package com.cts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * One row per candidate — the list of course completions lives on {@link #courses}.
 * associateId is a plain assigned primary key (always set explicitly by the service
 * before saving); {@code candidate} is a read-only shadow mapping onto that same
 * column purely for convenient lookups, so no identity is ever derived from it —
 * deriving via @MapsId broke when the batch helper saved a detached Candidate
 * reference in its own REQUIRES_NEW transaction (Hibernate couldn't resolve the
 * associated entity's identity and inserted a null primary key).
 */
@Entity
@Table(name = "ai_fluency_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIFluencyStatus {

    @Id
    @Column(name = "associate_id")
    private Integer associateId;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "associate_id", insertable = false, updatable = false)
    private Candidate candidate;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    @OneToMany(mappedBy = "fluencyStatus", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<AIFluencyCourseStatus> courses = new ArrayList<>();
}
