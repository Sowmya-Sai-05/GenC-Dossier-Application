package com.cts.service;

import com.cts.dto.AIFluencyTrackingDto;
import com.cts.dto.CourseCompletionDto;
import com.cts.entity.AIFluencyCourseStatus;
import com.cts.entity.AIFluencyStatus;
import com.cts.entity.AILearningCatalogue;
import com.cts.entity.Candidate;
import com.cts.entity.IngestionLog;
import com.cts.repository.AIFluencyStatusRepository;
import com.cts.repository.AILearningCatalogueRepository;
import com.cts.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles the combined AI Fluency ingestion: a single workbook containing a Master Data
 * (catalogue) sheet and a completion-tracking sheet. Both are processed in one pass —
 * the catalogue is upserted first, then tracking statuses are applied only for course
 * codes that exist in the catalogue (uploaded just now or previously).
 */
@Service
@RequiredArgsConstructor
public class AIFluencyService {

    private static final Logger logger = LoggerFactory.getLogger(AIFluencyService.class);
    private final AILearningCatalogueRepository catalogueRepository;
    private final AIFluencyStatusRepository statusRepository;
    private final CandidateRepository candidateRepository;
    private final AIFluencyBatchHelper batchHelper;
    private final IngestionLogService ingestionLogService;

    /** Mirrors CandidateService.ExcelUploadResult so the frontend can reuse the same stat-card UI. */
    public static class FluencyUploadResult {
        private int totalRecords;
        private int savedRecords;
        private int mergedRecords;
        private int rejectedRecords;
        private final List<String> errors = new ArrayList<>();
        private String schemaValidationMessage;

        public int getTotalRecords() { return totalRecords; }
        public void setTotalRecords(int v) { this.totalRecords = v; }
        public int getSavedRecords() { return savedRecords; }
        public void setSavedRecords(int v) { this.savedRecords = v; }
        public int getMergedRecords() { return mergedRecords; }
        public void setMergedRecords(int v) { this.mergedRecords = v; }
        public int getRejectedRecords() { return rejectedRecords; }
        public void setRejectedRecords(int v) { this.rejectedRecords = v; }
        public List<String> getErrors() { return errors; }
        public String getSchemaValidationMessage() { return schemaValidationMessage; }
        public void setSchemaValidationMessage(String v) { this.schemaValidationMessage = v; }
    }

