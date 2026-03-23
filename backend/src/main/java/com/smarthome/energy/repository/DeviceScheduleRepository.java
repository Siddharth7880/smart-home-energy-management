package com.smarthome.energy.repository;

import com.smarthome.energy.model.DeviceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeviceScheduleRepository extends JpaRepository<DeviceSchedule, Long> {

    List<DeviceSchedule> findByUserIdOrderByScheduledAtDesc(Long userId);

    List<DeviceSchedule> findByUserIdAndExecutedFalseOrderByScheduledAtAsc(Long userId);

    @Query("SELECT s FROM DeviceSchedule s WHERE s.executed = false AND s.scheduledAt <= :now")
    List<DeviceSchedule> findPendingSchedulesDue(@Param("now") LocalDateTime now);
}
