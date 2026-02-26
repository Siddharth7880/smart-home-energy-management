package com.smarthome.energy.repository;

import com.smarthome.energy.model.EnergyUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnergyUsageLogRepository extends JpaRepository<EnergyUsageLog, Long> {

        /**
         * Find all energy logs for a specific device
         */
        List<EnergyUsageLog> findByDeviceId(Long deviceId);

        /**
         * Find energy logs for a device within a time range
         */
        List<EnergyUsageLog> findByDeviceIdAndTimestampBetween(
                        Long deviceId,
                        LocalDateTime startTime,
                        LocalDateTime endTime);

        /**
         * Find energy logs for a device ordered by most recent
         */
        List<EnergyUsageLog> findByDeviceIdOrderByTimestampDesc(Long deviceId);

        /**
         * Get total energy consumption for a device in a time range
         */
        @Query("SELECT COALESCE(SUM(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getTotalEnergyConsumption(
                        @Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Get total cost for a device in a time range
         */
        @Query("SELECT COALESCE(SUM(e.cost), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getTotalCost(
                        @Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Get average energy consumption for a device
         */
        @Query("SELECT COALESCE(AVG(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getAverageEnergyConsumption(
                        @Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Find the most recent energy log for a device
         */
        @Query("SELECT e FROM EnergyUsageLog e WHERE e.device.id = :deviceId " +
                        "ORDER BY e.timestamp DESC LIMIT 1")
        EnergyUsageLog findMostRecentLogForDevice(@Param("deviceId") Long deviceId);

        /**
         * Count energy logs for a device
         */
        long countByDeviceId(Long deviceId);

        /**
         * Delete old logs (for maintenance/archiving)
         */
        long deleteByTimestampBefore(LocalDateTime timestamp);
}
