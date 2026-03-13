package com.smarthome.energy.config;

import com.smarthome.energy.model.*;
import com.smarthome.energy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.LinkedHashMap;

/**
 * Seed database with initial roles, test users, demo devices and
 * 30 days of historical energy-usage logs so the app has meaningful
 * data immediately without any manual interaction.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    /** Cost per kWh in ₹ */
    private static final double COST_PER_KWH = 8.0;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final EnergyUsageLogRepository energyUsageLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
            UserRepository userRepository,
            DeviceRepository deviceRepository,
            EnergyUsageLogRepository energyUsageLogRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.energyUsageLogRepository = energyUsageLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedTestUsers();
        seedDemoDevicesAndLogs();
    }

    // ─────────────────────────────────────────────────────────────────
    // Roles
    // ─────────────────────────────────────────────────────────────────

    private void seedRoles() {
        ensureRoleExists(ERole.ROLE_ADMIN);
        ensureRoleExists(ERole.ROLE_HOMEOWNER);
        ensureRoleExists(ERole.ROLE_TECHNICIAN);
    }

    private void ensureRoleExists(ERole roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    // ─────────────────────────────────────────────────────────────────
    // Test Users
    // ─────────────────────────────────────────────────────────────────

    private void seedTestUsers() {
        if (!userRepository.existsByUsername("admin_user"))
            createAdminUser();
        if (!userRepository.existsByUsername("homeowner_user"))
            createHomeownerUser();
        if (!userRepository.existsByUsername("technician_user"))
            createTechnicianUser();
    }

    private void createAdminUser() {
        User admin = buildUser("Admin", "User", "admin_user",
                "admin@smarthome.local", "AdminPassword123!");
        admin.setRoles(Set.of(role(ERole.ROLE_ADMIN)));
        userRepository.save(admin);
        log.info("✓ Admin test user created: admin_user / AdminPassword123!");
    }

    private void createHomeownerUser() {
        User homeowner = buildUser("Home", "Owner", "homeowner_user",
                "homeowner@smarthome.local", "HomePassword123!");
        homeowner.setRoles(Set.of(role(ERole.ROLE_HOMEOWNER)));
        userRepository.save(homeowner);
        log.info("✓ Homeowner test user created: homeowner_user / HomePassword123!");
    }

    private void createTechnicianUser() {
        User technician = buildUser("Tech", "Nician", "technician_user",
                "technician@smarthome.local", "TechPassword123!");
        technician.setRoles(Set.of(role(ERole.ROLE_TECHNICIAN)));
        userRepository.save(technician);
        log.info("✓ Technician test user created: technician_user / TechPassword123!");
    }

    private User buildUser(String first, String last, String username, String email, String password) {
        User u = new User(first, last, username, email, passwordEncoder.encode(password));
        u.setEmailVerified(true);
        return u;
    }

    private Role role(ERole name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(name)));
    }

    // ─────────────────────────────────────────────────────────────────
    // Demo Devices + Historical Energy Logs
    // ─────────────────────────────────────────────────────────────────

    /**
     * Seeds 4 realistic demo devices for the homeowner_user and generates
     * 30 days × ~24 hourly log entries per device.
     *
     * Devices are created once if they don't exist yet.
     * Energy logs are ALWAYS wiped and re-generated on every startup so that
     * analytics charts always reflect the real current date — never stale ones.
     */
    private void seedDemoDevicesAndLogs() {
        try {
            User homeowner = userRepository.findByUsername("homeowner_user").orElse(null);
            if (homeowner == null) return;

            // Seed config keyed by device name for safe name-based lookup
            Map<String, DeviceSeed> seedMap = new LinkedHashMap<>();
            seedMap.put("Living Room AC",      new DeviceSeed("Living Room AC",      "air_conditioner", "Living Room",    1.5,  "Carrier 1.5-ton split AC"));
            seedMap.put("Kitchen Fridge",       new DeviceSeed("Kitchen Fridge",       "refrigerator",    "Kitchen",        0.15, "Samsung double-door refrigerator"));
            seedMap.put("Master Bedroom Bulbs", new DeviceSeed("Master Bedroom Bulbs", "bulb",            "Master Bedroom", 0.01, "Philips smart LED cluster"));
            seedMap.put("Water Heater",         new DeviceSeed("Water Heater",         "water_heater",    "Bathroom",       3.0,  "Racold 25-litre geyser"));

            // Fresh time window anchored to right now
            LocalDateTime seedEnd   = LocalDateTime.now().withMinute(0).withSecond(0).withNano(0);
            LocalDateTime seedStart = seedEnd.minusDays(30);

            // ── Step 1: look up or create each demo device by name ────────────
            Map<String, Device> devicesByName = new LinkedHashMap<>();
            for (Device d : deviceRepository.findByUserIdAndIsDeletedFalse(homeowner.getId())) {
                devicesByName.put(d.getName(), d);
            }
            for (Map.Entry<String, DeviceSeed> e : seedMap.entrySet()) {
                if (!devicesByName.containsKey(e.getKey())) {
                    DeviceSeed s = e.getValue();
                    Device device = new Device();
                    device.setUser(homeowner);
                    device.setName(s.name);
                    device.setType(s.type);
                    device.setLocation(s.location);
                    device.setPowerRating((float) (s.powerKw * 1000));
                    device.setDescription(s.description);
                    device.setStatus(DeviceStatus.ON);
                    device.setOnline(true);
                    device.setLastActive(seedEnd);
                    Device saved = deviceRepository.save(device);
                    devicesByName.put(saved.getName(), saved);
                    log.info("✓ Created demo device '{}'.", saved.getName());
                }
            }

            // ── Step 2: bulk-wipe logs (no entity loading — fast & safe) ──────
            for (Device d : devicesByName.values()) {
                energyUsageLogRepository.bulkDeleteByDeviceId(d.getId());
            }
            log.info("Wiped stale energy logs. Re-seeding [{} → {}].", seedStart.toLocalDate(), seedEnd.toLocalDate());

            // ── Step 3: regenerate logs anchored to today ─────────────────────
            Random rng = new Random(42);
            for (Map.Entry<String, DeviceSeed> e : seedMap.entrySet()) {
                Device device = devicesByName.get(e.getKey());
                if (device == null) continue;
                DeviceSeed s = e.getValue();

                List<EnergyUsageLog> logs = new ArrayList<>();
                LocalDateTime tick = seedStart;
                while (!tick.isAfter(seedEnd)) {
                    if (rng.nextDouble() > 0.25) {      // ~75 % uptime
                        double variation = 1.0 + (rng.nextDouble() * 0.30 - 0.15);
                        double energyKwh = Math.round(s.powerKw * variation * 10000.0) / 10000.0;
                        double cost      = Math.round(energyKwh * COST_PER_KWH * 100.0) / 100.0;

                        EnergyUsageLog logEntry = new EnergyUsageLog();
                        logEntry.setDevice(device);
                        logEntry.setEnergyUsed((float) energyKwh);
                        logEntry.setTimestamp(tick);
                        logEntry.setDurationMinutes(60);
                        logEntry.setCost(cost);
                        logs.add(logEntry);
                    }
                    tick = tick.plusHours(1);
                }
                energyUsageLogRepository.saveAll(logs);
                log.info("✓ Re-seeded '{}' with {} log entries.", device.getName(), logs.size());
            }

        } catch (Exception ex) {
            // A seeder failure must never crash the application
            log.error("DataSeeder failed — app will still start normally. Cause: {}", ex.getMessage(), ex);
        }
    }

    /** Simple value holder for device seed data */
    private record DeviceSeed(String name, String type, String location,
            double powerKw, String description) {
    }
}
