package com.smarthome.energy.service;

import com.smarthome.energy.dto.DeviceScheduleRequest;
import com.smarthome.energy.dto.DeviceScheduleResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.DeviceSchedule;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.DeviceScheduleRepository;
import com.smarthome.energy.repository.UserRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeviceScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(DeviceScheduleService.class);

    @Autowired
    private DeviceScheduleRepository scheduleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeviceService deviceService;

    // ── CRUD ──────────────────────────────────────────────────────────────

    @Transactional
    public DeviceScheduleResponse createSchedule(DeviceScheduleRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new UnauthorizedAccessException("User not authenticated");

        if (request.getDeviceId() == null)
            throw new IllegalArgumentException("Device ID is required");
        if (request.getAction() == null ||
                (!request.getAction().equalsIgnoreCase("ON") && !request.getAction().equalsIgnoreCase("OFF")))
            throw new IllegalArgumentException("Action must be ON or OFF");
        if (request.getScheduledAt() == null)
            throw new IllegalArgumentException("Scheduled time is required");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Device device = deviceRepository.findByIdAndIsDeletedFalse(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device", "id", request.getDeviceId()));

        if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId))
            throw new UnauthorizedAccessException("Access denied: you do not own this device");

        DeviceSchedule schedule = new DeviceSchedule();
        schedule.setUser(user);
        schedule.setDevice(device);
        schedule.setAction(request.getAction().toUpperCase());
        schedule.setScheduledAt(request.getScheduledAt());
        schedule.setLabel(request.getLabel());

        DeviceSchedule saved = scheduleRepository.save(schedule);
        logger.info("Created schedule id={} for device={} action={} at={}", saved.getId(),
                device.getName(), saved.getAction(), saved.getScheduledAt());
        return toResponse(saved);
    }

    public List<DeviceScheduleResponse> getSchedules() {
        Long userId = getCurrentUserId();
        if (userId == null) throw new UnauthorizedAccessException("User not authenticated");

        List<DeviceSchedule> schedules = hasRole("ROLE_ADMIN")
                ? scheduleRepository.findAll()
                : scheduleRepository.findByUserIdOrderByScheduledAtDesc(userId);

        return schedules.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public DeviceScheduleResponse updateSchedule(Long scheduleId, DeviceScheduleRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new UnauthorizedAccessException("User not authenticated");

        DeviceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceSchedule", "id", scheduleId));

        if (!hasRole("ROLE_ADMIN") && !schedule.getUser().getId().equals(userId))
            throw new UnauthorizedAccessException("Access denied");

        if (schedule.isExecuted())
            throw new IllegalStateException("Cannot modify an already-executed schedule");

        if (request.getAction() != null) {
            if (!request.getAction().equalsIgnoreCase("ON") && !request.getAction().equalsIgnoreCase("OFF"))
                throw new IllegalArgumentException("Action must be ON or OFF");
            schedule.setAction(request.getAction().toUpperCase());
        }
        if (request.getScheduledAt() != null) schedule.setScheduledAt(request.getScheduledAt());
        if (request.getLabel() != null) schedule.setLabel(request.getLabel());
        if (request.getDeviceId() != null) {
            Device device = deviceRepository.findByIdAndIsDeletedFalse(request.getDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Device", "id", request.getDeviceId()));
            if (!hasRole("ROLE_ADMIN") && !device.getUser().getId().equals(userId))
                throw new UnauthorizedAccessException("Access denied: you do not own this device");
            schedule.setDevice(device);
        }

        return toResponse(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new UnauthorizedAccessException("User not authenticated");

        DeviceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceSchedule", "id", scheduleId));

        if (!hasRole("ROLE_ADMIN") && !schedule.getUser().getId().equals(userId))
            throw new UnauthorizedAccessException("Access denied");

        scheduleRepository.delete(schedule);
    }

    // ── Execution (called by cron) ─────────────────────────────────────────

    @Transactional
    public void executeDueSchedules() {
        LocalDateTime now = LocalDateTime.now();
        List<DeviceSchedule> due = scheduleRepository.findPendingSchedulesDue(now);
        for (DeviceSchedule s : due) {
            try {
                deviceService.controlDeviceInternal(s.getDevice().getId(), s.getAction());
                s.setExecuted(true);
                s.setExecutedAt(now);
                scheduleRepository.save(s);
                logger.info("✅ Executed schedule id={}: {} {} at {}",
                        s.getId(), s.getDevice().getName(), s.getAction(), now);
            } catch (Exception ex) {
                logger.error("❌ Failed to execute schedule id={}: {}", s.getId(), ex.getMessage());
            }
        }
    }

    /**
     * Manually trigger a specific pending schedule immediately.
     * Used by the "Trigger Now" UI feature.
     */
    @Transactional
    public DeviceScheduleResponse triggerScheduleNow(Long scheduleId) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new UnauthorizedAccessException("User not authenticated");

        DeviceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceSchedule", "id", scheduleId));

        if (!hasRole("ROLE_ADMIN") && !schedule.getUser().getId().equals(userId))
            throw new UnauthorizedAccessException("Access denied");

        if (schedule.isExecuted())
            throw new IllegalStateException("Schedule already executed");

        LocalDateTime now = LocalDateTime.now();
        deviceService.controlDeviceInternal(schedule.getDevice().getId(), schedule.getAction());
        schedule.setExecuted(true);
        schedule.setExecutedAt(now);
        DeviceSchedule saved = scheduleRepository.save(schedule);
        logger.info("⚡ Manual trigger: schedule id={} {} {} executed now",
                saved.getId(), saved.getDevice().getName(), saved.getAction());
        return toResponse(saved);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private DeviceScheduleResponse toResponse(DeviceSchedule s) {
        DeviceScheduleResponse r = new DeviceScheduleResponse();
        r.setId(s.getId());
        r.setDeviceId(s.getDevice().getId());
        r.setDeviceName(s.getDevice().getName());
        r.setDeviceType(s.getDevice().getType());
        r.setAction(s.getAction());
        r.setScheduledAt(s.getScheduledAt());
        r.setExecuted(s.isExecuted());
        r.setLabel(s.getLabel());
        r.setCreatedAt(s.getCreatedAt());
        r.setExecutedAt(s.getExecutedAt());
        return r;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl)
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        return null;
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }
}
