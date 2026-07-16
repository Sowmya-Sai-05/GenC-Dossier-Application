package com.cts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing the catalogue of AI courses/certifications uploaded by Admin.
 */
@Entity
@Table(name = "ai_learning_catalogue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AILearningCatalogue {

    @Id
    @Column(name = "course_code", length = 50, nullable = false)
    private String courseCode;

    @NotNull(message = "Type should not be empty")
    @Column(name = "type", length = 50, nullable = false)
    private String type; // e.g., "Course" or "Certification"

    @NotNull(message = "Course Name/Skills should not be empty")
    @Column(name = "course_name", length = 255, nullable = false)
    private String courseName;
}
