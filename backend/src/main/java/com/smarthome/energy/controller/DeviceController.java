package com.smarthome.energy.controller;

import com.smarthome.energy.dto.*;
import com.smarthome.energy.service.DeviceService;
import com.smarthome.energy.service.EnergyUsageLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/devices")
@PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private EnergyUsageLogService energyUsageLogService;

    // ============= DEVICE ENDPOINTS =============

    /**
     * Get all devices for the current homeowner
     * Homeowners can only see their own devices
     * Admins can see all devices
     */
    @GetMapping
    public ResponseEntity<?> getDevices() {
        return ResponseEntity.ok(deviceService.getUserDevices());
    }

    /**
     * Get device by ID
     * Homeowners can only access their own devices
     */
    @GetMapping("/{deviceId}")
    public ResponseEntity<?> getDeviceById(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.getDeviceById(deviceId));
    }

    /**
     * Create a new device
     * Only homeowners and admins can create devices
     */
    @PostMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> createDevice(@RequestBody CreateDeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceService.createDevice(request));
    }

    /**
     * Update device
     * Homeowners can only update their own devices
     */
    @PutMapping("/{deviceId}")
    public ResponseEntity<?> updateDevice(
            @PathVariable Long deviceId,
            @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.ok(deviceService.updateDevice(deviceId, request));
    }

    /**
     * Delete device
     * Homeowners can only delete their own devices
     */
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.deleteDevice(deviceId));
    }

    /**
     * Get device energy consumption
     */
    @GetMapping("/{deviceId}/consumption")
    public ResponseEntity<?> getDeviceConsumption(
            @PathVariable Long deviceId,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(deviceService.getDeviceEnergyConsumption(deviceId, period));
    }

    /**
     * Get all devices energy consumption summary
     */
    @GetMapping("/consumption/summary")
    public ResponseEntity<?> getConsumptionSummary(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(deviceService.getConsumptionSummary(period));
    }

    /**
     * Control device (turn on/off)
     */
    @PostMapping("/{deviceId}/control")
    public ResponseEntity<?> controlDevice(
            @PathVariable Long deviceId,
            @RequestParam String action) {
        return ResponseEntity.ok(deviceService.controlDevice(deviceId, action));
    }

    /**
     * Get device status
     */
    @GetMapping("/{deviceId}/status")
    public ResponseEntity<?> getDeviceStatus(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.getDeviceStatus(deviceId));
    }

    // ============= ENERGY LOG ENDPOINTS =============

    /**
     * Add energy usage log for a device
     */
    @PostMapping("/{deviceId}/logs")
    public ResponseEntity<?> addEnergyLog(
            @PathVariable Long deviceId,
            @RequestBody AddEnergyLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(energyUsageLogService.addEnergyLog(deviceId, request));
    }

    /**
     * Get energy logs for a specific device
     */
    @GetMapping("/{deviceId}/logs")
    public ResponseEntity<?> getDeviceEnergyLogs(@PathVariable Long deviceId) {
        return ResponseEntity.ok(energyUsageLogService.getDeviceEnergyLogs(deviceId));
    }

    /**
     * Get energy logs for a device within a date range
     */
    @GetMapping("/{deviceId}/logs/range")
    public ResponseEntity<?> getDeviceEnergyLogsByDateRange(
            @PathVariable Long deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(energyUsageLogService.getDeviceEnergyLogsByDateRange(deviceId, startTime, endTime));
    }

    /**
     * Get device analytics
     */
    @GetMapping("/{deviceId}/analytics")
    public ResponseEntity<?> getDeviceAnalytics(
            @PathVariable Long deviceId,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(energyUsageLogService.getDeviceAnalytics(deviceId, period));
    }

    /**
     * Get all devices energy logs
     */
    @GetMapping("/logs/all")
    public ResponseEntity<?> getAllDeviceEnergyLogs(@RequestParam(required = false) String period) {
        return ResponseEntity.ok(energyUsageLogService.getAllDeviceEnergyLogs(period));
    }

    /**
     * Delete old energy logs
     */
    @DeleteMapping("/logs/old")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOldLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime beforeDate) {
        return ResponseEntity.ok(energyUsageLogService.deleteOldLogs(beforeDate));
    }
}
