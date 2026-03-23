package com.smarthome.energy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Homeowner

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g., "air_conditioner", "heater", etc.

    private String description;

    private String location;

    @Column(name = "power_rating")
    private Float powerRating; // in watts (W)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status; // ON, OFF

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

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
        if (status == null) {
            status = DeviceStatus.OFF;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Device() {
    }

    public Device(User user, String name, String type, String location, Float powerRating) {
        this.user = user;
        this.name = name;
        this.type = type;
        this.location = location;
        this.powerRating = powerRating;
        this.status = DeviceStatus.OFF;
        this.isOnline = false;
        this.isDeleted = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public DeviceStatus getStatus() {
        return status;
    }

    public void setStatus(DeviceStatus status) {
        this.status = status;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
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
