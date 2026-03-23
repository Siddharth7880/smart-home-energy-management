package com.smarthome.energy.repository;

import com.smarthome.energy.model.EnergyThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnergyThresholdRepository extends JpaRepository<EnergyThreshold, Long> {
    Optional<EnergyThreshold> findByUserId(Long userId);
}
