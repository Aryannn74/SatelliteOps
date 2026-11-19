
package com.satellite.telemetry.repository;

import com.satellite.telemetry.model.Telemetry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TelemetryRepository extends MongoRepository<Telemetry, String> {

}
