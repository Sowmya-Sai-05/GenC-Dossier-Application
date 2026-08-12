package com.cts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Candidate {

    // @NotNull(message = "Cognizant Candidate ID should not be empty")
    // @Column(name = "cognizant_candidate_id", unique = true)
    // private Integer cognizantCandidateId; // unused — commented out per project decision

    @Id
    @NotNull(message = "Cognizant Associate ID should not be empty")
    @Column(name = "associate_id", unique = true)
    private Integer associateId;

    @NotNull(message = "Candidate name should not be empty")
    private String candidateName;

    @NotNull(message = "Cognizant Email ID should not be empty")
    @Email(message = "Cognizant Email ID must be a valid email address")
    private String cognizantEmailID;

    private String gender;
    private String cohortCode;
    private String deploymentLocation;
    private String trackName;
    private String sl;
    private LocalDate doj;

    // Relationship fields are excluded from equals/hashCode/toString — Lombok's @Data would
    // otherwise generate hashCode()/toString() that recurse into the other side's own
    // back-reference (e.g. Candidate <-> CandidateScore, Candidate <-> AIFluencyStatus),
    // causing a StackOverflowError the moment either method is called (Hibernate's own
    // internals, a HashSet, a debug log line, etc. can all trigger it).
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL)
    private CandidateScore candidateScore;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "candidate" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certificates;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Achievement> achievement;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private Skills skills;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private AIFluencyStatus aiFluencyStatus;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private User user;



}
