package com.smarthome.energy.service;

import com.smarthome.energy.dto.AddEnergyLogRequest;
import com.smarthome.energy.dto.EnergyUsageLogResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EnergyUsageLogService {

    @Value("${smarthome.app.energyRatePerKwh:8.0}")
    private double energyRatePerKwh;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    /**
     * Add a new energy usage log for a device
     */
    @Transactional
    public EnergyUsageLogResponse addEnergyLog(Long deviceId, AddEnergyLogRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        if (request.getEnergyUsed() == null || request.getEnergyUsed() < 0) {
            throw new IllegalArgumentException("Energy usage must be a positive number");
        }

        EnergyUsageLog log = new EnergyUsageLog();
        log.setDevice(device);
        log.setEnergyUsed(request.getEnergyUsed());

        if (request.getTimestamp() != null) {
            log.setTimestamp(request.getTimestamp());
        } else {
            log.setTimestamp(LocalDateTime.now());
        }

        if (request.getDurationMinutes() != null) {
            log.setDurationMinutes(request.getDurationMinutes());
        }

        if (request.getCost() != null) {
            log.setCost(request.getCost());
        } else {
            // Use configurable rate per kWh
            log.setCost(request.getEnergyUsed() * energyRatePerKwh);
        }

        EnergyUsageLog savedLog = energyUsageLogRepository.save(log);
        return convertToResponse(savedLog);
    }

    /**
     * Get all energy logs for a device
     */
    public List<EnergyUsageLogResponse> getDeviceEnergyLogs(Long deviceId) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));
        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        List<EnergyUsageLog> logs = energyUsageLogRepository.findByDeviceIdOrderByTimestampDesc(deviceId);
        return logs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get energy logs for a device within a time range
     */
    public List<EnergyUsageLogResponse> getDeviceEnergyLogsByDateRange(Long deviceId, LocalDateTime startTime,
            LocalDateTime endTime) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));
        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        List<EnergyUsageLog> logs = energyUsageLogRepository.findByDeviceIdAndTimestampBetween(deviceId, startTime,
                endTime);
        return logs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get energy analytics for a device
     */
    public Map<String, Object> getDeviceAnalytics(Long deviceId, String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));
        if (!hasRole("ROLE_ADMIN") && !hasRole("ROLE_TECHNICIAN") && !device.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access denied: you do not own this device");
        }

        String periodToUse = period != null ? period : "monthly";
        LocalDateTime startTime = calculateStartTime(periodToUse);
        LocalDateTime endTime = LocalDateTime.now();

        Double totalConsumption = energyUsageLogRepository.getTotalEnergyConsumption(deviceId, startTime, endTime);
        Double averageConsumption = energyUsageLogRepository.getAverageEnergyConsumption(deviceId, startTime, endTime);
        Double totalCost = energyUsageLogRepository.getTotalCost(deviceId, startTime, endTime);
        long logCount = energyUsageLogRepository.countByDeviceId(deviceId);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("deviceId", deviceId);
        analytics.put("deviceName", device.getName());
        analytics.put("deviceType", device.getType());
        analytics.put("period", periodToUse);
        analytics.put("totalConsumption", totalConsumption != null ? totalConsumption : 0.0);
        analytics.put("averageConsumption", averageConsumption != null ? averageConsumption : 0.0);
        analytics.put("totalCost", totalCost != null ? totalCost : 0.0);
        analytics.put("logCount", logCount);
        analytics.put("startDate", startTime);
        analytics.put("endDate", endTime);

        return analytics;
    }

    /**
     * Get energy logs for all user devices
     */
    public Map<String, Object> getAllDeviceEnergyLogs(String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Device> devices = deviceRepository.findByUserIdAndIsDeletedFalse(userId);
        Map<String, Object> allLogs = new HashMap<>();
        List<Map<String, Object>> deviceLogs = new java.util.ArrayList<>();

        String periodToUse = period != null ? period : "monthly";
        LocalDateTime startTime = calculateStartTime(periodToUse);
        LocalDateTime endTime = LocalDateTime.now();

        Double totalConsumption = 0.0;
        Double totalCost = 0.0;

        for (Device device : devices) {
            Double consumption = energyUsageLogRepository.getTotalEnergyConsumption(device.getId(), startTime, endTime);
            Double cost = energyUsageLogRepository.getTotalCost(device.getId(), startTime, endTime);

            if (consumption == null)
                consumption = 0.0;
            if (cost == null)
                cost = 0.0;

            totalConsumption += consumption;
            totalCost += cost;

            List<EnergyUsageLog> logs = energyUsageLogRepository.findByDeviceIdAndTimestampBetween(
                    device.getId(), startTime, endTime);

            Map<String, Object> deviceLog = new HashMap<>();
            deviceLog.put("deviceId", device.getId());
            deviceLog.put("deviceName", device.getName());
            deviceLog.put("deviceType", device.getType());
            deviceLog.put("consumption", consumption);
            deviceLog.put("cost", cost);
            deviceLog.put("logCount", logs.size());

            deviceLogs.add(deviceLog);
        }

        allLogs.put("period", periodToUse);
        allLogs.put("totalConsumption", totalConsumption);
        allLogs.put("totalCost", totalCost);
        allLogs.put("deviceLogs", deviceLogs);
        allLogs.put("startDate", startTime);
        allLogs.put("endDate", endTime);

        return allLogs;
    }

    /**
     * Delete old energy logs (for maintenance)
     */
    @Transactional
    public MessageResponse deleteOldLogs(LocalDateTime beforeDate) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        long deletedCount = energyUsageLogRepository.deleteByTimestampBefore(beforeDate);
        return new MessageResponse(deletedCount + " old energy logs deleted successfully");
    }

    /**
     * Helper: Convert entity to response DTO
     */
    private EnergyUsageLogResponse convertToResponse(EnergyUsageLog log) {
        EnergyUsageLogResponse response = new EnergyUsageLogResponse();
        response.setId(log.getId());
        response.setDeviceId(log.getDevice().getId());
        response.setDeviceName(log.getDevice().getName());
        response.setEnergyUsed(log.getEnergyUsed());
        response.setTimestamp(log.getTimestamp());
        response.setDurationMinutes(log.getDurationMinutes());
        response.setCost(log.getCost());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }

    /**
     * Helper: Get current user ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    /**
     * Helper: Check if current user has a specific role
     */
    private boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role::equals);
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
