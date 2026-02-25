# RBAC Quick Testing Guide

## Overview
This guide provides quick steps to test the Role-Based Access Control (RBAC) system implementation.

## Default Test Users

Three test users are automatically created on application startup:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin_user | AdminPassword123! | Admin | admin@smarthome.local |
| homeowner_user | HomePassword123! | Homeowner | homeowner@smarthome.local |
| technician_user | TechPassword123! | Technician | technician@smarthome.local |

## Testing using cURL

### 1. Login and Get JWT Token

```bash
# Admin Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "AdminPassword123!"
  }'

# Response:
{
  "id": 1,
  "username": "admin_user",
  "email": "admin@smarthome.local",
  "token": "eyJhbGc...",
  "roles": ["ROLE_ADMIN"]
}
```

Save the token:
```bash
ADMIN_TOKEN="<paste_token_here>"
HOMEOWNER_TOKEN="<paste_homeowner_token>"
TECHNICIAN_TOKEN="<paste_technician_token>"
```

### 2. Test Admin Endpoints

#### Get All Users (Admin Only)
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Get System Statistics (Admin Only)
```bash
curl -X GET http://localhost:8080/api/admin/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Get Role Distribution (Admin Only)
```bash
curl -X GET http://localhost:8080/api/admin/role-distribution \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update User Roles (Admin Only)
```bash
curl -X PUT http://localhost:8080/api/admin/users/2/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "roles": ["technician", "homeowner"]
  }'
```

#### Try Admin Endpoint with Homeowner Token (Should Fail)
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN"

# Expected: 403 Forbidden
```

### 3. Test Homeowner Endpoints

#### Create a Device (Homeowner)
```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN" \
  -d '{
    "name": "Living Room Air Conditioner",
    "type": "air_conditioner",
    "description": "Central AC unit",
    "location": "Living Room",
    "powerRating": 2.5
  }'
```

#### Get My Devices (Homeowner)
```bash
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN"
```

#### Control Device (Homeowner)
```bash
curl -X POST http://localhost:8080/api/devices/1/control \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN" \
  -d "action=on"
```

#### Get Device Status (Homeowner)
```bash
curl -X GET http://localhost:8080/api/devices/1/status \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN"
```

#### Try Homeowner Endpoint with Technician Token (Should Fail)
```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TECHNICIAN_TOKEN" \
  -d '{
    "name": "Test Device",
    "type": "air_conditioner",
    "location": "Test",
    "powerRating": 1.0
  }'

# Expected: 403 Forbidden
```

### 4. Test Technician Endpoints

#### Get My Installations (Technician)
```bash
curl -X GET http://localhost:8080/api/technician/installations \
  -H "Authorization: Bearer $TECHNICIAN_TOKEN"
```

#### Get Personal Metrics (Technician)
```bash
curl -X GET http://localhost:8080/api/technician/metrics/me \
  -H "Authorization: Bearer $TECHNICIAN_TOKEN"
```

#### Try Technician Endpoint with Homeowner Token (Should Fail)
```bash
curl -X GET http://localhost:8080/api/technician/installations \
  -H "Authorization: Bearer $HOMEOWNER_TOKEN"

# Expected: 403 Forbidden
```

### 5. Test Cross-Role Access

#### Admin Can Access Homeowner and Technician Endpoints
```bash
# Admin accessing device endpoints (should work via delegation)
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin accessing technician endpoints 
curl -X GET http://localhost:8080/api/technician/installations \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Testing using Postman

### 1. Create Collections
1. Open Postman
2. Create three folders:
   - Admin Tests
   - Homeowner Tests
   - Technician Tests

### 2. Set Up Environment Variables
1. Click "Environments" → Create New
2. Set variables:
   - `base_url`: http://localhost:8080
   - `admin_token`: (obtained from login)
   - `homeowner_token`: (obtained from login)
   - `technician_token`: (obtained from login)

### 3. Create Login Requests

**Admin Login Request:**
```
POST {{base_url}}/api/auth/signin
Header: Content-Type: application/json
Body: {
  "username": "admin_user",
  "password": "AdminPassword123!"
}
```

Copy response token to `admin_token` environment variable

