package com.smarthome.energy.dto;

/**
 * Represents a single device's energy share — used inside
 * AnalyticsSummaryResponse.topDevices
 */
public class DeviceEnergyShare {

    private Long deviceId;
    private String deviceName;
    private String deviceType;
    private double energyKwh;
    private double costRs;
    private double percentage; // % of total consumption

    public DeviceEnergyShare() {
    }

    public DeviceEnergyShare(Long deviceId, String deviceName, String deviceType,
            double energyKwh, double costRs, double percentage) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.deviceType = deviceType;
        this.energyKwh = energyKwh;
        this.costRs = costRs;
        this.percentage = percentage;
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

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public double getEnergyKwh() {
        return energyKwh;
    }

    public void setEnergyKwh(double energyKwh) {
        this.energyKwh = energyKwh;
    }

    public double getCostRs() {
        return costRs;
    }

    public void setCostRs(double costRs) {
        this.costRs = costRs;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
