package com.smarthome.energy.service;

import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Loads hourly energy averages from the CSV dataset file and imports them
 * as energy usage logs for devices that lack data for today's past hours.
 *
 * Runs on startup (after DataSeeder) and can also be called when a new
 * device is created so it immediately gets dataset-backed hourly readings.
 */
@Service
@Order(2)
public class DatasetImportService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatasetImportService.class);

    private static final double COST_PER_KWH = 8.0;

    @Value("${smarthome.app.datasetFilePath:../../smart_home_energy_usage_dataset.csv}")
    private String datasetFilePath;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    /** appliance name → (hour 0-23 → average energy kWh) */
    private final Map<String, Map<Integer, Double>> hourlyAverages = new HashMap<>();

    private boolean datasetLoaded = false;

    /** Maps system device types to CSV appliance names */
    private static final Map<String, String> DEVICE_TO_APPLIANCE = Map.ofEntries(
            Map.entry("air_conditioner", "HVAC"),
            Map.entry("hvac", "HVAC"),
            Map.entry("heater", "HVAC"),
            Map.entry("thermostat", "HVAC"),
            Map.entry("water_heater", "HVAC"),
            Map.entry("refrigerator", "Refrigerator"),
            Map.entry("washer", "Washing Machine"),
            Map.entry("dryer", "Washing Machine"),
            Map.entry("dishwasher", "Dishwasher"),
            Map.entry("bulb", "Lighting"),
            Map.entry("lighting", "Lighting"),
            Map.entry("ev_charger", "Electronics"),
            Map.entry("solar_panel", "Electronics"),
            Map.entry("smart_meter", "Electronics"),
            Map.entry("plug", "Electronics"),
            Map.entry("lock", "Electronics"),
            Map.entry("speaker", "Electronics"),
            Map.entry("camera", "Electronics")
    );

    /** Typical wattage for each CSV appliance (used for power-ratio scaling) */
    private static final Map<String, Double> TYPICAL_WATTS = Map.of(
            "HVAC", 1500.0,
            "Refrigerator", 150.0,
            "Washing Machine", 500.0,
            "Dishwasher", 1800.0,
            "Lighting", 60.0,
            "Electronics", 100.0
    );

    // ──────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void run(String... args) {
        loadDataset();
        importForAllDevices();
    }

    // ──────────────────────── CSV Loading ────────────────────────────────

    private void loadDataset() {
        Path csvPath = resolveDatasetPath();
        if (csvPath == null) {
            log.warn("Dataset CSV not found — hourly chart will use IoT simulator data only.");
            return;
        }

        log.info("Loading dataset from: {}", csvPath.toAbsolutePath());

        // Accumulator: appliance → hour → [sum, count]
        Map<String, Map<Integer, double[]>> accum = new HashMap<>();

        try (BufferedReader reader = Files.newBufferedReader(csvPath)) {
            String header = reader.readLine(); // skip header row
            if (header == null) return;

            String line;
            long rowCount = 0;
            while ((line = reader.readLine()) != null) {
                try {
                    String[] parts = line.split(",", -1);
                    if (parts.length < 6) continue;

                    String timestamp = parts[0].trim();
                    double energy = Double.parseDouble(parts[2].trim());
                    String appliance = parts[5].trim();

                    // Extract hour from "YYYY-MM-DD HH:mm:ss"
                    int hour = Integer.parseInt(timestamp.substring(11, 13));

                    double[] sums = accum
                            .computeIfAbsent(appliance, k -> new HashMap<>())
                            .computeIfAbsent(hour, k -> new double[]{0.0, 0.0});
                    sums[0] += energy;
                    sums[1] += 1;
                    rowCount++;
                } catch (Exception ignored) {
                    // skip malformed rows
                }
            }

            // Convert sums to averages
            for (var appEntry : accum.entrySet()) {
                Map<Integer, Double> avgMap = new HashMap<>();
                for (var hourEntry : appEntry.getValue().entrySet()) {
                    double[] s = hourEntry.getValue();
                    avgMap.put(hourEntry.getKey(),
                            Math.round((s[0] / s[1]) * 10000.0) / 10000.0);
                }
                hourlyAverages.put(appEntry.getKey(), avgMap);
            }

            datasetLoaded = true;
            log.info("Dataset loaded: {} rows, {} appliance types.", rowCount, hourlyAverages.size());

        } catch (IOException e) {
            log.error("Failed to read dataset CSV: {}", e.getMessage());
        }
    }

    private Path resolveDatasetPath() {
        String[] candidates = {
                datasetFilePath,
                "../../smart_home_energy_usage_dataset.csv",
                "../smart_home_energy_usage_dataset.csv",
                "./smart_home_energy_usage_dataset.csv",
                "smart_home_energy_usage_dataset.csv"
        };
        for (String p : candidates) {
            Path path = Paths.get(p);
            if (Files.exists(path) && Files.isReadable(path)) {
                return path;
            }
        }
        return null;
    }

    // ──────────────────────── Import Logic ───────────────────────────────

    private void importForAllDevices() {
        if (!datasetLoaded) return;

        List<Device> allDevices = deviceRepository.findAll().stream()
                .filter(d -> !d.isDeleted())
                .toList();

        for (Device device : allDevices) {
            importForDevice(device);
        }
    }

    /**
     * Import dataset-based energy logs for a single device, filling in any
     * hours of today that do not already have energy log entries.
     */
    @Transactional
    public void importForDevice(Device device) {
        if (!datasetLoaded) return;

        String deviceType = device.getType() != null ? device.getType().toLowerCase() : "";
        String appliance = DEVICE_TO_APPLIANCE.get(deviceType);
        if (appliance == null) return;

        Map<Integer, Double> appHours = hourlyAverages.get(appliance);
        if (appHours == null) return;

        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

        // Hours that already have data
        Set<Integer> existingHours = new HashSet<>();
        for (EnergyUsageLog el : energyUsageLogRepository
                .findByDeviceIdAndTimestampBetween(device.getId(), dayStart, dayEnd)) {
            existingHours.add(el.getTimestamp().getHour());
        }

        int currentHour = LocalDateTime.now().getHour();

        // Respect device creation time
        int startHour = 0;
        if (device.getCreatedAt() != null
                && device.getCreatedAt().toLocalDate().equals(today)) {
            startHour = device.getCreatedAt().getHour();
        }

        List<EnergyUsageLog> newLogs = new ArrayList<>();
        for (int h = startHour; h <= currentHour; h++) {
            if (existingHours.contains(h)) continue;

            Double csvEnergy = appHours.get(h);
            if (csvEnergy == null || csvEnergy <= 0) continue;

            double scaled = scaleEnergy(device, appliance, csvEnergy);
            double cost = Math.round(scaled * COST_PER_KWH * 10000.0) / 10000.0;

            EnergyUsageLog entry = new EnergyUsageLog();
            entry.setDevice(device);
            entry.setEnergyUsed((float) scaled);
            entry.setTimestamp(today.atTime(h, 0, 0));
            entry.setDurationMinutes(60);
            entry.setCost(cost);
            newLogs.add(entry);
        }

        if (!newLogs.isEmpty()) {
            energyUsageLogRepository.saveAll(newLogs);
            log.info("Dataset import: {} entries for device '{}' (type={})",
                    newLogs.size(), device.getName(), device.getType());
        }
    }

    /** Scale dataset energy proportionally to the device's actual power rating */
    private double scaleEnergy(Device device, String appliance, double csvEnergy) {
        if (device.getPowerRating() != null && device.getPowerRating() > 0) {
            double typical = TYPICAL_WATTS.getOrDefault(appliance, 100.0);
            if (typical > 0) {
                double ratio = device.getPowerRating() / typical;
                return Math.round(csvEnergy * ratio * 10000.0) / 10000.0;
            }
        }
        return csvEnergy;
    }
}
