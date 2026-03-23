package com.smarthome.energy.controller;

import com.smarthome.energy.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    /**
     * GET /api/alerts — Get all alerts + unread count.
     */
    @GetMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAlerts() {
        return ResponseEntity.ok(alertService.getAlerts());
    }

    /**
     * POST /api/alerts/mark-read — Mark all alerts as read.
     */
    @PostMapping("/mark-read")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllRead() {
        return ResponseEntity.ok(alertService.markAllRead());
    }

    /**
     * GET /api/alerts/threshold — Get current energy threshold.
     */
    @GetMapping("/threshold")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getThreshold() {
        return ResponseEntity.ok(alertService.getThreshold());
    }

    /**
     * POST /api/alerts/threshold — Set energy threshold.
     * Body: { "thresholdKwh": 5.0, "emailNotification": true }
     */
    @PostMapping("/threshold")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> setThreshold(@RequestBody Map<String, Object> body) {
        Double kWh = body.get("thresholdKwh") instanceof Number
                ? ((Number) body.get("thresholdKwh")).doubleValue() : null;
        boolean email = body.containsKey("emailNotification")
                ? Boolean.TRUE.equals(body.get("emailNotification")) : true;
        return ResponseEntity.ok(alertService.setThreshold(kWh, email));
    }
}
