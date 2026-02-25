package com.smarthome.energy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "installations")
public class Installation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long homeownerId;  // Homeowner ID

    @Column(nullable = false)
    private Long technicianId;  // Assigned technician ID (can be null initially)

    @Column(nullable = false)
    private Long deviceId;  // Device being installed

    @Column(nullable = false)
    private String location;

    private String description;

    @Column(nullable = false)
    private String status;  // "pending", "in_progress", "completed", "cancelled"

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;

    @Column(name = "actual_completion_date")
    private LocalDateTime actualCompletionDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "installation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Device> devices;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "pending";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Installation() {
    }

    public Installation(Long homeownerId, Long deviceId, String location) {
        this.homeownerId = homeownerId;
        this.deviceId = deviceId;
        this.location = location;
        this.status = "pending";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHomeownerId() {
        return homeownerId;
    }

    public void setHomeownerId(Long homeownerId) {
        this.homeownerId = homeownerId;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Integer getEstimatedDurationHours() {
        return estimatedDurationHours;
    }

    public void setEstimatedDurationHours(Integer estimatedDurationHours) {
        this.estimatedDurationHours = estimatedDurationHours;
    }

    public LocalDateTime getActualCompletionDate() {
        return actualCompletionDate;
    }

    public void setActualCompletionDate(LocalDateTime actualCompletionDate) {
        this.actualCompletionDate = actualCompletionDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public Set<Device> getDevices() {
        return devices;
    }

    public void setDevices(Set<Device> devices) {
        this.devices = devices;
    }
}
