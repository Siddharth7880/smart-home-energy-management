-- ============================================================================
-- Smart Home Energy Management System - Device & Energy Tracking
-- Database Migration Script
-- Created: February 17, 2026
-- ============================================================================

-- ============================================================================
-- 1. DEVICES TABLE (Already Exists - Verify Structure)
-- ============================================================================
-- Verify devices table has all required columns
-- If not present, it will be auto-created by Hibernate

-- ============================================================================
-- 2. CREATE ENERGY_USAGE_LOGS TABLE (NEW)
-- ============================================================================

-- Drop table if exists (for fresh setup)
-- DROP TABLE IF EXISTS energy_usage_logs;

-- Create energy usage logs table with proper indexing
CREATE TABLE IF NOT EXISTS energy_usage_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id BIGINT NOT NULL,
    energy_usage DECIMAL(10, 4) NOT NULL COMMENT 'Energy usage in kWh',
    timestamp TIMESTAMP NOT NULL COMMENT 'When the consumption occurred',
    duration_minutes INT COMMENT 'Duration of the measurement in minutes',
    cost DECIMAL(10, 4) COMMENT 'Estimated cost of the consumption',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the log was created',
    
    -- Foreign key constraint
    CONSTRAINT fk_energy_logs_device FOREIGN KEY (device_id) 
        REFERENCES devices(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_device_id (device_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_device_timestamp (device_id, timestamp),
    
    -- Comment for table
    COMMENT = 'Tracks energy consumption for each device over time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. VERIFY DEVICES TABLE STRUCTURE
-- ============================================================================

-- These columns should exist in devices table:
-- id, owner_id, name, type, description, location, power_rating, status,
-- is_online, last_active, created_at, updated_at, installation_date,
-- installation_id

-- Add columns if they don't exist:
ALTER TABLE devices ADD COLUMN IF NOT EXISTS power_rating DECIMAL(10, 2);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT TRUE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS last_active TIMESTAMP;

-- ============================================================================
-- 4. SAMPLE DATA (Optional - For Testing)
-- ============================================================================

-- Insert sample devices (if needed for testing)
-- Uncomment to use with a real user_id from your users table

/*
INSERT INTO devices (owner_id, name, type, location, power_rating, status, is_online, created_at, updated_at)
VALUES 
(1, 'Living Room Thermostat', 'thermostat', 'Living Room', 1.5, 'active', TRUE, NOW(), NOW()),
(1, 'Kitchen Light Bulb', 'bulb', 'Kitchen', 0.1, 'active', TRUE, NOW(), NOW()),
(1, 'Coffee Machine Plug', 'plug', 'Kitchen', 1.2, 'active', TRUE, NOW(), NOW()),
(1, 'Air Conditioner', 'air_conditioner', 'Master Bedroom', 3.5, 'active', TRUE, NOW(), NOW());

-- Insert sample energy logs (if you added sample devices, update device_id)
INSERT INTO energy_usage_logs (device_id, energy_usage, timestamp, duration_minutes, cost, created_at)
VALUES 
(1, 2.5, NOW() - INTERVAL 1 HOUR, 60, 12.50, NOW()),
(1, 2.3, NOW() - INTERVAL 2 HOUR, 60, 11.50, NOW()),
(2, 0.1, NOW() - INTERVAL 3 HOUR, 30, 0.50, NOW()),
(3, 1.5, NOW() - INTERVAL 4 HOUR, 45, 7.50, NOW());
*/

-- ============================================================================
-- 5. USEFUL QUERIES FOR TESTING & MONITORING
-- ============================================================================

-- View all tables
-- SHOW TABLES;

-- Check energy_usage_logs table structure
-- DESCRIBE energy_usage_logs;

-- Get total energy consumption per device for today
-- SELECT 
--     d.name,
--     d.type,
--     COUNT(*) as log_count,
--     SUM(e.energy_usage) as total_consumption,
--     AVG(e.energy_usage) as avg_consumption,
--     SUM(e.cost) as total_cost
-- FROM energy_usage_logs e
-- JOIN devices d ON e.device_id = d.id
-- WHERE DATE(e.timestamp) = CURDATE()
-- GROUP BY d.id, d.name, d.type
-- ORDER BY total_consumption DESC;

-- Get last 24 hours consumption by device
-- SELECT 
--     d.id,
--     d.name,
--     d.type,
--     d.location,
--     SUM(e.energy_usage) as consumption_24h,
--     SUM(e.cost) as cost_24h
-- FROM devices d
-- LEFT JOIN energy_usage_logs e ON d.id = e.device_id 
--     AND e.timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)
-- WHERE d.owner_id = 1  -- Replace with actual user_id
-- GROUP BY d.id, d.name, d.type, d.location
-- ORDER BY consumption_24h DESC;

-- Get monthly consumption trend
-- SELECT 
--     YEAR(timestamp) as year,
--     MONTH(timestamp) as month,
--     d.name,
--     SUM(energy_usage) as monthly_consumption,
--     SUM(cost) as monthly_cost
-- FROM energy_usage_logs e
-- JOIN devices d ON e.device_id = d.id
-- WHERE d.owner_id = 1  -- Replace with actual user_id
-- GROUP BY YEAR(timestamp), MONTH(timestamp), d.id, d.name
-- ORDER BY year DESC, month DESC;

-- ============================================================================
-- 6. CLEANUP PROCEDURES (Run Periodically)
-- ============================================================================

-- Delete logs older than 90 days
-- DELETE FROM energy_usage_logs 
-- WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive old logs before deletion (optional)
-- You could create a backup table first:
-- CREATE TABLE energy_usage_logs_archive AS 
-- SELECT * FROM energy_usage_logs 
-- WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- ============================================================================
-- 7. PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Analyze tables for query optimizer
-- ANALYZE TABLE devices;
-- ANALYZE TABLE energy_usage_logs;

-- Check index usage
-- SHOW INDEX FROM devices;
-- SHOW INDEX FROM energy_usage_logs;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================

-- Run this script with:
-- mysql -u root -p smart_database < device_energy_migration.sql
-- OR
-- mysql> SOURCE device_energy_migration.sql;
