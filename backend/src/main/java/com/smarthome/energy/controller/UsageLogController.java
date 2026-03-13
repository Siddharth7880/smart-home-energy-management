package com.smarthome.energy.controller;

import com.smarthome.energy.dto.AddEnergyLogRequest;
import com.smarthome.energy.dto.EnergyUsageLogResponse;
import com.smarthome.energy.service.EnergyUsageLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dedicated controller for /api/usage/* endpoints (Milestone 2 requirement).
 *
 * Routes:
 * POST /api/usage/{deviceId} → add usage log
 * GET /api/usage/{deviceId} → get all logs for device
 * GET /api/usage/{deviceId}?from=&to= → date-range filtered logs
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/usage")
public class UsageLogController {

    @Autowired
    private EnergyUsageLogService energyUsageLogService;

    /**
     * POST /api/usage/{deviceId}
     * Add a usage log entry for the specified device.
     * Only the device owner or Admin can log usage.
     */
    @PostMapping("/{deviceId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> addUsageLog(
            @PathVariable Long deviceId,
            @RequestBody AddEnergyLogRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(energyUsageLogService.addEnergyLog(deviceId, request));
    }

    /**
     * GET /api/usage/{deviceId}
     * Fetches usage logs, optionally filtered by date range.
     *
     * Query params (both required together for range filter):
     * from – ISO-8601 datetime, e.g. 2026-02-01T00:00:00
     * to – ISO-8601 datetime, e.g. 2026-02-28T23:59:59
     *
     * All authenticated roles can read usage logs.
     */
    @GetMapping("/{deviceId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getUsageLogs(
            @PathVariable Long deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        if (from != null && to != null) {
            // Date-range filtered response
            List<EnergyUsageLogResponse> logs = energyUsageLogService.getDeviceEnergyLogsByDateRange(deviceId, from,
                    to);
            return ResponseEntity.ok(logs);
        }

        // Full history
        List<EnergyUsageLogResponse> logs = energyUsageLogService.getDeviceEnergyLogs(deviceId);
        return ResponseEntity.ok(logs);
    }
}
