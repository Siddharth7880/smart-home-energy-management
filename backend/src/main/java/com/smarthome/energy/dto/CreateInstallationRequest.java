package com.smarthome.energy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateInstallationRequest {
    @NotNull(message = "Homeowner ID is required")
    private Long homeownerId;

    @NotNull(message = "Device ID is required")
    private Long deviceId;

    @NotBlank(message = "Installation location is required")
    private String location;

    private String description;
    private String scheduledDate;
    private Integer estimatedDurationHours;

    public CreateInstallationRequest() {
    }

    public CreateInstallationRequest(Long homeownerId, Long deviceId, String location) {
        this.homeownerId = homeownerId;
        this.deviceId = deviceId;
        this.location = location;
        this.description = "";
    }

    public Long getHomeownerId() {
        return homeownerId;
    }

    public void setHomeownerId(Long homeownerId) {
        this.homeownerId = homeownerId;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Integer getEstimatedDurationHours() {
        return estimatedDurationHours;
    }

    public void setEstimatedDurationHours(Integer estimatedDurationHours) {
        this.estimatedDurationHours = estimatedDurationHours;
    }
}
