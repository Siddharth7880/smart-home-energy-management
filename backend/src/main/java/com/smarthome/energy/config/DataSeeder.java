package com.smarthome.energy.config;

import com.smarthome.energy.model.*;
import com.smarthome.energy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Seed database with initial roles, test users, demo devices and
 * 30 days of historical energy-usage logs so the app has meaningful
 * data immediately without any manual interaction.
 */
@Component
@Order(1)
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
     * 30 days × 24 hourly log entries per device (~720 rows each).
     * Skipped if devices already exist for that owner.
     */
    private void seedDemoDevicesAndLogs() {
        User homeowner = userRepository.findByUsername("homeowner_user").orElse(null);
        if (homeowner == null)
            return;

        Long ownerId = homeowner.getId();
        if (deviceRepository.countByUserIdAndIsDeletedFalse(ownerId) > 0) {
            log.info("Demo devices already exist for homeowner_user – skipping seed.");
            return;
        }

        List<DeviceSeed> seeds = List.of(
                new DeviceSeed("Living Room AC", "air_conditioner", "Living Room", 1.5, "Carrier 1.5-ton split AC"),
                new DeviceSeed("Kitchen Fridge", "refrigerator", "Kitchen", 0.15, "Samsung double-door refrigerator"),
                new DeviceSeed("Master Bedroom Bulbs", "bulb", "Master Bedroom", 0.01, "Philips smart LED cluster"),
                new DeviceSeed("Water Heater", "water_heater", "Bathroom", 3.0, "Racold 25-litre geyser"));

        Random rng = new Random(42); // deterministic so restarts don't duplicate
        LocalDateTime seedEnd = LocalDateTime.now().withMinute(0).withSecond(0).withNano(0);
        LocalDateTime seedStart = seedEnd.minusDays(30);

        for (DeviceSeed s : seeds) {
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

            // Generate hourly logs for the last 30 days
            List<EnergyUsageLog> logs = new ArrayList<>();
            LocalDateTime tick = seedStart;
            while (!tick.isAfter(seedEnd)) {
                // Skip some hours randomly to simulate the device being off
                boolean deviceOn = rng.nextDouble() > 0.25; // ~75 % uptime
                if (deviceOn) {
                    double variation = 1.0 + (rng.nextDouble() * 0.30 - 0.15);
                    double energyKwh = Math.round(s.powerKw * variation * 10000.0) / 10000.0;
                    double cost = Math.round(energyKwh * COST_PER_KWH * 100.0) / 100.0;

                    EnergyUsageLog logEntry = new EnergyUsageLog();
                    logEntry.setDevice(saved);
                    logEntry.setEnergyUsed((float) energyKwh);
                    logEntry.setTimestamp(tick);
                    logEntry.setDurationMinutes(60);
                    logEntry.setCost(cost);
                    logs.add(logEntry);

                }
                tick = tick.plusHours(1);
            }
            energyUsageLogRepository.saveAll(logs);
            log.info("✓ Seeded device '{}' with {} energy log entries.", s.name, logs.size());
        }
    }

    /** Simple value holder for device seed data */
    private record DeviceSeed(String name, String type, String location,
            double powerKw, String description) {
    }
}
