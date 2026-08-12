package com.cts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCompletionDto {
    private String courseCode;
    private String courseName;
    private String type;
    private String status;
}
