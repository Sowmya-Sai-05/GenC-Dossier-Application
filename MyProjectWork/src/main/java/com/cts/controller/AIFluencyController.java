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
import com.cts.entity.AIFluencyStatus;

@RestController
@RequestMapping("/admin/ai-fluency")
@RequiredArgsConstructor
@Tag(name = "AI Fluency Controller", description = "Admin endpoints for AI catalogue and tracking ingestion")
public class AIFluencyController {

    private static final Logger logger = LoggerFactory.getLogger(AIFluencyController.class);
    private final AIFluencyService fluencyService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/catalogue")
    @Operation(summary = "Upload AI Learning Catalogue", description = "Uploads the catalogue mapping course codes to skills/certifications.")
    public ResponseEntity<ApiResponse<String>> uploadCatalogue(@RequestParam("file") MultipartFile file) {
        logger.info("Received request to upload AI Learning Catalogue");
        try {
            fluencyService.processCatalogue(file);
            return ResponseEntity.ok(new ApiResponse<>(true, "Catalogue processed. Check Ingestion Logs for details.", ""));
        } catch (Exception e) {
            logger.error("Error processing catalogue", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to process catalogue: " + e.getMessage(), ""));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/tracking")
    @Operation(summary = "Upload AI Tracking Sheet", description = "Uploads the trainee tracking sheet with dynamic course columns.")
    public ResponseEntity<ApiResponse<String>> uploadTracking(@RequestParam("file") MultipartFile file) {
        logger.info("Received request to upload AI Tracking Sheet");
        try {
            fluencyService.processTracking(file);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tracking processed. Check Ingestion Logs for details.", ""));
        } catch (Exception e) {
            logger.error("Error processing tracking sheet", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to process tracking: " + e.getMessage(), ""));
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
    @Operation(summary = "List AI Tracking Status", description = "Returns all tracking statuses for all trainees")
    public ResponseEntity<ApiResponse<List<AIFluencyStatus>>> listTracking() {
        try {
            List<AIFluencyStatus> list = fluencyService.getAllTrackingStatuses();
            return ResponseEntity.ok(new ApiResponse<>(true, "Tracking fetched", list));
        } catch (Exception e) {
            logger.error("Error fetching tracking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to fetch tracking: " + e.getMessage(), Collections.emptyList()));
        }
    }
}
