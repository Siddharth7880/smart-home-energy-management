<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=🌱%20Smart%20Home%20Energy%20Management&fontSize=36&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Monitor%20%7C%20Automate%20%7C%20Optimize%20Your%20Energy&descAlignY=55&descSize=18" width="100%"/>

<br/>

<!-- Tech Stack Badges -->
<p>
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
</p>

<!-- Status Badges -->
<p>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/Milestones-5%20%2F%205%20Completed-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/github/last-commit/Siddharth7880/smart-home-energy-management?style=flat-square&color=blueviolet"/>
</p>

<br/>

<p>
  <a href="#-overview">📖 Overview</a> •
  <a href="#%EF%B8%8F-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-live-features">✨ Features</a> •
  <a href="#-project-milestones">🏁 Milestones</a> •
  <a href="#-screenshots">📸 Screenshots</a> •
  <a href="#-setup-instructions">🚀 Setup</a> •
  <a href="#-api-endpoints">🔑 API</a> •
  <a href="#-project-structure">📁 Structure</a>
</p>

</div>

---

## 📖 Overview

> **Smart Home Energy Management System** is a **full-stack enterprise-grade web application** that empowers homeowners to intelligently monitor, analyze, and optimize their home energy consumption in real time.

Built across **5 structured milestones**, the system covers everything from secure authentication to AI-driven energy recommendations and advanced automation. It is designed for **three distinct user roles** — Homeowner, Technician, and Admin — each with their own tailored dashboard and capabilities.

<details>
<summary><b>🎯 What problem does it solve?</b></summary>
<br/>

Rising electricity costs and energy waste are major challenges for modern households. This system bridges the gap between smart IoT devices and actionable energy insights — giving users the power to **track usage in real time, automate devices, receive intelligent recommendations,** and **predict energy costs** before the bill arrives.

</details>

---

## 🛠️ Tech Stack

### 🔧 Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Core language |
| **Spring Boot 3.4.2** | RESTful API framework |
| **Spring Security + JWT** | Authentication & authorization |
| **Spring Data JPA + Hibernate** | ORM & database operations |
| **MySQL 8.0** | Relational database |
| **Maven** | Build & dependency management |
| **JUnit 5 + Mockito** | Unit & integration testing |

### 🎨 Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Recharts** | Energy consumption charts |
| **Axios** | HTTP client for API calls |
| **React Router 6** | Client-side routing |

---

## ✨ Live Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- ✅ JWT-based stateless authentication
- ✅ Google OAuth2 login
- ✅ Email OTP verification
- ✅ BCrypt password encryption
- ✅ Forgot / Reset password flow
- ✅ Role-based access control (RBAC)

### ⚡ Real-Time Energy Monitoring
- ✅ Live IoT device data simulation
- ✅ Per-device energy consumption tracking
- ✅ Total household energy calculation
- ✅ Hourly & daily usage data

### 📊 Analytics Dashboard
- ✅ Daily / Weekly / Monthly charts
- ✅ Peak vs Off-Peak usage analysis
- ✅ Energy cost prediction
- ✅ Usage comparison with historical data

</td>
<td width="50%">

### 🤖 Automation & Recommendations
- ✅ Device ON/OFF scheduling
- ✅ Energy overload alerts
- ✅ Smart energy-saving recommendations
- ✅ Off-peak usage suggestions

### 🏠 Device Management
- ✅ Full CRUD for smart devices
- ✅ Device status monitoring
- ✅ Technician installation tracking
- ✅ Device energy usage logs

### 🛡️ Admin & Technician Portals
- ✅ Admin user management
- ✅ Role assignment
- ✅ Platform-wide analytics
- ✅ Technician task tracker

</td>
</tr>
</table>

---

## 🏁 Project Milestones

```
Timeline ──────────────────────────────────────────────────────────────▶
         M1        M2        M3        M4        M5
         ✅        ✅        ✅        ✅        ✅
      Auth &    Device    Energy   Analytics  Automation
      Setup     CRUD     Tracking  Dashboard    & AI
```

### ✅ Milestone 1 — Foundation
> *Authentication, Database, Core Setup*
- 🔐 User registration & login with JWT
- 🗄️ MySQL database integration
- 🏠 Basic dashboard setup
- 👥 Role-based routing (Homeowner / Technician / Admin)

---

### ✅ Milestone 2 — Device Management
> *Smart Device CRUD, Energy Tracking, UI Polish*
- 📱 Device CRUD operations (Add, Edit, Delete, View)
- ⚡ Energy usage log generation
- 📊 Basic analytics visualization
- 🎨 UI/UX enhancement with glassmorphism
- ⚙️ Performance optimization

---

