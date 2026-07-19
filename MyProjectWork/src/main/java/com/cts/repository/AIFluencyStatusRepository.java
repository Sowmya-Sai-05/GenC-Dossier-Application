package com.cts.repository;

import com.cts.entity.AIFluencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIFluencyStatusRepository extends JpaRepository<AIFluencyStatus, Integer> {
}
