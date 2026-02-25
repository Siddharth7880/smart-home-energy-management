-- Quick fix: Verify all existing users' emails
-- Use this if you want to keep existing users and just fix their verification status

USE smart_database;

-- Show current status
SELECT 
    username,
    email,
    email_verified,
    CASE 
        WHEN email_verified = 1 THEN '✓ Can Login'
        ELSE '✗ Cannot Login - Not Verified'
    END as login_status
FROM users;

-- Fix: Set all users as verified
UPDATE users SET email_verified = 1;

-- Verify the fix
SELECT 
    username,
    email,
    email_verified,
    '✓ Can Login Now' as status
FROM users;

SELECT '✓ All users can now login!' as Result;
