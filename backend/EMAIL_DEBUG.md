## EMAIL DEBUGGING GUIDE

**Current Configuration:**
- Email: munwarbasha689@gmail.com  
- SMTP: smtp.gmail.com:587
- App Password: qbpm ealy cffi lzho

## CRITICAL: Gmail App Password Setup

**Your app password looks incorrect** - it has spaces. Gmail app passwords are 16 characters without spaces.

### Fix Gmail App Password:

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Sign in** with munwarbasha689@gmail.com
3. **Click "Generate"** and create a new app password for "Mail"
4. **Copy the 16-character password** (e.g., `abcdabcd abcdabcd`)
5. **Remove all spaces** → `abcdabcdabcdabcd`
6. **Update application.properties** line 33 with this password

### Test Email Manually:

After updating the password, restart backend and test:

```bash
# Stop backend (Ctrl+C)
./mvnw spring-boot:run

# Then register a new user or use resend OTP
```

## Common Issues:

1. ❌ **2-Factor Authentication not enabled** on Gmail
   - Go to: https://myaccount.google.com/security
   - Enable 2FA first, then create app password

2. ❌ **"Less secure app access"** is irrelevant
   - App passwords bypass this completely

3. ❌ **Wrong email format in app.properties**
   - Must match exactly: munwarbasha689@gmail.com

## The Real Problem:

**The app password `qbpm ealy cffi lzho` has SPACES**. When copied, remove spaces: `qbpmeallycffilzho`
