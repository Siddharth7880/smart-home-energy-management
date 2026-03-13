package com.smarthome.energy.dto;

import java.util.List;

/**
 * Full analytics summary response — returned by GET
 * /api/analytics/summary?period=...
 * and role-specific analytics endpoints.
 */
public class AnalyticsSummaryResponse {

    private String period;
    private double totalEnergyKwh;
    private double estimatedCostRs;
    private String peakHour;
    private double averageDailyKwh;
    private int activeDevices;
    private List<DeviceEnergyShare> topDevices;
    private List<EnergyTimePoint> timeline;

    public AnalyticsSummaryResponse() {
    }

    // ── Getters & Setters ──

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

    public double getAverageDailyKwh() {
        return averageDailyKwh;
    }

    public void setAverageDailyKwh(double averageDailyKwh) {
        this.averageDailyKwh = averageDailyKwh;
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
