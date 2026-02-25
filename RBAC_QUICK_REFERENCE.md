# RBAC Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### 1. Build & Deploy
```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run
```

### 2. Test Credentials
```
Admin:      admin_user / AdminPassword123!
Homeowner:  homeowner_user / HomePassword123!
Technician: technician_user / TechPassword123!
```

### 3. Get Token
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_user","password":"AdminPassword123!"}'
```

---

## 📍 Endpoint Quick Map

### Admin Endpoints (`/api/admin`)
```
/users                   → GET(list), POST(create-via signup)
/users/{id}              → GET(detail), PUT(update), DELETE
/users/{id}/roles        → PUT(change)
/users/{id}/deactivate   → POST
/users/{id}/reactivate   → POST
/users/{id}/reset-pwd    → POST
/statistics              → GET
/role-distribution       → GET
/settings                → GET, PUT
```

### Device Endpoints (`/api/devices`)
```
/                        → GET(list), POST(create)
/{id}                    → GET, PUT, DELETE
/{id}/control            → POST(on/off)
/{id}/status             → GET
/{id}/consumption        → GET
/consumption/summary     → GET
```

### Technician Endpoints (`/api/technician`)
```
/installations           → GET(mine)
/installations/{id}      → GET(if assigned)
/installations/{id}/status      → PUT(update)
/installations/{id}/notes       → POST
/installations/{id}/complete    → POST
/metrics/me              → GET(personal)

[Admin Only]
/installations           → POST(create)
/installations/{id}/assign      → POST
/installations/status/pending   → GET
/metrics                 → GET(all)
```

---

## 🔐 Authorization Quick Check

### I'm an Admin - Can I Access?
| Endpoint | Access | Notes |
|----------|:------:|-------|
| /api/admin/* | ✓ | Full access |
| /api/devices/* | ✓ | Can manage all devices |
| /api/technician/* | ✓ | Can assign & monitor |

### I'm a Homeowner - Can I Access?
| Endpoint | Access | Notes |
|----------|:------:|-------|
| /api/admin/* | ✗ | 403 Forbidden |
| /api/devices | ✓ | Your devices only |
| /api/technician/* | ✗ | 403 Forbidden |

### I'm a Technician - Can I Access?
| Endpoint | Access | Notes |
|----------|:------:|-------|
| /api/admin/* | ✗ | 403 Forbidden |
| /api/devices/* | ✗ | 403 Forbidden |
| /api/technician/* | ✓ | Assigned only |

---

## 🔧 Common Tasks

### Create Admin User (Signup)
```bash
POST /api/auth/signup
{
  "username": "new_admin",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": ["admin"]
}
```

### List All Users (Admin)
```bash
GET /api/admin/users
Header: Authorization: Bearer <ADMIN_TOKEN>
```

### Update User Role (Admin)
```bash
PUT /api/admin/users/3/roles
Header: Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "roles": ["admin", "homeowner"]
}
```

### Create Device (Homeowner)
```bash
POST /api/devices
Header: Authorization: Bearer <HOMEOWNER_TOKEN>
Content-Type: application/json

{
  "name": "Living Room AC",
  "type": "air_conditioner",
  "location": "Living Room",
  "powerRating": 2.5
}
```

### Get My Installations (Technician)
```bash
GET /api/technician/installations
Header: Authorization: Bearer <TECHNICIAN_TOKEN>
```

### Update Installation Status (Technician)
```bash
PUT /api/technician/installations/1/status?status=in_progress
Header: Authorization: Bearer <TECHNICIAN_TOKEN>
```

---

## 🎯 Role Responsibilities

```
ADMIN
├─ Manage Users (create, read, update, delete)
├─ Assign/Change Roles
├─ Configure System Settings
├─ View System Statistics
├─ Manage Installations (create, assign)
└─ Monitor All Activities

HOMEOWNER
├─ Manage Own Devices
│  ├─ Create new device
│  ├─ Update/Delete device
│  ├─ Control (on/off)
│  └─ View consumption
├─ View Installation Schedule
└─ Receive Technician Updates

TECHNICIAN
├─ View Assigned Installations
├─ Update Installation Status
│  ├─ pending → in_progress
│  ├─ in_progress → completed
│  └─ Add notes/photos
├─ View Personal Metrics
└─ Track Performance
```

---

## 🧪 Testing Template

```bash
#!/bin/bash

# Store tokens
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_user","password":"AdminPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

HOMEOWNER_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"homeowner_user","password":"HomePassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

TECHNICIAN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"technician_user","password":"TechPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test Admin access
echo "Testing Admin endpoints..."
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Test Homeowner access
echo "Testing Homeowner endpoints..."
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN"

# Test Technician access
echo "Testing Technician endpoints..."
curl -X GET http://localhost:8080/api/technician/installations \
  -H "Authorization: Bearer $TECHNICIAN_TOKEN"
