package com.smarthome.energy.service;

import com.smarthome.energy.model.Device;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InsightService {

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    /**
     * Generates energy-saving insights for the current user based on
     * 7-day consumption history.
     */
    public Map<String, Object> getInsights() {
        Long userId = getCurrentUserId();
        List<Device> devices = hasRole("ROLE_ADMIN")
                ? deviceRepository.findAll().stream().filter(d -> !d.isDeleted()).collect(Collectors.toList())
                : deviceRepository.findByUserIdAndIsDeletedFalse(userId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);

        List<String> tips = new ArrayList<>();
        List<Map<String, Object>> breakdown = new ArrayList<>();

        // ── 1. Peak hour detection (hour 0-23 with most energy logged in last 7 days) ──
        int[] hourlyTotals = new int[24];
        double[] hourlyKwh = new double[24];

        for (Device d : devices) {
            List<Object[]> hourlyData = energyUsageLogRepository.getHourlyConsumptionRaw(d.getId(), weekAgo, now);
            for (Object[] row : hourlyData) {
                int hour = ((Number) row[0]).intValue();
                double kwh = ((Number) row[1]).doubleValue();
                hourlyTotals[hour]++;
                hourlyKwh[hour] += kwh;
            }
        }

        // Find peak hour
        int peakHour = 0;
        double peakKwh = 0;
        for (int h = 0; h < 24; h++) {
            if (hourlyKwh[h] > peakKwh) {
                peakKwh = hourlyKwh[h];
                peakHour = h;
            }
        }

        int offPeakHour = 0;
        double offPeakKwh = Double.MAX_VALUE;
        for (int h = 0; h < 24; h++) {
            if (hourlyKwh[h] > 0 && hourlyKwh[h] < offPeakKwh) {
                offPeakKwh = hourlyKwh[h];
                offPeakHour = h;
            }
        }
        if (offPeakKwh == Double.MAX_VALUE) offPeakHour = 2; // default: 2 AM

        // Format hours
        String peakHourStr = formatHour(peakHour);
        String offPeakHourStr = formatHour(offPeakHour);

        // ── 2. High-consumption device detection ──
        String highestDeviceName = null;
        double highestDeviceKwh = 0;
        for (Device d : devices) {
            Double total = energyUsageLogRepository.getTotalEnergyConsumption(d.getId(), weekAgo, now);
            if (total != null && total > highestDeviceKwh) {
                highestDeviceKwh = total;
                highestDeviceName = d.getName();
            }
            if (total != null && total > 0) {
                Map<String, Object> b = new HashMap<>();
                b.put("deviceName", d.getName());
                b.put("deviceType", d.getType());
                b.put("weeklyKwh", Math.round(total * 100.0) / 100.0);
                breakdown.add(b);
            }
        }
        breakdown.sort((a, b) -> Double.compare(
                ((Number) b.get("weeklyKwh")).doubleValue(),
                ((Number) a.get("weeklyKwh")).doubleValue()));

        // ── 3. Generate dynamic tips ──

        // Tip 1: Peak hour avoidance
        if (peakKwh > 0) {
            int savingsPercent = 10 + (peakHour >= 9 && peakHour <= 18 ? 10 : 5);
            tips.add(String.format(
                "⚡ Your peak usage is around %s. Shift high-power tasks to off-peak hours (%s) to save up to %d%% on energy.",
                peakHourStr, offPeakHourStr, savingsPercent));
        } else {
            tips.add("⚡ Start using devices at different times to identify your peak hours and reduce energy bills.");
        }

        // Tip 2: Highest consuming device
        if (highestDeviceName != null && highestDeviceKwh > 0) {
            tips.add(String.format(
                "🔌 \"%s\" consumed %.2f kWh this week — your highest usage device. Consider scheduling it during off-peak hours.",
                highestDeviceName, highestDeviceKwh));
        }

        // Tip 3: AC / HVAC specific
        boolean hasAC = devices.stream().anyMatch(d ->
                d.getType().contains("ac") || d.getType().contains("air_conditioner") || d.getType().contains("hvac"));
        if (hasAC) {
            tips.add("❄️ Set your AC to 24°C instead of 18°C — each degree raises energy consumption by ~6%. Use AC after 8 PM to benefit from off-peak rates.");
        }

        // Tip 4: Heater
        boolean hasHeater = devices.stream().anyMatch(d -> d.getType().contains("heater"));
        if (hasHeater) {
            tips.add("🔥 Reduce heater usage during peak hours (" + peakHourStr + "). A programmable thermostat can save up to 10% on heating costs.");
        }

        // Tip 5: Washer / Dryer
        boolean hasWasher = devices.stream().anyMatch(d ->
                d.getType().contains("washer") || d.getType().contains("dryer"));
        if (hasWasher) {
            tips.add("🫧 Running washing machines and dryers during off-peak hours (" + offPeakHourStr + ") can reduce energy costs by 20–30%.");
        }

        // Tip 6: Lights
        boolean hasLights = devices.stream().anyMatch(d ->
                d.getType().contains("light") || d.getType().contains("bulb") || d.getType().contains("lighting"));
        if (hasLights) {
            tips.add("💡 Switch to LED bulbs and use smart scheduling on lighting devices to cut lighting energy use by up to 75%.");
        }

        // Tip 7: General standby
        long offlineDevices = devices.stream().filter(d -> !d.isOnline()).count();
        if (offlineDevices > 0) {
            tips.add(String.format(
                "🔋 You have %d device(s) in standby mode. Unplug devices not in use — standby power can account for 10%% of your electricity bill.",
                offlineDevices));
        }

        // Always add a general tip
        tips.add("🌿 Smart home energy tip: Set up device schedules (Device Automation) to automatically turn off devices when not needed.");

        // ── Build response ──
        Map<String, Object> result = new HashMap<>();
        result.put("tips", tips);
        result.put("peakHour", peakHourStr);
        result.put("offPeakHour", offPeakHourStr);
        result.put("breakdown", breakdown.stream().limit(5).collect(Collectors.toList()));
        result.put("totalDevicesAnalyzed", devices.size());
        result.put("analysisWindow", "Last 7 days");
        return result;
    }

    private String formatHour(int hour) {
        if (hour == 0) return "12 AM";
        if (hour < 12) return hour + " AM";
        if (hour == 12) return "12 PM";
        return (hour - 12) + " PM";
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl)
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        return null;
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }
}
