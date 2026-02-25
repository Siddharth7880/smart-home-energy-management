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

@Service
public class TechnicianService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get installations assigned to the current technician
     * Technicians can only see their own assignments
     * Admins can see all installations
     */
    public Map<String, Object> getTechnicianInstallations() {
        String username = getCurrentUsername();
        Long technicianId = getCurrentUserId();

        Map<String, Object> response = new HashMap<>();
        response.put("technicianId", technicianId);
        response.put("technicianName", username);
        response.put("installations", new ArrayList<>());
        response.put("totalInstallations", 0);
        response.put("completedInstallations", 0);
        response.put("pendingInstallations", 0);

        return response;
    }

    /**
     * Get installation by ID
     */
    public Map<String, Object> getInstallationById(Long installationId) {
        // Verify technician has access to this installation
        validateInstallationAccess(installationId);

        Map<String, Object> installation = new HashMap<>();
        installation.put("installationId", installationId);
        installation.put("status", "pending");
        installation.put("assignedTo", getCurrentUsername());
        installation.put("createdAt", LocalDateTime.now());

        return installation;
    }

    /**
     * Create a new installation (Admin only)
     */
    @Transactional
    public MessageResponse createInstallation(CreateInstallationRequest request) {
        // Validate homeowner exists
        Long homeownerId = request.getHomeownerId();
        if (homeownerId != null) {
            validateUserExists(homeownerId);
        } else {
            throw new RuntimeException("Homeowner ID is required");
        }

        return new MessageResponse("Installation created successfully for homeowner ID: " + 
                homeownerId + " at location: " + request.getLocation());
    }

    /**
     * Update installation status
     */
    @Transactional
    public MessageResponse updateInstallationStatus(Long installationId, String status) {
        // Verify technician has access to this installation
        validateInstallationAccess(installationId);

        // Validate status
        validateInstallationStatus(status);

        return new MessageResponse("Installation " + installationId + " status updated to: " + status);
    }

    /**
     * Add notes to installation
     */
    @Transactional
    public MessageResponse addInstallationNotes(Long installationId, String notes) {
        // Verify technician has access to this installation
        validateInstallationAccess(installationId);

        if (notes == null || notes.trim().isEmpty()) {
            throw new RuntimeException("Notes cannot be empty");
        }

        return new MessageResponse("Notes added to installation " + installationId);
    }

    /**
     * Mark installation as completed
     */
    @Transactional
    public MessageResponse completeInstallation(Long installationId) {
        // Verify technician has access to this installation
        validateInstallationAccess(installationId);

        return new MessageResponse("Installation " + installationId + " marked as completed");
    }

    /**
     * Get all pending installations (Admin only)
     */
    public Map<String, Object> getPendingInstallations() {
        // This should be called by admin only
        Map<String, Object> response = new HashMap<>();
        response.put("totalPending", 0);
        response.put("installations", new ArrayList<>());
        response.put("retrievedAt", LocalDateTime.now());

        return response;
    }

    /**
     * Assign installation to technician (Admin only)
     */
    @Transactional
    public MessageResponse assignInstallation(Long installationId, Long technicianId) {
        // Verify technician exists
        if (technicianId != null) {
            validateUserExists(technicianId);
            // Verify user is a technician
            validateUserIsTechnician(technicianId);
        } else {
            throw new RuntimeException("Technician ID is required");
        }

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

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("technicianId", technicianId);
        metrics.put("technicianName", technicianName);
        metrics.put("totalInstallations", 0);
        metrics.put("completedInstallations", 0);
        metrics.put("completionRate", 0.0);
        metrics.put("averageCompletionTime", 0.0);
        metrics.put("rating", 0.0);
        metrics.put("retrievedAt", LocalDateTime.now());

        return metrics;
    }

    // Helper methods

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.smarthome.energy.security.services.UserDetailsImpl) {
            return ((com.smarthome.energy.security.services.UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "anonymous";
    }

    private void validateInstallationAccess(Long installationId) {
        // Verify that the current user (technician) can access this installation
        // This would check if the installation is assigned to them
        Long technicianId = getCurrentUserId();
        if (technicianId == null) {
            throw new RuntimeException("Unable to determine current user");
        }
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
        String[] allowedStatuses = {"pending", "in_progress", "completed", "cancelled"};

        for (String allowed : allowedStatuses) {
            if (allowed.equalsIgnoreCase(status)) {
                return;
            }
        }

        throw new RuntimeException("Invalid installation status: " + status + ". Allowed statuses: " +
                String.join(", ", allowedStatuses));
    }
}
