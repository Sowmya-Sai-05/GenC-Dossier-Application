package com.cts.controller;

import com.cts.model.ApiResponse;
import com.cts.service.AIFluencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Collections;
import java.util.List;
import com.cts.entity.AILearningCatalogue;
import com.cts.dto.AIFluencyTrackingDto;

@RestController
@RequestMapping("/admin/ai-fluency")
@RequiredArgsConstructor
@Tag(name = "AI Fluency Controller", description = "Admin endpoints for AI catalogue and tracking ingestion")
public class AIFluencyController {

    private static final Logger logger = LoggerFactory.getLogger(AIFluencyController.class);
    private final AIFluencyService fluencyService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @Operation(summary = "Upload AI Fluency workbook",
            description = "Single .xlsx containing a Master Data (catalogue) sheet and a completion-tracking sheet. " +
                    "Catalogue rows are upserted first; tracking statuses are then applied only for course codes " +
                    "that exist in the catalogue. Returns counts (total/saved/merged/rejected) plus per-row notes.")
    public ResponseEntity<?> uploadAIFluency(@RequestParam("file") MultipartFile file) {
        logger.info("Received AI Fluency upload request: {}, size={} bytes", file.getOriginalFilename(), file.getSize());
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String uploadedBy = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;

            AIFluencyService.FluencyUploadResult result = fluencyService.processExcel(file, uploadedBy);

            if (result.getTotalRecords() == 0) {
                logger.warn("AI Fluency upload failed for file: {}", file.getOriginalFilename());
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error processing AI Fluency workbook", e);
            return ResponseEntity.internalServerError().body("Error processing file: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/catalogue")
    @Operation(summary = "List AI Learning Catalogue", description = "Returns all catalogue rows previously uploaded")
    public ResponseEntity<ApiResponse<List<AILearningCatalogue>>> listCatalogue() {
        try {
            List<AILearningCatalogue> list = fluencyService.getAllCatalogues();
            return ResponseEntity.ok(new ApiResponse<>(true, "Catalogue fetched", list));
        } catch (Exception e) {
            logger.error("Error fetching catalogue", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to fetch catalogue: " + e.getMessage(), Collections.emptyList()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/tracking")
    @Operation(summary = "List AI Tracking Status", description = "Returns one entry per associate with their full list of course completions")
    public ResponseEntity<ApiResponse<List<AIFluencyTrackingDto>>> listTracking() {
        try {
            List<AIFluencyTrackingDto> list = fluencyService.getAllTrackingStatuses();
            return ResponseEntity.ok(new ApiResponse<>(true, "Tracking fetched", list));
        } catch (Exception e) {
            logger.error("Error fetching tracking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to fetch tracking: " + e.getMessage(), Collections.emptyList()));
        }
    }
}
