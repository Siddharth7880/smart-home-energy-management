package com.smarthome.energy.controller;

import com.smarthome.energy.dto.DeviceScheduleRequest;
import com.smarthome.energy.service.DeviceScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/schedules")
public class DeviceScheduleController {

    @Autowired
    private DeviceScheduleService scheduleService;

    /**
     * POST /api/schedules — Create a new device schedule.
     */
    @PostMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> createSchedule(@RequestBody DeviceScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.createSchedule(request));
    }

    /**
     * GET /api/schedules — Get all schedules for the current user.
     */
    @GetMapping
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSchedules() {
        return ResponseEntity.ok(scheduleService.getSchedules());
    }

    /**
     * PUT /api/schedules/{id} — Update an existing schedule.
     */
    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody DeviceScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.updateSchedule(scheduleId, request));
    }

    /**
     * DELETE /api/schedules/{id} — Delete a schedule.
     */
    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
    }

    /**
     * POST /api/schedules/{id}/trigger — Manually trigger a pending schedule immediately.
     * Useful for testing automation without waiting for the cron to fire.
     */
    @PostMapping("/{scheduleId}/trigger")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> triggerScheduleNow(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(scheduleService.triggerScheduleNow(scheduleId));
    }
}
