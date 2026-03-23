package com.smarthome.energy.dto;

import java.time.LocalDateTime;

public class DeviceScheduleRequest {
    private Long deviceId;
    private String action; // "ON" or "OFF"
    private LocalDateTime scheduledAt;
    private String label;

    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
