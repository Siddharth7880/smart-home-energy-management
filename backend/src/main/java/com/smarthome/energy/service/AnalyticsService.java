package com.smarthome.energy.service;

import com.smarthome.energy.dto.*;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for energy analytics — hourly, daily, weekly, monthly, yearly,
 * full summary, admin global, and technician device-health.
 *
 * All queries are scoped to the authenticated user's devices unless the
 * caller has the ADMIN role.
 */
@Service
public class AnalyticsService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    @Autowired
    private IoTService iotService;

    @Autowired
    private UserRepository userRepository;

    @Value("${smarthome.app.energyRatePerKwh:8.0}")
    private double energyRatePerKwh;

    // ═══════════════ Total Live Usage ═══════════════

    public Map<String, Object> getTotalLiveUsage() {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");
        return iotService.getTotalLiveUsage(userId, hasRole("ROLE_ADMIN"));
    }

    // ═══════════════ Hourly Aggregation ═══════════════

    /**
     * GET /api/analytics/hourly?date=YYYY-MM-DD
     * Returns 24 time-points (one per hour) with summed energy + cost.
     */
    public List<EnergyTimePoint> getHourlyUsage(String dateStr) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        if (deviceIds.isEmpty())
            return Collections.emptyList();

        LocalDate date = (dateStr != null && !dateStr.isBlank())
                ? LocalDate.parse(dateStr)
                : LocalDate.now();

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<Object[]> rows = energyUsageLogRepository.aggregateHourly(deviceIds, start, end);
        Map<Integer, double[]> hourMap = buildHourMap(rows);

        String[] labels = {
                "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM",
                "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
                "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
                "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
        };

        List<EnergyTimePoint> points = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            double[] vals = hourMap.getOrDefault(h, new double[] { 0.0, 0.0 });
            points.add(new EnergyTimePoint(labels[h], round4(vals[0]), round2(vals[1])));
        }
        return points;
    }

    // ═══════════════ Daily Aggregation ═══════════════

    /**
     * GET /api/analytics/daily?month=YYYY-MM
     * Returns one data point per day of the month with summed energy + cost.
     */
    public List<EnergyTimePoint> getDailyUsage(String monthStr) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        if (deviceIds.isEmpty())
            return Collections.emptyList();

        YearMonth ym = (monthStr != null && !monthStr.isBlank())
                ? YearMonth.parse(monthStr)
                : YearMonth.now();

        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();

        List<Object[]> rows = energyUsageLogRepository.aggregateDaily(deviceIds, start, end);
        Map<Integer, double[]> dayMap = buildIntMap(rows);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
        int daysInMonth = ym.lengthOfMonth();
        List<EnergyTimePoint> points = new ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            double[] vals = dayMap.getOrDefault(d, new double[] { 0.0, 0.0 });
            points.add(new EnergyTimePoint(ym.atDay(d).format(fmt), round4(vals[0]), round2(vals[1])));
        }
        return points;
    }

    // ═══════════════ Weekly Aggregation ═══════════════

    /**
     * GET /api/analytics/weekly?year=YYYY
     * Returns 52 data points — one per ISO week of the given year.
     */
    public List<EnergyTimePoint> getWeeklyUsage(String yearStr) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        if (deviceIds.isEmpty())
            return Collections.emptyList();

        int year = (yearStr != null && !yearStr.isBlank())
                ? Integer.parseInt(yearStr)
                : LocalDate.now().getYear();

        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year + 1, 1, 1).atStartOfDay();

        List<Object[]> rows = energyUsageLogRepository.aggregateWeekly(deviceIds, start, end);
        Map<Integer, double[]> weekMap = buildIntMap(rows);

        List<EnergyTimePoint> points = new ArrayList<>();
        for (int w = 1; w <= 52; w++) {
            double[] vals = weekMap.getOrDefault(w, new double[] { 0.0, 0.0 });
            points.add(new EnergyTimePoint("Wk " + w, round4(vals[0]), round2(vals[1])));
        }
        return points;
    }

    // ═══════════════ Monthly Aggregation ═══════════════

    /**
     * GET /api/analytics/monthly?year=YYYY
     * Returns 12 data points — one per month of the given year.
     */
    public List<EnergyTimePoint> getMonthlyUsage(String yearStr) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        if (deviceIds.isEmpty())
            return Collections.emptyList();

        int year = (yearStr != null && !yearStr.isBlank())
                ? Integer.parseInt(yearStr)
                : LocalDate.now().getYear();

        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year + 1, 1, 1).atStartOfDay();

        List<Object[]> rows = energyUsageLogRepository.aggregateMonthly(deviceIds, start, end);
        Map<Integer, double[]> monthMap = buildIntMap(rows);

        String[] monthNames = { "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        List<EnergyTimePoint> points = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            double[] vals = monthMap.getOrDefault(m, new double[] { 0.0, 0.0 });
            points.add(new EnergyTimePoint(monthNames[m - 1], round4(vals[0]), round2(vals[1])));
        }
        return points;
    }

    // ═══════════════ Yearly Aggregation ═══════════════

    /**
     * GET /api/analytics/yearly
     * Returns data points for the last 5 years.
     */
    public List<EnergyTimePoint> getYearlyUsage() {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        if (deviceIds.isEmpty())
            return Collections.emptyList();

        int currentYear = LocalDate.now().getYear();
        LocalDateTime start = LocalDate.of(currentYear - 4, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(currentYear + 1, 1, 1).atStartOfDay();

        List<Object[]> rows = energyUsageLogRepository.aggregateYearly(deviceIds, start, end);
        Map<Integer, double[]> yearMap = buildIntMap(rows);

        List<EnergyTimePoint> points = new ArrayList<>();
        for (int y = currentYear - 4; y <= currentYear; y++) {
            double[] vals = yearMap.getOrDefault(y, new double[] { 0.0, 0.0 });
            points.add(new EnergyTimePoint(String.valueOf(y), round4(vals[0]), round2(vals[1])));
        }
        return points;
    }

    // ═══════════════ Full Summary Analytics ═══════════════

    /**
     * GET /api/analytics/summary?period=daily|weekly|monthly|yearly
     * Returns a complete analytics summary: totals, peak hour, top devices,
     * timeline.
     */
    public AnalyticsSummaryResponse getSummaryAnalytics(String period) {
        Long userId = getCurrentUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("User not authenticated");

        List<Long> deviceIds = getUserDeviceIds(userId);
        List<Device> devices = getDevicesForUser(userId);

        LocalDateTime[] range = calculateTimeRange(period);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];

        AnalyticsSummaryResponse response = new AnalyticsSummaryResponse();
        response.setPeriod(period != null ? period : "monthly");
        response.setActiveDevices(devices.size());

        if (deviceIds.isEmpty()) {
            response.setTotalEnergyKwh(0.0);
            response.setEstimatedCostRs(0.0);
            response.setPeakHour("N/A");
            response.setAverageDailyKwh(0.0);
            response.setTopDevices(Collections.emptyList());
            response.setTimeline(Collections.emptyList());
            return response;
        }

        // Totals
        double totalEnergy = 0.0;
        double totalCost = 0.0;
        for (Long did : deviceIds) {
            totalEnergy += Optional.ofNullable(
                    energyUsageLogRepository.getTotalEnergyConsumption(did, start, end)).orElse(0.0);
            totalCost += Optional.ofNullable(
                    energyUsageLogRepository.getTotalCost(did, start, end)).orElse(0.0);
        }
        response.setTotalEnergyKwh(round4(totalEnergy));
        response.setEstimatedCostRs(round2(totalCost));

        // Average daily kWh
        long days = java.time.temporal.ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
        response.setAverageDailyKwh(days > 0 ? round4(totalEnergy / days) : round4(totalEnergy));

        // Peak hour
        response.setPeakHour(resolvePeakHour(deviceIds, start, end));

        // Top devices (up to 5)
        List<Object[]> topRows = energyUsageLogRepository.findTopDevicesByEnergy(deviceIds, start, end);
        response.setTopDevices(buildDeviceShares(topRows, totalEnergy, 10));

        // Timeline
        response.setTimeline(buildTimeline(period, deviceIds, start, end));

        return response;
    }

    // ═══════════════ Admin Global Analytics ═══════════════

    /**
     * GET /api/analytics/admin/global?period=...
     * ADMIN only — system-wide aggregation across ALL devices and ALL users.
     */
    public AdminGlobalAnalyticsResponse getAdminGlobalAnalytics(String period) {
        LocalDateTime[] range = calculateTimeRange(period);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];

        AdminGlobalAnalyticsResponse response = new AdminGlobalAnalyticsResponse();
        response.setPeriod(period != null ? period : "monthly");

        // Totals
        response.setTotalEnergyKwh(round4(
                Optional.ofNullable(energyUsageLogRepository.getGlobalTotalEnergy(start, end)).orElse(0.0)));
        response.setEstimatedCostRs(round2(
                Optional.ofNullable(energyUsageLogRepository.getGlobalTotalCost(start, end)).orElse(0.0)));

        // System counts
        long totalDevices = deviceRepository.count();
        long activeDevices = deviceRepository.findByIsOnlineAndIsDeletedFalse(true).size();
        long totalUsers = userRepository.count();

        response.setTotalDevices((int) totalDevices);
        response.setActiveDevices((int) activeDevices);
        response.setTotalHouseholds((int) totalUsers);

        // Peak hour (global)
        Object[] peakRow = energyUsageLogRepository.findGlobalPeakHour(start, end);
        response.setPeakHour(peakRow != null ? formatHour(((Number) peakRow[0]).intValue()) : "N/A");

        // Top devices (global, up to 10)
        List<Object[]> topRows = energyUsageLogRepository.findGlobalTopDevicesByEnergy(start, end);
        List<DeviceEnergyShare> topDevices = new ArrayList<>();
        double totalEnergy = response.getTotalEnergyKwh();
        for (int i = 0; i < Math.min(topRows.size(), 10); i++) {
            Object[] row = topRows.get(i);
            double energy = ((Number) row[5]).doubleValue();
            double cost = ((Number) row[6]).doubleValue();
            double pct = totalEnergy > 0 ? round2((energy / totalEnergy) * 100) : 0.0;
            topDevices.add(new DeviceEnergyShare(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    round4(energy), round2(cost), pct));
        }
        response.setTopDevices(topDevices);

        // Timeline (global daily/monthly)
        response.setTimeline(buildGlobalTimeline(period, start, end));

        return response;
    }

    // ═══════════════ Technician Device Health ═══════════════

    /**
     * GET /api/analytics/technician/device-health
     * TECHNICIAN only — device anomaly detection based on power usage patterns.
     */
    public List<DeviceHealthReport> getTechnicianDeviceHealth() {
        List<Device> allDevices = deviceRepository.findAll().stream()
                .filter(d -> !d.isDeleted())
                .collect(Collectors.toList());

        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        LocalDateTime now = LocalDateTime.now();

        List<DeviceHealthReport> reports = new ArrayList<>();

        for (Device device : allDevices) {
            DeviceHealthReport report = new DeviceHealthReport();
            report.setDeviceId(device.getId());
            report.setDeviceName(device.getName());
            report.setDeviceType(device.getType());
            report.setOnline(device.isOnline());
            report.setDeviceStatus(device.getStatus() != null ? device.getStatus().name() : "UNKNOWN");

            if (device.getUser() != null) {
                report.setOwnerName(device.getUser().getFirstName() + " " + device.getUser().getLastName());
                report.setOwnerEmail(device.getUser().getEmail());
            }

            // Historical average per log entry
            double avgEnergy = Optional.ofNullable(
                    energyUsageLogRepository.getOverallAverageForDevice(device.getId())).orElse(0.0);
            report.setAvgEnergyKwh(round4(avgEnergy));

            // Recent 24h total
            double recentEnergy = Optional.ofNullable(
                    energyUsageLogRepository.getTotalEnergyConsumption(device.getId(), last24h, now)).orElse(0.0);
            report.setRecentEnergyKwh(round4(recentEnergy));

            // Anomaly score
            double anomalyScore = avgEnergy > 0 ? round2(recentEnergy / avgEnergy) : 0.0;
            report.setAnomalyScore(anomalyScore);

            // Health classification
            if (!device.isOnline()) {
                report.setHealthStatus("OFFLINE");
            } else if (anomalyScore > 3.0) {
                report.setHealthStatus("CRITICAL");
            } else if (anomalyScore > 1.5) {
                report.setHealthStatus("WARNING");
            } else {
                report.setHealthStatus("NORMAL");
            }

            reports.add(report);
        }

        // Sort: CRITICAL first, then WARNING, then NORMAL, then OFFLINE
        reports.sort(Comparator.comparingInt(r -> {
            return switch (r.getHealthStatus()) {
                case "CRITICAL" -> 0;
                case "WARNING" -> 1;
                case "NORMAL" -> 2;
                default -> 3;
            };
        }));

        return reports;
    }

    // ═══════════════ Private Helpers ═══════════════

    private List<Long> getUserDeviceIds(Long userId) {
        return getDevicesForUser(userId).stream().map(Device::getId).collect(Collectors.toList());
    }

    private List<Device> getDevicesForUser(Long userId) {
        if (hasRole("ROLE_ADMIN")) {
            return deviceRepository.findAll().stream()
                    .filter(d -> !d.isDeleted()).collect(Collectors.toList());
        }
        return deviceRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        }
        return null;
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }

    /** Build [key → [energy, cost]] from query result rows */
    private Map<Integer, double[]> buildIntMap(List<Object[]> rows) {
        Map<Integer, double[]> map = new HashMap<>();
        for (Object[] row : rows) {
            int key = ((Number) row[0]).intValue();
            double energy = ((Number) row[1]).doubleValue();
            double cost = ((Number) row[2]).doubleValue();
            map.put(key, new double[] { energy, cost });
        }
        return map;
    }

    /** Alias for hourly map (same shape) */
    private Map<Integer, double[]> buildHourMap(List<Object[]> rows) {
        return buildIntMap(rows);
    }

    /** Calculate [startTime, endTime] for a given period string */
    private LocalDateTime[] calculateTimeRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = switch (period != null ? period.toLowerCase() : "monthly") {
            case "daily" -> now.toLocalDate().atStartOfDay();
            case "weekly" -> now.toLocalDate().minusDays(6).atStartOfDay();
            case "monthly" -> now.toLocalDate().withDayOfMonth(1).atStartOfDay();
            case "yearly" -> LocalDate.of(now.getYear(), 1, 1).atStartOfDay();
            default -> now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        };
        return new LocalDateTime[] { start, now };
    }

    /** Resolve peak hour string (e.g. "7 PM") from DB or return N/A */
    private String resolvePeakHour(List<Long> deviceIds, LocalDateTime start, LocalDateTime end) {
        try {
            Object[] peakRow = energyUsageLogRepository.findPeakHour(deviceIds, start, end);
            if (peakRow != null && peakRow.length > 0 && peakRow[0] != null) {
                return formatHour(((Number) peakRow[0]).intValue());
            }
        } catch (Exception e) {
            // ignore — native query may return null for empty data
        }
        return "N/A";
    }

    /** Format hour integer to 12-hour display string */
    private String formatHour(int hour) {
        if (hour == 0)
            return "12 AM";
        if (hour < 12)
            return hour + " AM";
        if (hour == 12)
            return "12 PM";
        return (hour - 12) + " PM";
    }

    /** Build DeviceEnergyShare list from DB rows */
    private List<DeviceEnergyShare> buildDeviceShares(List<Object[]> rows, double totalEnergy, int limit) {
        List<DeviceEnergyShare> shares = new ArrayList<>();
        for (int i = 0; i < Math.min(rows.size(), limit); i++) {
            Object[] row = rows.get(i);
            double energy = ((Number) row[3]).doubleValue();
            double cost = ((Number) row[4]).doubleValue();
            double pct = totalEnergy > 0 ? round2((energy / totalEnergy) * 100) : 0.0;
            shares.add(new DeviceEnergyShare(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    round4(energy), round2(cost), pct));
        }
        return shares;
    }

    /** Build timeline EnergyTimePoint list for a given period */
    private List<EnergyTimePoint> buildTimeline(String period, List<Long> deviceIds,
            LocalDateTime start, LocalDateTime end) {
        if (period == null)
            period = "monthly";
        return switch (period.toLowerCase()) {
            case "daily" -> {
                List<Object[]> rows = energyUsageLogRepository.aggregateHourly(deviceIds, start, end);
                Map<Integer, double[]> hourMap = buildIntMap(rows);
                String[] labels = {
                        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM",
                        "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
                        "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
                        "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
                };
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int h = 0; h < 24; h++) {
                    double[] v = hourMap.getOrDefault(h, new double[] { 0.0, 0.0 });
                    pts.add(new EnergyTimePoint(labels[h], round4(v[0]), round2(v[1])));
                }
                yield pts;
            }
            case "weekly" -> {
                // 7 days
                List<EnergyTimePoint> pts = new ArrayList<>();
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("EEE MMM d");
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime dayStart = end.toLocalDate().minusDays(i).atStartOfDay();
                    LocalDateTime dayEnd = dayStart.plusDays(1);
                    List<Object[]> rows = energyUsageLogRepository.aggregateHourly(deviceIds, dayStart, dayEnd);
                    double energy = rows.stream().mapToDouble(r -> ((Number) r[1]).doubleValue()).sum();
                    double cost = rows.stream().mapToDouble(r -> ((Number) r[2]).doubleValue()).sum();
                    pts.add(new EnergyTimePoint(dayStart.format(fmt), round4(energy), round2(cost)));
                }
                yield pts;
            }
            case "yearly" -> {
                List<Object[]> rows = energyUsageLogRepository.aggregateMonthly(deviceIds, start, end);
                Map<Integer, double[]> monthMap = buildIntMap(rows);
                String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int m = 1; m <= 12; m++) {
                    double[] v = monthMap.getOrDefault(m, new double[] { 0.0, 0.0 });
                    pts.add(new EnergyTimePoint(months[m - 1], round4(v[0]), round2(v[1])));
                }
                yield pts;
            }
            default -> {
                // monthly — daily breakdown
                YearMonth ym = YearMonth.from(LocalDate.now());
                LocalDateTime mStart = ym.atDay(1).atStartOfDay();
                LocalDateTime mEnd = ym.plusMonths(1).atDay(1).atStartOfDay();
                List<Object[]> rows = energyUsageLogRepository.aggregateDaily(deviceIds, mStart, mEnd);
                Map<Integer, double[]> dayMap = buildIntMap(rows);
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int d = 1; d <= ym.lengthOfMonth(); d++) {
                    double[] v = dayMap.getOrDefault(d, new double[] { 0.0, 0.0 });
                    pts.add(new EnergyTimePoint(ym.atDay(d).format(fmt), round4(v[0]), round2(v[1])));
                }
                yield pts;
            }
        };
    }

    /** Build global (admin) timeline */
    private List<EnergyTimePoint> buildGlobalTimeline(String period, LocalDateTime start, LocalDateTime end) {
        if (period == null)
            period = "monthly";
        return switch (period.toLowerCase()) {
            case "daily" -> {
                List<Object[]> rows = energyUsageLogRepository.aggregateGlobalHourly(start, end);
                Map<Integer, double[]> map = buildIntMap(rows);
                String[] labels = {
                        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM",
                        "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
                        "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
                        "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
                };
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int h = 0; h < 24; h++) {
                    double[] v = map.getOrDefault(h, new double[] { 0.0, 0.0 });
                    pts.add(new EnergyTimePoint(labels[h], round4(v[0]), round2(v[1])));
                }
                yield pts;
            }
            case "weekly" -> {
                // Query each day individually to avoid day-of-month key collisions
                // (aggregateGlobalDaily groups by DAY() which can match days from other months)
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("EEE MMM d");
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime dayStart = end.toLocalDate().minusDays(i).atStartOfDay();
                    LocalDateTime dayEnd = dayStart.plusDays(1);
                    List<Object[]> rows = energyUsageLogRepository.aggregateGlobalHourly(dayStart, dayEnd);
                    double energy = rows.stream().mapToDouble(r -> ((Number) r[1]).doubleValue()).sum();
                    double cost = rows.stream().mapToDouble(r -> ((Number) r[2]).doubleValue()).sum();
                    pts.add(new EnergyTimePoint(dayStart.format(fmt), round4(energy), round2(cost)));
                }
                yield pts;
            }
            default -> {
                List<Object[]> rows = energyUsageLogRepository.aggregateGlobalMonthly(start, end);
                Map<Integer, double[]> map = buildIntMap(rows);
                String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                List<EnergyTimePoint> pts = new ArrayList<>();
                for (int m = 1; m <= 12; m++) {
                    double[] v = map.getOrDefault(m, new double[] { 0.0, 0.0 });
                    pts.add(new EnergyTimePoint(months[m - 1], round4(v[0]), round2(v[1])));
                }
                yield pts;
            }
        };
    }

    private double round4(double v) {
        return Math.round(v * 10000.0) / 10000.0;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
