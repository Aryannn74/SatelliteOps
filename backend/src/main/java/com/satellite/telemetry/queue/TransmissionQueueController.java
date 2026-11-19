
package com.satellite.telemetry.queue;

import com.satellite.telemetry.model.Telemetry;
import com.satellite.telemetry.repository.TelemetryRepository;
import com.satellite.telemetry.service.PriorityService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "http://localhost:5173")
public class TransmissionQueueController {

    private final TransmissionQueueRepository repository;
    private final TelemetryRepository telemetryRepository;
    private final PriorityService priorityService;

    public TransmissionQueueController(
            TransmissionQueueRepository repository,
            TelemetryRepository telemetryRepository,
            PriorityService priorityService) {

        this.repository = repository;
        this.telemetryRepository = telemetryRepository;
        this.priorityService = priorityService;
    }

    // Retrieve all queue items
    @GetMapping
    public List<TransmissionQueueItem> getAllItems() {
        return repository.findAll();
    }

    // Retrieve pending items, highest score first
    @GetMapping("/pending")
    public List<TransmissionQueueItem> getPendingItems() {
        return repository
                .findByStatusOrderByPriorityScoreDescCreatedAtAsc(
                        "PENDING");
    }

    // Transmit the highest-priority pending item
    @PostMapping("/transmit-next")
    public TransmissionQueueItem transmitNext() {

        List<TransmissionQueueItem> pendingItems =
                repository
                    .findByStatusOrderByPriorityScoreDescCreatedAtAsc(
                            "PENDING");

        if (pendingItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No pending transmissions available");
        }

        // Highest score first; oldest item wins a tie
        TransmissionQueueItem nextItem = pendingItems.get(0);

        nextItem.setStatus("TRANSMITTED");
        nextItem.setTransmittedAt(LocalDateTime.now());

        return repository.save(nextItem);
    }


    // Automatically calculate priority from saved telemetry
    @PostMapping("/from-telemetry/{telemetryId}")
    public ResponseEntity<TransmissionQueueItem> addFromTelemetry(
            @PathVariable String telemetryId) {

        Telemetry telemetry = telemetryRepository
                .findById(telemetryId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Telemetry record not found"));

        int score = priorityService.calculateScore(
                telemetry.getBatteryLevel(),
                telemetry.getLinkQuality(),
                telemetry.getPayloadType());

        String priority =
                priorityService.classifyPriority(score);

        TransmissionQueueItem item =
                new TransmissionQueueItem();

        item.setSatelliteId(telemetry.getSatelliteId());
        item.setPayloadType(telemetry.getPayloadType());
        item.setPriorityScore(score);
        item.setPriority(priority);
        item.setStatus("PENDING");
        item.setCreatedAt(LocalDateTime.now());
        item.setTransmittedAt(null);

        TransmissionQueueItem saved =
                repository.save(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // Mark an item as transmitted
    @PutMapping("/{id}/transmit")
    public TransmissionQueueItem markTransmitted(
            @PathVariable String id) {

        TransmissionQueueItem item = repository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Queue item not found"));

        if (!"PENDING".equals(item.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Item has already been transmitted");
        }

        item.setStatus("TRANSMITTED");
        item.setTransmittedAt(LocalDateTime.now());

        return repository.save(item);
    }

    // Delete queue item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable String id) {

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Queue item not found");
        }

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
