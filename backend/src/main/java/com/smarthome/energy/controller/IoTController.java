package com.smarthome.energy.controller;

import com.smarthome.energy.service.IoTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for simulated IoT live-power readings.
 *
 * Endpoints:
 *   GET /api/iot/devices/{deviceId}/live  → single device live wattage
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/iot")
public class IoTController {

    @Autowired
    private IoTService iotService;

    /**
     * GET /api/iot/devices/{deviceId}/live
     * Returns the current simulated power draw for the given device.
     *
     * Response:
     * {
     *   "deviceId": 1,
     *   "currentPowerWatts": 1425.73,
     *   "timestamp": "2026-03-02T14:30:00"
     * }
     */
    @GetMapping("/devices/{deviceId}/live")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getLiveReading(@PathVariable Long deviceId) {
        return ResponseEntity.ok(iotService.getLiveReading(deviceId));
    }
}
