-- Debug script to check password reset token status
-- Run this in MySQL to see if the reset token exists

USE smart_database;

-- Check all users and their reset tokens
SELECT 
    id,
    email,
    username,
    email_verified,
    reset_token,
    reset_token_expiry,
    CASE 
        WHEN reset_token IS NULL THEN 'No Token'
        WHEN reset_token_expiry IS NULL THEN 'No Expiry Set'
        WHEN reset_token_expiry < NOW() THEN 'EXPIRED'
        ELSE 'VALID'
    END as token_status,
    TIMESTAMPDIFF(MINUTE, NOW(), reset_token_expiry) as minutes_until_expiry
FROM users;

-- If you want to manually create a test token for a specific user:
-- UPDATE users 
-- SET reset_token = 'test-token-12345', 
--     reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
-- WHERE email = 'siddind18@gmail.com';
