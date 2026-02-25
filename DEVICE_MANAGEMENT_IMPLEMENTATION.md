# Smart Home Device Management System - Implementation Guide

## Overview
This document provides a complete overview of the device management system implementation for the Smart Home Energy Management Application.

## ✅ What's Been Implemented

### 1. **Backend - Java/Spring Boot**

#### ✨ New Entity: EnergyUsageLog
**Location:** `backend/src/main/java/com/smarthome/energy/model/EnergyUsageLog.java`

- Tracks energy consumption per device
- Stores: device_id, energy_usage (kWh), timestamp, duration, cost
- Indexed for efficient queries by device and timestamp
- Automatic cost calculation based on energy usage

#### ✨ Complete Device Service
**Location:** `backend/src/main/java/com/smarthome/energy/service/DeviceService.java`

**Features:**
- ✅ Create, Read, Update, Delete (CRUD) devices
- ✅ User ownership-based access control (JWT protected)
- ✅ Device energy consumption tracking
- ✅ Filter devices by type
- ✅ Device status management
- ✅ Power control (on/off)
- ✅ Consumption summaries (daily/weekly/monthly/yearly)

**Key Methods:**
```java
- getUserDevices() → All devices for logged-in user
- createDevice(request) → Add new device
- updateDevice(id, request) → Update existing device
- deleteDevice(id) → Delete device with validation
- getDeviceEnergyConsumption(id, period) → Energy data
- getConsumptionSummary(period) → Aggregated data
```

#### ✨ Energy Usage Log Service
**Location:** `backend/src/main/java/com/smarthome/energy/service/EnergyUsageLogService.java`

**Features:**
- ✅ Add energy logs for devices
- ✅ Retrieve logs with date range filtering
- ✅ Calculate total/average consumption
- ✅ Device analytics per period
- ✅ Cost estimation
- ✅ Old log cleanup (for maintenance)

#### ✨ Enhanced DeviceController
**Location:** `backend/src/main/java/com/smarthome/energy/controller/DeviceController.java`

**REST Endpoints:**

```
Device Management:
POST   /api/devices                    → Create device
GET    /api/devices                    → Get all user devices
GET    /api/devices/{id}               → Get device details
PUT    /api/devices/{id}               → Update device
DELETE /api/devices/{id}               → Delete device

Device Control:
POST   /api/devices/{id}/control       → Turn on/off (power control)
GET    /api/devices/{id}/status        → Get device status

Energy Consumption:
GET    /api/devices/{id}/consumption   → Device consumption data
GET    /api/devices/consumption/summary → All devices summary

Energy Logs:
POST   /api/devices/{id}/logs          → Add energy log
GET    /api/devices/{id}/logs          → Get all logs for device
GET    /api/devices/{id}/logs/range    → Get logs for date range
GET    /api/devices/{id}/analytics     → Device analytics
GET    /api/devices/logs/all           → All logs for user's devices
DELETE /api/devices/logs/old           → Delete logs before date (ADMIN)
```

#### ✨ DTOs (Data Transfer Objects)
Created for type-safe API communication:
- `DeviceResponse.java` - Device with energy data
- `EnergyUsageLogResponse.java` - Energy log details
- `AddEnergyLogRequest.java` - Energy log creation

#### ✨ Energy Usage Log Repository
**Location:** `backend/src/main/java/com/smarthome/energy/repository/EnergyUsageLogRepository.java`

**Custom Queries:**
```java
- getTotalEnergyConsumption() → Sum of kWh for period
- getTotalCost() → Estimated cost for period
- getAverageEnergyConsumption() → Average consumption
- findMostRecentLogForDevice() → Latest reading
- findByDeviceIdAndTimestampBetween() → Date range search
```

---

### 2. **Frontend - React/Vite**

#### ✨ Components Created

**DeviceCard.jsx**
- Beautiful card layout with device info
- Shows online/offline status
- Displays current energy usage
- Quick action buttons (Details, Delete)
- Smooth animations with Framer Motion
- Device type icons (Thermostat, Bulb, Plug, Lock, etc.)

**AddDeviceModal.jsx**
- Modern modal for device creation
- Form validation
- Device type selector with emojis
- Location and power rating inputs
- Error handling and feedback

**BottomNavigation.jsx**
- Fixed bottom nav bar with 4 main sections
  - Dashboard
  - Devices (active indicator)
  - Analytics
  - Profile
- Role-based visibility (HOMEOWNER, ADMIN, TECHNICIAN)
- Smooth animations and transitions

**DeviceManager.jsx (Updated)**
- Modern, responsive list-style cards
- Search functionality
- Filter by device type
- Floating "+" button (bottom-right)
- Loading states
- Error handling
- No devices empty state
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Matches SaaS-style design

#### ✨ Updated API Service
**Location:** `frontend/src/services/api.js`

**New Device API Methods:**
```javascript
deviceApi.addEnergyLog(deviceId, logData)
deviceApi.getDeviceEnergyLogs(deviceId)
deviceApi.getDeviceEnergyLogsByDateRange(deviceId, start, end)
deviceApi.getDeviceAnalytics(deviceId, period)
deviceApi.getAllDeviceEnergyLogs(period)
deviceApi.deleteOldLogs(beforeDate)
```

---

### 3. **Security & Access Control**

✅ **JWT Authentication**
- All device endpoints require valid JWT token
- Token validated on every request

✅ **User Ownership Validation**
- Can only access own devices (ownerId check)
- Cannot delete/edit other users' devices
- Admin can see all devices

✅ **Role-Based Access Control (RBAC)**
- `@PreAuthorize("hasRole('HOMEOWNER') or hasRole('ADMIN')")`
- Device endpoints protected
- Admin-only endpoints for log cleanup

