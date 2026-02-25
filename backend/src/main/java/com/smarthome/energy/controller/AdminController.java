package com.smarthome.energy.controller;

import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.dto.UserRoleUpdateRequest;
import com.smarthome.energy.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get all users - Admin only
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(adminService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get user by ID - Admin only
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable @NonNull Long userId) {
        try {
            return ResponseEntity.ok(adminService.getUserById(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update user roles - Admin only
     */
    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable @NonNull Long userId,
            @RequestBody UserRoleUpdateRequest request) {
        try {
            return ResponseEntity.ok(adminService.updateUserRoles(userId, request.getRoles()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Delete user - Admin only
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable @NonNull Long userId) {
        try {
            return ResponseEntity.ok(adminService.deleteUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get system statistics - Admin only
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSystemStatistics() {
        try {
            return ResponseEntity.ok(adminService.getSystemStatistics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get role distribution - Admin only
     */
    @GetMapping("/role-distribution")
    public ResponseEntity<?> getRoleDistribution() {
        try {
            return ResponseEntity.ok(adminService.getRoleDistribution());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get system settings - Admin only
     */
    @GetMapping("/settings")
    public ResponseEntity<?> getSystemSettings() {
        try {
            return ResponseEntity.ok(adminService.getSystemSettings());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update system settings - Admin only
     */
    @PutMapping("/settings")
    public ResponseEntity<?> updateSystemSettings(@RequestBody Map<String, Object> settings) {
        try {
            return ResponseEntity.ok(adminService.updateSystemSettings(settings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Deactivate user - Admin only
     */
    @PostMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable @NonNull Long userId) {
        try {
            return ResponseEntity.ok(adminService.deactivateUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reactivate user - Admin only
     */
    @PostMapping("/users/{userId}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable @NonNull Long userId) {
        try {
            return ResponseEntity.ok(adminService.reactivateUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reset user password - Admin only
     */
    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable @NonNull Long userId) {
        try {
            return ResponseEntity.ok(adminService.resetUserPassword(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
