package com.smarthome.energy.dto;

/**
 * Single data point for hourly or daily energy time-series.
 *
 * Used by:
 *   GET /api/analytics/hourly?date=YYYY-MM-DD
 *   GET /api/analytics/daily?month=YYYY-MM
 */
public class EnergyTimePoint {

    private String time;    // e.g. "10 AM" or "Mar 01"
    private double energy;  // kWh
    private double cost;    // currency

    public EnergyTimePoint() {}

    public EnergyTimePoint(String time, double energy, double cost) {
        this.time = time;
        this.energy = energy;
        this.cost = cost;
    }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public double getEnergy() { return energy; }
    public void setEnergy(double energy) { this.energy = energy; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }
}
