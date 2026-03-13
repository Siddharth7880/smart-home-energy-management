-- COMPLETE DATABASE FIX AND SETUP SCRIPT
-- This will fix all login issues and create a working test user

USE smart_database;

-- Step 1: Clean up everything
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM email_verification_otp;
DELETE FROM user_roles;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

-- Step 2: Create test user with VERIFIED email
-- Password: TestPass123!
INSERT INTO users (first_name, last_name, username, email, password_hash, email_verified, created_at) 
VALUES (
    'Test',
    'User',
    'testuser',
    'test@example.com',
    '$2a$10$xQ8K9gZ5Y.B2oF7sX3L9/.vH7yG8jR5vX3wD1rY9hK2nB6pQ7tL8a',  -- Password: TestPass123!
    1,  -- email_verified = true
    NOW()
);

-- Step 3: Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Step 4: Create HOMEOWNER role if it doesn't exist
INSERT IGNORE INTO roles (name) VALUES ('ROLE_HOMEOWNER');

-- Step 5: Assign role to user
INSERT INTO user_roles (user_id, role_id)
SELECT @user_id, id FROM roles WHERE name = 'ROLE_HOMEOWNER';

-- Verify the setup
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.email_verified,
    GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id;

-- Show final status
SELECT '✓ Database cleaned and test user created' as Status;
SELECT '✓ Username: testuser' as Login_Info;
SELECT '✓ Password: TestPass123!' as Login_Info;
SELECT '✓ Email verified: YES' as Login_Info;
