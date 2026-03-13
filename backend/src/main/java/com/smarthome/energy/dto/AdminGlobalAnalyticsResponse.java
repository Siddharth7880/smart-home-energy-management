package com.smarthome.energy.dto;

import java.util.List;

/**
 * Admin-only global analytics response — returned by GET
 * /api/analytics/admin/global
 */
public class AdminGlobalAnalyticsResponse {

    private String period;
    private double totalEnergyKwh;
    private double estimatedCostRs;
    private String peakHour;
    private int totalHouseholds;
    private int totalDevices;
    private int activeDevices;
    private List<DeviceEnergyShare> topDevices;
    private List<EnergyTimePoint> timeline;

    public AdminGlobalAnalyticsResponse() {
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public double getTotalEnergyKwh() {
        return totalEnergyKwh;
    }

    public void setTotalEnergyKwh(double totalEnergyKwh) {
        this.totalEnergyKwh = totalEnergyKwh;
    }

    public double getEstimatedCostRs() {
        return estimatedCostRs;
    }

    public void setEstimatedCostRs(double estimatedCostRs) {
        this.estimatedCostRs = estimatedCostRs;
    }

    public String getPeakHour() {
        return peakHour;
    }

    public void setPeakHour(String peakHour) {
        this.peakHour = peakHour;
    }

    public int getTotalHouseholds() {
        return totalHouseholds;
    }

    public void setTotalHouseholds(int totalHouseholds) {
        this.totalHouseholds = totalHouseholds;
    }

    public int getTotalDevices() {
        return totalDevices;
    }

    public void setTotalDevices(int totalDevices) {
        this.totalDevices = totalDevices;
    }

    public int getActiveDevices() {
        return activeDevices;
    }

    public void setActiveDevices(int activeDevices) {
        this.activeDevices = activeDevices;
    }

    public List<DeviceEnergyShare> getTopDevices() {
        return topDevices;
    }

    public void setTopDevices(List<DeviceEnergyShare> topDevices) {
        this.topDevices = topDevices;
    }

    public List<EnergyTimePoint> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<EnergyTimePoint> timeline) {
        this.timeline = timeline;
    }
}
