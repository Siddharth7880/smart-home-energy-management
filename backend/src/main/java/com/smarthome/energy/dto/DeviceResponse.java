package com.smarthome.energy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class DeviceResponse {
    private Long id;
    private Long ownerId;
    private String name;
    private String type;
    private String description;
    private String location;
    private Double powerRating;
    private String status;
    private boolean isOnline;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double currentEnergyUsage;
    private Double totalEnergyUsage;

    public DeviceResponse() {
    }

    public DeviceResponse(Long id, String name, String type, String description, String location,
            Double powerRating, String status, boolean isOnline) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.location = location;
        this.powerRating = powerRating;
        this.status = status;
        this.isOnline = isOnline;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getPowerRating() {
        return powerRating;
    }

    public void setPowerRating(Double powerRating) {
        this.powerRating = powerRating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @JsonProperty("isOnline")
    public boolean isOnline() {
        return isOnline;
    }

    @JsonProperty("isOnline")
    public void setOnline(boolean online) {
        isOnline = online;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Double getCurrentEnergyUsage() {
        return currentEnergyUsage;
    }

    public void setCurrentEnergyUsage(Double currentEnergyUsage) {
        this.currentEnergyUsage = currentEnergyUsage;
    }

    public Double getTotalEnergyUsage() {
        return totalEnergyUsage;
    }

    public void setTotalEnergyUsage(Double totalEnergyUsage) {
        this.totalEnergyUsage = totalEnergyUsage;
    }
}
