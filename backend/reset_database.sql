-- Complete Database Reset Script
-- Run this ONLY when the Spring Boot server is STOPPED

USE smart_database;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data from tables
DELETE FROM email_verification_otp;
DELETE FROM user_roles;
DELETE FROM users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify cleanup
SELECT 'Users count:' as Info, COUNT(*) as Count FROM users
UNION ALL
SELECT 'OTP records count:' as Info, COUNT(*) as Count FROM email_verification_otp
UNION ALL
SELECT 'User roles count:' as Info, COUNT(*) as Count FROM user_roles;

-- Optional: Reset auto-increment counters
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE email_verification_otp AUTO_INCREMENT = 1;
