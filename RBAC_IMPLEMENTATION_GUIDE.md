# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This document outlines the comprehensive Role-Based Access Control (RBAC) system implemented for the Smart Home Energy Management System. The system supports three distinct roles: **Admin**, **Homeowner**, and **Technician**, each with specific permissions and access levels.

## Role Definitions

### 1. **ADMIN Role**
**Permissions & Responsibilities:**
- **User Management**: View, edit, and delete user accounts
- **Role Management**: Assign and update user roles
- **System Settings**: Configure system-wide settings and policies
- **System Monitoring**: View system statistics, analytics, and reports
- **User Deactivation/Activation**: Deactivate or reactivate users
- **Installation Management**: Create, assign, and manage installations
- **Technology Access**: Full system access

**Key Endpoints:**
```
GET    /api/admin/users               - Get all users
GET    /api/admin/users/{userId}      - Get specific user
PUT    /api/admin/users/{userId}/roles - Update user roles
DELETE /api/admin/users/{userId}      - Delete user
GET    /api/admin/statistics          - Get system statistics
GET    /api/admin/role-distribution   - Get role distribution
GET    /api/admin/settings            - Get system settings
PUT    /api/admin/settings            - Update system settings
POST   /api/admin/users/{userId}/deactivate   - Deactivate user
POST   /api/admin/users/{userId}/reactivate  - Reactivate user
POST   /api/admin/users/{userId}/reset-password - Reset user password
```

### 2. **HOMEOWNER Role**
**Permissions & Responsibilities:**
- **Device Management**: Add, update, and manage their own smart home devices
- **Energy Monitoring**: View energy consumption data for their devices
- **Device Control**: Turn devices on/off and manage device settings
- **Profile Management**: Update their own profile information
- **Read-Only Access**: View their own installations and technician assignments

**Key Endpoints:**
```
GET    /api/devices                   - Get user's devices
POST   /api/devices                   - Create new device
GET    /api/devices/{deviceId}        - Get device details
PUT    /api/devices/{deviceId}        - Update device
DELETE /api/devices/{deviceId}        - Delete device
POST   /api/devices/{deviceId}/control - Control device (on/off)
GET    /api/devices/{deviceId}/status - Get device status
GET    /api/devices/{deviceId}/consumption - Get consumption data
GET    /api/devices/consumption/summary - Get consumption summary
```

### 3. **TECHNICIAN Role**
**Permissions & Responsibilities:**
- **Installation Management**: View and manage installations assigned to them
- **Task Execution**: Update installation status and add notes
- **Performance Tracking**: View their own performance metrics
- **Assignment Tracking**: Track assigned installations and their progress
- **Read-Only Access**: Cannot delete installations or assign to other technicians

**Key Endpoints:**
```
GET    /api/technician/installations  - Get assigned installations
GET    /api/technician/installations/{installationId} - Get installation details
PUT    /api/technician/installations/{installationId}/status - Update status
POST   /api/technician/installations/{installationId}/notes - Add notes
POST   /api/technician/installations/{installationId}/complete - Mark as completed
GET    /api/technician/metrics/me     - Get personal metrics
```

**Admin-Only Technician Endpoints:**
```
POST   /api/technician/installations  - Create installation (admin)
POST   /api/technician/installations/{installationId}/assign - Assign to technician (admin)
GET    /api/technician/installations/status/pending - Get pending installations (admin)
GET    /api/technician/metrics       - Get all technician metrics (admin)
```

## Permission Matrix

| Feature | Admin | Homeowner | Technician |
|---------|-------|-----------|-----------|
| Manage Users | ✓ | ✗ | ✗ |
| Manage Roles | ✓ | ✗ | ✗ |
| System Settings | ✓ | ✗ | ✗ |
| View Statistics | ✓ | ✗ | ✗ |
| Own Devices | ✓ | ✓ | ✗ |
| Other's Devices | ✓ (view) | ✗ | ✗ |
| Control Devices | ✓ | ✓ (own) | ✗ |
| View Installations | ✓ | ✗ | ✓ (assigned) |
| Create Installation | ✓ | ✗ | ✗ |
| Update Installation | ✓ | ✗ | ✓ (assigned) |
| Complete Installation | ✓ | ✗ | ✓ (assigned) |
| Assign Installation | ✓ | ✗ | ✗ |
| View Performance | ✓ | ✗ | ✓ (own) |

## Implementation Details

### Security Configuration
The system uses Spring Security's method-level security with `@EnableMethodSecurity` annotation in `SecurityConfig.java`. This allows fine-grained control over endpoint access.

**Key Features:**
- JWT-based authentication for stateless API calls
- Method-level authorization using `@PreAuthorize` annotations
- Role-based request matching in security filter chain
- CORS configuration for frontend integration

### Authorization Annotations

All controllers use `@PreAuthorize` annotations to enforce role-based access:

```java
// Admin only
@PreAuthorize("hasRole('ADMIN')")
public class AdminController { ... }

// Homeowner and Admin
@PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")
public class DeviceController { ... }

// Technician and Admin
@PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
public class TechnicianController { ... }
```

### Role Assignment

Roles are assigned during user registration through the `AuthService`:

```java
// Default role (if not specified)
roles.add(getOrCreateRole(ERole.ROLE_HOMEOWNER));

// Or specified during signup
"admin"       → ROLE_ADMIN
"technician"  → ROLE_TECHNICIAN
"homeowner"   → ROLE_HOMEOWNER
```

### Data Access Control

For endpoints where multiple users might need access but to different resources:
- **Homeowners**: Can only access their own devices
- **Technicians**: Can only access installations assigned to them
- **Admins**: Can access all resources (with verification)

Example:
```java
public Map<String, Object> getUserDevices() {
    Long userId = getCurrentUserId();
    // Return only devices owned by userId
    return deviceRepository.findByOwnerId(userId);
}
```