---

### 4. **Database Schema**

#### devices Table
```sql
CREATE TABLE devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  power_rating DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  is_online BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  installation_date TIMESTAMP,
  installation_id BIGINT,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  INDEX idx_owner (owner_id),
  INDEX idx_type (type),
  INDEX idx_location (location)
);
```

#### energy_usage_logs Table (NEW)
```sql
CREATE TABLE energy_usage_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT NOT NULL,
  energy_usage DECIMAL(10,4) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  duration_minutes INT,
  cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_device_id (device_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_device_timestamp (device_id, timestamp)
);
```

---

## 🚀 How to Use

### Backend Setup

1. **Start MySQL Database**
   ```bash
   mysql -u root -p
   ```

2. **Build & Run Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. **Database Migrations**
   - Hibernate will auto-create tables if `spring.jpa.hibernate.ddl-auto=update`
   - Or run the SQL scripts in the backend folder

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📱 User Flow

### 1. **Viewing Devices**
```
User Login → Dashboard → Click "Devices" Bottom Nav
→ DeviceManager Page Shows All User's Devices
→ Click device card → Navigate to device details
```

### 2. **Creating a Device**
```
DeviceManager Page → Click "+" Floating Button
→ Modal Opens → Fill Form → Click "Add Device"
→ Device Added to List
```

### 3. **Device Information Displayed**
- Device Name & Type
- Current Daily Energy Usage (kWh)
- Online/Offline Status
- Location
- Power Rating (kW)
- Quick Action Buttons

### 4. **Energy Tracking**
```
Device Created → Energy Logs Added (via API)
→ Analytics Dashboard Calculates:
   - Total consumption (daily/weekly/monthly)
   - Average consumption
   - Cost estimate
```

---

## 🔒 Security Features

✅ **JWT Token Validation**
- Checked on every request via Spring Security

✅ **User Ownership Check**
- Can't access other users' devices

✅ **Data Isolation**
- Each user sees only their devices

✅ **Role-Based Endpoints**
- Admin-only endpoints for maintenance

---

## 📊 Energy Analytics

### Available Periods
- **daily** → Last 24 hours
- **weekly** → Last 7 days
- **monthly** → Current month (1st to today)
- **yearly** → Current year (Jan 1 to today)

### Data Calculated
- Total Energy Usage (kWh)
- Average Usage per measurement
- Total Cost
- Number of logs
- Detailed device-by-device breakdown

---

## 🎨 UI/UX Features

✅ **Modern SaaS-Style Design**
- Clean gradient backgrounds
- Smooth animations (Framer Motion)
- Professional color scheme (Green/Emerald)
- Responsive layout

✅ **User-Friendly**
- Search devices by name or type
- Filter by device type
- Quick action buttons
- Bottom navigation for easy access
- Floating action button (FAB) for adding devices
- Loading states & error messages
- Empty state guidance

✅ **Smooth Animations**
- Page transitions
- Card hover effects
- Button ripples
- Modal animations
- List item stagger effects

---

## 📝 API Examples

### Create a Device
```bash
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Living Room Thermostat",
  "type": "thermostat",
  "location": "Living Room",
  "powerRating": 1.5,
  "description": "Main temperature controller"
}

Response:
{
  "id": 1,
  "name": "Living Room Thermostat",
  "type": "thermostat",
  "status": "active",
  "isOnline": true,
  "createdAt": "2024-02-17T10:30:00",
  "currentEnergyUsage": 0.0,
  "totalEnergyUsage": 0.0
}
```

### Add Energy Log
```bash
POST /api/devices/1/logs
Authorization: Bearer {token}
Content-Type: application/json

{
  "energyUsage": 2.5,
  "timestamp": "2024-02-17T10:00:00",
  "durationMinutes": 60,
  "cost": 12.50
}
```

### Get Device Analytics
```bash
GET /api/devices/1/analytics?period=monthly
Authorization: Bearer {token}

Response:
{
  "deviceId": 1,
  "deviceName": "Living Room Thermostat",
  "period": "monthly",
  "totalConsumption": 45.75,
  "averageConsumption": 2.5,
  "totalCost": 228.75,
  "logCount": 18
}
```

---

## 📋 Testing Checklist

- [ ] User can view all their devices
- [ ] User can add a new device
- [ ] Device appears in list immediately
- [ ] Can search devices by name
- [ ] Can filter by device type
- [ ] Can delete a device
- [ ] Energy logs are recorded
- [ ] Analytics calculate correctly
- [ ] User can't access other users' devices
- [ ] Bottom navigation works correctly
- [ ] Mobile layout is responsive
- [ ] Animations are smooth
- [ ] Error messages display properly
- [ ] Loading states show during API calls

---

## 🔧 Troubleshooting

### Issue: Devices not loading
- Check JWT token validity
- Verify user is logged in
- Check backend logs for errors
- Ensure database connection is correct

### Issue: Energy logs not saving
- Verify deviceId is valid
- Check device ownership
- Confirm energy_usage_logs table exists
- Check for null values in required fields

### Issue: Styling issues
- Run `npm install` to ensure all dependencies installed
- Clear browser cache
- Check Tailwind CSS configuration
- Verify framer-motion is installed

---

## 🚀 Future Enhancements

- [ ] Device scheduled ON/OFF
- [ ] Real-time energy monitoring
- [ ] Energy graphs and charts
- [ ] Alerts for high consumption
- [ ] Device-to-device automation rules
- [ ] Smart recommendations based on usage
- [ ] Multi-language support
- [ ] Export energy reports as PDF

---

## 📧 Support
For issues or questions, refer to the backend logs and browser console for debugging information.

---

**Last Updated:** February 17, 2026
**Status:** Complete & Ready for Testing
