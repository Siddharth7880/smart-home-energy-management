-- SQL script to remove a user and related OTP records from the database
-- Replace 'your_email@example.com' with the actual email address

-- Delete OTP records for the user
DELETE FROM email_verification_otp WHERE email = 'siddind18@gmail.com';

-- Delete user_roles associations
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'siddind18@gmail.com');

-- Delete the user
DELETE FROM users WHERE email = 'siddind18@gmail.com';

-- Verify deletion
SELECT * FROM users WHERE email = 'siddind18@gmail.com';
SELECT * FROM email_verification_otp WHERE email = 'siddind18@gmail.com';
