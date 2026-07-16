package com.cts.service;

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
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIFluencyService {

    private static final Logger logger = LoggerFactory.getLogger(AIFluencyService.class);
    private final AILearningCatalogueRepository catalogueRepository;
    private final AIFluencyStatusRepository statusRepository;
    private final CandidateRepository candidateRepository;
    private final AIFluencyBatchHelper batchHelper;
    private final IngestionLogService ingestionLogService;

    public void processCatalogue(MultipartFile file) {
        logger.info("Starting AI Catalogue upload process");
        IngestionLog logEntry = ingestionLogService.startLog("CATALOGUE_" + file.getOriginalFilename(), "SYSTEM");
        Long logId = logEntry != null ? logEntry.getId() : null;
        int saved = 0, rejected = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            // Try to find the sheet that contains the catalogue headers. Many admin
            // templates place the catalogue on a sheet called "Master_Data". If that
            // doesn't exist, scan sheets and pick the first sheet whose header row
            // contains the required columns.
            Sheet sheet = null;
            Row headerRow = null;
            // prefer sheet named Master_Data (case-insensitive)
            for (Sheet s : workbook) {
                if (s == null) continue;
                String name = s.getSheetName();
                if (name != null && name.equalsIgnoreCase("Master_Data")) {
                    sheet = s;
                    headerRow = sheet.getRow(0);
                    break;
                }
            }
            if (sheet == null) {
                // fallback: find first sheet whose first row contains required headers
                for (Sheet s : workbook) {
                    if (s == null) continue;
                    Row r = s.getRow(0);
                    if (r == null) continue;
                    Map<String, Integer> tmp = buildHeaderMap(r);
                    if (tmp.containsKey("course code") && tmp.containsKey("type") && tmp.containsKey("course skills")) {
                        sheet = s;
                        headerRow = r;
                        break;
                    }
                }
            }
            // final fallback: use first sheet
            if (sheet == null) {
                sheet = workbook.getSheetAt(0);
                headerRow = sheet.getRow(0);
            }

            if (headerRow == null) {
                ingestionLogService.appendSchemaError(logId, "No header row found");
                ingestionLogService.failLog(logId);
                return;
            }

            Map<String, Integer> headerIndexMap = buildHeaderMap(headerRow);
            if (!headerIndexMap.containsKey("course code") || !headerIndexMap.containsKey("type") || !headerIndexMap.containsKey("course skills")) {
                ingestionLogService.appendSchemaError(logId, "Missing required catalogue headers");
                ingestionLogService.failLog(logId);
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

                if (processedCodes.contains(courseCode)) {
                    ingestionLogService.appendDataError(logId, i + 1, null, courseCode, null, "Duplicate Course Code in file");
                    rejected++;
                    continue;
                }
                processedCodes.add(courseCode);

                if (catalogueRepository.existsById(courseCode)) {
                    // update existing entry if something changed
                    AILearningCatalogue existing = catalogueRepository.findById(courseCode).orElse(null);
                    if (existing != null) {
                        boolean changed = false;
                        if (!Objects.equals(existing.getType(), type)) {
                            existing.setType(type);
                            changed = true;
                        }
                        if (!Objects.equals(existing.getCourseName(), skills)) {
                            existing.setCourseName(skills);
                            changed = true;
                        }
                        if (changed) {
                            catalogueRepository.save(existing);
                        }
                    }
                } else {
                    AILearningCatalogue catalogue = new AILearningCatalogue(courseCode, type, skills);
                    catalogueRepository.save(catalogue);
                    saved++;
                }
            }
            ingestionLogService.completeLog(logId, saved, 0, rejected);
            logger.info("Catalogue upload completed. Saved: {}, Rejected: {}", saved, rejected);

        } catch (Exception e) {
            logger.error("Failed to process catalogue", e);
            ingestionLogService.failLog(logId);
            throw new RuntimeException("Failed to parse Excel file", e);
        }
    }

    public void processTracking(MultipartFile file) {
        logger.info("Starting AI Tracking upload process");
        IngestionLog logEntry = ingestionLogService.startLog("TRACKING_" + file.getOriginalFilename(), "SYSTEM");
        Long logId = logEntry != null ? logEntry.getId() : null;
        int saved = 0, rejected = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                ingestionLogService.appendSchemaError(logId, "No header row found");
                ingestionLogService.failLog(logId);
                return;
            }

            // Read dynamic course codes starting usually from col 2 (after Associate Id, Name)
            Map<String, Integer> headerIndexMap = buildHeaderMap(headerRow);
            if (!headerIndexMap.containsKey("associate id")) {
                ingestionLogService.appendSchemaError(logId, "Missing 'Associate Id' header");
                ingestionLogService.failLog(logId);
                return;
            }

            // Extract course codes from headers
            List<String> dynamicCourseCodes = new ArrayList<>();
            for (Cell cell : headerRow) {
                String header = getCellAsString(cell);
                if (header.isEmpty() || header.equalsIgnoreCase("associate id") || header.equalsIgnoreCase("name")) {
                    continue;
                }
                
                // Duplicate header check
                if (dynamicCourseCodes.contains(header)) {
                     ingestionLogService.appendSchemaError(logId, "Duplicate course code header: " + header);
                     ingestionLogService.failLog(logId);
                     return;
                }
                
                // Foreign key check for catalogue
                if (!catalogueRepository.existsById(header)) {
                    ingestionLogService.appendSchemaError(logId, "Course code not found in catalogue: " + header);
                    ingestionLogService.failLog(logId);
                    return;
                }
                dynamicCourseCodes.add(header);
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell idCell = row.getCell(headerIndexMap.get("associate id"));
                if (idCell == null) continue;
                
                Integer associateId = null;
                try {
                    associateId = (int) idCell.getNumericCellValue();
                } catch (Exception e) {
                    try {
                        associateId = Integer.parseInt(getCellAsString(idCell));
                    } catch (NumberFormatException ex) {
                        continue;
                    }
                }
                
                Candidate candidate = candidateRepository.findById(associateId).orElse(null);
                if (candidate == null) {
                    ingestionLogService.appendDataError(logId, i + 1, associateId, null, null, "Associate ID not found in system");
                    rejected++;
                    continue;
                }

                boolean rowHasError = false;
                for (String courseCode : dynamicCourseCodes) {
                    String status = getCellAsString(row.getCell(headerIndexMap.get(courseCode.toLowerCase())));
                    if (status.isEmpty()) continue;
                    
                    if (!status.equalsIgnoreCase("Completed") && !status.equalsIgnoreCase("Yet to Start")) {
                         ingestionLogService.appendDataError(logId, i + 1, associateId, candidate.getCandidateName(), null, "Invalid status: " + status);
                         rowHasError = true;
                         break; // abort this trainee's processing
                    }
                    
                    try {
                        AILearningCatalogue catalogue = catalogueRepository.findById(courseCode).orElseThrow();
                        AIFluencyStatus fluencyStatus = new AIFluencyStatus();
                        fluencyStatus.setCandidate(candidate);
                        fluencyStatus.setCatalogue(catalogue);
                        fluencyStatus.setStatus(status.equalsIgnoreCase("Completed") ? "Completed" : "Yet to Start");
                        batchHelper.saveOne(fluencyStatus);
                    } catch (Exception e) {
                         ingestionLogService.appendDataError(logId, i + 1, associateId, candidate.getCandidateName(), null, "Failed to save: " + e.getMessage());
                         rowHasError = true;
                         break;
                    }
                }
                
                if (rowHasError) {
                    rejected++;
                } else {
                    saved++;
                }
            }
            
            ingestionLogService.completeLog(logId, saved, 0, rejected);
            logger.info("Tracking upload completed. Saved Trainees: {}, Rejected Trainees: {}", saved, rejected);

        } catch (Exception e) {
            logger.error("Failed to process tracking", e);
            ingestionLogService.failLog(logId);
            throw new RuntimeException("Failed to parse Excel file", e);
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

    /**
     * Return all catalogue entries. Used by admin UI to list uploaded catalogues.
     */
    public List<AILearningCatalogue> getAllCatalogues() {
        return catalogueRepository.findAll();
    }

    /**
     * Return all tracking statuses. Used by admin UI to view trainee progress on AI courses.
     */
    public List<AIFluencyStatus> getAllTrackingStatuses() {
        return statusRepository.findAll();
    }
}
