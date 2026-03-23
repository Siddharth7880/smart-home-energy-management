package com.smarthome.energy.service;

import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.DeviceStatus;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simulated IoT service that generates realistic live power readings.
 * <p>
 * This is the default {@link IoTService} implementation.  It keeps an
 * in-memory cache of the latest simulated wattage for every active device
 * and refreshes values on a 10-second schedule.
 * <p>
 * Replace with a real IoT gateway implementation when hardware is connected.
 */
@Service
@Primary
public class IoTSimulatorService implements IoTService {

    private static final Logger logger = LoggerFactory.getLogger(IoTSimulatorService.class);

    /** Fluctuation band: ±15 % of rated power */
    private static final double FLUCTUATION_MIN = 0.85;
    private static final double FLUCTUATION_MAX = 1.15;

    /** Interval between auto-generated energy log snapshots (10 seconds) */
    private static final int TICK_SECONDS = 10;

    @Value("${smarthome.app.energyRatePerKwh:8.0}")
    private double energyRatePerKwh;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    private final Random random = new Random();

    /** deviceId → latest simulated wattage */
    private final Map<Long, Double> liveReadings = new ConcurrentHashMap<>();

    // ═══════════════ IoTService contract ═══════════════

    @Override
    public Map<String, Object> getLiveReading(Long deviceId) {
        Device device = deviceRepository.findByIdAndIsDeletedFalse(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", deviceId));

        double watts;
        if (device.getStatus() == DeviceStatus.ON) {
            watts = liveReadings.getOrDefault(deviceId, simulateWatts(device));
        } else {
            watts = 0.0;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("deviceId", deviceId);
        result.put("currentPowerWatts", Math.round(watts * 100.0) / 100.0);
        result.put("timestamp", LocalDateTime.now().toString());
        return result;
    }

    @Override
    public Map<String, Object> getTotalLiveUsage(Long userId, boolean isAdmin) {
        List<Device> activeDevices;
        if (isAdmin) {
            activeDevices = deviceRepository.findByIsOnlineAndIsDeletedFalse(true);
        } else {
            activeDevices = deviceRepository.findByUserIdAndIsOnlineAndIsDeletedFalse(userId, true);
        }

        double totalWatts = 0.0;
        for (Device d : activeDevices) {
            totalWatts += liveReadings.getOrDefault(d.getId(), simulateWatts(d));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalWatts", Math.round(totalWatts * 100.0) / 100.0);
        result.put("totalKW", Math.round((totalWatts / 1000.0) * 1000.0) / 1000.0);
        result.put("activeDevices", activeDevices.size());
        result.put("timestamp", LocalDateTime.now().toString());
        return result;
    }

    // ═══════════════ Scheduled task: every 10 seconds ═══════════════

    /**
     * Refreshes simulated readings and persists a micro energy-log snapshot
     * for every device that is currently ON.
     */
    @Scheduled(fixedRate = 10_000)
    @Transactional
    public void generateLiveReadings() {
        List<Device> onlineDevices = deviceRepository.findByIsOnlineAndIsDeletedFalse(true);

        if (onlineDevices.isEmpty()) {
            return; // nothing to simulate
        }

        LocalDateTime now = LocalDateTime.now();
        int logged = 0;

        for (Device device : onlineDevices) {
            try {
                double watts = simulateWatts(device);
                liveReadings.put(device.getId(), watts);

                // Energy consumed in this 10-second tick
                double hoursElapsed = TICK_SECONDS / 3600.0;
                double energyKwh = (watts / 1000.0) * hoursElapsed;
                energyKwh = Math.round(energyKwh * 1_000_000.0) / 1_000_000.0; // 6 dp precision
                double cost = Math.round(energyKwh * energyRatePerKwh * 1_000_000.0) / 1_000_000.0;

                EnergyUsageLog log = new EnergyUsageLog();
                log.setDevice(device);
                log.setEnergyUsed((float) energyKwh);
                log.setTimestamp(now);
                log.setDurationMinutes(0); // sub-minute tick
                log.setCost(cost);
                energyUsageLogRepository.save(log);

                logged++;
            } catch (Exception ex) {
                logger.error("IoTSimulator: failed for device id={}: {}", device.getId(), ex.getMessage());
            }
        }

        if (logged > 0) {
            logger.debug("IoTSimulator tick @ {}: {} readings generated", now, logged);
        }
    }

    // ═══════════════ Helpers ═══════════════

    private double simulateWatts(Device device) {
        double base = resolveBasePower(device);
        if (base <= 0) return 0.0;
        double factor = FLUCTUATION_MIN + (FLUCTUATION_MAX - FLUCTUATION_MIN) * random.nextDouble();
        return base * factor;
    }

    private double resolveBasePower(Device device) {
        if (device.getPowerRating() != null && device.getPowerRating() > 0) {
            return device.getPowerRating();
        }
        if (device.getType() == null) return 100.0;
        return switch (device.getType().toLowerCase()) {
            case "air_conditioner" -> 1500.0;
            case "heater"          -> 2000.0;
            case "water_heater"    -> 3000.0;
            case "washer"          -> 500.0;
            case "dryer"           -> 2500.0;
            case "refrigerator"    -> 150.0;
            case "ev_charger"      -> 7200.0;
            case "solar_panel"     -> 0.0;
            case "smart_meter"     -> 10.0;
            case "thermostat"      -> 50.0;
            case "bulb", "lighting"-> 10.0;
            case "plug"            -> 100.0;
            case "lock"            -> 5.0;
            case "speaker"         -> 30.0;
            case "camera"          -> 8.0;
            case "hvac"            -> 1800.0;
            default                -> 100.0;
        };
    }
}
