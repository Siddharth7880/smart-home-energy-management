package com.smarthome.energy.service;

import com.smarthome.energy.model.*;
import com.smarthome.energy.repository.*;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    @Autowired
    private EnergyAlertRepository alertRepository;

    @Autowired
    private EnergyThresholdRepository thresholdRepository;

    @Autowired
    private EnergyUsageLogRepository energyUsageLogRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private EmailService emailService;

    // ── Threshold management ───────────────────────────────────────────────

    public Map<String, Object> getThreshold() {
        Long userId = getCurrentUserId();
        EnergyThreshold threshold = thresholdRepository.findByUserId(userId)
                .orElse(null);
        Map<String, Object> result = new HashMap<>();
        result.put("thresholdKwh", threshold != null ? threshold.getThresholdKwh() : 10.0);
        result.put("emailNotification", threshold == null || threshold.isEmailNotification());
        result.put("configured", threshold != null);
        return result;
    }

    @Transactional
    public Map<String, Object> setThreshold(Double thresholdKwh, boolean emailNotification) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new IllegalStateException("User not authenticated");
        if (thresholdKwh == null || thresholdKwh <= 0)
            throw new IllegalArgumentException("Threshold must be greater than 0");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EnergyThreshold threshold = thresholdRepository.findByUserId(userId)
                .orElseGet(() -> {
                    EnergyThreshold t = new EnergyThreshold();
                    t.setUser(user);
                    return t;
                });
        threshold.setThresholdKwh(thresholdKwh);
        threshold.setEmailNotification(emailNotification);
        thresholdRepository.save(threshold);

        Map<String, Object> res = new HashMap<>();
        res.put("thresholdKwh", thresholdKwh);
        res.put("emailNotification", emailNotification);
        res.put("message", "Threshold updated successfully");
        return res;
    }

    // ── Alerts retrieval ───────────────────────────────────────────────────

    public Map<String, Object> getAlerts() {
        Long userId = getCurrentUserId();
        List<EnergyAlert> alerts = alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long unreadCount = alertRepository.countByUserIdAndReadFalse(userId);

        List<Map<String, Object>> alertList = alerts.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("message", a.getMessage());
            m.put("type", a.getType().name());
            m.put("read", a.isRead());
            m.put("createdAt", a.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("alerts", alertList);
        result.put("unreadCount", unreadCount);
        return result;
    }

    @Transactional
    public Map<String, Object> markAllRead() {
        Long userId = getCurrentUserId();
        alertRepository.markAllReadByUserId(userId);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "All alerts marked as read");
        res.put("unreadCount", 0);
        return res;
    }

    // ── Overload monitoring (called by scheduler) ──────────────────────────

    /**
     * Called periodically. Checks every user's 24-hour consumption against their threshold.
     */
    @Transactional
    public void checkAllUsersForOverload() {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            try {
                checkOverloadForUser(user);
            } catch (Exception e) {
                logger.warn("Overload check failed for user {}: {}", user.getId(), e.getMessage());
            }
        }
    }

    private void checkOverloadForUser(User user) {
        Optional<EnergyThreshold> thresholdOpt = thresholdRepository.findByUserId(user.getId());
        if (thresholdOpt.isEmpty()) return; // user hasn't configured a threshold

        double threshold = thresholdOpt.get().getThresholdKwh();

        // Calculate 24-hour consumption for all user's devices
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        LocalDateTime now = LocalDateTime.now();

        List<Device> devices = deviceRepository.findByUserIdAndIsDeletedFalse(user.getId());
        double total = 0.0;
        for (Device d : devices) {
            Double usage = energyUsageLogRepository.getTotalEnergyConsumption(d.getId(), since, now);
            if (usage != null) total += usage;
        }

        logger.debug("User {} 24h consumption = {} kWh, threshold = {} kWh", user.getId(), total, threshold);

        if (total > threshold) {
            // Suppress duplicate unread overload alerts within last hour
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            boolean alreadyAlerted = alertRepository.hasRecentUnreadOverload(user.getId(), oneHourAgo);
            if (!alreadyAlerted) {
                String msg = String.format(
                    "⚠️ Energy usage exceeded the safe limit! Your 24-hour consumption is %.2f kWh " +
                    "(threshold: %.2f kWh). Consider turning off high-power devices.", total, threshold);

                EnergyAlert alert = new EnergyAlert(user, msg, EnergyAlert.AlertType.OVERLOAD);
                alertRepository.save(alert);
                logger.warn("OVERLOAD ALERT created for user {}: {} kWh > {} kWh", user.getId(), total, threshold);

                // Optional email notification
                if (thresholdOpt.get().isEmailNotification() && emailService != null) {
                    try {
                        emailService.sendOverloadAlert(user.getEmail(), user.getFirstName(), total, threshold);
                    } catch (Exception e) {
                        logger.warn("Failed to send overload email to {}: {}", user.getEmail(), e.getMessage());
                    }
                }
            }
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl)
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        return null;
    }
}
