
package com.satellite.telemetry.repository;

import com.satellite.telemetry.model.PriorityDecision;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriorityDecisionRepository
        extends MongoRepository<PriorityDecision, String> {

}