## Security Best Practices

### 1. Authentication Flow
1. User registers with role selection
2. Email verification via OTP
3. JWT token issued upon successful login
4. Token renewed automatically

### 2. Authorization Flow
1. JWT token validated for every request
2. User roles extracted from token
3. Endpoint authorization checked via `@PreAuthorize`
4. Data-level access control applied in service layer

### 3. Error Handling
- **403 Forbidden**: User lacks required role
- **404 Not Found**: Resource doesn't exist or user can't access it
- **401 Unauthorized**: Invalid or expired token

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    ...
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY,
    name ENUM('ROLE_ADMIN', 'ROLE_HOMEOWNER', 'ROLE_TECHNICIAN')
);
```

### User_Roles Junction Table
```sql
CREATE TABLE user_roles (
    user_id BIGINT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## API Usage Examples

### 1. Register as Homeowner
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_home",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Home",
    "role": ["homeowner"]
  }'
```

### 2. Register as Technician
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tech_mike",
    "email": "mike@example.com",
    "password": "SecurePass123",
    "firstName": "Mike",
    "lastName": "Tech",
    "role": ["technician"]
  }'
```

### 3. Get All Users (Admin Only)
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4. Create Device (Homeowner)
```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "Living Room AC",
    "type": "air_conditioner",
    "location": "Living Room",
    "powerRating": 2.5
  }'
```

### 5. Get Installation (Technician)
```bash
curl -X GET http://localhost:8080/api/technician/installations \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 6. Update Installation Status (Technician)
```bash
curl -X PUT http://localhost:8080/api/technician/installations/1/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d "status=in_progress"
```

## Frontend Integration

### Role-Based Navigation
Update your React frontend to show different navigation items based on user role:

```javascript
// AuthContext provides current user with roles
const { user } = useContext(AuthContext);

const isAdmin = user?.roles?.includes('ROLE_ADMIN');
const isHomeowner = user?.roles?.includes('ROLE_HOMEOWNER');
const isTechnician = user?.roles?.includes('ROLE_TECHNICIAN');

// Conditional rendering
{isAdmin && <AdminPanel />}
{isHomeowner && <DeviceManagement />}
{isTechnician && <InstallationTracking />}
```

### Protected Routes
Update your ProtectedRoute component:

```javascript
function ProtectedRoute({ 
  element, 
  requiredRoles = [] 
}) {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => 
      user.roles?.includes(role)
    );
    if (!hasRole) return <Navigate to="/unauthorized" />;
  }
  
  return element;
}
```

### API Integration
Update service calls to use proper endpoints:

```javascript
// Admin API calls
const adminService = {
  getAllUsers: (token) => 
    api.get('/admin/users', { headers: { Authorization: \`Bearer \${token}\` } }),
  updateUserRoles: (userId, roles, token) =>
    api.put(\`/admin/users/\${userId}/roles\`, { roles }, 
      { headers: { Authorization: \`Bearer \${token}\` } })
};

// Homeowner API calls
const deviceService = {
  getMyDevices: (token) =>
    api.get('/devices', { headers: { Authorization: \`Bearer \${token}\` } }),
  createDevice: (device, token) =>
    api.post('/devices', device, { headers: { Authorization: \`Bearer \${token}\` } })
};

// Technician API calls
const technicianService = {
  getMyInstallations: (token) =>
    api.get('/technician/installations', 
      { headers: { Authorization: \`Bearer \${token}\` } })
};
```

## Testing RBAC

### Manual Testing Steps

1. **Create Admin User**
   - Register with role: "admin"
   - Verify access to `/api/admin/users`
   - Verify denied access to `/api/devices`

2. **Create Homeowner User**
   - Register with role: "homeowner"
   - Verify access to `/api/devices`
   - Verify denied access to `/api/admin/users`
   - Verify denied access to `/api/technician/installations`

3. **Create Technician User**
   - Register with role: "technician"
   - Verify access to `/api/technician/installations`
   - Verify denied access to `/api/admin/users`
   - Verify denied access to `/api/devices` (create/delete, but can view assigned devices)

### Automated Testing

```java
@SpringBootTest
public class RBACTest {
    
    @Test
    @WithMockUser(roles = "ADMIN")
    public void adminCanAccessAdminEndpoints() {
        // Test admin access
    }
    
    @Test
    @WithMockUser(roles = "HOMEOWNER")
    public void homeownerCannotAccessAdminEndpoints() {
        // Test denial
    }
    
    @Test
    @WithMockUser(roles = "TECHNICIAN")
    public void technicianCanAccessTechnicianEndpoints() {
        // Test technician access
    }
}
```

## Troubleshooting

### Issue: 403 Forbidden on Protected Endpoint
**Solution**: Verify user has correct role assigned
```bash
# Check user roles
curl http://localhost:8080/api/admin/users/{userId} \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Issue: User Can Access Other User's Devices
**Solution**: Ensure service layer validates user ownership:
```java
// Add validation
public Device getDevice(Long deviceId, Long userId) {
    Device device = deviceRepository.findById(deviceId)
        .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
    
    if (!device.getOwnerId().equals(userId)) {
        throw new AccessDeniedException("Cannot access this device");
    }
    
    return device;
}
```

## Maintenance & Future Enhancements

1. **Audit Logging**: Log all role changes and admin actions
2. **Two-Factor Authentication**: Add 2FA for admin accounts
3. **Permission Hierarchy**: Implement permission inheritance
4. **Custom Roles**: Allow creation of custom roles
5. **Time-Based Access**: Schedule temporary elevated permissions
6. **Geo-Fencing**: Restrict access by location for technicians

## References

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Access Control](https://owasp.org/www-community/Access_Control)

