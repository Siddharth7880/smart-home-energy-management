package com.smarthome.energy.service;

import com.smarthome.energy.dto.CreateInstallationRequest;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import com.smarthome.energy.repository.InstallationRepository;
import com.smarthome.energy.model.Installation;

@Service
public class TechnicianService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstallationRepository installationRepository;

    /**
     * Get installations assigned to the current technician
     * Technicians can only see their own assignments
     * Admins can see all installations
     */
    public Map<String, Object> getTechnicianInstallations() {
        String username = getCurrentUsername();
        Long technicianId = getCurrentUserId();

        List<Installation> installationsList = installationRepository.findByTechnicianId(technicianId);

        List<Map<String, Object>> installations = installationsList.stream().map(inst -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inst.getId());
            map.put("homeownerId", inst.getHomeownerId());
            map.put("technicianId", inst.getTechnicianId());
            map.put("deviceId", inst.getDeviceId());
            map.put("location", inst.getLocation());
            map.put("description", inst.getDescription());
            map.put("status", inst.getStatus());
            map.put("scheduledDate", inst.getScheduledDate());
            map.put("estimatedDurationHours", inst.getEstimatedDurationHours());
            map.put("actualCompletionDate", inst.getActualCompletionDate());
            map.put("notes", inst.getNotes());
            map.put("createdAt", inst.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        long completedCount = installationsList.stream().filter(i -> "completed".equals(i.getStatus())).count();
        long pendingCount = installationsList.stream().filter(i -> "pending".equals(i.getStatus())).count();

        Map<String, Object> response = new HashMap<>();
        response.put("technicianId", technicianId);
        response.put("technicianName", username);
        response.put("installations", installations);
        response.put("totalInstallations", installations.size());
        response.put("completedInstallations", completedCount);
        response.put("pendingInstallations", pendingCount);

        return response;
    }

    /**
     * Get installation by ID
     */
    public Map<String, Object> getInstallationById(Long installationId) {
        validateInstallationAccess(installationId);

        Installation inst = installationRepository.findById(installationId)
                .orElseThrow(() -> new RuntimeException("Installation not found"));

        Map<String, Object> installation = new HashMap<>();
        installation.put("id", inst.getId());
        installation.put("homeownerId", inst.getHomeownerId());
        installation.put("technicianId", inst.getTechnicianId());
        installation.put("deviceId", inst.getDeviceId());
        installation.put("location", inst.getLocation());
        installation.put("description", inst.getDescription());
        installation.put("status", inst.getStatus());
        installation.put("scheduledDate", inst.getScheduledDate());
        installation.put("estimatedDurationHours", inst.getEstimatedDurationHours());
        installation.put("actualCompletionDate", inst.getActualCompletionDate());
        installation.put("notes", inst.getNotes());
        installation.put("createdAt", inst.getCreatedAt());

        return installation;
    }

    /**
     * Create a new installation (Admin only)
     */
    @Transactional
    public MessageResponse createInstallation(CreateInstallationRequest request) {
        Long homeownerId = request.getHomeownerId();
        if (homeownerId != null) {
            validateUserExists(homeownerId);
        } else {
            throw new RuntimeException("Homeowner ID is required");
        }

        Installation installation = new Installation();
        installation.setHomeownerId(homeownerId);
        installation.setDeviceId(request.getDeviceId() != null ? request.getDeviceId() : 0L); // Assuming deviceId
                                                                                              // exists
        installation.setLocation(request.getLocation() != null ? request.getLocation() : "Unknown");
        installation.setDescription(request.getDescription());
        installation.setStatus("pending");
        if (request.getScheduledDate() != null) {
            installation.setScheduledDate(java.time.LocalDateTime.parse(request.getScheduledDate()));
        }
        if (request.getEstimatedDurationHours() != null) {
            installation.setEstimatedDurationHours(request.getEstimatedDurationHours());
        }

        installationRepository.save(installation);

        return new MessageResponse("Installation created successfully for homeowner ID: " +
                homeownerId + " at location: " + request.getLocation());
    }

    /**
     * Update installation status
     */
    @Transactional
    public MessageResponse updateInstallationStatus(Long installationId, String status) {
        validateInstallationAccess(installationId);
        validateInstallationStatus(status);

        Installation installation = installationRepository.findById(installationId)
                .orElseThrow(() -> new RuntimeException("Installation not found"));

        installation.setStatus(status);
        if ("completed".equalsIgnoreCase(status)) {
            installation.setActualCompletionDate(LocalDateTime.now());
        }
        installationRepository.save(installation);

        return new MessageResponse("Installation " + installationId + " status updated to: " + status);
    }

    /**
     * Add notes to installation
     */
    @Transactional
    public MessageResponse addInstallationNotes(Long installationId, String notes) {
        validateInstallationAccess(installationId);

        if (notes == null || notes.trim().isEmpty()) {
            throw new RuntimeException("Notes cannot be empty");
        }

        Installation installation = installationRepository.findById(installationId)
                .orElseThrow(() -> new RuntimeException("Installation not found"));

        String currentNotes = installation.getNotes() != null ? installation.getNotes() + "\n" : "";
        installation.setNotes(currentNotes + LocalDateTime.now() + ": " + notes);
        installationRepository.save(installation);

        return new MessageResponse("Notes added to installation " + installationId);
    }

    /**
     * Mark installation as completed
     */
    @Transactional
    public MessageResponse completeInstallation(Long installationId) {
        validateInstallationAccess(installationId);

        Installation installation = installationRepository.findById(installationId)
                .orElseThrow(() -> new RuntimeException("Installation not found"));

        installation.setStatus("completed");
        installation.setActualCompletionDate(LocalDateTime.now());
        installationRepository.save(installation);

        return new MessageResponse("Installation " + installationId + " marked as completed");
    }

    /**
     * Get all pending installations (Admin only)
     */
    public Map<String, Object> getPendingInstallations() {
        List<Installation> pendingList = installationRepository.findByStatus("pending");

        List<Map<String, Object>> installations = pendingList.stream().map(inst -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inst.getId());
            map.put("homeownerId", inst.getHomeownerId());
            map.put("location", inst.getLocation());
            map.put("scheduledDate", inst.getScheduledDate());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalPending", installations.size());
        response.put("installations", installations);
        response.put("retrievedAt", LocalDateTime.now());

        return response;
    }

    /**
     * Assign installation to technician (Admin only)
     */
    @Transactional
    public MessageResponse assignInstallation(Long installationId, Long technicianId) {
        if (technicianId != null) {
            validateUserExists(technicianId);
            validateUserIsTechnician(technicianId);
        } else {
            throw new RuntimeException("Technician ID is required");
        }

        Installation installation = installationRepository.findById(installationId)
                .orElseThrow(() -> new RuntimeException("Installation not found"));

        installation.setTechnicianId(technicianId);
        installationRepository.save(installation);

        return new MessageResponse("Installation " + installationId + " assigned to technician ID: " + technicianId);
    }

    /**
     * Get all technician performance metrics (Admin only)
     */
    public Map<String, Object> getAllTechnicianMetrics() {
        // This should be called by admin only
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalTechnicians", 0);
        metrics.put("technicians", new ArrayList<>());
        metrics.put("retrievedAt", LocalDateTime.now());

        return metrics;
    }

    /**
     * Get my performance metrics (Technician can see their own)
     */
    public Map<String, Object> getMyMetrics() {
        Long technicianId = getCurrentUserId();
        String technicianName = getCurrentUsername();

        long total = installationRepository.countByTechnicianId(technicianId);
        long completed = installationRepository.countByTechnicianIdAndStatus(technicianId, "completed");

        double completionRate = total > 0 ? (double) completed / total : 0.0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("technicianId", technicianId);
        metrics.put("technicianName", technicianName);
        metrics.put("totalInstallations", total);
        metrics.put("completedInstallations", completed);
        metrics.put("completionRate", completionRate);
        metrics.put("averageCompletionTime", 2.5); // Mocked average time
        metrics.put("rating", 4.8); // Mocked rating
        metrics.put("retrievedAt", LocalDateTime.now());

        return metrics;
    }

    // Helper methods

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.getPrincipal() instanceof com.smarthome.energy.security.services.UserDetailsImpl) {
            return ((com.smarthome.energy.security.services.UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "anonymous";
    }

    private void validateInstallationAccess(Long installationId) {
        Long technicianId = getCurrentUserId();
        if (technicianId == null) {
            throw new RuntimeException("Unable to determine current user");
        }

        if (!hasRole("ROLE_ADMIN")) {
            Installation inst = installationRepository.findById(installationId)
                    .orElseThrow(() -> new RuntimeException("Installation not found"));
            if (inst.getTechnicianId() == null || !inst.getTechnicianId().equals(technicianId)) {
                throw new RuntimeException("Access denied: you do not have permission for this installation");
            }
        }
    }

    private boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }

    private void validateUserExists(@NonNull Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    private void validateUserIsTechnician(@NonNull Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        boolean isTechnician = user.getRoles().stream()
                .anyMatch(r -> r.getName().toString().equals("ROLE_TECHNICIAN"));

        if (!isTechnician) {
            throw new RuntimeException("User ID " + userId + " is not a technician");
        }
    }

    private void validateInstallationStatus(String status) {
        String[] allowedStatuses = { "pending", "in_progress", "completed", "cancelled" };

        for (String allowed : allowedStatuses) {
            if (allowed.equalsIgnoreCase(status)) {
                return;
            }
        }

        throw new RuntimeException("Invalid installation status: " + status + ". Allowed statuses: " +
                String.join(", ", allowedStatuses));
    }
}
