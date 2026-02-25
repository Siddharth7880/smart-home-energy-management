# COMPLETE LOGIN FIX GUIDE
## Your login system is working correctly! The issue is database state.

## 🔴 THE PROBLEM
Users in your database don't have `email_verified = 1`, which blocks login.

## ✅ THE SOLUTION

### Step 1: Fix Database (CRITICAL - DO THIS FIRST!)

**Stop the backend server if running** (Ctrl+C in backend terminal)

**Run the fix script in MySQL:**

```bash
# Option A: Using MySQL command line
mysql -u root -p < FIX_LOGIN_DATABASE.sql

# Option B: Using MySQL Workbench
# Open FIX_LOGIN_DATABASE.sql and execute it
```

This will:
- Clean all existing data
- Create a test user with email already verified
- Assign HOMEOWNER role

### Step 2: Start Backend Server

```bash
cd backend
./mvnw spring-boot:run
```

Wait for: `Started EnergyApplication in X seconds`

### Step 3: Test Login

1. Go to: `http://localhost:3000/login`
2. Enter:
   - **Username**: `testuser`
   - **Password**: `TestPass123!`
3. Click "Sign In"
4. ✅ You should login successfully!

---

## 📝 REGISTRATION FLOW (For New Users)

### Step 1: Register
1. Go to: `http://localhost:3000/register`
2. Fill in the form
3. Click "Create Account"

### Step 2: Get OTP from Console
Check backend terminal for:
```
=== OTP VERIFICATION EMAIL (CONSOLE LOG) ===
To: your@email.com
OTP Code: 123456
```

### Step 3: Verify OTP
1. You'll be redirected to `/verify-otp`
2. Enter the 6-digit code from console
3. Click "Verify Email"

### Step 4: Login
1. Go to `/login`
2. Enter your username and password
3. ✅ Login successfully!

---

## 🔧 TROUBLESHOOTING

### Problem: "Please verify your email before logging in"
**Cause**: `email_verified` is `0` in database
**Fix**: Either:
1. Complete OTP verification flow, OR
2. Manually update database:
```sql
UPDATE users SET email_verified = 1 WHERE email = 'your@email.com';
```

### Problem: "Wrong password"
**Cause**: Password hash mismatch
**Fix**: Use the test user credentials or reset password

### Problem: "User not found"
**Cause**: Username doesn't exist in database
**Fix**: Check username spelling or register new user

### Problem: Cannot connect to database
**Cause**: MySQL not running or wrong credentials
**Fix**: Check `application.properties` database settings

---

## 🗄️ DATABASE MANUAL CHECKS

### Check if user exists and is verified:
```sql
SELECT username, email, email_verified, created_at 
FROM users 
WHERE email = 'your@email.com';
```

### Manually verify a user's email:
```sql
UPDATE users 
SET email_verified = 1 
WHERE email = 'your@email.com';
```

### Check user's roles:
```sql
SELECT u.username, u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'your@email.com';
```

---

## 📋 QUICK TEST CHECKLIST

- [ ] Run `FIX_LOGIN_DATABASE.sql` script
- [ ] Start backend server (`./mvnw spring-boot:run`)
- [ ] Backend shows "Started EnergyApplication"
- [ ] Start frontend (`npm run dev`)
- [ ] Go to `http://localhost:3000/login`
- [ ] Login with `testuser` / `TestPass123!`
- [ ] ✅ Successfully logged in and redirected to dashboard

---

## 💡 WHY THIS WORKS NOW

The OTP system we implemented requires:
1. User created with `email_verified = false`
2. OTP sent to email
3. User verifies OTP
4. System sets `email_verified = true`
5. User can now login

The test user script creates a user with `email_verified = 1` already set, skipping the OTP verification for testing purposes.
