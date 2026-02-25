package com.smarthome.energy.repository;

import com.smarthome.energy.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    
    /**
     * Find all devices owned by a specific homeowner
     */
    List<Device> findByOwnerId(Long ownerId);
    
    /**
     * Find a specific device owned by a homeowner
     */
    Optional<Device> findByIdAndOwnerId(Long deviceId, Long ownerId);
    
    /**
     * Find all devices of a specific type
     */
    List<Device> findByType(String type);
    
    /**
     * Find all devices at a specific location
     */
    List<Device> findByLocation(String location);
    
    /**
     * Find all active devices for a homeowner
     */
    List<Device> findByOwnerIdAndStatus(Long ownerId, String status);
    
    /**
     * Find all online devices
     */
    List<Device> findByIsOnline(boolean isOnline);
    
    /**
     * Count devices owned by a homeowner
     */
    long countByOwnerId(Long ownerId);
    
    /**
     * Count devices of a specific type
     */
    long countByType(String type);
}
