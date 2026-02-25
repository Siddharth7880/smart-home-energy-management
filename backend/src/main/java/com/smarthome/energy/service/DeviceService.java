package com.smarthome.energy.service;

import com.smarthome.energy.dto.CreateDeviceRequest;
import com.smarthome.energy.dto.DeviceResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    /**
     * Get all devices for the current user (homeowner)
     * Admins can see all devices
     */
    public Map<String, Object> getUserDevices() {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Device> devices = deviceRepository.findByOwnerId(userId);
        List<DeviceResponse> deviceResponses = devices.stream()
                .map(this::convertToDeviceResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("devices", deviceResponses);
        response.put("totalDevices", deviceResponses.size());
        response.put("totalConsumption", calculateTotalConsumption(userId));
        response.put("success", true);

        return response;
    }

    /**
     * Get device by ID
     */
    public DeviceResponse getDeviceById(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        return convertToDeviceResponse(device);
    }

    /**
     * Create a new device
     */
    @Transactional
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        validateDeviceType(request.getType());

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Device name is required");
        }

        Device device = new Device();
        device.setOwnerId(userId);
        device.setName(request.getName());
        device.setType(request.getType());
        device.setDescription(request.getDescription());
        device.setLocation(request.getLocation());
        device.setPowerRating(request.getPowerRating());
        device.setStatus("active");
        device.setOnline(true);

        Device savedDevice = deviceRepository.save(device);

        return convertToDeviceResponse(savedDevice);
    }

    /**
     * Update device
     */
    @Transactional
    public DeviceResponse updateDevice(Long deviceId, CreateDeviceRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            device.setName(request.getName());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()) {
            validateDeviceType(request.getType());
            device.setType(request.getType());
        }
        if (request.getDescription() != null) {
            device.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            device.setLocation(request.getLocation());
        }
        if (request.getPowerRating() != null) {
            device.setPowerRating(request.getPowerRating());
        }

        Device updatedDevice = deviceRepository.save(device);

        return convertToDeviceResponse(updatedDevice);
    }

    /**
     * Delete device
     */
    @Transactional
    public MessageResponse deleteDevice(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        deviceRepository.delete(device);

        return new MessageResponse("Device '" + device.getName() + "' deleted successfully");
    }

    /**
     * Get device energy consumption logs
     */
    public Map<String, Object> getDeviceEnergyConsumption(Long deviceId, String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        String periodToUse = period != null ? period : "daily";
        LocalDateTime startTime = calculateStartTime(periodToUse);
        LocalDateTime endTime = LocalDateTime.now();

        Double totalConsumption = energyUsageLogRepository.getTotalEnergyConsumption(deviceId, startTime, endTime);
        Double averageConsumption = energyUsageLogRepository.getAverageEnergyConsumption(deviceId, startTime, endTime);
        Double totalCost = energyUsageLogRepository.getTotalCost(deviceId, startTime, endTime);

        Map<String, Object> consumption = new HashMap<>();
        consumption.put("deviceId", deviceId);
        consumption.put("deviceName", device.getName());
        consumption.put("period", periodToUse);
        consumption.put("totalConsumption", totalConsumption != null ? totalConsumption : 0.0);
        consumption.put("averageConsumption", averageConsumption != null ? averageConsumption : 0.0);
        consumption.put("totalCost", totalCost != null ? totalCost : 0.0);
        consumption.put("success", true);

        return consumption;
    }

    /**
     * Get consumption summary for all devices of the current user
     */
    public Map<String, Object> getConsumptionSummary(String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        String periodToUse = period != null ? period : "monthly";
        List<Device> devices = deviceRepository.findByOwnerId(userId);

        Double totalConsumption = 0.0;
        List<Map<String, Object>> deviceSummaries = new ArrayList<>();

        LocalDateTime startTime = calculateStartTime(periodToUse);
        LocalDateTime endTime = LocalDateTime.now();

        for (Device device : devices) {
            Double consumption = energyUsageLogRepository.getTotalEnergyConsumption(device.getId(), startTime, endTime);
            Double cost = energyUsageLogRepository.getTotalCost(device.getId(), startTime, endTime);

            if (consumption == null)
                consumption = 0.0;
            if (cost == null)
                cost = 0.0;

            totalConsumption += consumption;

            Map<String, Object> deviceSummary = new HashMap<>();
            deviceSummary.put("deviceId", device.getId());
            deviceSummary.put("deviceName", device.getName());
            deviceSummary.put("consumption", consumption);
            deviceSummary.put("cost", cost);
            deviceSummary.put("type", device.getType());

            deviceSummaries.add(deviceSummary);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("period", periodToUse);
        summary.put("totalConsumption", totalConsumption);
        summary.put("devices", deviceSummaries);
        summary.put("costEstimate", totalConsumption * 5.0); // Assuming $5 per kWh
        summary.put("success", true);

        return summary;
    }

    /**
     * Control device (turn on/off) and auto-log energy usage on turn-off
     */
    @Transactional
    public MessageResponse controlDevice(Long deviceId, String action) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        if (!action.equalsIgnoreCase("on") && !action.equalsIgnoreCase("off")) {
            throw new IllegalArgumentException("Invalid action. Allowed actions: 'on', 'off'");
        }

        LocalDateTime now = LocalDateTime.now();

        if (action.equalsIgnoreCase("on")) {
            // Turn ON: mark online, record turn-on time
            device.setOnline(true);
            device.setTurnedOnAt(now);
            device.setLastActive(now);
        } else {
            // Turn OFF: calculate session energy and auto-log
            device.setOnline(false);
            device.setLastActive(now);

            LocalDateTime turnedOnAt = device.getTurnedOnAt();
            if (turnedOnAt != null && device.getPowerRating() != null && device.getPowerRating() > 0) {
                // Calculate how long the device was ON (in minutes)
                long minutesOn = java.time.Duration.between(turnedOnAt, now).toMinutes();
                if (minutesOn > 0) {
                    double hoursOn = minutesOn / 60.0;
                    double energyUsedKwh = device.getPowerRating() * hoursOn;
                    // cost at ₹8 per kWh (common Indian residential tariff)
                    double cost = energyUsedKwh * 8.0;

                    EnergyUsageLog log = new EnergyUsageLog();
                    log.setDevice(device);
                    log.setEnergyUsage(energyUsedKwh);
                    log.setTimestamp(now);
                    log.setDurationMinutes((int) minutesOn);
                    log.setCost(cost);
                    energyUsageLogRepository.save(log);
                }
            }

            // Clear the turnedOnAt so it doesn't get reused
            device.setTurnedOnAt(null);
        }

        deviceRepository.save(device);

        return new MessageResponse("Device '" + device.getName() + "' turned " + action.toUpperCase());
    }

    /**
     * Get device status
     */
    public Map<String, Object> getDeviceStatus(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        Double currentPowerUsage = energyUsageLogRepository.getTotalEnergyConsumption(
                deviceId, oneHourAgo, LocalDateTime.now());

        Map<String, Object> status = new HashMap<>();
        status.put("deviceId", deviceId);
        status.put("deviceName", device.getName());
        status.put("status", device.getStatus());
        status.put("isOnline", device.isOnline());
        status.put("lastUpdated", device.getLastActive());
        status.put("powerUsage", currentPowerUsage != null ? currentPowerUsage : 0.0);
        status.put("success", true);

        return status;
    }

    /**
     * Get all devices by type
     */
    public List<DeviceResponse> getDevicesByType(String type) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Device> devices = deviceRepository.findByType(type);
        return devices.stream()
                .filter(device -> device.getOwnerId().equals(userId))
                .map(this::convertToDeviceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper: Convert Device entity to DeviceResponse DTO
     */
    private DeviceResponse convertToDeviceResponse(Device device) {
        DeviceResponse response = new DeviceResponse();
        response.setId(device.getId());
        response.setOwnerId(device.getOwnerId());
        response.setName(device.getName());
        response.setType(device.getType());
        response.setDescription(device.getDescription());
        response.setLocation(device.getLocation());
        response.setPowerRating(device.getPowerRating());
        response.setStatus(device.getStatus());
        response.setOnline(device.isOnline());
        response.setLastActive(device.getLastActive());
        response.setCreatedAt(device.getCreatedAt());
        response.setUpdatedAt(device.getUpdatedAt());

        // Get energy usage for the last 24 hours
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        Double dailyUsage = energyUsageLogRepository.getTotalEnergyConsumption(
                device.getId(), oneDayAgo, LocalDateTime.now());
        response.setCurrentEnergyUsage(dailyUsage != null ? dailyUsage : 0.0);

        // Get total energy usage for the month
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double monthlyUsage = energyUsageLogRepository.getTotalEnergyConsumption(
                device.getId(), monthStart, LocalDateTime.now());
        response.setTotalEnergyUsage(monthlyUsage != null ? monthlyUsage : 0.0);

        return response;
    }

    /**
     * Helper: Get current user ID from authentication context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    /**
     * Helper: Validate device access
     */
    private void validateDeviceAccess(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!device.getOwnerId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }
    }

    /**
     * Helper: Validate device type
     */
    private void validateDeviceType(String type) {
        String[] allowedTypes = { "thermostat", "bulb", "plug", "lock", "air_conditioner", "heater",
                "washer", "dryer", "refrigerator", "water_heater", "solar_panel", "ev_charger",
                "smart_meter", "lighting", "speaker", "camera", "HVAC" };

        for (String allowed : allowedTypes) {
            if (allowed.equalsIgnoreCase(type))
                return;
        }

        throw new IllegalArgumentException("Invalid device type: " + type);
    }

    /**
     * Helper: Calculate total consumption for all user devices
     */
    private Double calculateTotalConsumption(Long userId) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<Device> devices = deviceRepository.findByOwnerId(userId);

        return devices.stream()
                .map(device -> {
                    Double consumption = energyUsageLogRepository.getTotalEnergyConsumption(
                            device.getId(), monthStart, LocalDateTime.now());
                    return consumption != null ? consumption : 0.0;
                })
                .reduce(0.0, Double::sum);
    }

    /**
     * Helper: Calculate start time based on period
     */
    private LocalDateTime calculateStartTime(String period) {
        LocalDateTime now = LocalDateTime.now();

        switch (period.toLowerCase()) {
            case "daily":
                return now.minusDays(1);
            case "weekly":
                return now.minusWeeks(1);
            case "monthly":
                return now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            case "yearly":
                return now.withMonth(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            default:
                return now.minusDays(1);
        }
    }
}
