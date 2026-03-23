package com.smarthome.energy.dto;

/**
 * Single data point for hourly energy aggregation.
 *
 * Used by: GET /api/analytics/hourly?date=YYYY-MM-DD
 */
public class HourlyEnergyPoint {

    private int hour;       // 0–23
    private double energy;  // kWh

    public HourlyEnergyPoint() {}

    public HourlyEnergyPoint(int hour, double energy) {
        this.hour = hour;
        this.energy = energy;
    }

    public int getHour() { return hour; }
    public void setHour(int hour) { this.hour = hour; }

    public double getEnergy() { return energy; }
    public void setEnergy(double energy) { this.energy = energy; }
}
