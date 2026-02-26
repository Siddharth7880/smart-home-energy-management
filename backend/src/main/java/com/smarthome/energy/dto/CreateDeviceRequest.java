package com.smarthome.energy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateDeviceRequest {

    @NotBlank(message = "Device name is required")
    private String name;

    @NotBlank(message = "Device type is required")
    private String type;

    private String description;
    private String location;

    @NotNull(message = "Power rating is required")
    @Min(value = 1, message = "Power rating must be at least 1 watt")
    private Float powerRating;

    private String status;

    public CreateDeviceRequest() {
    }

    public CreateDeviceRequest(String name, String type, String description, String location, Float powerRating) {
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

    public Float getPowerRating() {
        return powerRating;
    }

    public void setPowerRating(Float powerRating) {
        this.powerRating = powerRating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
