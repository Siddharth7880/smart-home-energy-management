package com.smarthome.energy.dto;

/**
 * Device health report for technicians — returned by GET
 * /api/analytics/technician/device-health
 */
public class DeviceHealthReport {

    private Long deviceId;
    private String deviceName;
    private String deviceType;
    private String ownerName;
    private String ownerEmail;
    private double avgEnergyKwh; // historical average per log entry
    private double recentEnergyKwh; // last 24-hour total
    private double anomalyScore; // recentEnergyKwh / avgEnergyKwh; > 1.5 = abnormal
    private String healthStatus; // "NORMAL", "WARNING", "CRITICAL"
    private boolean isOnline;
    private String deviceStatus; // Original device state if needed
    private String status; // Derived "ONLINE" or "OFFLINE"
    private java.time.LocalDateTime lastUpdated;

    public DeviceHealthReport() {
    }

    // ── Getters & Setters ──

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

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public double getAvgEnergyKwh() {
        return avgEnergyKwh;
    }

    public void setAvgEnergyKwh(double avgEnergyKwh) {
        this.avgEnergyKwh = avgEnergyKwh;
    }

    public double getRecentEnergyKwh() {
        return recentEnergyKwh;
    }

    public void setRecentEnergyKwh(double recentEnergyKwh) {
        this.recentEnergyKwh = recentEnergyKwh;
    }

    public double getAnomalyScore() {
        return anomalyScore;
    }

    public void setAnomalyScore(double anomalyScore) {
        this.anomalyScore = anomalyScore;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public String getDeviceStatus() {
        return deviceStatus;
    }

    public void setDeviceStatus(String deviceStatus) {
        this.deviceStatus = deviceStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.time.LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(java.time.LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
