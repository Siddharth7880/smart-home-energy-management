# 🏠 Smart Home Device Management System - Quick Start Guide

## 📋 Overview

This guide will help you get the complete Device Management system up and running in minutes.

---

## ✨ What's New

- ✅ **Full Device CRUD Operations** - Create, Read, Update, Delete devices
- ✅ **Energy Tracking System** - Automatic logging of device energy usage
- ✅ **Modern UI Components** - DeviceCard, AddDeviceModal, BottomNavigation
- ✅ **Security** - JWT-protected endpoints with user ownership validation
- ✅ **Analytics Ready** - Energy consumption data per device and time period
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **SaaS-Style UI** - Professional, clean, modern interface

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Backend Database Setup

```bash
# 1. Open MySQL
mysql -u root -p

# 2. Run migration script
SOURCE backend/device_energy_migration.sql;

# 3. Verify tables created
SHOW TABLES;
DESCRIBE energy_usage_logs;
```

### Step 2: Build Backend

```bash
cd backend

# Clean and build
mvn clean install

# Run Spring Boot
mvn spring-boot:run
```

Backend should start on `http://localhost:8080`

### Step 3: Install Frontend Dependencies

```bash
cd frontend

# Install all packages
npm install
```

### Step 4: Start Frontend Development Server

```bash
# Start dev server
npm run dev
```

Frontend available at `http://localhost:3000` (or displayed in terminal)

### Step 5: Test the System

1. **Open** http://localhost:3000
2. **Register** a new account or login
3. **Navigate** to the "Devices" section (bottom nav)
4. **Click** the "+" button to add your first device
5. **Fill** the form and submit
6. **See** your device appear in the list!

---

## 📱 Main Features

### Device Management Page
- **Location:** `/devices` route
- **Features:**
  - 📋 List all your devices as beautiful cards
  - 🔍 Search devices by name or type
  - 🏷️ Filter by device type
  - ➕ Floating action button to add devices
  - 🗑️ Delete devices with confirmation
  - 📊 View energy usage on each card

### Device Card
- Device name and icon
- Online/offline status
- Today's energy usage (kWh)
- Location and power rating
- Quick action buttons
- Smooth hover animations

### Add Device Modal
- **Device Name** (required)
- **Device Type** dropdown (thermostat, bulb, plug, lock, etc.)
- **Location** (optional)
- **Power Rating** in kW (optional)
- **Description** (optional)
- Form validation and error handling

### Bottom Navigation
- 4 main sections: Dashboard, Devices, Analytics, Profile
- Active state highlighting
- Role-based visibility
- Smooth animations

---

## 🔌 API Endpoints Reference

### Device Endpoints
```
GET    /api/devices              → Get all user devices
POST   /api/devices              → Create new device
GET    /api/devices/{id}         → Get device details
PUT    /api/devices/{id}         → Update device
DELETE /api/devices/{id}         → Delete device
```

### Energy & Consumption
```
GET    /api/devices/{id}/consumption          → Device consumption data
GET    /api/devices/consumption/summary       → All devices summary
POST   /api/devices/{id}/logs                 → Add energy log
GET    /api/devices/{id}/logs                 → Get device logs
GET    /api/devices/{id}/analytics            → Device analytics
```

### Device Control
```
POST   /api/devices/{id}/control   → Turn device on/off
GET    /api/devices/{id}/status    → Get device status
```

---

## 🧪 Testing

### Create a Test Device

```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Thermostat",
    "type": "thermostat",
    "location": "Living Room",
    "powerRating": 1.5,
    "description": "Testing device"
  }'
```

### Get All Devices

```bash
curl -X GET http://localhost:8080/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Energy Log

```bash
curl -X POST http://localhost:8080/api/devices/1/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "energyUsage": 2.5,
    "timestamp": "2024-02-17T10:00:00",
    "durationMinutes": 60,
    "cost": 12.50
  }'
