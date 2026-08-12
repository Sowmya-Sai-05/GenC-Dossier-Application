package com.cts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * One course's completion status for one candidate. Always reached through its parent
 * {@link AIFluencyStatus#getCourses()} — that parent is the unique-per-associate row.
 */
@Entity
@Table(name = "ai_fluency_course_status",
        uniqueConstraints = @UniqueConstraint(columnNames = {"fluency_status_id", "course_code"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIFluencyCourseStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fluency_status_id", nullable = false)
    private AIFluencyStatus fluencyStatus;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_code", nullable = false)
    private AILearningCatalogue catalogue;

    @NotNull(message = "Status should not be empty")
    @Column(name = "status", length = 50, nullable = false)
    private String status; // "Completed" or "Yet to Start"
}
