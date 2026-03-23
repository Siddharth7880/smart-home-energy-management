package com.smarthome.energy.repository;

import com.smarthome.energy.model.EnergyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnergyAlertRepository extends JpaRepository<EnergyAlert, Long> {

    List<EnergyAlert> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<EnergyAlert> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE EnergyAlert a SET a.read = true WHERE a.user.id = :userId AND a.read = false")
    void markAllReadByUserId(@Param("userId") Long userId);

    /** Prevent duplicate unread OVERLOAD alerts within same hour (avoid spam) */
    @Query("SELECT COUNT(a) > 0 FROM EnergyAlert a WHERE a.user.id = :userId AND a.type = 'OVERLOAD' AND a.read = false AND a.createdAt >= :since")
    boolean hasRecentUnreadOverload(@Param("userId") Long userId, @Param("since") java.time.LocalDateTime since);
}