```

---

## ❌ Common Errors & Fixes

### 403 Forbidden
```
Cause: User role doesn't match endpoint
Fix:   Check user role: GET /api/admin/users/{userId}
```

### 401 Unauthorized
```
Cause: Invalid or expired token
Fix:   Login again to get fresh token
```

### 404 Not Found
```
Cause: Endpoint path wrong or controller not registered
Fix:   Check endpoint URL (case sensitive)
         Verify controller in right package
```

### Circular Admin Access
```
Cause: Admin trying to delete themselves
Fix:   Admin cannot be deleted if last admin
Solution: Create 2nd admin, then delete first
```

---

## 📊 Database Quick Commands

### Check Created Tables
```sql
SHOW TABLES;
DESCRIBE devices;
DESCRIBE installations;
```

### View Test Users
```sql
SELECT u.id, u.username, u.email, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;
```

### Check User Count by Role
```sql
SELECT r.name, COUNT(*) as count
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
GROUP BY r.name;
```

### Delete Test Data (use with caution!)
```sql
DELETE FROM installations;
DELETE FROM devices;
DELETE FROM user_roles WHERE user_id IN (2,3,4);
DELETE FROM users WHERE username IN ('homeowner_user', 'technician_user');
```

---

## 🔑 Key Java Annotations

```java
// Controllers - Class level
@PreAuthorize("hasRole('ADMIN')")
public class AdminController { }

// Controllers - Method level
@PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
@PostMapping("/devices")
public ResponseEntity<?> createDevice() { }

// Data validation
@NotBlank(message = "Username required")
@Email(message = "Valid email required")

// Audit/Logging
@Transactional  // Automatic rollback on error
@PrePersist     // Fires before insert
@PreUpdate      // Fires before update
```

---

## 📁 File Locations

```
Backend:
├─ src/main/java/com/smarthome/energy/
│  ├─ controller/
│  │  ├─ AdminController.java
│  │  ├─ DeviceController.java
│  │  └─ TechnicianController.java
│  ├─ service/
│  │  ├─ AdminService.java
│  │  ├─ DeviceService.java
│  │  └─ TechnicianService.java
│  ├─ model/
│  │  ├─ Device.java
│  │  ├─ Installation.java
│  │  ├─ Role.java
│  │  └─ ERole.java (enum)
│  ├─ repository/
│  │  ├─ DeviceRepository.java
│  │  └─ InstallationRepository.java
│  ├─ config/
│  │  ├─ SecurityConfig.java (@EnableMethodSecurity ✓)
│  │  └─ DataSeeder.java (creates test users)
│  └─ dto/
│     ├─ UserRoleUpdateRequest.java
│     ├─ CreateDeviceRequest.java
│     ├─ CreateInstallationRequest.java
│     ├─ AdminUserResponse.java
│     └─ SystemStatisticsResponse.java

Database:
└─ database_rbac_migration.sql

Documentation:
├─ RBAC_SUMMARY.md
├─ RBAC_IMPLEMENTATION_GUIDE.md
├─ RBAC_TESTING_GUIDE.md
├─ RBAC_IMPLEMENTATION_FILES.md
└─ RBAC_QUICK_REFERENCE.md (this file)
```

---

## 🚦 Authorization Flow Diagram

```
Request with JWT
       ↓
Validate Token (JWT Filter)
       ↓
   Valid? ──No──→ 401 Unauthorized
       │
      Yes
       ↓
Extract User & Roles
       ↓
Check @PreAuthorize ✓ or ✗
       ↓
  No Match ──→ 403 Forbidden
       ↓
      Match
       ↓
Execute Service Method
       ↓
Check Data-Level Access
(Homeowner: owner_id = userId?)
(Technician: technician_id = userId?)
(Admin: no restriction)
       ↓
   Pass? ──No──→ 403 Forbidden
       │
      Yes
       ↓
Execute Business Logic
       ↓
Return 200 with Data
```

---

## 💡 Pro Tips

1. **Always use JWT Token in Header**
   ```
   Authorization: Bearer <token_here>
   ```

2. **Test Role Denial First**
   Verify users get 403 before granting access

3. **Keep Tokens Safe**
   Never expose in logs or commit to git

4. **Role Names**
   - Use exactly: `ROLE_ADMIN`, `ROLE_HOMEOWNER`, `ROLE_TECHNICIAN`
   - Case-sensitive!

5. **Database Migration**
   Run BEFORE deploying new code
   ```bash
   mysql -u root -p smartHomeDB < database_rbac_migration.sql
   ```

6. **Test User Cleanup**
   Remember test users created by DataSeeder
   Delete them before production deployment

---

## 📞 Need Help?

| Issue | File | Section |
|-------|------|---------|
| How something works | RBAC_IMPLEMENTATION_GUIDE.md | API Usage Examples |
| Test something | RBAC_TESTING_GUIDE.md | Manual Testing Steps |
| File overview | RBAC_IMPLEMENTATION_FILES.md | Architecture Overview |
| Quick fix | RBAC_TESTING_GUIDE.md | Common Issues & Solutions |

---

**Print this card and keep it handy! 📋**

Last Updated: 2026-02-17  
RBAC System Version: 1.0  
Status: ✓ Ready for Production

