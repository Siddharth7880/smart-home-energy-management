package com.smarthome.energy.service;

import com.smarthome.energy.dto.CreateDeviceRequest;
import com.smarthome.energy.dto.DeviceResponse;
import com.smarthome.energy.dto.MessageResponse;
import com.smarthome.energy.exception.ResourceNotFoundException;
import com.smarthome.energy.exception.UnauthorizedAccessException;
import com.smarthome.energy.model.Device;
import com.smarthome.energy.model.DeviceStatus;
import com.smarthome.energy.model.EnergyUsageLog;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.DeviceRepository;
import com.smarthome.energy.repository.EnergyUsageLogRepository;
import com.smarthome.energy.repository.UserRepository;
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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("DeviceService Hard Test Cases")
class DeviceServiceTest {

    @Mock
    private DeviceRepository deviceRepository;
    @Mock
    private EnergyUsageLogRepository energyUsageLogRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DeviceService deviceService;

    private static final Long USER_ID = 1L;
    private static final Long DEVICE_ID = 10L;

    @BeforeEach
    void setupSecurityContext() {
        setRole("ROLE_HOMEOWNER"); // default to homeowner
        ReflectionTestUtils.setField(deviceService, "energyRatePerKwh", 8.0);
    }

    private void setRole(String role) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                USER_ID, "testuser", "test@example.com", "password",
                Collections.singletonList(new SimpleGrantedAuthority(role)));
        var token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    private Device buildDevice(Long id, Long ownerId, boolean online) {
        Device d = new Device();
        d.setId(id);
        User user = new User();
        user.setId(ownerId);
        d.setUser(user);
        d.setName("Test Device");
        d.setType("bulb");
        d.setStatus(online ? DeviceStatus.ON : DeviceStatus.OFF);
        d.setOnline(online);
        d.setPowerRating(1.5f);
        return d;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // getUserDevices
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getUserDevices()")
    class GetUserDevicesTests {

        @Test
        @DisplayName("Returns map with device list for current user")
        void returnsDevicesForCurrentUser() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findByUserIdAndIsDeletedFalse(USER_ID)).thenReturn(List.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.0);

            Map<String, Object> result = deviceService.getUserDevices();

            assertThat(result).containsKey("devices");
            assertThat(result.get("totalDevices")).isEqualTo(1);
            verify(deviceRepository, atLeast(1)).findByUserIdAndIsDeletedFalse(USER_ID);
            verify(deviceRepository, never()).findAll();
        }

        @Test
        @DisplayName("Admin receives ALL devices regardless of owner")
        void adminReceivesAllDevices() {
            setRole("ROLE_ADMIN");
            when(deviceRepository.findAll()).thenReturn(List.of(
                    buildDevice(1L, 99L, true),
                    buildDevice(2L, USER_ID, false)));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.0);

            Map<String, Object> result = deviceService.getUserDevices();

            assertThat(result.get("totalDevices")).isEqualTo(2);
            verify(deviceRepository, atLeastOnce()).findAll();
            verify(deviceRepository, never()).findByUserIdAndIsDeletedFalse(anyLong());
        }

        @Test
        @DisplayName("Returns zero total when user has no devices")
        void returnsEmptyListWhenNoDevices() {
            when(deviceRepository.findByUserIdAndIsDeletedFalse(USER_ID)).thenReturn(Collections.emptyList());
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(null);

            Map<String, Object> result = deviceService.getUserDevices();

            assertThat(result.get("totalDevices")).isEqualTo(0);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // getDeviceById
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getDeviceById()")
    class GetDeviceByIdTests {

        @Test
        @DisplayName("Returns device when owner matches")
        void returnsDeviceForOwner() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.5);

            DeviceResponse resp = deviceService.getDeviceById(DEVICE_ID);

            assertThat(resp.getId()).isEqualTo(DEVICE_ID);
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when device does not exist")
        void throwsWhenDeviceNotFound() {
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> deviceService.getDeviceById(DEVICE_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Throws UnauthorizedAccessException when Homeowner is not the owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            assertThatThrownBy(() -> deviceService.getDeviceById(DEVICE_ID))
                    .isInstanceOf(UnauthorizedAccessException.class);
        }

        @Test
        @DisplayName("Technician CAN read an unowned device (readonly bypass)")
        void technicianCanReadUnownedDevice() {
            setRole("ROLE_TECHNICIAN");
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            DeviceResponse resp = deviceService.getDeviceById(DEVICE_ID);

            assertThat(resp.getId()).isEqualTo(DEVICE_ID);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // createDevice
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("createDevice()")
    class CreateDeviceTests {

        private CreateDeviceRequest validRequest() {
            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setName("Smart Bulb");
            req.setType("bulb");
            req.setLocation("Living Room");
            req.setPowerRating(1.5f);
            return req;
        }

        @Test
        @DisplayName("Creates and returns the new device")
        void createsDevice() {
            Device saved = buildDevice(DEVICE_ID, USER_ID, true);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
            when(deviceRepository.save(any(Device.class))).thenReturn(saved);

            DeviceResponse resp = deviceService.createDevice(validRequest());

            assertThat(resp.getId()).isEqualTo(DEVICE_ID);
            verify(deviceRepository).save(any(Device.class));
        }

        @Test
        @DisplayName("Throws when device name is duplicate for same user")
        void throwsOnDuplicateName() {
            CreateDeviceRequest req = validRequest();
            when(deviceRepository.existsByNameAndUserIdAndIsDeletedFalse(req.getName(), USER_ID)).thenReturn(true);

            assertThatThrownBy(() -> deviceService.createDevice(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("already exists for your account");
        }

        @Test
        @DisplayName("Throws when power rating is less than 1")
        void throwsOnLowPowerRating() {
            CreateDeviceRequest req = validRequest();
            req.setPowerRating(0.5f); // < 1

            assertThatThrownBy(() -> deviceService.createDevice(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("at least 1 watt");
        }

        @Test
        @DisplayName("Throws when type is invalid")
        void throwsWhenTypeIsInvalid() {
            CreateDeviceRequest req = validRequest();
            req.setType("rocket_ship");

            assertThatThrownBy(() -> deviceService.createDevice(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid device type");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // updateDevice
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("updateDevice()")
    class UpdateDeviceTests {

        @Test
        @DisplayName("Updates allowed fields and saves")
        void updatesDevice() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setName("Updated Name");
            req.setType("plug");
            req.setLocation("Kitchen");
            req.setPowerRating(2.0f);

            deviceService.updateDevice(DEVICE_ID, req);

            verify(deviceRepository).save(d);
            assertThat(d.getName()).isEqualTo("Updated Name");
            assertThat(d.getPowerRating()).isEqualTo(2.0f);
        }

        @Test
        @DisplayName("Throws on duplicate name excluding self")
        void throwsOnDuplicateNameExcludingSelf() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            d.setName("Old Name");
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.existsByNameAndUserIdAndIdNotAndIsDeletedFalse("New Name", USER_ID, DEVICE_ID))
                    .thenReturn(true);

            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setName("New Name"); // Attempting to change to an existing name

            assertThatThrownBy(() -> deviceService.updateDevice(DEVICE_ID, req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("already exists for this account");
        }

        @Test
        @DisplayName("Admin can update unowned device")
        void adminCanUpdateUnowned() {
            setRole("ROLE_ADMIN");
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setName("Admin Updated");

            DeviceResponse resp = deviceService.updateDevice(DEVICE_ID, req);

            assertThat(resp.getName()).isEqualTo("Admin Updated");
        }

        @Test
        @DisplayName("Throws on low power rating update")
        void throwsOnLowPowerRatingUpdate() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setPowerRating(0.9f);

            assertThatThrownBy(() -> deviceService.updateDevice(DEVICE_ID, req))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // deleteDevice
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteDevice()")
    class DeleteDeviceTests {

        @Test
        @DisplayName("Deletes the device")
        void deletesDevice() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            deviceService.deleteDevice(DEVICE_ID);
            verify(deviceRepository).save(d);
            assertThat(d.isDeleted()).isTrue();
        }

        @Test
        @DisplayName("Admin bypasses ownership check to delete")
        void adminDeletesUnowned() {
            setRole("ROLE_ADMIN");
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));

            deviceService.deleteDevice(DEVICE_ID);
            verify(deviceRepository).save(d);
            assertThat(d.isDeleted()).isTrue();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // toggleDevice (Milestone 2 PATCH)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("toggleDevice()")
    class ToggleDeviceTests {

        @Test
        @DisplayName("Turn ON sets isOnline=true and sets turnedOnAt")
        void turnOn() {
            Device d = buildDevice(DEVICE_ID, USER_ID, false);
            d.setTurnedOnAt(null);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            deviceService.toggleDevice(DEVICE_ID);

            ArgumentCaptor<Device> captor = ArgumentCaptor.forClass(Device.class);
            verify(deviceRepository).save(captor.capture());
            assertThat(captor.getValue().isOnline()).isTrue();
            assertThat(captor.getValue().getTurnedOnAt()).isNotNull();
        }

        @Test
        @DisplayName("Turn OFF generates EnergyUsageLog with correct rate calculation")
        void turnOffLogging() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            d.setTurnedOnAt(LocalDateTime.now().minusMinutes(60)); // On for 1 hour
            d.setPowerRating(2.0f); // 2 W, wait it's in watts now

            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);
            when(energyUsageLogRepository.save(any(EnergyUsageLog.class))).thenReturn(new EnergyUsageLog());

            deviceService.toggleDevice(DEVICE_ID);

            ArgumentCaptor<EnergyUsageLog> logCaptor = ArgumentCaptor.forClass(EnergyUsageLog.class);
            verify(energyUsageLogRepository).save(logCaptor.capture());

            EnergyUsageLog savedLog = logCaptor.getValue();
            assertThat(savedLog.getDurationMinutes()).isEqualTo(60);

            // Expected energy: (2.0 W / 1000) * 1 hour = 0.002 kWh
            assertThat(savedLog.getEnergyUsed()).isEqualTo(0.002f);
            // Expected cost: 0.002 kWh * 8.0 rate = 0.016 -> rounds to 0.02
            assertThat(savedLog.getCost()).isEqualTo((double) 0.02);

            ArgumentCaptor<Device> deviceCaptor = ArgumentCaptor.forClass(Device.class);
            verify(deviceRepository).save(deviceCaptor.capture());
            assertThat(deviceCaptor.getValue().isOnline()).isFalse();
            assertThat(deviceCaptor.getValue().getTurnedOnAt()).isNull();
        }

        @Test
        @DisplayName("Admin can toggle another user's device")
        void adminToggle() {
            setRole("ROLE_ADMIN");
            Device d = buildDevice(DEVICE_ID, 999L, false);
            when(deviceRepository.findByIdAndIsDeletedFalse(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            DeviceResponse resp = deviceService.toggleDevice(DEVICE_ID);
            assertThat(resp.isOnline()).isTrue();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // getTotalPower (Milestone 2 GET)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("getTotalPower()")
    class GetTotalPowerTests {

        @Test
        @DisplayName("Returns calculated total power summing only online devices for homeowner")
        void returnsTotalPowerHomeowner() {
            when(deviceRepository.sumPowerRatingByUserIdAndOnline(USER_ID)).thenReturn(15555.0);
            when(deviceRepository.findByUserIdAndIsOnlineAndIsDeletedFalse(USER_ID, true))
                    .thenReturn(List.of(new Device(), new Device()));

            Map<String, Object> result = deviceService.getTotalPower();

            // Expected rounding: 15.555 (actually totalPowerKw comes from Watts / 1000)
            assertThat((Double) result.get("totalPowerKw")).isEqualTo(15.555);
            assertThat((Long) result.get("totalPowerWatts")).isEqualTo(15555L);
            long activeCount = ((Number) result.get("activeDevices")).longValue();
            assertThat(activeCount).isEqualTo(2L);
            verify(deviceRepository).sumPowerRatingByUserIdAndOnline(USER_ID);
        }

        @Test
        @DisplayName("Returns sum of all online power ratings for Admin")
        void returnsTotalPowerAdmin() {
            setRole("ROLE_ADMIN");
            when(deviceRepository.sumAllOnlinePowerRatings()).thenReturn(100123.0);
            when(deviceRepository.findByIsOnlineAndIsDeletedFalse(true))
                    .thenReturn(List.of(new Device(), new Device(), new Device()));

            Map<String, Object> result = deviceService.getTotalPower();

            assertThat((Double) result.get("totalPowerKw")).isEqualTo(100.123);
            assertThat((Long) result.get("totalPowerWatts")).isEqualTo(100123L);
            long activeCount = ((Number) result.get("activeDevices")).longValue();
            assertThat(activeCount).isEqualTo(3L);
            verify(deviceRepository).sumAllOnlinePowerRatings();
        }
    }
}
