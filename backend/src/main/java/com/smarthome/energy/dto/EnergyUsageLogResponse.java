package com.smarthome.energy.dto;

import java.time.LocalDateTime;

public class EnergyUsageLogResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private Double energyUsage;
    private LocalDateTime timestamp;
    private Integer durationMinutes;
    private Double cost;
    private LocalDateTime createdAt;

    public EnergyUsageLogResponse() {
    }

    public EnergyUsageLogResponse(Long id, Long deviceId, String deviceName, Double energyUsage, 
                                  LocalDateTime timestamp, Integer durationMinutes, Double cost) {
        this.id = id;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.energyUsage = energyUsage;
        this.timestamp = timestamp;
        this.durationMinutes = durationMinutes;
        this.cost = cost;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
