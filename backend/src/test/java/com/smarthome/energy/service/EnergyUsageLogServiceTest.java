package com.smarthome.energy.service;

import com.smarthome.energy.dto.AddEnergyLogRequest;
import com.smarthome.energy.dto.EnergyUsageLogResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.DeviceStatus;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EnergyUsageLogService Hard Test Cases")
class EnergyUsageLogServiceTest {

    @Mock
    DeviceRepository deviceRepository;
    @Mock
    EnergyUsageLogRepository energyUsageLogRepository;

    @InjectMocks
    EnergyUsageLogService energyUsageLogService;

    private static final Long USER_ID = 1L;
    private static final Long DEVICE_ID = 10L;
    private static final double ENERGY_RATE = 8.5;

    @BeforeEach
    void setupAuth() {
        setRole("ROLE_HOMEOWNER");
        ReflectionTestUtils.setField(energyUsageLogService, "energyRatePerKwh", ENERGY_RATE);
    }

    private void setRole(String role) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                USER_ID, "testuser", "test@example.com", "pwd",
                Collections.singletonList(new SimpleGrantedAuthority(role)));
        var token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    private Device buildDevice(Long ownerId) {
        Device d = new Device();
        d.setId(DEVICE_ID);
        User user = new User();
        user.setId(ownerId);
        d.setUser(user);
        d.setName("Heater");
        d.setType("heater");
        d.setStatus(DeviceStatus.ON);
        d.setOnline(true);
        return d;
    }

    private EnergyUsageLog buildLog(Device device, double kwh) {
        EnergyUsageLog log = new EnergyUsageLog();
        log.setId(1L);
        log.setDevice(device);
        log.setEnergyUsed((float) kwh);
        log.setTimestamp(LocalDateTime.now());
        log.setDurationMinutes(60);
        log.setCost(kwh * ENERGY_RATE);
        log.setCreatedAt(LocalDateTime.now());
        return log;
    }

    @Nested
    @DisplayName("addEnergyLog()")
    class AddEnergyLogTests {

        @Test
        @DisplayName("Calculates cost using configurable injected energyRatePerKwh")
        void calculatesCostWithInjectedRate() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.save(any())).thenReturn(buildLog(d, 2.0));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsed(2.0f);
            req.setDurationMinutes(120);

            energyUsageLogService.addEnergyLog(DEVICE_ID, req);

            ArgumentCaptor<EnergyUsageLog> logCaptor = ArgumentCaptor.forClass(EnergyUsageLog.class);
            verify(energyUsageLogRepository).save(logCaptor.capture());

            // Usage is 2.0, rate is 8.5
            assertThat(logCaptor.getValue().getCost()).isEqualTo(17.0);
        }

        @Test
        @DisplayName("Admin can add log to unowned device")
        void adminCanAddUnowned() {
            setRole("ROLE_ADMIN");
            Device d = buildDevice(999L); // Unowned device
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.save(any())).thenReturn(buildLog(d, 2.0));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsed(2.0f);

            EnergyUsageLogResponse resp = energyUsageLogService.addEnergyLog(DEVICE_ID, req);
            assertThat(resp.getEnergyUsed()).isEqualTo(2.0f);
        }

        @Test
        @DisplayName("Throws when user is not device owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(999L);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsed(1.0f);

            assertThatThrownBy(() -> energyUsageLogService.addEnergyLog(DEVICE_ID, req))
                    .isInstanceOf(UnauthorizedAccessException.class);
        }

        @Test
        @DisplayName("Throws when device not found")
        void throwsWhenDeviceNotFound() {
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.empty());

            AddEnergyLogRequest req = new AddEnergyLogRequest();
            req.setEnergyUsed(1.0f);

            assertThatThrownBy(() -> energyUsageLogService.addEnergyLog(DEVICE_ID, req))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("getDeviceEnergyLogs() & Range Filter")
    class GetLogsTests {

        @Test
        @DisplayName("Technician CAN read logs of unowned device")
        void technicianCanReadUnownedDeviceLogs() {
            setRole("ROLE_TECHNICIAN");
            Device d = buildDevice(999L);
            EnergyUsageLog log = buildLog(d, 2.0);

            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.findByDeviceIdOrderByTimestampDesc(DEVICE_ID))
                    .thenReturn(List.of(log));

            List<EnergyUsageLogResponse> result = energyUsageLogService.getDeviceEnergyLogs(DEVICE_ID);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Returns filtered logs by date range")
        void returnsFilteredLogsByDateRange() {
            Device d = buildDevice(USER_ID);
            EnergyUsageLog log = buildLog(d, 2.0);

            LocalDateTime from = LocalDateTime.now().minusDays(5);
            LocalDateTime to = LocalDateTime.now();

            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.findByDeviceIdAndTimestampBetween(DEVICE_ID, from, to))
                    .thenReturn(List.of(log));

            List<EnergyUsageLogResponse> result = energyUsageLogService.getDeviceEnergyLogsByDateRange(DEVICE_ID, from,
                    to);

            assertThat(result).hasSize(1);
            verify(energyUsageLogRepository).findByDeviceIdAndTimestampBetween(DEVICE_ID, from, to);
        }
    }

    @Nested
    @DisplayName("deleteOldLogs()")
    class DeleteLogsTests {

        @Test
        @DisplayName("Deletes logs before specific date and returns count")
        void deletesOldLogs() {
            LocalDateTime beforeDate = LocalDateTime.now().minusMonths(6);
            when(energyUsageLogRepository.deleteByTimestampBefore(beforeDate)).thenReturn(50L);

            MessageResponse response = energyUsageLogService.deleteOldLogs(beforeDate);

            verify(energyUsageLogRepository).deleteByTimestampBefore(beforeDate);
            assertThat(response.getMessage()).contains("50 old energy logs deleted successfully");
        }
    }

    @Nested
    @DisplayName("getDeviceAnalytics()")
    class AnalyticsTests {

        @Test
        @DisplayName("Aggregates total consumption/cost for given period")
        void aggregatesForPeriod() {
            Device d = buildDevice(USER_ID);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
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
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
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
