
package com.satellite.telemetry.service;

import com.satellite.telemetry.model.PriorityDecision;
import com.satellite.telemetry.repository.PriorityDecisionRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PriorityService {

    private final PriorityDecisionRepository repository;

    public PriorityService(PriorityDecisionRepository repository) {
        this.repository = repository;
    }

    // Existing method used by PriorityController
    public String calculatePriority(
            double batteryLevel,
            double linkQuality,
            String payloadType) {

        int score = calculateScore(
                batteryLevel, linkQuality, payloadType);

        return classifyPriority(score);
    }

    // Calculate numerical priority score
    public int calculateScore(
            double batteryLevel,
            double linkQuality,
            String payloadType) {

        int score = 0;

        // Battery condition
        if (batteryLevel < 20) {
            score += 40;
        } else if (batteryLevel < 50) {
            score += 20;
        }

        // Communication link condition
        if (linkQuality < 30) {
            score += 30;
        } else if (linkQuality < 60) {
            score += 15;
        }

        // Payload importance
        if ("SENSOR".equalsIgnoreCase(payloadType)) {
            score += 30;
        } else if ("IMAGE".equalsIgnoreCase(payloadType)) {
            score += 20;
        } else if ("VIDEO".equalsIgnoreCase(payloadType)) {
            score += 10;
        } else if ("TEXT".equalsIgnoreCase(payloadType)) {
            score += 5;
        }

        return score;
    }

    // Classify score
    public String classifyPriority(int score) {

        if (score >= 60) {
            return "HIGH";
        } else if (score >= 30) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    // Generate explanation
    public String generateExplanation(
            double batteryLevel,
            double linkQuality,
            String payloadType) {

        StringBuilder explanation = new StringBuilder();

        if (batteryLevel < 20) {
            explanation.append("Critically low battery. ");
        } else if (batteryLevel < 50) {
            explanation.append("Battery level is low. ");
        } else {
            explanation.append("Battery level is sufficient. ");
        }

        if (linkQuality < 30) {
            explanation.append("Communication link is poor. ");
        } else if (linkQuality < 60) {
            explanation.append("Communication link is moderate. ");
        } else {
            explanation.append("Communication link is strong. ");
        }

        explanation.append(
                payloadType.toUpperCase()
                + " payload was considered for prioritization."
        );

        return explanation.toString();
    }

    // Evaluate and save decision in MongoDB
    public PriorityDecision evaluateAndSave(
            String satelliteId,
            double batteryLevel,
            double linkQuality,
            String payloadType) {

        if (satelliteId == null || satelliteId.isBlank()) {
            throw new IllegalArgumentException(
                    "Satellite ID is required");
        }

        if (!Double.isFinite(batteryLevel)
                || !Double.isFinite(linkQuality)
                || batteryLevel < 0 || batteryLevel > 100
                || linkQuality < 0 || linkQuality > 100) {
            throw new IllegalArgumentException(
                    "Battery and link quality must be between 0 and 100");
        }

        if (payloadType == null ||
                !java.util.Set.of(
                        "IMAGE", "VIDEO", "SENSOR", "TEXT"
                ).contains(payloadType.toUpperCase())) {
            throw new IllegalArgumentException(
                    "Invalid payload type");
        }

        int score = calculateScore(
                batteryLevel, linkQuality, payloadType);

        String priority = classifyPriority(score);

        String explanation = generateExplanation(
                batteryLevel, linkQuality, payloadType);

        PriorityDecision decision = new PriorityDecision();

        decision.setSatelliteId(satelliteId.trim());
        decision.setBatteryLevel(batteryLevel);
        decision.setLinkQuality(linkQuality);
        decision.setPayloadType(payloadType.toUpperCase());

        decision.setScore(score);
        decision.setPriority(priority);
        decision.setExplanation(explanation);
        decision.setCreatedAt(LocalDateTime.now());

        return repository.save(decision);
    }

    // Retrieve saved priority history
    public List<PriorityDecision> getHistory() {
        return repository.findAll();
    }
}
