package com.cts.service;

import com.cts.entity.AIFluencyStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Commits one AIFluencyStatus (one associate's full course list) at a time, in its own
 * transaction, so one bad row can't roll back previously-saved rows in the same upload.
 *
 * Uses EntityManager.persist()/merge() explicitly instead of JpaRepository.save(): since
 * associateId is a manually-assigned (non-generated) id that's always non-null — even for a
 * brand-new row — Spring Data's default isNew() check (id == null?) misreads every new row as
 * "existing" and routes it through merge(). Combined with the EAGER, cascade-ALL/orphanRemoval
 * `courses` collection, that produced "org.hibernate.AssertionFailure: null identifier". The
 * caller already knows whether the row is new (it just looked it up), so that's passed in
 * directly rather than re-derived from the id.
 */
@Service
public class AIFluencyBatchHelper {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AIFluencyStatus saveOne(AIFluencyStatus status, boolean isNew) {
        if (isNew) {
            entityManager.persist(status);
            return status;
        }
        return entityManager.merge(status);
    }
}
