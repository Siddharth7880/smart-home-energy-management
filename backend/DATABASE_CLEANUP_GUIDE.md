# Database Cleanup Guide

## Problem
Database entries keep coming back after deletion because the Spring Boot server is running and Hibernate is managing the database.

## Solution: Complete Cleanup Steps

### Step 1: Stop the Backend Server
**IMPORTANT: You MUST stop the server before cleaning the database!**

In your backend terminal, press `Ctrl+C` to stop the server.

### Step 2: Clean the Database

Open MySQL command line or MySQL Workbench and run:

```sql
USE smart_database;

-- Delete all OTP records
DELETE FROM email_verification_otp;

-- Delete all user-role associations
DELETE FROM user_roles;

-- Delete all users
DELETE FROM users;

-- Verify tables are empty
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM email_verification_otp;
SELECT COUNT(*) FROM user_roles;
```

### Step 3: Start Fresh

After cleanup, restart your backend server:

```bash
./mvnw spring-boot:run
```

### Step 4: Register Again

1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Submit
4. **Check the backend console** for the OTP code like this:

```
=== OTP VERIFICATION EMAIL (CONSOLE LOG) ===
To: youremail@example.com
Subject: Email Verification - Smart Home Energy Management
OTP Code: 123456
Expiry: 15 minutes
===========================================
```

5. Enter the **exact 6-digit code** from the console
6. After verification, login with your credentials

## Why This Happens

- `spring.jpa.hibernate.ddl-auto=update` makes Hibernate manage your database schema
- While the server is running, it may cache entities or recreate them
- **Always stop the server before manual database operations**

## Alternative: Drop and Recreate Database

If the above doesn't work, you can completely recreate the database:

```sql
DROP DATABASE smart_database;
CREATE DATABASE smart_database;
```

Then restart the server - Hibernate will recreate all tables automatically.
