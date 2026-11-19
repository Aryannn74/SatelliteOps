
package com.satellite.telemetry.controller;

import com.satellite.telemetry.model.Telemetry;
import com.satellite.telemetry.repository.TelemetryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "http://localhost:5173")
public class TelemetryController {

    private final TelemetryRepository repository;

    private static final Set<String> ALLOWED_PAYLOADS =
            Set.of("IMAGE", "VIDEO", "SENSOR", "TEXT");

    // Constructor
    public TelemetryController(TelemetryRepository repository) {
        this.repository = repository;
    }

    // Validate telemetry inputs
    private void validateTelemetry(Telemetry telemetry) {

        // Check telemetry object
        if (telemetry == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Telemetry data is required"
            );
        }

        // Validate Satellite ID
        if (telemetry.getSatelliteId() == null ||
                telemetry.getSatelliteId().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Satellite ID is required"
            );
        }

        // Validate Battery Level
        if (!Double.isFinite(telemetry.getBatteryLevel()) ||
                telemetry.getBatteryLevel() < 0 ||
                telemetry.getBatteryLevel() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Battery level must be between 0 and 100"
            );
        }

        // Validate Link Quality
        if (!Double.isFinite(telemetry.getLinkQuality()) ||
                telemetry.getLinkQuality() < 0 ||
                telemetry.getLinkQuality() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Link quality must be between 0 and 100"
            );
        }

        // Validate Payload Type
        if (telemetry.getPayloadType() == null ||
                !ALLOWED_PAYLOADS.contains(
                        telemetry.getPayloadType()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payload type must be IMAGE, VIDEO, SENSOR, or TEXT"
            );
        }
    }

    // GET - Retrieve all telemetry records
    @GetMapping
    public List<Telemetry> getAllTelemetry() {

        return repository.findAll();
    }

    // POST - Add a new telemetry record
    @PostMapping
    public ResponseEntity<Telemetry> addTelemetry(
            @RequestBody Telemetry telemetry) {

        // Validate inputs
        validateTelemetry(telemetry);

        // Prevent clients from choosing an existing record ID
        telemetry.setId(null);

        // Generate creation timestamp
        telemetry.setTimestamp(LocalDateTime.now());

        // Save to MongoDB
        Telemetry savedTelemetry =
                repository.save(telemetry);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTelemetry);
    }

    // PUT - Update existing telemetry
    @PutMapping("/{id}")
    public Telemetry updateTelemetry(
            @PathVariable String id,
            @RequestBody Telemetry updatedTelemetry) {

        // Validate updated inputs
        validateTelemetry(updatedTelemetry);

        // Find existing record
        Telemetry existing = repository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Telemetry record not found"
                        )
                );

        // Update fields
        existing.setSatelliteId(
                updatedTelemetry.getSatelliteId()
        );

        existing.setBatteryLevel(
                updatedTelemetry.getBatteryLevel()
        );

        existing.setLinkQuality(
                updatedTelemetry.getLinkQuality()
        );

        existing.setPayloadType(
                updatedTelemetry.getPayloadType()
        );

        // Preserve original creation timestamp

        // Save updated record
        return repository.save(existing);
    }

    // DELETE - Delete telemetry record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTelemetry(
            @PathVariable String id) {

        // Check record exists
        if (!repository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Telemetry record not found"
            );
        }

        // Delete from MongoDB
        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
