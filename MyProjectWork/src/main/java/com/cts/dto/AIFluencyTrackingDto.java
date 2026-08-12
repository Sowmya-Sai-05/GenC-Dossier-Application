package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** One associate's full completion record — one row per candidate, courses listed underneath. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIFluencyTrackingDto {
    private Integer associateId;
    private String candidateName;
    private List<CourseCompletionDto> courses;
}
