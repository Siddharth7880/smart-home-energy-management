package com.smarthome.energy.dto;

import java.time.LocalDateTime;

public class AddEnergyLogRequest {
    private Float energyUsed;
    private LocalDateTime timestamp;
    private Integer durationMinutes;
    private Double cost;

    public AddEnergyLogRequest() {
    }

    public AddEnergyLogRequest(Float energyUsed, LocalDateTime timestamp) {
        this.energyUsed = energyUsed;
        this.timestamp = timestamp;
    }

    public AddEnergyLogRequest(Float energyUsed, LocalDateTime timestamp, Integer durationMinutes) {
        this.energyUsed = energyUsed;
        this.timestamp = timestamp;
        this.durationMinutes = durationMinutes;
    }

    // Getters and Setters
    public Float getEnergyUsed() {
        return energyUsed;
    }

    public void setEnergyUsed(Float energyUsed) {
        this.energyUsed = energyUsed;
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
