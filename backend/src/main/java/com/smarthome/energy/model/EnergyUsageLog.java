package com.smarthome.energy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_usage_logs", indexes = {
    @Index(name = "idx_device_id", columnList = "device_id"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_device_timestamp", columnList = "device_id, timestamp")
})
public class EnergyUsageLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "energy_usage", nullable = false)
    private Double energyUsage;  // in kWh

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;  // Duration of the measurement in minutes

    @Column(name = "cost")
    private Double cost;  // Estimated cost based on energy usage

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public EnergyUsageLog() {
    }

    public EnergyUsageLog(Device device, Double energyUsage, LocalDateTime timestamp) {
        this.device = device;
        this.energyUsage = energyUsage;
        this.timestamp = timestamp;
        this.createdAt = LocalDateTime.now();
    }

    public EnergyUsageLog(Device device, Double energyUsage, LocalDateTime timestamp, Integer durationMinutes) {
        this.device = device;
        this.energyUsage = energyUsage;
        this.timestamp = timestamp;
        this.durationMinutes = durationMinutes;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
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

    @Override
    public String toString() {
        return "EnergyUsageLog{" +
                "id=" + id +
                ", deviceId=" + (device != null ? device.getId() : null) +
                ", energyUsage=" + energyUsage +
                ", timestamp=" + timestamp +
                ", durationMinutes=" + durationMinutes +
                ", cost=" + cost +
                ", createdAt=" + createdAt +
                '}';
    }
}
