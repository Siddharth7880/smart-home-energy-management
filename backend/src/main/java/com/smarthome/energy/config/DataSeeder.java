package com.smarthome.energy.config;

import com.smarthome.energy.model.ERole;
import com.smarthome.energy.model.Role;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.RoleRepository;
import com.smarthome.energy.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Seed database with initial test users and roles
 * This component runs on application startup and creates:
 * - 3 test roles (Admin, Homeowner, Technician)
 * - 3 test users (one for each role) if they don't exist
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed roles
        seedRoles();
        // Seed test users
        seedTestUsers();
    }

    private void seedRoles() {
        ensureRoleExists(ERole.ROLE_ADMIN);
        ensureRoleExists(ERole.ROLE_HOMEOWNER);
        ensureRoleExists(ERole.ROLE_TECHNICIAN);
    }

    private void ensureRoleExists(ERole roleName) {
        roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private void seedTestUsers() {
        // Admin user
        if (!userRepository.existsByUsername("admin_user")) {
            createAdminUser();
        }

        // Homeowner user
        if (!userRepository.existsByUsername("homeowner_user")) {
            createHomeownerUser();
        }

        // Technician user
        if (!userRepository.existsByUsername("technician_user")) {
            createTechnicianUser();
        }
    }

    private void createAdminUser() {
        User admin = new User(
                "Admin",
                "User",
                "admin_user",
                "admin@smarthome.local",
                passwordEncoder.encode("AdminPassword123!")
        );

        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN))));

        admin.setRoles(adminRoles);
        admin.setEmailVerified(true);

        userRepository.save(admin);
        System.out.println("✓ Admin test user created: admin_user / AdminPassword123!");
    }

    private void createHomeownerUser() {
        User homeowner = new User(
                "Home",
                "Owner",
                "homeowner_user",
                "homeowner@smarthome.local",
                passwordEncoder.encode("HomePassword123!")
        );

        Set<Role> homeownerRoles = new HashSet<>();
        homeownerRoles.add(roleRepository.findByName(ERole.ROLE_HOMEOWNER)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_HOMEOWNER))));

        homeowner.setRoles(homeownerRoles);
        homeowner.setEmailVerified(true);

        userRepository.save(homeowner);
        System.out.println("✓ Homeowner test user created: homeowner_user / HomePassword123!");
    }

    private void createTechnicianUser() {
        User technician = new User(
                "Tech",
                "Nician",
                "technician_user",
                "technician@smarthome.local",
                passwordEncoder.encode("TechPassword123!")
        );

        Set<Role> technicianRoles = new HashSet<>();
        technicianRoles.add(roleRepository.findByName(ERole.ROLE_TECHNICIAN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_TECHNICIAN))));

        technician.setRoles(technicianRoles);
        technician.setEmailVerified(true);

        userRepository.save(technician);
        System.out.println("✓ Technician test user created: technician_user / TechPassword123!");
    }
}
