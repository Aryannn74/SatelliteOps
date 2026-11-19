
package com.satellite.telemetry.controller;

import com.satellite.telemetry.model.PriorityDecision;
import com.satellite.telemetry.service.PriorityService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/priority")
@CrossOrigin(origins = "http://localhost:5173")
public class PriorityController {

    private final PriorityService priorityService;

    public PriorityController(PriorityService priorityService) {
        this.priorityService = priorityService;
    }

    // POST - Evaluate priority and save decision
    @PostMapping("/evaluate")
    public PriorityDecision evaluatePriority(
            @RequestBody Map<String, Object> request) {

        try {
            String satelliteId =
                    request.get("satelliteId").toString();

            double batteryLevel = Double.parseDouble(
                    request.get("batteryLevel").toString());

            double linkQuality = Double.parseDouble(
                    request.get("linkQuality").toString());

            String payloadType =
                    request.get("payloadType").toString();

            return priorityService.evaluateAndSave(
                    satelliteId,
                    batteryLevel,
                    linkQuality,
                    payloadType
            );

        } catch (NullPointerException
                 | IllegalArgumentException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid input: " + e.getMessage()
            );
        }
    }

    // GET - Retrieve saved priority history
    @GetMapping("/history")
    public List<PriorityDecision> getPriorityHistory() {
        return priorityService.getHistory();
    }
}
