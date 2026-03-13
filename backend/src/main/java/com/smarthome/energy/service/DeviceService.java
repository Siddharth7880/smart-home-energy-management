package com.smarthome.energy.service;

import com.smarthome.energy.dto.CreateDeviceRequest;
import com.smarthome.energy.dto.DeviceResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.DeviceStatus;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.repository.UserRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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

    @Autowired
    private UserRepository userRepository;

    @Value("${smarthome.app.energyRatePerKwh:8.0}")
    private double energyRatePerKwh;

    // ═══════════════════════════════════════════════════════════════════════
    // READ Operations
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get all devices.
     * - ADMIN: returns all devices in the system
     * - TECHNICIAN: returns all devices (read-only context)
     * - HOMEOWNER: returns only their own devices
     */
    public Map<String, Object> getUserDevices() {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Device> devices;
        if (hasRole("ROLE_ADMIN")) {
            devices = deviceRepository.findAll().stream().filter(d -> !d.isDeleted()).collect(Collectors.toList());
        } else {
            devices = deviceRepository.findByUserIdAndIsDeletedFalse(userId);
        }

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
     * Get device by ID.
     * - ADMIN: can access any device
     * - TECHNICIAN: can access any device (read-only)
     * - HOMEOWNER: only their own device
     */
    public DeviceResponse getDeviceById(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN")
                && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        return convertToDeviceResponse(device);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // WRITE Operations (HOMEOWNER / ADMIN only)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create a new device for the current homeowner.
     * Validates: type, name not blank, no duplicate name per user, min power
     * rating.
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

        // Duplicate name check per user
        if (deviceRepository.existsByNameAndUserIdAndIsDeletedFalse(request.getName().trim(), userId)) {
            throw new IllegalArgumentException(
                    "A device named '" + request.getName().trim() + "' already exists for your account");
        }

        // Min power rating (1 watt minimum)
        if (request.getPowerRating() == null || request.getPowerRating() < 1) {
            throw new IllegalArgumentException("Power rating must be at least 1 watt");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Device device = new Device(
                user,
                request.getName().trim(),
                request.getType().toLowerCase(),
                request.getLocation(),
                request.getPowerRating());
        device.setDescription(request.getDescription());

        Device savedDevice = deviceRepository.save(device);
        return convertToDeviceResponse(savedDevice);
    }

    /**
     * Update an existing device (owner or admin only).
     */
    @Transactional
    public DeviceResponse updateDevice(Long deviceId, CreateDeviceRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            // Duplicate name check (excluding current device)
            if (!request.getName().trim().equalsIgnoreCase(device.getName())
                    && deviceRepository.existsByNameAndUserIdAndIdNotAndIsDeletedFalse(
                            request.getName().trim(), device.getUser().getId(), deviceId)) {
                throw new IllegalArgumentException(
                        "A device named '" + request.getName().trim() + "' already exists for this account");
            }
            device.setName(request.getName().trim());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()) {
            validateDeviceType(request.getType());
            device.setType(request.getType().toLowerCase());
        }
        if (request.getDescription() != null) {
            device.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            device.setLocation(request.getLocation());
        }
        if (request.getPowerRating() != null) {
            if (request.getPowerRating() < 1) {
                throw new IllegalArgumentException("Power rating must be at least 1 watt");
            }
            device.setPowerRating(request.getPowerRating());
        }

        Device updatedDevice = deviceRepository.save(device);
        return convertToDeviceResponse(updatedDevice);
    }

    /**
     * Delete a device (owner or admin only).
     */
    @Transactional
    public MessageResponse deleteDevice(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        device.setDeleted(true);
        device.setStatus(DeviceStatus.OFF); // Safety turn off
        deviceRepository.save(device);
        return new MessageResponse("Device '" + device.getName() + "' deleted successfully");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Toggle & Power
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * PATCH toggle: flip isOnline. If turning OFF, auto-generate a usage log.
     */
    @Transactional
    public DeviceResponse toggleDevice(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        LocalDateTime now = LocalDateTime.now();

        if (device.getStatus() == DeviceStatus.OFF) {
            // Turning ON
            device.setStatus(DeviceStatus.ON);
            device.setOnline(true); // Keeping for legacy frontend compatibility until fully removed
            device.setTurnedOnAt(now);
            device.setLastActive(now);
        } else {
            // Turning OFF — auto-log usage based on runtime
            device.setStatus(DeviceStatus.OFF);
            device.setOnline(false);
            device.setLastActive(now);

            LocalDateTime turnedOnAt = device.getTurnedOnAt();
            if (turnedOnAt != null && device.getPowerRating() != null && device.getPowerRating() > 0) {
                long minutesOn = java.time.Duration.between(turnedOnAt, now).toMinutes();
                if (minutesOn > 0) {
                    double hoursOn = minutesOn / 60.0;
                    // powerRating stored in Watts, so energy = (Watts / 1000) × hours = kWh
                    double energyKwh = Math.round((device.getPowerRating() / 1000f) * hoursOn * 10000.0) / 10000.0;
                    double cost = Math.round(energyKwh * energyRatePerKwh * 100.0) / 100.0;

                    EnergyUsageLog log = new EnergyUsageLog();
                    log.setDevice(device);
                    log.setEnergyUsed((float) energyKwh);
                    log.setTimestamp(now);
                    log.setDurationMinutes((int) minutesOn);
                    log.setCost(cost);
                    energyUsageLogRepository.save(log);
                }
            }
            device.setTurnedOnAt(null);
        }

        Device saved = deviceRepository.save(device);
        return convertToDeviceResponse(saved);
    }

    /**
     * GET /api/devices/total-power
     * Returns sum of powerRating (kW) for all currently ON devices.
     * Admin sees all users; Homeowner/Technician sees own devices.
     */
    public Map<String, Object> getTotalPower() {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        double totalKw;
        if (hasRole("ROLE_ADMIN")) {
            totalKw = Optional.ofNullable(deviceRepository.sumAllOnlinePowerRatings()).orElse(0.0) / 1000.0;
        } else {
            totalKw = Optional.ofNullable(deviceRepository.sumPowerRatingByUserIdAndOnline(userId)).orElse(0.0)
                    / 1000.0;
        }

        long activeCount;
        if (hasRole("ROLE_ADMIN")) {
            activeCount = deviceRepository.findByIsOnlineAndIsDeletedFalse(true).size();
        } else {
            activeCount = deviceRepository.findByUserIdAndIsOnlineAndIsDeletedFalse(userId, true).size();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalPowerKw", Math.round(totalKw * 1000.0) / 1000.0);
        result.put("totalPowerWatts", Math.round(totalKw * 1000.0));
        result.put("activeDevices", activeCount);
        result.put("success", true);
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Device Control (legacy POST endpoint — kept for compatibility)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Control device (turn on/off) and auto-log energy usage on turn-off.
     */
    @Transactional
    public MessageResponse controlDevice(Long deviceId, String action) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        if (!action.equalsIgnoreCase("on") && !action.equalsIgnoreCase("off")) {
            throw new IllegalArgumentException("Invalid action. Allowed actions: 'on', 'off'");
        }

        LocalDateTime now = LocalDateTime.now();

        if (action.equalsIgnoreCase("on")) {
            device.setStatus(DeviceStatus.ON);
            device.setOnline(true);
            device.setTurnedOnAt(now);
            device.setLastActive(now);
        } else {
            device.setStatus(DeviceStatus.OFF);
            device.setOnline(false);
            device.setLastActive(now);

            LocalDateTime turnedOnAt = device.getTurnedOnAt();
            if (turnedOnAt != null && device.getPowerRating() != null && device.getPowerRating() > 0) {
                long minutesOn = java.time.Duration.between(turnedOnAt, now).toMinutes();
                if (minutesOn > 0) {
                    double hoursOn = minutesOn / 60.0;
                    double energyKwh = (device.getPowerRating() / 1000f) * hoursOn;
                    double cost = energyKwh * energyRatePerKwh;

                    EnergyUsageLog log = new EnergyUsageLog();
                    log.setDevice(device);
                    log.setEnergyUsed((float) energyKwh);
                    log.setTimestamp(now);
                    log.setDurationMinutes((int) minutesOn);
                    log.setCost(cost);
                    energyUsageLogRepository.save(log);
                }
            }
            device.setTurnedOnAt(null);
        }

        deviceRepository.save(device);
        return new MessageResponse("Device '" + device.getName() + "' turned " + action.toUpperCase());
    }

    /**
     * Get device status map.
     */
    public Map<String, Object> getDeviceStatus(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN")
                && !device.getUser().getId().equals(userId)) {
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
     * Get device energy consumption logs
     */
    public Map<String, Object> getDeviceEnergyConsumption(Long deviceId, String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN")
                && !device.getUser().getId().equals(userId)) {
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
        List<Device> devices = hasRole("ROLE_ADMIN")
                ? deviceRepository.findAll().stream().filter(d -> !d.isDeleted()).collect(Collectors.toList())
                : deviceRepository.findByUserIdAndIsDeletedFalse(userId);

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
        summary.put("costEstimate", totalConsumption * energyRatePerKwh);
        summary.put("success", true);

        return summary;
    }

    /**
     * Get all devices by type
     */
    public List<DeviceResponse> getDevicesByType(String type) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Device> devices = deviceRepository.findByTypeAndIsDeletedFalse(type);
        return devices.stream()
                .filter(device -> hasRole("ROLE_ADMIN") || device.getUser().getId().equals(userId))
                .map(this::convertToDeviceResponse)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Private Helpers
    // ═══════════════════════════════════════════════════════════════════════

    private DeviceResponse convertToDeviceResponse(Device device) {
        DeviceResponse response = new DeviceResponse();
        response.setId(device.getId());
        response.setOwnerId(device.getUser() != null ? device.getUser().getId() : null);
        response.setName(device.getName());
        response.setType(device.getType());
        response.setDescription(device.getDescription());
        response.setLocation(device.getLocation());
        response.setPowerRating(device.getPowerRating());
        response.setStatus(device.getStatus());
        response.setOnline(device.getStatus() == DeviceStatus.ON);
        response.setLastActive(device.getLastActive());
        response.setCreatedAt(device.getCreatedAt());
        response.setUpdatedAt(device.getUpdatedAt());

        // Get energy usage for the last 24 hours
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        Double dailyUsage = energyUsageLogRepository.getTotalEnergyConsumption(
                device.getId(), oneDayAgo, LocalDateTime.now());
        response.setCurrentEnergyUsage(dailyUsage != null ? dailyUsage.floatValue() : 0.0f);

        // Get total energy usage for the current month
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Double monthlyUsage = energyUsageLogRepository.getTotalEnergyConsumption(
                device.getId(), monthStart, LocalDateTime.now());
        response.setTotalEnergyUsage(monthlyUsage != null ? monthlyUsage.floatValue() : 0.0f);

        return response;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    private boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role::equals);
    }

    /**
     * Validate device type against allowed list (spec types + extended set).
     */
    private void validateDeviceType(String type) {
        // Spec types (case-insensitive)
        String[] allowedTypes = {
                "light", "ac", "fridge", "tv", "custom",
                // Extended types in use
                "thermostat", "bulb", "plug", "lock", "air_conditioner", "heater",
                "washer", "dryer", "refrigerator", "water_heater", "solar_panel",
                "ev_charger", "smart_meter", "lighting", "speaker", "camera", "hvac"
        };

        for (String allowed : allowedTypes) {
            if (allowed.equalsIgnoreCase(type))
                return;
        }

        throw new IllegalArgumentException(
                "Invalid device type: '" + type + "'. Allowed: Light, AC, Fridge, TV, Custom");
    }

    private Double calculateTotalConsumption(Long userId) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<Device> devices = hasRole("ROLE_ADMIN")
                ? deviceRepository.findAll().stream().filter(d -> !d.isDeleted()).collect(Collectors.toList())
                : deviceRepository.findByUserIdAndIsDeletedFalse(userId);

        return devices.stream()
                .map(device -> {
                    Double consumption = energyUsageLogRepository.getTotalEnergyConsumption(
                            device.getId(), monthStart, LocalDateTime.now());
                    return consumption != null ? consumption : 0.0;
                })
                .reduce(0.0, Double::sum);
    }

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