```

---

## 🗂️ File Structure

### Backend
```
backend/src/main/java/com/smarthome/energy/
├── model/
│   ├── Device.java              (existing)
│   └── EnergyUsageLog.java      (NEW)
├── repository/
│   ├── DeviceRepository.java    (existing)
│   └── EnergyUsageLogRepository.java (NEW)
├── service/
│   ├── DeviceService.java       (UPDATED)
│   └── EnergyUsageLogService.java (NEW)
├── controller/
│   └── DeviceController.java    (UPDATED)
└── dto/
    ├── DeviceResponse.java      (NEW)
    ├── EnergyUsageLogResponse.java (NEW)
    └── AddEnergyLogRequest.java (NEW)

backend/
└── device_energy_migration.sql  (NEW)
```

### Frontend
```
frontend/src/
├── components/
│   ├── DeviceCard.jsx           (NEW)
│   ├── AddDeviceModal.jsx       (NEW)
│   ├── BottomNavigation.jsx     (NEW)
│   └── ... (existing components)
├── pages/
│   ├── DeviceManager.jsx        (UPDATED)
│   └── ... (existing pages)
├── services/
│   └── api.js                   (UPDATED)
└── ... (existing structure)
```

---

## 🔒 Security

All device endpoints are protected by:

1. **JWT Authentication**
   - Token required in `Authorization: Bearer {token}` header
   - Token automatically added by API service

2. **User Ownership Check**
   - Users can only access their own devices
   - System checks `device.ownerId === currentUserId`
   - Prevents accessing other users' devices

3. **Role-Based Access**
   - `HOMEOWNER` and `ADMIN` can manage devices
   - Only `ADMIN` can delete old logs

---

## ⚙️ Configuration

### Backend Database
Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_database
spring.datasource.username=root
spring.datasource.password=Nasiya@9867
spring.jpa.hibernate.ddl-auto=update
```

### Frontend API URL
Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Devices not loading** | Check JWT token, verify user logged in, check backend logs |
| **Modal not opening** | Clear browser cache, refresh page, check console errors |
| **Energy logs not saving** | Verify device exists, check energy_usage_logs table, check database connection |
| **Styling looks broken** | Run `npm install`, clear cache, check Tailwind CSS config |
| **Backend won't start** | Check MySQL running, check port 8080 free, check application.properties |
| **CORS errors** | Backend has `@CrossOrigin`, shouldn't be issue, check frontend URL |

---

## 📊 Energy Data Calculation

Energy consumption periods available:
- **daily** → Last 24 hours
- **weekly** → Last 7 days
- **monthly** → From 1st of month to today
- **yearly** → From Jan 1 to today

**Cost Calculation:**
- Default: $5 per kWh (configurable)
- Cost = energy_usage * rate

---

## 📈 Next Steps

After setup, you can:

1. ✅ Create multiple devices
2. ✅ Add energy logs via API
3. ✅ View energy consumption data
4. ✅ Build analytics dashboard
5. ✅ Add device control features
6. ✅ Create energy recommendations

---

## 📚 Related Documentation

- 📄 [DEVICE_MANAGEMENT_IMPLEMENTATION.md](./DEVICE_MANAGEMENT_IMPLEMENTATION.md) - Complete implementation details
- 📄 [device_energy_migration.sql](./backend/device_energy_migration.sql) - Database schema

---

## 💡 Tips

- **Start small:** Add 1-2 devices first, then add data
- **Test APIs:** Use curl or Postman before integrating with UI
- **Monitor logs:** Check browser console and backend logs for errors
- **Mobile design:** Test on phone to see responsive layout
- **Performance:** Energy logs queries are indexed for fast lookups

---

## 🎉 You're All Set!

Your Smart Home Device Management System is now ready to use!

### Quick Checklist
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] Database tables created
- [ ] Can login to application
- [ ] Can navigate to Devices page
- [ ] Can create first device
- [ ] Can see device in list
- [ ] Can delete device
- [ ] Bottom nav working

---

**Last Updated:** February 17, 2026
**Version:** 1.0 - Complete
**Status:** ✅ Ready for Testing
