package com.smarthome.energy.repository;

import com.smarthome.energy.model.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

        /** Find all devices owned by a specific homeowner */
        List<Device> findByUserIdAndIsDeletedFalse(Long userId);

        /** Find all devices for a given user regardless of deletion status */
        List<Device> findByUserId(Long userId);

        /** Find all active devices for a homeowner with pagination and search */
        @Query("SELECT d FROM Device d WHERE d.user.id = :userId AND d.isDeleted = false " +
                        "AND (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.type) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Device> findByUserIdAndIsDeletedFalseWithSearch(@Param("userId") Long userId,
                        @Param("search") String search,
                        Pageable pageable);

        /** Find all devices ignoring users with search/pagination (for Admin) */
        @Query("SELECT d FROM Device d WHERE d.isDeleted = false " +
                        "AND (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.type) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Device> findAllByIsDeletedFalseWithSearch(@Param("search") String search, Pageable pageable);

        /** Find a specific device owned by a homeowner */
        Optional<Device> findByIdAndUserIdAndIsDeletedFalse(Long deviceId, Long userId);

        Optional<Device> findByIdAndIsDeletedFalse(Long deviceId);

        /** Find all devices of a specific type */
        List<Device> findByTypeAndIsDeletedFalse(String type);

        /** Find all active devices for a homeowner */
        List<Device> findByUserIdAndStatusAndIsDeletedFalse(Long userId, String status);

        /** Find all online devices */
        List<Device> findByIsOnlineAndIsDeletedFalse(boolean isOnline);

        /** Find online devices for a specific owner (for total-power calculation) */
        List<Device> findByUserIdAndIsOnlineAndIsDeletedFalse(Long userId, boolean isOnline);

        /** Count devices owned by a homeowner */
        long countByUserIdAndIsDeletedFalse(Long userId);

        /** Count devices of a specific type */
        long countByTypeAndIsDeletedFalse(String type);

        /** Check for duplicate device name per user */
        boolean existsByNameAndUserIdAndIsDeletedFalse(String name, Long userId);

        /**
         * Check for duplicate device name per user excluding a specific device (for
         * updates)
         */
        boolean existsByNameAndUserIdAndIdNotAndIsDeletedFalse(String name, Long userId, Long id);

        /** Sum of powerRating for all online devices of an owner */
        @Query("SELECT COALESCE(SUM(d.powerRating), 0.0) FROM Device d WHERE d.user.id = :userId AND d.status = 'ON' AND d.isDeleted = false")
        Double sumPowerRatingByUserIdAndOnline(@Param("userId") Long userId);

        /** Sum of powerRating for all online devices (Admin total) */
        @Query("SELECT COALESCE(SUM(d.powerRating), 0.0) FROM Device d WHERE d.status = 'ON' AND d.isDeleted = false")
        Double sumAllOnlinePowerRatings();
}
