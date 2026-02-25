package com.smarthome.energy.service;

import com.smarthome.energy.dto.AddEnergyLogRequest;
import com.smarthome.energy.dto.EnergyUsageLogResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EnergyUsageLogService Tests")
class EnergyUsageLogServiceTest {

    @Mock
    DeviceRepository deviceRepository;
    @Mock
    EnergyUsageLogRepository energyUsageLogRepository;

    @InjectMocks
    EnergyUsageLogService energyUsageLogService;

    private static final Long USER_ID = 1L;
    private static final Long DEVICE_ID = 10L;

    @BeforeEach
    void setupAuth() {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                USER_ID, "testuser", "test@example.com", "pwd", Collections.emptyList());
        var token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    private Device buildDevice(Long ownerId) {
        Device d = new Device();
        d.setId(DEVICE_ID);
        d.setOwnerId(ownerId);
        d.setName("Heater");
        d.setType("heater");
        d.setStatus("active");
        d.setOnline(true);
        return d;
    }

    private EnergyUsageLog buildLog(Device device, double kwh) {
        EnergyUsageLog log = new EnergyUsageLog();
        log.setId(1L);
        log.setDevice(device);
        log.setEnergyUsage(kwh);
        log.setTimestamp(LocalDateTime.now());
        log.setDurationMinutes(60);
        log.setCost(kwh * 8.0);
        log.setCreatedAt(LocalDateTime.now());
        return log;
    }

    @Nested
    @DisplayName("addEnergyLog()")
    class AddEnergyLogTests {

        @Test
        @DisplayName("Saves log with estimated cost when cost not provided")
        void savesLogWithEstimatedCost() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.save(any())).thenReturn(buildLog(d, 1.5));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsage(1.5);

            EnergyUsageLogResponse resp = energyUsageLogService.addEnergyLog(DEVICE_ID, req);

            assertThat(resp.getEnergyUsage()).isEqualTo(1.5);
            verify(energyUsageLogRepository).save(any(EnergyUsageLog.class));
        }

        @Test
        @DisplayName("Throws when energy usage is negative")
        void throwsOnNegativeUsage() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsage(-1.0);

            assertThatThrownBy(() -> energyUsageLogService.addEnergyLog(DEVICE_ID, req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("positive");
        }

        @Test
        @DisplayName("Throws when user is not device owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(999L);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsage(1.0);

            assertThatThrownBy(() -> energyUsageLogService.addEnergyLog(DEVICE_ID, req))
                    .isInstanceOf(UnauthorizedAccessException.class);
        }

        @Test
        @DisplayName("Throws when device not found")
        void throwsWhenDeviceNotFound() {
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.empty());

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsage(1.0);

            assertThatThrownBy(() -> energyUsageLogService.addEnergyLog(DEVICE_ID, req))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getDeviceEnergyLogs()")
    class GetLogsTests {

        @Test
        @DisplayName("Returns all logs sorted by timestamp descending")
        void returnsLogs() {
            Device d = buildDevice(USER_ID);
            EnergyUsageLog log = buildLog(d, 2.0);

            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.findByDeviceIdOrderByTimestampDesc(DEVICE_ID))
                    .thenReturn(List.of(log));

            List<EnergyUsageLogResponse> result = energyUsageLogService.getDeviceEnergyLogs(DEVICE_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEnergyUsage()).isEqualTo(2.0);
        }

        @Test
        @DisplayName("Returns empty list when no logs exist")
        void returnsEmptyWhenNoLogs() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.findByDeviceIdOrderByTimestampDesc(DEVICE_ID))
                    .thenReturn(List.of());

            List<EnergyUsageLogResponse> result = energyUsageLogService.getDeviceEnergyLogs(DEVICE_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getDeviceAnalytics()")
    class AnalyticsTests {

        @Test
        @DisplayName("Aggregates total consumption/cost for given period")
        void aggregatesForPeriod() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(5.5);
            when(energyUsageLogRepository.getAverageEnergyConsumption(any(), any(), any())).thenReturn(1.1);
            when(energyUsageLogRepository.getTotalCost(any(), any(), any())).thenReturn(44.0);
            when(energyUsageLogRepository.countByDeviceId(DEVICE_ID)).thenReturn(5L);

            var result = energyUsageLogService.getDeviceAnalytics(DEVICE_ID, "weekly");

            assertThat(result.get("totalConsumption")).isEqualTo(5.5);
            assertThat(result.get("totalCost")).isEqualTo(44.0);
            assertThat(result.get("logCount")).isEqualTo(5L);
            assertThat(result.get("period")).isEqualTo("weekly");
        }

        @Test
        @DisplayName("Defaults to monthly when period is null")
        void defaultsToMonthly() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(null);
            when(energyUsageLogRepository.getAverageEnergyConsumption(any(), any(), any())).thenReturn(null);
            when(energyUsageLogRepository.getTotalCost(any(), any(), any())).thenReturn(null);
            when(energyUsageLogRepository.countByDeviceId(DEVICE_ID)).thenReturn(0L);

            var result = energyUsageLogService.getDeviceAnalytics(DEVICE_ID, null);

            assertThat(result.get("period")).isEqualTo("monthly");
            assertThat(result.get("totalConsumption")).isEqualTo(0.0);
        }
    }
}
