package com.cts.repository;

import com.cts.entity.AILearningCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AILearningCatalogueRepository extends JpaRepository<AILearningCatalogue, String> {
}
