package com.cts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity tracking the completion status of a specific candidate for an AI learning catalogue item.
 */
@Entity
@Table(name = "ai_fluency_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIFluencyStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_code", nullable = false)
    private AILearningCatalogue catalogue;

    @NotNull(message = "Status should not be empty")
    @Column(name = "status", length = 50, nullable = false)
    private String status; // "Completed" or "Yet to Start"
}
