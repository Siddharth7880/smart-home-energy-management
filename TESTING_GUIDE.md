# Testing Guide: User Role & Google OAuth Validation

## 🧪 Test Environment Setup

### Prerequisites:
1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`
3. MySQL database configured and running
4. Google OAuth credentials configured in `application.properties`

---

## ✅ Test Case 1: Register with Role Selection

### Steps:
1. Navigate to `http://localhost:3000/register`
2. Fill in form:
   - First Name: `John`
   - Last Name: `Doe`
   - Username: `johndoe123`
   - Email: `john.doe@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
3. **Select Role: "Homeowner"** ← New Feature
4. Click "Create Account"

### Expected Results:
- ✅ Role field appears with two clear options
- ✅ Radio buttons work smoothly
- ✅ Visual feedback on selected role (colored border/background)
- ✅ Form submits without errors
- ✅ Redirects to OTP verification page
- ✅ OTP sent to registered email

### Backend Verification:
```sql
-- Check user created with correct role in database
SELECT u.username, u.email, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'john.doe@example.com';

-- Expected Output:
-- | johndoe123 | john.doe@example.com | ROLE_HOMEOWNER |
```

---

## ✅ Test Case 2: Technician Role Registration

### Steps:
1. Navigate to `http://localhost:3000/register`
2. Fill in form with different email: `tech.user@example.com`
3. **Select Role: "Technician"** ← New Feature
4. Complete registration

### Expected Results:
- ✅ Role field shows "Technician" selected
- ✅ Description shows "Manage and maintain systems"
- ✅ Form submits with technician role
- ✅ OTP verification initiated

### Backend Verification:
```sql
-- Verify technician role assigned
SELECT u.username, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'tech.user@example.com';

-- Expected: ROLE_TECHNICIAN
```

---

## ✅ Test Case 3: Google OAuth - Account Exists (All Scenarios)

### Scenario A: Registered & Verified User
1. Create account via normal registration for: `registered.user@gmail.com`
2. Complete OTP verification (email now verified)
3. Navigate to `http://localhost:3000/login`
4. Click "Sign in with Google"
5. Authenticate with Google account: `registered.user@gmail.com`

### Expected Results:
- ✅ Google authentication succeeds
- ✅ Backend checks email exists
- ✅ Backend checks email is verified
- ✅ JWT token generated
- ✅ Redirected to dashboard
- ✅ User logged in successfully

**Console Log:**
```
[AuthService] processOAuthPostLogin: Email found in database
[AuthService] Email verified, generating JWT token
[OAuth2LoginSuccessHandler] Redirecting to: /oauth/callback?token=eyJhbGciOiJIUzUxMiJ9...
```

---

### Scenario B: Account Exists but NOT Verified
1. Create account via registration: `unverified.user@gmail.com`
2. **DO NOT verify OTP** (skip OTP verification)
3. Try to login with Google: `unverified.user@gmail.com`

### Expected Results:
- ✅ Google authentication succeeds
- ✅ Backend finds email in database
- ✅ Backend detects email NOT verified
- ✅ New OTP generated and sent
- ✅ Redirected to OTP verification page
- ✅ Message: "Enter OTP sent to your email"

**Console Log:**
```
[AuthService] processOAuthPostLogin: Email found but not verified
[EmailService] Sending OTP to unverified.user@gmail.com
[OAuth2LoginSuccessHandler] Redirecting to: /verify-otp?email=unverified.user@gmail.com&from=oauth
```

---

## ❌ Test Case 4: Google OAuth - Account Does NOT Exist (NEW FEATURE)

### Steps:
1. Open `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Authenticate with a Google account that is **NOT registered** in the database
   - Example: `unregistered.random@gmail.com`

### Expected Results:
- ❌ **Authentication FAILS** (This is correct!)
- ❌ User is redirected to `/login?error=[message]&type=oauth_error`
- ❌ **Error message displayed:**
  ```
  "Account not found. Please register first before signing in with Google."
  ```
- ✅ Error shown in red banner on login form
- ✅ User can click "Sign Up" to register first
- ✅ **NO account is created** (this prevents unauthorized access)

**Console Log:**
```
[AuthService] processOAuthPostLogin: Email 'unregistered.random@gmail.com' NOT in database
[OAuth2LoginSuccessHandler] OAuth login failed: Account not found. Please register first before signing in with Google.
[OAuth2LoginSuccessHandler] Redirecting to: /login?error=Account%20not%20found...&type=oauth_error
```

### Frontend Display:
- Red error box appears at top of login form
- Text: "Account not found. Please register first before signing in with Google."
- User can:
  - ✅ Click "Sign Up" link to create account
  - ✅ Try different credentials
  - ✅ Use email/password login instead

---

## ✅ Test Case 5: Email Endpoint (Optional - For Pre-Validation)

### Steps:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Execute JavaScript:

```javascript
// Check if email exists
fetch('http://localhost:8080/api/auth/check-email/john.doe@example.com')
  .then(r => r.json())
  .then(d => console.log('Email exists:', d.message))
  .catch(e => console.error('Error:', e));

// Check if email does NOT exist
fetch('http://localhost:8080/api/auth/check-email/nonexistent@example.com')
  .then(r => r.json())
  .then(d => console.log('Email response:', d.message))
  .catch(e => console.error('Error:', e));
