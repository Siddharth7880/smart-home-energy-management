package com.smarthome.energy.config;

import com.smarthome.energy.model.ERole;
import com.smarthome.energy.model.Role;
import com.smarthome.energy.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;

    public RoleSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        ensureRoleExists(ERole.ROLE_ADMIN);
        ensureRoleExists(ERole.ROLE_HOMEOWNER);
        ensureRoleExists(ERole.ROLE_TECHNICIAN);
    }

    private void ensureRoleExists(ERole roleName) {
        roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
    }
}
