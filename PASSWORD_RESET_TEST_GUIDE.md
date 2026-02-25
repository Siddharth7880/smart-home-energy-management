# Password Reset Testing Guide

## Prerequisites
- Backend server running (`./mvnw spring-boot:run`)
- Frontend server running (`npm run dev`)
- At least one verified user in the database

## Step-by-Step Test

### Step 1: Request Password Reset

1. Go to `http://localhost:3000/forgot-password`
2. Enter the email of an existing user (e.g., `siddind18@gmail.com`)
3. Click "Send Reset Link"
4. **Check backend console** for the reset link (if SMTP is not configured):

```
=== PASSWORD RESET EMAIL (CONSOLE LOG) ===
To: siddind18@gmail.com
Reset Link: http://localhost:3000/reset-password?token=<LONG_TOKEN_STRING>
=======================================
```

### Step 2: Use Reset Link

1. **Copy the ENTIRE reset link** from the console
2. Paste it into your browser address bar
3. You should see the "Create New Password" page

### Step 3: Set New Password

1. Enter your new password (minimum 8 characters)
2. Confirm the password
3. Click "Reset Password"
4. You should see a success message

### Step 4: Verify Login

1. Go to `http://localhost:3000/login`
2. Login with your email and **NEW password**
3. Should successfully login

## Common Issues & Solutions

### Issue: "Invalid or missing reset token"
**Cause**: Token not in URL or malformed
**Solution**: Make sure the entire URL with `?token=...` is copied correctly

### Issue: "Reset token has expired"
**Cause**: Token is older than 15 minutes
**Solution**: Request a new password reset link

### Issue: Reset link not appearing in console
**Cause**: Email sending is configured but failing, or user doesn't exist
**Solution**: 
- Check if user exists in database
- Check console for "Password reset email sent" or error messages
- Verify SMTP settings in `application.properties`

### Issue: "Failed to reset password"
**Cause**: Backend error or user doesn't exist
**Solution**: Check backend console for error messages

## Direct Database Check

If you want to manually verify:

```sql
USE smart_database;

-- Check if reset token was created
SELECT id, email, reset_token, reset_token_expiry, email_verified 
FROM users 
WHERE email = 'siddind18@gmail.com';

-- Reset token should have a value and expiry should be 15 minutes in the future
```

## Manual Token Creation (For Testing)

If automatic token generation isn't working, you can manually create one:

```sql
UPDATE users 
SET reset_token = 'test-token-123', 
    reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
WHERE email = 'siddind18@gmail.com';
```

Then visit: `http://localhost:3000/reset-password?token=test-token-123`

## Check Backend Logs

Look for these messages in the backend console:

- ✅ `Password reset email sent to: <email>`
- ⚠️ `Failed to send password reset email to: <email>`
- ❌ Any `RuntimeException` or error stack traces

## Email Configuration Status

The current configuration in `application.properties`:
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587
- **Username**: munwarbasha689@gmail.com

If these are configured correctly, the reset link will be sent to the user's email instead of console.
