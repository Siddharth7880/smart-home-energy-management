# OTP Email Configuration Fix Guide

## Problem
❌ OTP emails are not being received by users during authentication because **Gmail SMTP authentication is failing**.

## Root Cause
The Gmail credentials in `application.properties` are either:
- Incorrect/invalid
- Using a regular password instead of an App Password
- The Gmail account doesn't have SMTP access enabled

## Solutions

### Option 1: Use Your Own Gmail Account (Recommended for Production)

#### Step 1: Generate a Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **App Passwords** (located on the left sidebar)
3. Select **App: Mail** and **Device: Windows Computer**
4. Google will generate a 16-character password with spaces
5. Copy this password (without spaces or keep the spaces - the config handles both)

#### Step 2: Update application.properties
Open: `backend/src/main/resources/application.properties`

Replace:
```properties
spring.mail.username=YOUR_GMAIL_ADDRESS@gmail.com
spring.mail.password=YOUR_APP_PASSWORD_HERE
```

With your actual Gmail and the generated App Password:
```properties
spring.mail.username=youremail@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx
```

#### Step 3: Restart Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### Option 2: Use Development Mode (Quick Testing)

For development/testing without real email sending:

#### Leave Email Unconfigured
In `application.properties`, keep:
```properties
spring.mail.username=YOUR_GMAIL_ADDRESS@gmail.com
spring.mail.password=YOUR_APP_PASSWORD_HERE
```

#### Keep the Fallback
When SMTP fails or is not configured, the backend logs OTP codes to console:
```
=== OTP VERIFICATION EMAIL (CONSOLE LOG - SMTP NOT CONFIGURED) ===
To: user@example.com
Subject: Email Verification - Smart Home Energy Management
OTP Code: 123456
Expiry: 15 minutes
```

**You can then copy the OTP from console logs and use it in the frontend for testing.**

## Verification

### Check if OTP Email is Working
1. Register a new user
2. Check backend logs for:
   - ✅ **Success**: `✓ EMAIL SENT: OTP verification sent to email@example.com`
   - ❌ **Failure**: `✗ EMAIL FAILED: Authentication failed`
   - ℹ️ **Development Mode**: `=== OTP VERIFICATION EMAIL (CONSOLE LOG - SMTP NOT CONFIGURED) ===`

### Email Flow
```
User Registration
    ↓
OTP Generated (6-digit code)
    ↓
Saved to Database (email_verification_otp table)
    ↓
Email Sent via SMTP or Logged to Console
    ↓
User Enters OTP on /verify-otp page
    ↓
OTP Verified in Database
    ↓
User Auto-Logged In with JWT Token
```

## Common Issues

### "Authentication failed"
- **Cause**: Wrong Gmail credentials or App Password not generated
- **Fix**: Follow Step 1-2 above to generate and configure proper App Password

### "Java Mail Sender not initialized"
- **Cause**: No valid SMTP configuration
- **Fix**: Use development mode consolelogging or configure Gmail SMTP

### OTP Not Arriving in Inbox
- **Cause**: Email sent from test account (munwarbasha689@gmail.com) may be marked as spam
- **Fix**: Use your own Gmail account with proper App Password

## Database Check

To verify OTP was saved to database:
```sql
SELECT * FROM email_verification_otp 
WHERE email = 'user@example.com'
ORDER BY created_at DESC;
```

## Testing the OTP Verification

Once you receive/view the OTP:
1. Go to `/verify-otp` page (after registration)
2. Enter the 6-digit OTP code
3. You should be auto-logged in

Or test via API:
```bash
# Verify OTP
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# Expected Response:
# {"accessToken":"JWT_TOKEN","id":1,"username":"...","email":"...","roles":[...]}
```

## Next Steps

1. ✅ Update Gmail credentials in `application.properties`
2. ✅ Restart the backend
3. ✅ Test registration with a real Gmail account
4. ✅ Verify OTP email arrives in inbox
5. ✅ Complete OTP verification on frontend

## Support Articles
- [Generate Gmail App Password](https://support.google.com/accounts/answer/185833)
- [Enable 2-factor Authentication](https://support.google.com/accounts/answer/180744)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
