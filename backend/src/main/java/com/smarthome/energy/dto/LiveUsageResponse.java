package com.smarthome.energy.dto;

/**
 * DTO for GET /api/analytics/total-live-usage response.
 */
public class LiveUsageResponse {

    private double totalWatts;
    private double totalKW;
    private int activeDevices;
    private String timestamp;

    public LiveUsageResponse() {}

    public LiveUsageResponse(double totalWatts, double totalKW, int activeDevices, String timestamp) {
        this.totalWatts = totalWatts;
        this.totalKW = totalKW;
        this.activeDevices = activeDevices;
        this.timestamp = timestamp;
    }

    public double getTotalWatts() { return totalWatts; }
    public void setTotalWatts(double totalWatts) { this.totalWatts = totalWatts; }

    public double getTotalKW() { return totalKW; }
    public void setTotalKW(double totalKW) { this.totalKW = totalKW; }

    public int getActiveDevices() { return activeDevices; }
    public void setActiveDevices(int activeDevices) { this.activeDevices = activeDevices; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
