package com.cts.service;

import com.cts.entity.AIFluencyStatus;
import com.cts.repository.AIFluencyStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Helper for committing one AIFluencyStatus at a time inside its own transaction.
 */
@Service
@RequiredArgsConstructor
public class AIFluencyBatchHelper {

    private final AIFluencyStatusRepository statusRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AIFluencyStatus saveOne(AIFluencyStatus status) {
        return statusRepository.save(status);
    }
}