### ✅ Milestone 3 — Energy Tracking & API Integration
> *Real-Time Data, IoT Simulation*
- 🌐 IoT API integration (Simulated / Real-time data)
- ⚡ Real-time energy consumption display
- 🏠 Total household energy calculation
- 📅 Hourly / Daily usage data fetching

---

### ✅ Milestone 4 — Analytics Dashboard
> *Deep Insights, Predictions, Comparisons*
- 📈 Charts for energy consumption — Daily / Weekly / Monthly
- 📊 Usage comparison with previous period data
- 💰 Energy cost prediction engine
- ⏰ Peak vs Off-Peak usage analysis

---

### ✅ Milestone 5 — Automation & Recommendations
> *Smart Scheduling, AI Insights, Alerts*
- 🤖 Device scheduling (ON/OFF Automation)
- 🚨 Energy overload alerts & notifications
- 💡 Personalized energy-saving recommendations
- 🌙 Smart usage insights (e.g., Off-peak Suggestions)

---

## 👨‍💻 About the Developer

<div align="center">

<img src="https://img.shields.io/badge/Role-Backend%20Developer-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white"/>
<img src="https://img.shields.io/badge/Scope-Full%20Backend%20Architecture-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
<img src="https://img.shields.io/badge/Milestones%20Covered-1%20through%205-blueviolet?style=for-the-badge"/>

</div>

<br/>

> 🧠 **I am the Backend Developer** of this project, responsible for designing, building, and maintaining the **entire server-side architecture** across all 5 milestones — from the initial authentication system to the advanced automation engine and analytics pipeline.

### 🔨 What I Built

| Area | Details |
|---|---|
| 🏗️ **REST API Design** | Architected all **11 controllers** — Auth, Devices, Analytics, Automation, IoT, Alerts, Insights, Admin, Technician, UsageLogs, and Test |
| 🔒 **Security System** | Built full JWT token lifecycle, Google OAuth2 social login, OTP email verification, BCrypt password hashing, and role-based access control (RBAC) |
| 🗄️ **Database Architecture** | Designed and modeled **11 JPA entities** with correct foreign key relationships, cascade strategies, and indexed queries for performance |
| ⚡ **Real-Time IoT Engine** | Built the `DataSeeder` service that continuously generates realistic, date-anchored energy consumption data per device |
| 🤖 **Automation Scheduler** | Implemented the `DeviceScheduleExecutor` with Spring `@Scheduled`, handling timezone-aware cron jobs for ON/OFF automation |
| 🚨 **Alert System** | Developed energy overload detection with configurable thresholds and per-user notification management |
| 💡 **Insights Engine** | Built the smart recommendation and off-peak usage suggestion system |
| 🛡️ **Admin & Technician APIs** | Designed full management APIs for user role changes, technician task assignment, and platform-wide analytics |
| 🧪 **Testing Suite** | Wrote JUnit 5 & Mockito unit tests for `DeviceService`, `EnergyUsageLogService`, and critical edge cases |

---

## 📎 Presentations & Downloads

> Click the link below to view or download the full project presentation covering all milestones.

| Coverage | Document | Download |
|:---:|---|:---:|
| 🎯 **Milestones 1 – 5** | Complete Project Presentation — Authentication, Device Management, Energy Tracking, Analytics Dashboard, Automation & Recommendations | [📥 Download PPTX](Smart-Home-Energy-Management-All-Milestones.pptx) |


---

## 📸 Screenshots

### 🚀 Onboarding
| Registration Page | Login Page |
| :---: | :---: |
| <img src="registration.png" alt="Registration" width="420"/> | <img src="login.png" alt="Login" width="420"/> |

### 🏠 Owner Console
| Dashboard | Devices Overview |
| :---: | :---: |
| <img src="Images/Owner/Screenshot 2026-02-26 232148.png" alt="Owner Dashboard" width="420"/> | <img src="Images/Owner/Screenshot 2026-02-26 232310.png" alt="Owner Devices" width="420"/> |
| **Device Details** | **Device Logs** |
| <img src="Images/Owner/Screenshot 2026-02-26 232330.png" alt="Owner Device Details" width="420"/> | <img src="Images/Owner/Screenshot 2026-02-27 125123.png" alt="Owner Device Logs" width="420"/> |

### 🔧 Technician Console
| Main Dashboard | Assigned Installations |
| :---: | :---: |
| <img src="Images/Tech/Screenshot 2026-02-27 130847.png" alt="Technician Dashboard" width="420"/> | <img src="Images/Tech/Screenshot 2026-02-27 130902.png" alt="Technician Installations" width="420"/> |

