package com.cts.repository;

import com.cts.entity.AIFluencyStatus;
import com.cts.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIFluencyStatusRepository extends JpaRepository<AIFluencyStatus, Long> {
    List<AIFluencyStatus> findByCandidate(Candidate candidate);
}
