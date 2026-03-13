package com.smarthome.energy.dto;

import java.util.Map;

public class SystemStatisticsResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalDevices;
    private long totalInstallations;
    private Map<String, Long> roleDistribution;
    private double totalEnergyConsumption;
    private String lastUpdated;

    public SystemStatisticsResponse() {
    }

    public SystemStatisticsResponse(long totalUsers, long activeUsers, long totalDevices,
                                   long totalInstallations, Map<String, Long> roleDistribution,
                                   double totalEnergyConsumption, String lastUpdated) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalDevices = totalDevices;
        this.totalInstallations = totalInstallations;
        this.roleDistribution = roleDistribution;
        this.totalEnergyConsumption = totalEnergyConsumption;
        this.lastUpdated = lastUpdated;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalDevices() {
        return totalDevices;
    }

    public void setTotalDevices(long totalDevices) {
        this.totalDevices = totalDevices;
    }

    public long getTotalInstallations() {
        return totalInstallations;
    }

    public void setTotalInstallations(long totalInstallations) {
        this.totalInstallations = totalInstallations;
    }

    public Map<String, Long> getRoleDistribution() {
        return roleDistribution;
    }

    public void setRoleDistribution(Map<String, Long> roleDistribution) {
        this.roleDistribution = roleDistribution;
    }

    public double getTotalEnergyConsumption() {
        return totalEnergyConsumption;
    }

    public void setTotalEnergyConsumption(double totalEnergyConsumption) {
        this.totalEnergyConsumption = totalEnergyConsumption;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
