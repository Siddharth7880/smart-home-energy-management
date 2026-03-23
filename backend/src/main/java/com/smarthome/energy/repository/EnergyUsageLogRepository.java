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

        List<EnergyUsageLog> findByDeviceId(Long deviceId);

        void deleteByDeviceId(Long deviceId);

        List<EnergyUsageLog> findByDeviceIdAndTimestampBetween(Long deviceId,
                        LocalDateTime startTime, LocalDateTime endTime);

        List<EnergyUsageLog> findByDeviceIdOrderByTimestampDesc(Long deviceId);

        @Query("SELECT COALESCE(SUM(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getTotalEnergyConsumption(@Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COALESCE(SUM(e.cost), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getTotalCost(@Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COALESCE(AVG(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime")
        Double getAverageEnergyConsumption(@Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // Uses Spring Data derived query instead of `LIMIT 1` JPQL to prevent Hibernate 6 parsing errors
        EnergyUsageLog findFirstByDeviceIdOrderByTimestampDesc(Long deviceId);

        default EnergyUsageLog findMostRecentLogForDevice(Long deviceId) {
                return findFirstByDeviceIdOrderByTimestampDesc(deviceId);
        }

        long countByDeviceId(Long deviceId);

        long deleteByTimestampBefore(LocalDateTime timestamp);

        // ═══════════════ Hourly aggregation (native SQL) ═══════════════

        @Query(value = "SELECT HOUR(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY HOUR(e.timestamp) ORDER BY HOUR(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateHourly(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Daily aggregation (native SQL) ═══════════════

        @Query(value = "SELECT DAY(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY DAY(e.timestamp) ORDER BY DAY(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateDaily(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Weekly aggregation (native SQL) ═══════════════

        @Query(value = "SELECT WEEK(e.timestamp, 1), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY WEEK(e.timestamp, 1) ORDER BY WEEK(e.timestamp, 1)", nativeQuery = true)
        List<Object[]> aggregateWeekly(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Monthly aggregation (native SQL) ═══════════════

        @Query(value = "SELECT MONTH(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY MONTH(e.timestamp) ORDER BY MONTH(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateMonthly(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Yearly aggregation (native SQL) ═══════════════

        @Query(value = "SELECT YEAR(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY YEAR(e.timestamp) ORDER BY YEAR(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateYearly(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Top devices by total energy (native SQL) ═══════════════

        @Query(value = "SELECT e.device_id, d.name, d.type, " +
                        "COALESCE(SUM(e.energy_used), 0.0) AS totalEnergy, " +
                        "COALESCE(SUM(e.cost), 0.0) AS totalCost " +
                        "FROM energy_usage_logs e " +
                        "JOIN devices d ON d.id = e.device_id " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY e.device_id, d.name, d.type " +
                        "ORDER BY totalEnergy DESC", nativeQuery = true)
        List<Object[]> findTopDevicesByEnergy(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Peak hour detection (native SQL) ═══════════════

        @Query(value = "SELECT HOUR(e.timestamp) AS hr, SUM(e.energy_used) AS total " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id IN :deviceIds AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY HOUR(e.timestamp) ORDER BY total DESC LIMIT 1", nativeQuery = true)
        List<Object[]> findPeakHour(@Param("deviceIds") List<Long> deviceIds,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // ═══════════════ Admin global queries ═══════════════

        @Query("SELECT COALESCE(SUM(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime")
        Double getGlobalTotalEnergy(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COALESCE(SUM(e.cost), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime")
        Double getGlobalTotalCost(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query(value = "SELECT e.device_id, d.name, d.type, d.user_id, u.username, " +
                        "COALESCE(SUM(e.energy_used), 0.0) AS totalEnergy, " +
                        "COALESCE(SUM(e.cost), 0.0) AS totalCost " +
                        "FROM energy_usage_logs e " +
                        "JOIN devices d ON d.id = e.device_id " +
                        "JOIN users u ON u.id = d.user_id " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY e.device_id, d.name, d.type, d.user_id, u.username " +
                        "ORDER BY totalEnergy DESC", nativeQuery = true)
        List<Object[]> findGlobalTopDevicesByEnergy(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COALESCE(AVG(e.energyUsed), 0.0) FROM EnergyUsageLog e " +
                        "WHERE e.device.id = :deviceId")
        Double getOverallAverageForDevice(@Param("deviceId") Long deviceId);

        // ═══════════════ Admin global time-series (native SQL) ═══════════════

        @Query(value = "SELECT HOUR(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY HOUR(e.timestamp) ORDER BY HOUR(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateGlobalHourly(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query(value = "SELECT DAY(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY DAY(e.timestamp) ORDER BY DAY(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateGlobalDaily(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query(value = "SELECT MONTH(e.timestamp), COALESCE(SUM(e.energy_used), 0.0), COALESCE(SUM(e.cost), 0.0) " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY MONTH(e.timestamp) ORDER BY MONTH(e.timestamp)", nativeQuery = true)
        List<Object[]> aggregateGlobalMonthly(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query(value = "SELECT HOUR(e.timestamp) AS hr, SUM(e.energy_used) AS total " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY HOUR(e.timestamp) ORDER BY total DESC LIMIT 1", nativeQuery = true)
        List<Object[]> findGlobalPeakHour(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT COALESCE(SUM(e.energyUsed), 0.0) FROM EnergyUsageLog e")
        Double getGlobalTotalEnergyAllTime();

        // ═══════════ Per-device hourly breakdown (for InsightService) ═══════════

        @Query(value = "SELECT HOUR(e.timestamp) AS hr, COALESCE(SUM(e.energy_used), 0.0) AS total " +
                        "FROM energy_usage_logs e " +
                        "WHERE e.device_id = :deviceId AND e.timestamp BETWEEN :startTime AND :endTime " +
                        "GROUP BY HOUR(e.timestamp) ORDER BY HOUR(e.timestamp)", nativeQuery = true)
        List<Object[]> getHourlyConsumptionRaw(@Param("deviceId") Long deviceId,
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
