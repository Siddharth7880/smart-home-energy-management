package com.smarthome.energy.controller;

import com.smarthome.energy.dto.*;
import com.smarthome.energy.service.DeviceService;
import com.smarthome.energy.service.EnergyUsageLogService;
import jakarta.validation.Valid;
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
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private EnergyUsageLogService energyUsageLogService;

    // ─────────────────────────────────────────────────────────────────────
    // CRUD Endpoints
    // ─────────────────────────────────────────────────────────────────────

    /**
     * GET /api/devices
     * HOMEOWNER → their own devices
     * ADMIN → all devices in the system
     * TECHNICIAN → read-only view of all devices
     */
    @GetMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDevices() {
        return ResponseEntity.ok(deviceService.getUserDevices());
    }

    /**
     * GET /api/devices/{id}
     * HOMEOWNER → owner only
     * ADMIN / TECHNICIAN → any device
     */
    @GetMapping("/{deviceId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceById(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.getDeviceById(deviceId));
    }

    /**
     * POST /api/devices
     * Only HOMEOWNER and ADMIN can create devices.
     */
    @PostMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceService.createDevice(request));
    }

    /**
     * PUT /api/devices/{id}
     * HOMEOWNER (own device) or ADMIN.
     */
    @PutMapping("/{deviceId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateDevice(
            @PathVariable Long deviceId,
            @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.ok(deviceService.updateDevice(deviceId, request));
    }

    /**
     * DELETE /api/devices/{id}
     * HOMEOWNER (own device) or ADMIN.
     * TECHNICIAN is explicitly excluded.
     */
    @DeleteMapping("/{deviceId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDevice(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.deleteDevice(deviceId));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Toggle & Power Endpoints (Milestone 2 Enhancements)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * PATCH /api/devices/{id}/toggle
     * Flip ON/OFF status; auto-logs usage when turning OFF.
     * HOMEOWNER (own device) or ADMIN.
     */
    @PatchMapping("/{deviceId}/toggle")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleDevice(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.toggleDevice(deviceId));
    }

    /**
     * PUT /api/devices/{id}/toggle
     * Alias for PATCH toggle — ensures broad client compatibility.
     */
    @PutMapping("/{deviceId}/toggle")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleDevicePut(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.toggleDevice(deviceId));
    }

    /**
     * GET /api/devices/total-power
     * Returns sum of powerRating (kW) for all currently ON devices.
     * All authenticated roles can access.
     */
    @GetMapping("/total-power")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getTotalPower() {
        return ResponseEntity.ok(deviceService.getTotalPower());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Legacy Control & Status Endpoints
    // ─────────────────────────────────────────────────────────────────────

    /**
     * POST /api/devices/{id}/control?action=on|off (legacy endpoint)
     */
    @PostMapping("/{deviceId}/control")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> controlDevice(
            @PathVariable Long deviceId,
            @RequestParam String action) {
        return ResponseEntity.ok(deviceService.controlDevice(deviceId, action));
    }

    /**
     * GET /api/devices/{id}/status
     */
    @GetMapping("/{deviceId}/status")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceStatus(@PathVariable Long deviceId) {
        return ResponseEntity.ok(deviceService.getDeviceStatus(deviceId));
    }

    /**
     * GET /api/devices/{id}/consumption
     */
    @GetMapping("/{deviceId}/consumption")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceConsumption(
            @PathVariable Long deviceId,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(deviceService.getDeviceEnergyConsumption(deviceId, period));
    }

    /**
     * GET /api/devices/consumption/summary
     */
    @GetMapping("/consumption/summary")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getConsumptionSummary(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(deviceService.getConsumptionSummary(period));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Energy Log Endpoints (under /api/devices/{id}/logs)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * POST /api/devices/{id}/logs
     */
    @PostMapping("/{deviceId}/logs")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> addEnergyLog(
            @PathVariable Long deviceId,
            @RequestBody AddEnergyLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(energyUsageLogService.addEnergyLog(deviceId, request));
    }

    /**
     * GET /api/devices/{id}/logs
     */
    @GetMapping("/{deviceId}/logs")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceEnergyLogs(@PathVariable Long deviceId) {
        return ResponseEntity.ok(energyUsageLogService.getDeviceEnergyLogs(deviceId));
    }

    /**
     * GET /api/devices/{id}/logs/range
     */
    @GetMapping("/{deviceId}/logs/range")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceEnergyLogsByDateRange(
            @PathVariable Long deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return ResponseEntity.ok(
                energyUsageLogService.getDeviceEnergyLogsByDateRange(deviceId, startTime, endTime));
    }

    /**
     * GET /api/devices/{id}/analytics
     */
    @GetMapping("/{deviceId}/analytics")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDeviceAnalytics(
            @PathVariable Long deviceId,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(energyUsageLogService.getDeviceAnalytics(deviceId, period));
    }

    /**
     * GET /api/devices/logs/all
     */
    @GetMapping("/logs/all")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getAllDeviceEnergyLogs(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(energyUsageLogService.getAllDeviceEnergyLogs(period));
    }

    /**
     * DELETE /api/devices/logs/old (Admin only)
     */
    @DeleteMapping("/logs/old")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOldLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime beforeDate) {
        return ResponseEntity.ok(energyUsageLogService.deleteOldLogs(beforeDate));
    }
}
