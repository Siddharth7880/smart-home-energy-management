package com.smarthome.energy.controller;

import com.smarthome.energy.service.InsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/insights")
public class InsightController {

    @Autowired
    private InsightService insightService;

    /**
     * GET /api/insights — Returns energy-saving tips + consumption breakdown for the current user.
     */
    @GetMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInsights() {
        return ResponseEntity.ok(insightService.getInsights());
    }
}
