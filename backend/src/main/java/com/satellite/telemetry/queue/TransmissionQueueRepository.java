
package com.satellite.telemetry.queue;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransmissionQueueRepository
        extends MongoRepository<TransmissionQueueItem, String> {

    // Find queue items by transmission status
    List<TransmissionQueueItem> findByStatus(String status);

    // Find queue items belonging to a satellite
    List<TransmissionQueueItem> findBySatelliteId(
            String satelliteId
    );

    // Find pending items ordered by priority score
    List<TransmissionQueueItem>
            findByStatusOrderByPriorityScoreDescCreatedAtAsc(
                    String status
            );
}
