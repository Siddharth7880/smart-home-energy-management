package com.smarthome.energy.service;

import com.smarthome.energy.dto.CreateDeviceRequest;
import com.smarthome.energy.dto.DeviceResponse;
import com.smarthome.energy.dto.MessageResponse;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

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
@DisplayName("DeviceService Tests")
class DeviceServiceTest {

    @Mock
    private DeviceRepository deviceRepository;
    @Mock
    private EnergyUsageLogRepository energyUsageLogRepository;

    @InjectMocks
    private DeviceService deviceService;

    private static final Long USER_ID = 1L;
    private static final Long DEVICE_ID = 10L;

    /** Populate SecurityContext with a real UserDetailsImpl — no mocking needed. */
    @BeforeEach
    void setupSecurityContext() {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                USER_ID, "testuser", "test@example.com", "password", Collections.emptyList());
        var token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    private Device buildDevice(Long id, Long ownerId, boolean online) {
        Device d = new Device();
        d.setId(id);
        d.setOwnerId(ownerId);
        d.setName("Test Device");
        d.setType("bulb");
        d.setStatus("active");
        d.setOnline(online);
        d.setPowerRating(1.5);
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
            when(deviceRepository.findByOwnerId(USER_ID)).thenReturn(List.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.0);

            Map<String, Object> result = deviceService.getUserDevices();

            assertThat(result).containsKey("devices");
            assertThat(result.get("totalDevices")).isEqualTo(1);
            verify(deviceRepository, atLeast(1)).findByOwnerId(USER_ID);
        }

        @Test
        @DisplayName("Returns zero total when user has no devices")
        void returnsEmptyListWhenNoDevices() {
            when(deviceRepository.findByOwnerId(USER_ID)).thenReturn(Collections.emptyList());
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
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.5);

            DeviceResponse resp = deviceService.getDeviceById(DEVICE_ID);

            assertThat(resp.getId()).isEqualTo(DEVICE_ID);
            assertThat(resp.getName()).isEqualTo("Test Device");
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when device does not exist")
        void throwsWhenDeviceNotFound() {
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> deviceService.getDeviceById(DEVICE_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Throws UnauthorizedAccessException when user is not the owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            assertThatThrownBy(() -> deviceService.getDeviceById(DEVICE_ID))
                    .isInstanceOf(UnauthorizedAccessException.class);
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
            req.setPowerRating(0.01);
            return req;
        }

        @Test
        @DisplayName("Creates and returns the new device")
        void createsDevice() {
            Device saved = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.save(any(Device.class))).thenReturn(saved);
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.0);

            DeviceResponse resp = deviceService.createDevice(validRequest());

