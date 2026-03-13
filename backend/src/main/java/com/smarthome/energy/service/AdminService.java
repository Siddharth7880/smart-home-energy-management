package com.smarthome.energy.service;

import com.smarthome.energy.dto.AdminUserResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.dto.SystemStatisticsResponse;
import com.smarthome.energy.model.ERole;
import com.smarthome.energy.model.Role;
import com.smarthome.energy.model.User;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.Installation;
import com.smarthome.energy.repository.RoleRepository;
import com.smarthome.energy.repository.UserRepository;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.repository.InstallationRepository;
import com.smarthome.energy.repository.EmailVerificationOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    @Autowired
    private InstallationRepository installationRepository;

    @Autowired
    private EmailVerificationOtpRepository otpRepository;

    /**
     * Get all users in the system (Admin only)
     */
    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertUserToAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public AdminUserResponse getUserById(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return convertUserToAdminResponse(user);
    }

    /**
     * Update user roles
     */
    @Transactional
    public MessageResponse updateUserRoles(@NonNull Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Set<Role> updatedRoles = new HashSet<>();
        if (roleNames != null && !roleNames.isEmpty()) {
            roleNames.forEach(role -> {
                String normalizedRole = role.toUpperCase().replace("ROLE_", "");
                switch (normalizedRole) {
                    case "ADMIN":
                        updatedRoles.add(getOrCreateRole(ERole.ROLE_ADMIN));
                        break;
                    case "TECHNICIAN":
                        updatedRoles.add(getOrCreateRole(ERole.ROLE_TECHNICIAN));
                        break;
                    case "HOMEOWNER":
                    default:
                        updatedRoles.add(getOrCreateRole(ERole.ROLE_HOMEOWNER));
                }
            });
        } else {
            updatedRoles.add(getOrCreateRole(ERole.ROLE_HOMEOWNER));
        }

        user.setRoles(updatedRoles);
        userRepository.save(user);

        return new MessageResponse("User roles updated successfully for user: " + user.getUsername());
    }

    /**
     * Delete user
     */
    @Transactional
    public MessageResponse deleteUser(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Prevent deletion of the last admin user
        if (user.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN)) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN))
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user in the system");
            }
        }

        // Cascade delete OTPs
        otpRepository.deleteByEmail(user.getEmail());

        // Cascade delete Devices and Energy Logs for Homeowners
        List<Device> userDevices = deviceRepository.findByUserId(userId);
        for (Device device : userDevices) {
            energyUsageLogRepository.deleteByDeviceId(device.getId());
            deviceRepository.delete(device);
        }

        // Cascade delete Installations where user is Homeowner
        List<Installation> homeownerInstallations = installationRepository.findByHomeownerId(userId);
        installationRepository.deleteAll(homeownerInstallations);

        // Unassign Installations where user is Technician
        List<Installation> technicianInstallations = installationRepository.findByTechnicianId(userId);
        for (Installation installation : technicianInstallations) {
            installation.setTechnicianId(null);
            installationRepository.save(installation); // Update with null technician
        }

        userRepository.deleteById(userId);
        return new MessageResponse("User deleted successfully");
    }

    /**
     * Get system statistics
     */
    public SystemStatisticsResponse getSystemStatistics() {
        List<User> allUsers = userRepository.findAll();

        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream()
                .filter(User::isEmailVerified)
                .count();

        Map<String, Long> roleDistribution = getRoleDistributionMap();

        // Placeholder for device and installation counts
        long totalDevices = 0;
        long totalInstallations = 0;
        double totalEnergyConsumption = 0.0;

        return new SystemStatisticsResponse(
                totalUsers,
                activeUsers,
                totalDevices,
                totalInstallations,
                roleDistribution,
                totalEnergyConsumption,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
    }

    /**
     * Get role distribution
     */
    public Map<String, Long> getRoleDistribution() {
        return getRoleDistributionMap();
    }

    /**
     * Get system settings
     */
    public Map<String, Object> getSystemSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("maxDevicesPerHomeowner", 50);
        settings.put("maxTechniciansPerInstallation", 5);
        settings.put("emailVerificationRequired", true);
        settings.put("passwordMinLength", 8);
        settings.put("sessionTimeout", 3600);
        settings.put("twoFactorAuthEnabled", false);
        settings.put("lastUpdated", LocalDateTime.now());

        return settings;
    }

    /**
     * Update system settings
     */
    @Transactional
    public MessageResponse updateSystemSettings(Map<String, Object> settings) {
        // This is a placeholder. In a real application, you would store these in a
        // database
        // For now, we'll just acknowledge the settings
        settings.put("updatedAt", LocalDateTime.now());
        settings.put("updatedBy", getCurrentUsername());

        return new MessageResponse("System settings updated successfully");
    }

    /**
     * Deactivate user
     */
    @Transactional
    public MessageResponse deactivateUser(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setEmailVerified(false);
        userRepository.save(user);

        return new MessageResponse("User " + user.getUsername() + " has been deactivated");
    }

    /**
     * Reactivate user
     */
    @Transactional
    public MessageResponse reactivateUser(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setEmailVerified(true);
        userRepository.save(user);

        return new MessageResponse("User " + user.getUsername() + " has been reactivated");
    }

    /**
     * Reset user password
     */
    @Transactional
    public MessageResponse resetUserPassword(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Generate a temporary password reset token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return new MessageResponse("Password reset token generated for user: " + user.getUsername());
    }

    // Helper methods

    private AdminUserResponse convertUserToAdminResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().toString().replace("ROLE_", ""))
                .collect(Collectors.toSet());

        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames,
                user.getCreatedAt(),
                user.isEmailVerified());
    }

    private Map<String, Long> getRoleDistributionMap() {
        List<User> allUsers = userRepository.findAll();

        long adminCount = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN))
                .count();

        long homeownerCount = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_HOMEOWNER))
                .count();

        long technicianCount = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_TECHNICIAN))
                .count();

        Map<String, Long> distribution = new HashMap<>();
        distribution.put("ADMIN", adminCount);
        distribution.put("HOMEOWNER", homeownerCount);
        distribution.put("TECHNICIAN", technicianCount);

        return distribution;
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }
}
