package com.smarthome.energy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId; // Homeowner ID

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g., "air_conditioner", "heater", etc.

    private String description;

    private String location;

    @Column(name = "power_rating")
    private Double powerRating; // in kW

    @Column(nullable = false)
    private String status; // "active", "inactive", "maintenance"

    @Column(name = "is_online", nullable = false)
    private boolean isOnline;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "turned_on_at")
    private LocalDateTime turnedOnAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "installation_date")
    private LocalDateTime installationDate;

    @ManyToOne
    @JoinColumn(name = "installation_id")
    private Installation installation;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = "active";
        isOnline = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Device() {
    }

    public Device(Long ownerId, String name, String type, String location, Double powerRating) {
        this.ownerId = ownerId;
        this.name = name;
        this.type = type;
        this.location = location;
        this.powerRating = powerRating;
        this.status = "active";
        this.isOnline = true;
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

    public boolean isOnline() {
        return isOnline;
    }

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

    public LocalDateTime getTurnedOnAt() {
        return turnedOnAt;
    }

    public void setTurnedOnAt(LocalDateTime turnedOnAt) {
        this.turnedOnAt = turnedOnAt;
    }

    public LocalDateTime getInstallationDate() {
        return installationDate;
    }

    public void setInstallationDate(LocalDateTime installationDate) {
        this.installationDate = installationDate;
    }

    public Installation getInstallation() {
        return installation;
    }

    public void setInstallation(Installation installation) {
        this.installation = installation;
    }
}