```

### Expected Results:
- ✅ First call: `"Email exists"`
- ✅ Second call: `"Email does not exist"`
- ✅ No errors in console
- ✅ HTTP 200 status for both

---

## 🔒 Security Verification Tests

### Test: Role Cannot Be Manipulated

#### Steps:
1. Open browser DevTools (F12) → Network tab
2. Go to register page
3. Intercept the registration request
4. Change role in payload from `["homeowner"]` to `["admin"]`
5. Send modified request

#### Expected Result:
- ✅ Backend IGNORES frontend role value
- ✅ Backend processes role from its own logic
- ✅ User created with appropriate default role
- ✅ Not promoted to ADMIN (security working)

**Browser Network Request (Before Interception):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "role": ["homeowner"],
  "password": "SecurePass123!"
}
```

**Modified (Attempted):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "role": ["admin"],  // ← Hacker attempts to set admin
  "password": "SecurePass123!"
}
```

**Backend Response:** 
- ✅ User created with HOMEOWNER or selected role (not admin)
- ✅ Verify in database

---

### Test: OAuth Token Validation

#### Steps:
1. Complete successful Google login
2. Open DevTools → Console
3. Paste:

```javascript
// Try to use manipulated token
const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYWNrZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJBRE1JTiJdfQ.fake";

fetch('http://localhost:8080/api/test/admin', {
  headers: {
    'Authorization': 'Bearer ' + fakeToken
  }
})
.then(r => r.json())
.then(d => console.log('Admin access:', d))
.catch(e => console.error('Denied:', e));
```

#### Expected Result:
- ❌ **401 Unauthorized** (Access denied)
- ✅ Fake token rejected by server
- ✅ Cannot access admin endpoints with forged token
- ✅ Token signature validation working

---

## 📊 Complete Test Checklist

### Functional Tests:
- [ ] Role selector appears and is clickable
- [ ] Both role options selectable
- [ ] Default role is 'homeowner'
- [ ] Selected role passes to backend
- [ ] Role assignment verified in database

### Google OAuth Tests:
- [ ] Registered + Verified user → Login success ✅
- [ ] Registered + Unverified user → OTP page ⚠️
- [ ] Unregistered user → Error message + Stay on login ❌
- [ ] Error message is readable and correct
- [ ] User can navigate to signup from error

### Security Tests:
- [ ] Cannot manipulate role in network tab
- [ ] Cannot use fake JWT tokens
- [ ] Email checked before authentication
- [ ] No user auto-creation from OAuth

### UI/UX Tests:
- [ ] No layout shifting when role field appears
- [ ] No text zooming or distortion
- [ ] Error messages clear and visible
- [ ] Animations are smooth
- [ ] Mobile responsive works

### API Tests:
- [ ] Registration payload received correctly
- [ ] OAuth error handling working
- [ ] Email check endpoint responds correctly
- [ ] JWT tokens valid after login

---

## 🐛 Debugging Tips

### If Role Selector Not Showing:
1. Check Firefox/Chrome DevTools → Elements
2. Verify `<div>` exists with UserCog icon
3. Check browser console for JavaScript errors
4. Clear cache and reload: `Ctrl+Shift+R` (Windows)

### If Google OAuth Not Working:
1. Check backend logs for errors:
   ```bash
   tail -f /path/to/application.log | grep OAuth
   ```
2. Verify Google OAuth credentials in `application.properties`
3. Check if email parameter correctly extracted

### If Email Check Endpoint Fails:
1. Verify endpoint exists: `GET /api/auth/check-email/test@example.com`
2. Check for typos in endpoint path
3. Verify UserRepository has `existsByEmail()` method

### Logs Location:
- Backend: `backend/target/` or check console output
- Frontend: Browser DevTools → Console tab
- Database: MySQL error logs in data directory

---

## 📝 Test Results Template

```
Date: _____________
Tester: _____________

Test Case 1 - Register with Role: [ ] PASS [ ] FAIL
Notes: _____________________

Test Case 2 - Technician Role: [ ] PASS [ ] FAIL
Notes: _____________________

Test Case 3A - OAuth (Verified): [ ] PASS [ ] FAIL
Notes: _____________________

Test Case 3B - OAuth (Unverified): [ ] PASS [ ] FAIL
Notes: _____________________

Test Case 4 - OAuth (Not Exists): [ ] PASS [ ] FAIL
Notes: _____________________

Test Case 5 - Email Endpoint: [ ] PASS [ ] FAIL
Notes: _____________________

Security Test - Role Manipulation: [ ] PASS [ ] FAIL
Notes: _____________________

Security Test - Token Validation: [ ] PASS [ ] FAIL
Notes: _____________________

Overall Status: [ ] ALL PASS [ ] SOME FAILURES [ ] CRITICAL ISSUES
Comments: _____________________
```

---

## 🚀 Quick Commands for Testing

### Start Backend:
```bash
cd backend
mvn spring-boot:run
```

### Start Frontend:
```bash
cd frontend
npm start
```

### Check Database:
```bash
mysql -u root -p smart_database

-- View users
SELECT id, email, username, email_verified FROM users;

-- View user roles
SELECT u.username, r.name FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;

-- View OTP records
SELECT email, otp, verified FROM email_verification_otp;
```

---

**Version:** 1.0
**Last Updated:** February 13, 2026
**Status:** Ready for Testing