### 🛡️ Admin Console
| Platform Dashboard | Dashboard Highlights |
| :---: | :---: |
| <img src="Images/Admin/Screenshot 2026-02-27 131059.png" alt="Admin Dashboard Overview" width="420"/> | <img src="Images/Admin/Screenshot 2026-02-27 131118.png" alt="Admin Dashboard Detail" width="420"/> |
| **System Details** | **Device Registry** |
| <img src="Images/Admin/Screenshot 2026-02-27 131131.png" alt="Admin Details" width="420"/> | <img src="Images/Admin/Screenshot 2026-02-27 131141.png" alt="Admin Device Details" width="420"/> |
| **Technician Management** | |
| <img src="Images/Admin/Screenshot 2026-02-27 131200.png" alt="Admin Technician Details" width="420"/> | |

---

## 🚀 Setup Instructions

### 📋 Prerequisites
Make sure you have the following installed:

| Tool | Version |
|---|---|
| Java | 17+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Maven | 3.8+ |

---

### 1️⃣ Database Setup

1. Start your MySQL server
2. The application **automatically creates** the database `smart_home_energy` on first run
3. Copy the example config and fill in your credentials:

```bash
cp backend/src/main/resources/application.properties.example \
   backend/src/main/resources/application.properties
```

> **⚠️ Important:** Edit `application.properties` with your MySQL credentials, Gmail App Password, Google OAuth Client ID/Secret, and JWT secret. See the `.example` file for all required keys.

---

### 2️⃣ Backend Setup

```bash
cd backend

# Windows (Maven Wrapper)
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw clean install
./mvnw spring-boot:run
```

✅ Backend starts at: **`http://localhost:8080`**

---

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend starts at: **`http://localhost:5173`**

---

### ⚡ Quick Start (Windows One-Click)

```bash
# From project root
start.bat
```

> This script starts both the backend and frontend simultaneously.

---

## 🔑 API Endpoints

### 🔐 Authentication — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/signup` | Register new user | ❌ |
| `POST` | `/signin` | Login & get JWT | ❌ |
| `POST` | `/forgot-password` | Send reset email | ❌ |
| `POST` | `/reset-password` | Reset with token | ❌ |
| `POST` | `/verify-otp` | OTP email verification | ❌ |

### 📱 Devices — `/api/devices`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get all user devices | ✅ |
| `POST` | `/` | Add new device | ✅ |
| `PUT` | `/{id}` | Update device | ✅ |
| `DELETE` | `/{id}` | Delete device | ✅ |
| `GET` | `/{id}/logs` | Get device energy logs | ✅ |

### 📊 Analytics — `/api/analytics`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/energy/daily` | Daily usage data | ✅ |
| `GET` | `/energy/weekly` | Weekly usage data | ✅ |
| `GET` | `/energy/monthly` | Monthly usage data | ✅ |
| `GET` | `/energy/comparison` | Historical comparison | ✅ |
| `GET` | `/energy/cost` | Cost prediction | ✅ |

### 🤖 Automation — `/api/schedules`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get all schedules | ✅ |
| `POST` | `/` | Create schedule | ✅ |
| `PUT` | `/{id}` | Update schedule | ✅ |
| `DELETE` | `/{id}` | Delete schedule | ✅ |

### 🌐 IoT & Alerts — `/api/iot`, `/api/alerts`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/iot/current` | Live energy readings | ✅ |
| `GET` | `/alerts` | Get energy alerts | ✅ |
| `PUT` | `/alerts/{id}/read` | Mark alert as read | ✅ |

### 🛡️ Admin — `/api/admin`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/users` | All users | ADMIN |
| `PUT` | `/users/{id}/role` | Change user role | ADMIN |
| `DELETE` | `/users/{id}` | Delete user | ADMIN |
| `GET` | `/stats` | Platform statistics | ADMIN |

### 🔧 Technician — `/api/technician`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/installations` | Assigned installations | TECH |
| `PUT` | `/installations/{id}` | Update install status | TECH |

---

## 📁 Project Structure