            assertThat(resp.getId()).isEqualTo(DEVICE_ID);
            verify(deviceRepository).save(any(Device.class));
        }

        @Test
        @DisplayName("Throws when device name is blank")
        void throwsWhenNameIsBlank() {
            CreateDeviceRequest req = validRequest();
            req.setName("  ");

            assertThatThrownBy(() -> deviceService.createDevice(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Device name is required");
        }

        @Test
        @DisplayName("Throws when device type is invalid")
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
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);
            when(energyUsageLogRepository.getTotalEnergyConsumption(any(), any(), any())).thenReturn(0.0);

            CreateDeviceRequest req = new CreateDeviceRequest();
            req.setName("Updated Name");
            req.setType("plug");
            req.setLocation("Kitchen");

            deviceService.updateDevice(DEVICE_ID, req);

            verify(deviceRepository).save(d);
        }

        @Test
        @DisplayName("Throws when device not found")
        void throwsWhenNotFound() {
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> deviceService.updateDevice(DEVICE_ID, new CreateDeviceRequest()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Throws when user is not the owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(DEVICE_ID, 999L, true);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            assertThatThrownBy(() -> deviceService.updateDevice(DEVICE_ID, new CreateDeviceRequest()))
                    .isInstanceOf(UnauthorizedAccessException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // deleteDevice
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("deleteDevice()")
    class DeleteDeviceTests {

        @Test
        @DisplayName("Deletes the device and returns success message")
        void deletesDevice() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            MessageResponse resp = deviceService.deleteDevice(DEVICE_ID);

            verify(deviceRepository).delete(d);
            assertThat(resp.getMessage()).contains("deleted successfully");
        }

        @Test
        @DisplayName("Throws when device not found")
        void throwsWhenNotFound() {
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> deviceService.deleteDevice(DEVICE_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // controlDevice (Turn ON / Turn OFF + auto-log)
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("controlDevice()")
    class ControlDeviceTests {

        @Test
        @DisplayName("Turn ON sets isOnline=true and records turnedOnAt timestamp")
        void turnOnSetsOnlineAndTimestamp() {
            Device d = buildDevice(DEVICE_ID, USER_ID, false);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            deviceService.controlDevice(DEVICE_ID, "on");

            ArgumentCaptor<Device> captor = ArgumentCaptor.forClass(Device.class);
            verify(deviceRepository).save(captor.capture());
            assertThat(captor.getValue().isOnline()).isTrue();
            assertThat(captor.getValue().getTurnedOnAt()).isNotNull();
        }

        @Test
        @DisplayName("Turn OFF creates energy log using powerRating x duration")
        void turnOffCreatesEnergyLog() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            d.setTurnedOnAt(LocalDateTime.now().minusMinutes(30));
            d.setPowerRating(2.0);

            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);
            when(energyUsageLogRepository.save(any(EnergyUsageLog.class))).thenReturn(new EnergyUsageLog());

            deviceService.controlDevice(DEVICE_ID, "off");

            verify(energyUsageLogRepository).save(any(EnergyUsageLog.class));
            ArgumentCaptor<Device> captor = ArgumentCaptor.forClass(Device.class);
            verify(deviceRepository).save(captor.capture());
            assertThat(captor.getValue().isOnline()).isFalse();
            assertThat(captor.getValue().getTurnedOnAt()).isNull();
        }

        @Test
        @DisplayName("Turn OFF skips log when powerRating is null")
        void turnOffSkipsLogWhenNoPowerRating() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            d.setTurnedOnAt(LocalDateTime.now().minusMinutes(10));
            d.setPowerRating(null);

            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            deviceService.controlDevice(DEVICE_ID, "off");

            verify(energyUsageLogRepository, never()).save(any());
        }

        @Test
        @DisplayName("Turn OFF skips log when turnedOnAt is null (never recorded)")
        void turnOffSkipsLogWhenNeverTurnedOn() {
            Device d = buildDevice(DEVICE_ID, USER_ID, true);
            d.setTurnedOnAt(null);

            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            deviceService.controlDevice(DEVICE_ID, "off");

            verify(energyUsageLogRepository, never()).save(any());
        }

        @Test
        @DisplayName("Throws IllegalArgumentException on invalid action")
        void throwsOnInvalidAction() {
            Device d = buildDevice(DEVICE_ID, USER_ID, false);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            assertThatThrownBy(() -> deviceService.controlDevice(DEVICE_ID, "restart"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid action");
        }

        @Test
        @DisplayName("Throws UnauthorizedAccessException when user is not the owner")
        void throwsWhenNotOwner() {
            Device d = buildDevice(DEVICE_ID, 999L, false);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));

            assertThatThrownBy(() -> deviceService.controlDevice(DEVICE_ID, "on"))
                    .isInstanceOf(UnauthorizedAccessException.class);
        }

        @Test
        @DisplayName("Returns success message with action in uppercase")
        void returnsSuccessMessage() {
            Device d = buildDevice(DEVICE_ID, USER_ID, false);
            when(deviceRepository.findById(DEVICE_ID)).thenReturn(Optional.of(d));
            when(deviceRepository.save(any())).thenReturn(d);

            MessageResponse resp = deviceService.controlDevice(DEVICE_ID, "on");

            assertThat(resp.getMessage()).containsIgnoringCase("ON");
        }
    }
}
