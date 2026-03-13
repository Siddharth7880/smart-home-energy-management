package com.smarthome.energy.controller;

import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.dto.CreateInstallationRequest;
import com.smarthome.energy.service.TechnicianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/technician")
@PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
public class TechnicianController {

    @Autowired
    private TechnicianService technicianService;

    /**
     * Get all installations assigned to the technician
     * Technicians can only see their own installations
     * Admins can see all installations
     */
    @GetMapping("/installations")
    public ResponseEntity<?> getInstallations() {
        try {
            return ResponseEntity.ok(technicianService.getTechnicianInstallations());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get installation by ID
     * Technicians can only access their assigned installations
     */
    @GetMapping("/installations/{installationId}")
    public ResponseEntity<?> getInstallationById(@PathVariable Long installationId) {
        try {
            return ResponseEntity.ok(technicianService.getInstallationById(installationId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Create a new installation
     * Only admins can create installations and assign them to technicians
     */
    @PostMapping("/installations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createInstallation(@RequestBody CreateInstallationRequest request) {
        try {
            return ResponseEntity.ok(technicianService.createInstallation(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update installation status
     * Technicians can update the status of their assigned installations
     */
    @PutMapping("/installations/{installationId}/status")
    public ResponseEntity<?> updateInstallationStatus(
            @PathVariable Long installationId,
            @RequestParam String status) {
        try {
            return ResponseEntity.ok(technicianService.updateInstallationStatus(installationId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Add notes to installation
     */
    @PostMapping("/installations/{installationId}/notes")
    public ResponseEntity<?> addInstallationNotes(
            @PathVariable Long installationId,
            @RequestParam String notes) {
        try {
            return ResponseEntity.ok(technicianService.addInstallationNotes(installationId, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Mark installation as completed
     */
    @PostMapping("/installations/{installationId}/complete")
    public ResponseEntity<?> completeInstallation(@PathVariable Long installationId) {
        try {
            return ResponseEntity.ok(technicianService.completeInstallation(installationId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all pending installations (Admin only)
     */
    @GetMapping("/installations/status/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingInstallations() {
        try {
            return ResponseEntity.ok(technicianService.getPendingInstallations());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Assign installation to technician (Admin only)
     */
    @PostMapping("/installations/{installationId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignInstallation(
            @PathVariable Long installationId,
            @RequestParam Long technicianId) {
        try {
            return ResponseEntity.ok(technicianService.assignInstallation(installationId, technicianId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get technician performance metrics (Admin only)
     */
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTechnicianMetrics() {
        try {
            return ResponseEntity.ok(technicianService.getAllTechnicianMetrics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get my performance metrics (Technician can see their own)
     */
    @GetMapping("/metrics/me")
    public ResponseEntity<?> getMyMetrics() {
        try {
            return ResponseEntity.ok(technicianService.getMyMetrics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
