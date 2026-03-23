package com.smarthome.energy.controller;

import com.smarthome.energy.service.AnalyticsService;
import com.smarthome.energy.service.EnergyTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for all energy analytics endpoints.
 *
 * Role-based access:
 * - HOMEOWNER → own devices only (auto-scoped in service layer)
 * - ADMIN → all system devices (auto-scoped in service layer)
 * - TECHNICIAN → device health reports
 *
 * Endpoints:
 * GET /api/analytics/total-live-usage
 * GET /api/analytics/hourly?date=YYYY-MM-DD
 * GET /api/analytics/daily?month=YYYY-MM
 * GET /api/analytics/weekly?year=YYYY
 * GET /api/analytics/monthly?year=YYYY
 * GET /api/analytics/yearly
 * GET /api/analytics/summary?period=daily|weekly|monthly|yearly
 * GET /api/analytics/admin/global?period=...
 * GET /api/analytics/technician/device-health
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private EnergyTrackingService energyTrackingService;

    // ═══════════════ Live Usage ═══════════════

    /**
     * GET /api/analytics/total-live-usage
     * Returns real-time aggregated power draw across all active devices.
     */
    @GetMapping("/total-live-usage")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getTotalLiveUsage() {
        return ResponseEntity.ok(analyticsService.getTotalLiveUsage());
    }

    // ═══════════════ Hourly ═══════════════

    /**
     * GET /api/analytics/hourly?date=YYYY-MM-DD
     * Returns 24 data points (one per hour) of aggregated energy usage.
     * Defaults to today if no date parameter is provided.
     */
    @GetMapping("/hourly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getHourlyUsage(@RequestParam(required = false) String date) {
        return ResponseEntity.ok(analyticsService.getHourlyUsage(date));
    }

    // ═══════════════ Daily ═══════════════

    /**
     * GET /api/analytics/daily?month=YYYY-MM
     * Returns one data point per day of the month.
     * Defaults to current month if no month parameter is provided.
     */
    @GetMapping("/daily")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDailyUsage(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.getDailyUsage(month));
    }

    // ═══════════════ Weekly ═══════════════

    /**
     * GET /api/analytics/weekly?year=YYYY
     * Returns one data point per ISO week (52 weeks) for the given year.
     * Defaults to current year.
     */
    @GetMapping("/weekly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getWeeklyUsage(@RequestParam(required = false) String year) {
        return ResponseEntity.ok(analyticsService.getWeeklyUsage(year));
    }

    // ═══════════════ Monthly ═══════════════

    /**
     * GET /api/analytics/monthly?year=YYYY
     * Returns one data point per month (12 months) for the given year.
     * Defaults to current year.
     */
    @GetMapping("/monthly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getMonthlyUsage(@RequestParam(required = false) String year) {
        return ResponseEntity.ok(analyticsService.getMonthlyUsage(year));
    }

    // ═══════════════ Yearly ═══════════════

    /**
     * GET /api/analytics/yearly
     * Returns one data point per year for the last 5 years.
     */
    @GetMapping("/yearly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getYearlyUsage() {
        return ResponseEntity.ok(analyticsService.getYearlyUsage());
    }

    // ═══════════════ Full Summary ═══════════════

    /**
     * GET /api/analytics/summary?period=daily|weekly|monthly|yearly
     *
     * Returns a complete analytics summary including:
     * - total_energy_kwh, estimated_cost, peak_hour, average_daily_kwh
     * - top_devices (up to 10 with percentage shares)
     * - timeline (time-series appropriate for the period)
     *
     * Example response:
     * {
     * "period": "monthly",
     * "totalEnergyKwh": 152.4,
     * "estimatedCostRs": 1219.20,
     * "peakHour": "7 PM",
     * "averageDailyKwh": 4.9,
     * "activeDevices": 3,
     * "topDevices": [...],
     * "timeline": [...]
     * }
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getSummaryAnalytics(
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        return ResponseEntity.ok(analyticsService.getSummaryAnalytics(period));
    }

    // ═══════════════ Admin Global Dashboard ═══════════════

    /**
     * GET /api/analytics/admin/global?period=daily|weekly|monthly|yearly
     *
     * ADMIN ONLY — system-wide analytics across all households and devices.
     * Includes totalHouseholds, totalDevices, system-wide top consuming devices.
     */
    @GetMapping("/admin/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminGlobalAnalytics(
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        return ResponseEntity.ok(analyticsService.getAdminGlobalAnalytics(period));
    }

    // ═══════════════ Technician Device Health ═══════════════

    /**
     * GET /api/analytics/technician/device-health
     *
     * TECHNICIAN ONLY — anomaly detection report for all devices.
     * Returns devices sorted by health status: CRITICAL → WARNING → NORMAL →
     * OFFLINE
     * Anomaly score = recent 24h energy / historical average per log entry
     */
    @GetMapping("/technician/device-health")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> getTechnicianDeviceHealth() {
        return ResponseEntity.ok(analyticsService.getTechnicianDeviceHealth());
    }

    // ═══════════════ EnergyTrackingService convenience endpoints ═══════════════

    /**
     * GET /api/analytics/report/daily
     * Returns today's full report using EnergyTrackingService.
     */
    @GetMapping("/report/daily")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getDailyReport() {
        return ResponseEntity.ok(energyTrackingService.getDailyReport());
    }

    /**
     * GET /api/analytics/report/weekly
     */
    @GetMapping("/report/weekly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getWeeklyReport() {
        return ResponseEntity.ok(energyTrackingService.getWeeklyReport());
    }

    /**
     * GET /api/analytics/report/monthly
     */
    @GetMapping("/report/monthly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getMonthlyReport() {
        return ResponseEntity.ok(energyTrackingService.getMonthlyReport());
    }

    /**
     * GET /api/analytics/report/yearly
     */
    @GetMapping("/report/yearly")
    @PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<?> getYearlyReport() {
        return ResponseEntity.ok(energyTrackingService.getYearlyReport());
    }
}
