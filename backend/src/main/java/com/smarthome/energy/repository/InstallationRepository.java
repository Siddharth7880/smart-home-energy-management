package com.smarthome.energy.repository;

import com.smarthome.energy.model.Installation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstallationRepository extends JpaRepository<Installation, Long> {
    
    /**
     * Find all installations for a specific homeowner
     */
    List<Installation> findByHomeownerId(Long homeownerId);
    
    /**
     * Find all installations assigned to a specific technician
     */
    List<Installation> findByTechnicianId(Long technicianId);
    
    /**
     * Find installations by status
     */
    List<Installation> findByStatus(String status);
    
    /**
     * Find installations for a homeowner with a specific status
     */
    List<Installation> findByHomeownerIdAndStatus(Long homeownerId, String status);
    
    /**
     * Find installations assigned to a technician with a specific status
     */
    List<Installation> findByTechnicianIdAndStatus(Long technicianId, String status);
    
    /**
     * Find pending installations (not yet assigned)
     */
    List<Installation> findByStatusAndTechnicianIdIsNull(String status);
    
    /**
     * Find installation by ID and verify it belongs to a homeowner
     */
    Optional<Installation> findByIdAndHomeownerId(Long installationId, Long homeownerId);
    
    /**
     * Find installation by ID and verify it's assigned to a technician
     */
    Optional<Installation> findByIdAndTechnicianId(Long installationId, Long technicianId);
    
    /**
     * Count pending installations
     */
    long countByStatus(String status);
    
    /**
     * Count installations for a technician
     */
    long countByTechnicianId(Long technicianId);
    
    /**
     * Count completed installations by a technician
     */
    long countByTechnicianIdAndStatus(Long technicianId, String status);
}
