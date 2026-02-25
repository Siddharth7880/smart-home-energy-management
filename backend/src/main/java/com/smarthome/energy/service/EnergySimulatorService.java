package com.smarthome.energy.service;

import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * EnergySimulatorService
 * Runs on a fixed schedule and auto-generates realistic energy-usage logs
 * for every device that is currently marked as online ("active" status).
 *
 * This means that even without a user manually toggling devices on/off,
 * the system accumulates real log data that is visible in analytics,
 * the DeviceDetail page, and the Dashboard charts.
 */
@Service
public class EnergySimulatorService {

    private static final Logger logger = LoggerFactory.getLogger(EnergySimulatorService.class);

    /** Cost per kWh in Indian Rupees (common residential tariff) */
    private static final double COST_PER_KWH = 8.0;

    /** Duration simulated per tick (60 minutes) */
    private static final int TICK_DURATION_MINUTES = 60;

    private final Random random = new Random();

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    /**
     * Runs every hour (3 600 000 ms).
     * For each online device, calculates kWh consumed during the last hour
     * and saves an EnergyUsageLog row.
     *
     * Power rating is used as the base; a small ±15 % random variation is
     * added to simulate real-world fluctuations.
     */
    @Scheduled(fixedRate = 3_600_000) // every 60 minutes
    @Transactional
    public void simulateHourlyEnergyLogs() {
        List<Device> onlineDevices = deviceRepository.findByIsOnline(true);

        if (onlineDevices.isEmpty()) {
            logger.debug("EnergySimulator: no online devices, skipping tick.");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        int logged = 0;

        for (Device device : onlineDevices) {
            try {
                double powerKw = resolveEffectivePowerKw(device);
                if (powerKw <= 0)
                    continue;

                // Apply ±15 % random variation
                double variation = 1.0 + (random.nextDouble() * 0.30 - 0.15);
                double energyKwh = powerKw * (TICK_DURATION_MINUTES / 60.0) * variation;
                energyKwh = Math.round(energyKwh * 10000.0) / 10000.0; // 4 dp

                double cost = Math.round(energyKwh * COST_PER_KWH * 100.0) / 100.0;

                EnergyUsageLog log = new EnergyUsageLog();
                log.setDevice(device);
                log.setEnergyUsage(energyKwh);
                log.setTimestamp(now);
                log.setDurationMinutes(TICK_DURATION_MINUTES);
                log.setCost(cost);

                energyUsageLogRepository.save(log);

                // Keep lastActive in sync
                device.setLastActive(now);
                deviceRepository.save(device);

                logged++;
            } catch (Exception ex) {
                logger.error("EnergySimulator: failed to log for device id={} name='{}': {}",
                        device.getId(), device.getName(), ex.getMessage());
            }
        }

        logger.info("EnergySimulator tick @ {}: logged {} entries for {} online devices.",
                now, logged, onlineDevices.size());
    }

    /**
     * Returns the effective power rating for a device.
     * Falls back to sensible defaults when the owner hasn't set one.
     */
    private double resolveEffectivePowerKw(Device device) {
        if (device.getPowerRating() != null && device.getPowerRating() > 0) {
            return device.getPowerRating();
        }
        // Default power ratings by device type (kW)
        if (device.getType() == null)
            return 0.1;
        return switch (device.getType().toLowerCase()) {
            case "air_conditioner" -> 1.5;
            case "heater" -> 2.0;
            case "water_heater" -> 3.0;
            case "washer" -> 0.5;
            case "dryer" -> 2.5;
            case "refrigerator" -> 0.15;
            case "ev_charger" -> 7.2;
            case "solar_panel" -> 0.0; // generates, not consumes – skip
            case "smart_meter" -> 0.01;
            case "thermostat" -> 0.05;
            case "bulb", "lighting" -> 0.01;
            case "plug" -> 0.1;
            case "lock" -> 0.005;
            case "speaker" -> 0.03;
            case "camera" -> 0.008;
            case "hvac" -> 1.8;
            default -> 0.1;
        };
    }
}
