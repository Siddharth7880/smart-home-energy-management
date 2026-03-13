package com.smarthome.energy.service;

import java.util.Map;

/**
 * IoT Service Interface — abstraction over live device power readings.
 *
 * The default implementation ({@link IoTSimulatorService}) generates
 * synthetic readings by applying random fluctuation to each device's
 * power_rating.  When a real IoT gateway is available, swap in a new
 * implementation (e.g. IoTGatewayService) without changing any callers.
 */
public interface IoTService {

    /**
     * Get the current (live) power reading for a single device.
     *
     * @param deviceId ID of the device
     * @return map containing {@code deviceId}, {@code currentPowerWatts},
     *         and {@code timestamp}
     */
    Map<String, Object> getLiveReading(Long deviceId);

    /**
     * Get aggregated live power readings across all of a user's active
     * (ON) devices.
     *
     * @param userId the authenticated user's ID (null-safe for admins)
     * @param isAdmin whether the caller has ADMIN role
     * @return map containing {@code totalWatts}, {@code totalKW},
     *         and {@code activeDevices}
     */
    Map<String, Object> getTotalLiveUsage(Long userId, boolean isAdmin);
}
