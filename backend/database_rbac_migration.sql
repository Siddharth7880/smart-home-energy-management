-- Database migration script for RBAC implementation
-- This script creates tables for Device and Installation models
-- Run this script after deploying the RBAC implementation

-- Create Devices table
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    power_rating DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    is_online BOOLEAN NOT NULL DEFAULT TRUE,
    last_active TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    installation_date TIMESTAMP NULL,
    installation_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Installations table
CREATE TABLE IF NOT EXISTS installations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homeowner_id BIGINT NOT NULL,
    technician_id BIGINT,
    device_id BIGINT NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    scheduled_date TIMESTAMP NULL,
    estimated_duration_hours INT,
    actual_completion_date TIMESTAMP NULL,
    notes LONGTEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_homeowner_id (homeowner_id),
    INDEX idx_technician_id (technician_id),
    INDEX idx_device_id (device_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify roles exist
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_HOMEOWNER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_TECHNICIAN');

-- Verify tables created
SHOW TABLES LIKE 'devices';
SHOW TABLES LIKE 'installations';
SHOW TABLES LIKE 'roles';

-- Display table structures
DESCRIBE devices;
DESCRIBE installations;
