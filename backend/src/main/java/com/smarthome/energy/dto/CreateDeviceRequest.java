package com.smarthome.energy.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateDeviceRequest {
    @NotBlank(message = "Device name is required")
    private String name;

    @NotBlank(message = "Device type is required")
    private String type;

    private String description;
    private String location;
    private Double powerRating;
    private String status;

    public CreateDeviceRequest() {
    }

    public CreateDeviceRequest(String name, String type, String description, String location, Double powerRating) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.location = location;
        this.powerRating = powerRating;
        this.status = "active";
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
}