    /**
     * Single entry point for the combined upload. Catalogue rows are upserted first so the
     * tracking pass can validate its course-code columns against the just-updated catalogue;
     * tracking columns for courses not in the catalogue are skipped (logged as a note) rather
     * than failing the whole upload.
     */
    public FluencyUploadResult processExcel(MultipartFile file, String uploadedBy) {
        logger.info("Starting AI Fluency upload process");
        IngestionLog logEntry = ingestionLogService.startLog("AI_FLUENCY_" + file.getOriginalFilename(), uploadedBy);
        Long logId = logEntry != null ? logEntry.getId() : null;
        FluencyUploadResult result = new FluencyUploadResult();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet catalogueSheet = findCatalogueSheet(workbook);
            Sheet trackingSheet = findTrackingSheet(workbook, catalogueSheet);

            if (catalogueSheet == null && trackingSheet == null) {
                String msg = "Could not find a Master Data (catalogue) sheet or a completion-tracking sheet in the workbook";
                result.setSchemaValidationMessage(msg);
                result.getErrors().add(msg);
                ingestionLogService.appendSchemaError(logId, "Master_Data / Completion_Det");
                ingestionLogService.finalizeLog(logId, IngestionLog.Status.FAILED, 0, 0, 0, 0, msg);
                return result;
            }

            if (catalogueSheet != null) {
                processCatalogueSheet(catalogueSheet, logId, result);
            } else {
                String msg = "Master Data (catalogue) sheet not found — no new/changed courses were applied";
                result.getErrors().add(msg);
                ingestionLogService.appendSchemaError(logId, "Master_Data");
            }

            if (trackingSheet != null) {
                processTrackingSheet(trackingSheet, logId, result);
            } else {
                String msg = "Completion-tracking sheet not found — no completion statuses were updated";
                result.getErrors().add(msg);
                ingestionLogService.appendSchemaError(logId, "Completion_Det");
            }

            IngestionLog.Status finalStatus;
            if (result.getRejectedRecords() == 0 && (result.getSavedRecords() + result.getMergedRecords()) > 0) {
                finalStatus = IngestionLog.Status.SUCCESS;
            } else if (result.getSavedRecords() + result.getMergedRecords() > 0) {
                finalStatus = IngestionLog.Status.PARTIAL;
            } else {
                finalStatus = IngestionLog.Status.FAILED;
            }
            ingestionLogService.finalizeLog(logId, finalStatus,
                    result.getTotalRecords(), result.getSavedRecords(),
                    result.getMergedRecords(), result.getRejectedRecords(),
                    result.getSchemaValidationMessage());
            logger.info("AI Fluency upload completed. total={}, saved={}, merged={}, rejected={}",
                    result.getTotalRecords(), result.getSavedRecords(), result.getMergedRecords(), result.getRejectedRecords());
            return result;

        } catch (Exception e) {
            logger.error("Failed to process AI Fluency workbook", e);
            ingestionLogService.appendProcessingError(logId, 0, e.getMessage());
            ingestionLogService.failLog(logId);
            throw new RuntimeException("Failed to parse Excel file", e);
        }
    }

    // ── Sheet discovery ────────────────────────────────────────────────────────

    private Sheet findCatalogueSheet(Workbook workbook) {
        for (Sheet s : workbook) {
            if (s != null && s.getSheetName() != null && s.getSheetName().toLowerCase().contains("master")) {
                return s;
            }
        }
        for (Sheet s : workbook) {
            if (s == null) continue;
            Row r = s.getRow(0);
            if (r == null) continue;
            Map<String, Integer> headers = buildHeaderMap(r);
            if (headers.containsKey("course code") && headers.containsKey("type") && headers.containsKey("course skills")) {
                return s;
            }
        }
        return null;
    }

    private Sheet findTrackingSheet(Workbook workbook, Sheet catalogueSheet) {
        for (Sheet s : workbook) {
            if (s == null || s == catalogueSheet) continue;
            String name = s.getSheetName();
            if (name != null) {
                String lower = name.toLowerCase();
                if (lower.contains("completion") || lower.contains("tracking")) {
                    return s;
                }
            }
        }
        for (Sheet s : workbook) {
            if (s == null || s == catalogueSheet) continue;
            Row r = s.getRow(0);
            if (r == null) continue;
            Map<String, Integer> headers = buildHeaderMap(r);
            if (headers.containsKey("associate id")) {
                return s;
            }
        }
        for (Sheet s : workbook) {
            if (s != null && s != catalogueSheet) return s;
        }
        return null;
    }

    // ── Master Data (catalogue) ────────────────────────────────────────────────

    private void processCatalogueSheet(Sheet sheet, Long logId, FluencyUploadResult result) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            result.getErrors().add("Master Data sheet has no header row");
            ingestionLogService.appendSchemaError(logId, "Master Data header row");
            return;
        }

        Map<String, Integer> headerIndexMap = buildHeaderMap(headerRow);
        if (!headerIndexMap.containsKey("course code") || !headerIndexMap.containsKey("type") || !headerIndexMap.containsKey("course skills")) {
            result.getErrors().add("Missing required Master Data headers (Course Code, Type, Course Skills)");
            ingestionLogService.appendSchemaError(logId, "Course Code / Type / Course Skills");
            return;
        }

        Set<String> processedCodes = new HashSet<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String courseCode = getCellAsString(row.getCell(headerIndexMap.get("course code")));
            String type = getCellAsString(row.getCell(headerIndexMap.get("type")));
            String skills = getCellAsString(row.getCell(headerIndexMap.get("course skills")));

            if (courseCode.isEmpty()) continue;
            result.setTotalRecords(result.getTotalRecords() + 1);

            if (processedCodes.contains(courseCode)) {
                ingestionLogService.appendDataError(logId, i + 1, null, courseCode, List.of("Course Code"), "Duplicate Course Code in Master Data sheet");
                result.getErrors().add("Master Data row " + (i + 1) + ": duplicate course code " + courseCode);
                result.setRejectedRecords(result.getRejectedRecords() + 1);
                continue;
            }
            processedCodes.add(courseCode);

            Optional<AILearningCatalogue> existing = catalogueRepository.findById(courseCode);
            if (existing.isPresent()) {
                AILearningCatalogue entry = existing.get();
                boolean changed = !Objects.equals(entry.getType(), type) || !Objects.equals(entry.getCourseName(), skills);
                if (changed) {
                    entry.setType(type);
                    entry.setCourseName(skills);
                    catalogueRepository.save(entry);
                    result.setMergedRecords(result.getMergedRecords() + 1);
                } else {
                    // Exact match against DB — already up to date, counted as a rejected duplicate.
                    result.setRejectedRecords(result.getRejectedRecords() + 1);
                }
            } else {
                catalogueRepository.save(new AILearningCatalogue(courseCode, type, skills));
                result.setSavedRecords(result.getSavedRecords() + 1);
            }
        }
    }

    // ── Completion tracking ─────────────────────────────────────────────────────

    private void processTrackingSheet(Sheet sheet, Long logId, FluencyUploadResult result) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            result.getErrors().add("Tracking sheet has no header row");
            ingestionLogService.appendSchemaError(logId, "Tracking header row");
            return;
        }

        Map<String, Integer> headerIndexMap = buildHeaderMap(headerRow);
        if (!headerIndexMap.containsKey("associate id")) {
            result.getErrors().add("Missing 'Associate Id' header in tracking sheet");
            ingestionLogService.appendSchemaError(logId, "Associate Id");
            return;
        }

        // Only course-code columns that exist in the catalogue (just upserted above, or from an
        // earlier upload) are tracked. Anything else is skipped instead of failing the upload.
        List<String> trackedCourseCodes = new ArrayList<>();
        for (Cell cell : headerRow) {
            String header = getCellAsString(cell);
            if (header.isEmpty() || header.equalsIgnoreCase("associate id") || header.equalsIgnoreCase("name")) {
                continue;
            }
            if (trackedCourseCodes.contains(header)) {
                result.getErrors().add("Tracking sheet: duplicate course code column '" + header + "' — later occurrence ignored");
                continue;
            }
            if (!catalogueRepository.existsById(header)) {
                result.getErrors().add("Tracking sheet: course code '" + header + "' is not in the Master Data catalogue — column skipped");
                continue;
            }
            trackedCourseCodes.add(header);
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            Cell idCell = row.getCell(headerIndexMap.get("associate id"));
            if (idCell == null) continue;

            Integer associateId = parseAssociateId(idCell);
            if (associateId == null) continue;

            result.setTotalRecords(result.getTotalRecords() + 1);

            Candidate candidate = candidateRepository.findById(associateId).orElse(null);
            if (candidate == null) {
                ingestionLogService.appendDataError(logId, i + 1, associateId, null, null, "Associate ID not found in system");
                result.getErrors().add("Tracking row " + (i + 1) + ": Associate Id " + associateId + " not found");
                result.setRejectedRecords(result.getRejectedRecords() + 1);
                continue;
            }

            AIFluencyStatus fluencyStatus = statusRepository.findById(associateId).orElse(null);
            boolean isNewFluencyStatus = fluencyStatus == null;
            if (isNewFluencyStatus) {
                fluencyStatus = new AIFluencyStatus();
                fluencyStatus.setAssociateId(associateId);
                fluencyStatus.setCandidate(candidate);
            }

            boolean rowHasError = false;
            for (String courseCode : trackedCourseCodes) {
                Integer col = headerIndexMap.get(courseCode.toLowerCase());
                String status = getCellAsString(row.getCell(col));
                if (status.isEmpty()) continue;

                if (!status.equalsIgnoreCase("Completed") && !status.equalsIgnoreCase("Yet to Start")) {
                    ingestionLogService.appendDataError(logId, i + 1, associateId, candidate.getCandidateName(),
                            List.of(courseCode), "Invalid status '" + status + "' for course " + courseCode);
                    result.getErrors().add("Tracking row " + (i + 1) + ": invalid status '" + status + "' for course " + courseCode);
                    rowHasError = true;
                    break;
                }

                AILearningCatalogue catalogue = catalogueRepository.findById(courseCode).orElseThrow();
                String normalizedStatus = status.equalsIgnoreCase("Completed") ? "Completed" : "Yet to Start";

                AIFluencyCourseStatus existingCourse = fluencyStatus.getCourses().stream()
                        .filter(c -> c.getCatalogue() != null && courseCode.equals(c.getCatalogue().getCourseCode()))
                        .findFirst().orElse(null);
                if (existingCourse != null) {
                    existingCourse.setStatus(normalizedStatus);
                } else {
                    AIFluencyCourseStatus newCourse = new AIFluencyCourseStatus();
                    newCourse.setFluencyStatus(fluencyStatus);
                    newCourse.setCatalogue(catalogue);
                    newCourse.setStatus(normalizedStatus);
                    fluencyStatus.getCourses().add(newCourse);
                }
            }

            if (rowHasError) {
                result.setRejectedRecords(result.getRejectedRecords() + 1);
                continue;
            }

            try {
                batchHelper.saveOne(fluencyStatus, isNewFluencyStatus);
                result.setSavedRecords(result.getSavedRecords() + 1);
            } catch (Exception e) {
                ingestionLogService.appendDataError(logId, i + 1, associateId, candidate.getCandidateName(), null, "Failed to save: " + e.getMessage());
                result.getErrors().add("Tracking row " + (i + 1) + ": failed to save — " + e.getMessage());
                result.setRejectedRecords(result.getRejectedRecords() + 1);
            }
        }
    }

    private Integer parseAssociateId(Cell idCell) {
        try {
            return (int) idCell.getNumericCellValue();
        } catch (Exception e) {
            try {
                return Integer.parseInt(getCellAsString(idCell));
            } catch (NumberFormatException ex) {
                return null;
            }
        }
    }

    private Map<String, Integer> buildHeaderMap(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = getCellAsString(cell).toLowerCase().trim();
            if (!header.isEmpty()) {
                map.put(header, cell.getColumnIndex());
            }
        }
        return map;
    }

    private String getCellAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    /** Return all catalogue entries. Used by admin UI to list uploaded catalogues. */
    public List<AILearningCatalogue> getAllCatalogues() {
        return catalogueRepository.findAll();
    }

    /** Return all tracking statuses, one entry per associate with their course list. Used by admin UI to view trainee progress on AI courses. */
    @Transactional(readOnly = true)
    public List<AIFluencyTrackingDto> getAllTrackingStatuses() {
        return statusRepository.findAll().stream()
                .map(fs -> AIFluencyTrackingDto.builder()
                        .associateId(fs.getAssociateId())
                        .candidateName(fs.getCandidate() != null ? fs.getCandidate().getCandidateName() : null)
                        .courses(fs.getCourses().stream()
                                .map(c -> CourseCompletionDto.builder()
                                        .courseCode(c.getCatalogue().getCourseCode())
                                        .courseName(c.getCatalogue().getCourseName())
                                        .type(c.getCatalogue().getType())
                                        .status(c.getStatus())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }
}