**Repeat for homeowner_user and technician_user**

### 4. Test Endpoints

Create requests for each endpoint and verify:
- ✓ Correct role can access
- ✗ Wrong role gets 403 Forbidden

## Automated Testing with JUnit

### Running Tests
```bash
mvn test -Dtest=RBACTest
```

### Test Example
```java
@SpringBootTest
@AutoConfigureMockMvc
public class RBACTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void adminCanAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isOk());
    }
    
    @Test
    @WithMockUser(username = "homeowner", roles = {"HOMEOWNER"})
    public void homeownerCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isForbidden());
    }
    
    @Test
    @WithMockUser(username = "homeowner", roles = {"HOMEOWNER"})
    public void homeownerCanAccessDeviceEndpoints() throws Exception {
        mockMvc.perform(get("/api/devices"))
            .andExpect(status().isOk());
    }
    
    @Test
    @WithMockUser(username = "technician", roles = {"TECHNICIAN"})
    public void technicianCanAccessTechnicianEndpoints() throws Exception {
        mockMvc.perform(get("/api/technician/installations"))
            .andExpect(status().isOk());
    }
}
```

## Expected HTTP Status Codes

| Scenario | Status Code | Description |
|----------|------------|-------------|
| Valid token, correct role | 200 | OK - Request successful |
| Valid token, wrong role | 403 | Forbidden - Insufficient permissions |
| Invalid/expired token | 401 | Unauthorized - Token invalid or expired |
| Resource not found | 404 | Not Found - Resource doesn't exist |
| Invalid request body | 400 | Bad Request - Validation failed |
| Server error | 500 | Internal Server Error |

## Common Issues & Solutions

### Issue: 401 Unauthorized Even with Valid Token
**Cause**: Token expired or invalid format

**Solution**: 
- Get new token with fresh login
- Ensure "Bearer" prefix in header
- Check token expiration time in application.properties

### Issue: 403 Forbidden on Valid Endpoint
**Cause**: User role doesn't match endpoint requirements

**Solution**:
- Verify user has correct role: `GET /api/admin/users/{userId}`
- Check @PreAuthorize annotation on endpoint
- Update user roles if needed

### Issue: Endpoint Not Found (404)
**Cause**: Wrong URL or controller not registered

**Solution**:
- Check endpoint path matches controller's @RequestMapping
- Verify controller is in component scan path
- Restart application

### Issue: Cannot See Test Users
**Cause**: Database not seeded on startup

**Solution**:
- Check DataSeeder logs on application startup
- Manually insert test users:
```sql
INSERT INTO users (username, email, password_hash, first_name, last_name, email_verified, created_at)
VALUES ('admin_user', 'admin@example.com', '$2a$10$...', 'Admin', 'User', true, NOW());

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.username = 'admin_user' AND r.name = 'ROLE_ADMIN';
```

## Testing Checklist

- [ ] Admin can view all users
- [ ] Admin can update user roles
- [ ] Admin can view system statistics
- [ ] Homeowner can create devices
- [ ] Homeowner cannot view other homeowners' devices
- [ ] Homeowner cannot access admin endpoints
- [ ] Technician can view assigned installations
- [ ] Technician cannot create installations
- [ ] Technician cannot access device endpoints
- [ ] Token is required for all protected endpoints
- [ ] Invalid token returns 401
- [ ] Wrong role returns 403
- [ ] Expired token returns 401

## Performance Testing

### Simulate Multiple Requests
```bash
for i in {1..100}; do
  curl -s -X GET http://localhost:8080/api/admin/users \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    > /dev/null
done
echo "Completed 100 requests"
```

### Monitor Response Times
```bash
time curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Cleanup

### Delete Test Installations
```bash
curl -X DELETE http://localhost:8080/api/admin/users/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Reset Database
```bash
# This depends on your database setup
# Example for MySQL:
mysql -u root -p smartHomeDB < reset_database.sql
```

## Next Steps

After testing, consider:
1. ✓ Implementing audit logging
2. ✓ Adding two-factor authentication
3. ✓ Setting up rate limiting
4. ✓ Implementing permission hierarchy
5. ✓ Adding geo-fencing for technicians