```
smart-home-energy-management/
│
├── 📂 backend/
│   └── src/main/java/com/smarthome/energy/
│       ├── 📂 config/          # Security, CORS, OAuth2 config
│       ├── 📂 controller/      # 11 REST API controllers
│       │   ├── AuthController.java
│       │   ├── DeviceController.java
│       │   ├── AnalyticsController.java
│       │   ├── DeviceScheduleController.java
│       │   ├── IoTController.java
│       │   ├── AlertController.java
│       │   ├── InsightController.java
│       │   ├── AdminController.java
│       │   ├── TechnicianController.java
│       │   ├── UsageLogController.java
│       │   └── TestController.java
│       ├── 📂 dto/             # Request / Response DTOs
│       ├── 📂 exception/       # Global exception handlers
│       ├── 📂 model/           # 11 JPA entity models
│       │   ├── User.java
│       │   ├── Device.java
│       │   ├── EnergyUsageLog.java
│       │   ├── DeviceSchedule.java
│       │   ├── EnergyAlert.java
│       │   ├── EnergyThreshold.java
│       │   ├── Installation.java
│       │   └── Role.java / ERole.java
│       ├── 📂 repository/      # Spring Data JPA repositories
│       ├── 📂 security/        # JWT filter, UserDetails, OAuth2
│       └── 📂 service/         # Business logic layer
│
├── 📂 frontend/
│   └── src/
│       ├── 📂 components/      # 15 reusable components
│       │   ├── Navbar.jsx
│       │   ├── EnergyCharts.jsx
│       │   ├── DeviceCard.jsx
│       │   ├── SummaryCard.jsx
│       │   └── ...
│       ├── 📂 pages/           # 15 page components
│       │   ├── Home.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Analytics.jsx
│       │   ├── Automation.jsx
│       │   ├── DeviceManager.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── TechnicianTracker.jsx
│       │   ├── Login.jsx / Register.jsx
│       │   └── ...
│       ├── 📂 context/         # Auth & Theme context
│       ├── 📂 services/        # Axios API services
│       └── 📂 styles/          # Global styles
│
├── 📂 Images/                  # Screenshots (Owner / Tech / Admin)
├── 📂 screenshots/             # Additional UI screenshots
├── 🔧 start.bat                # One-click start script (Windows)
├── 📄 README.md
└── 📦 package-lock.json
```

---

## 🔒 Security Architecture

```
Request
  │
  ▼
JWT Filter ──────▶ Token Valid? ──No──▶ 401 Unauthorized
  │                    │
  │                   Yes
  │                    │
  ▼                    ▼
Security Context    Role Check ──────▶ 403 Forbidden
                        │
                       Pass
                        │
                        ▼
                   Controller Logic
```

- JWT tokens with configurable expiry
- BCrypt password hashing (strength 10)
- CORS configured for frontend origin
- Spring Security endpoint-level protection
- Google OAuth2 social login integration

---

## ⚙️ Configuration Reference

### Backend — `application.properties`
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/smart_home_energy?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT
smarthome.app.jwtSecret=REPLACE_WITH_LONG_RANDOM_SECRET_KEY_MIN_256_BITS
smarthome.app.jwtExpirationMs=86400000

# Gmail (App Password — not your actual password)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD

# Google OAuth2 — https://console.cloud.google.com/
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

### Frontend — `src/services/api.js`
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 🐛 Troubleshooting

<details>
<summary><b>🔴 Backend won't start</b></summary>

- Ensure MySQL is running: `net start MySQL80` (Windows)
- Verify credentials in `application.properties`
- Check Java version: `java -version` (must be 17+)
- Port conflict: Change `server.port` in `application.properties`

</details>

<details>
<summary><b>🔴 Frontend API errors</b></summary>

- Confirm backend is running at `http://localhost:8080`
- Check browser console for CORS errors
- Delete `node_modules` and run `npm install` again

</details>

<details>
<summary><b>🔴 Email / OTP not sending</b></summary>

- Use a **Gmail App Password**, not your actual Gmail password
- Enable 2FA on your Google account first
- Generate App Password at: https://myaccount.google.com/apppasswords

</details>

<details>
<summary><b>🔴 Google OAuth login fails</b></summary>

- Add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI in Google Cloud Console
- Ensure client ID and secret are correctly set

</details>

---

## 🔜 Upcoming / Future Features

- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🤖 AI-based monthly bill prediction (ML model)
- [ ] 📡 Real hardware IoT device integration (MQTT)
- [ ] 🌍 Carbon footprint tracker
- [ ] 🏆 Gamification — energy saving challenges & badges
- [ ] 📊 Exportable PDF/CSV energy reports
- [ ] 🔔 Push notification support
- [ ] 🌐 Multi-home / multi-location support

---

## 📄 License

This project is built for **educational purposes** as part of a structured software engineering curriculum.

---

## 👥 Support & Contribution

- 🐛 **Found a bug?** Open an [issue](https://github.com/Siddharth7880/smart-home-energy-management/issues)
- 💡 **Have a feature idea?** Start a [discussion](https://github.com/Siddharth7880/smart-home-energy-management/discussions)
- 🔀 **Want to contribute?** PRs are welcome!

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

<b>Built with ❤️ for a Greener Tomorrow 🌱</b><br/>
<sub>Smart Home Energy Management System — Full Stack | Spring Boot + React</sub>

<br/><br/>

⭐ **Star this repo if you found it helpful!** ⭐

</div>
