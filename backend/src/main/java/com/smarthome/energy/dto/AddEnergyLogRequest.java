package com.smarthome.energy.dto;

import java.time.LocalDateTime;

public class AddEnergyLogRequest {
    private Double energyUsage;
    private LocalDateTime timestamp;
    private Integer durationMinutes;
    private Double cost;

    public AddEnergyLogRequest() {
    }

    public AddEnergyLogRequest(Double energyUsage, LocalDateTime timestamp) {
        this.energyUsage = energyUsage;
        this.timestamp = timestamp;
    }

    public AddEnergyLogRequest(Double energyUsage, LocalDateTime timestamp, Integer durationMinutes) {
        this.energyUsage = energyUsage;
        this.timestamp = timestamp;
        this.durationMinutes = durationMinutes;
    }

    // Getters and Setters
    public Double getEnergyUsage() {
        return energyUsage;
    }

    public void setEnergyUsage(Double energyUsage) {
        this.energyUsage = energyUsage;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}
