<div align="center">
  <h1>🌱 Smart Home Energy Management System</h1>
  <p><i>A full-stack, comprehensive web application designed to monitor, track, and optimize smart home energy consumption. Build with security, modern UI/UX, and performance in mind.</i></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Java-17-orange.svg" alt="Java" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F.svg?logo=spring&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  </p>

  <p>
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-live-features">Features</a> •
    <a href="#-my-contribution-backend-developer">My Contribution</a> •
    <a href="#-screenshots">Screenshots</a> •
    <a href="#-setup-instructions">Getting Started</a> •
    <a href="#-api-endpoints">API</a>
  </p>
</div>

---

## 📖 Overview

The **Smart Home Energy Management System** allows homeowners to track their energy usage effortlessly, helping reduce carbon footprints and electricity bills. Built with a robust backend and a highly interactive front end, it securely manages real-time monitoring and user roles.

## 🛠️ Tech Stack

### Backend
- **Java 17** with Spring Boot 3.4.2
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **MySQL** database

### Frontend
- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Router** for navigation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven (or use the included Maven wrapper)

## 🚀 Live Features

- 🔐 Secure JWT Authentication
- ⚡ Real-Time Energy Monitoring
- 📊 Analytics Dashboard
- 🏠 Smart Device Management
- 🌙 Dark/Light Theme Toggle
- 📱 Fully Responsive UI

## 👨‍💻 My Contribution (Backend Developer)

As a primary **Backend Developer** for this project, I engineered robust and secure server-side logic to power the platform. My key contributions include:

- **Architecting the Core Engine:** Designed and implemented the Spring Boot 3.4 RESTful APIs handling authentication, role-based access control, and core entity business logic.
- **Enterprise Security & Roles:** Programmed the JWT token lifecycle, secured endpoints based on user roles (Owner, Tech, Admin), and solved complex cross-browser permission mappings to ensure secure session continuity.
- **Database Architecture & Optimization:** Addressed critical MySQL constraint validations (e.g., maintaining foreign key integrity and schemas for devices), ensuring secure data persistence using Spring Data JPA and Hibernate.
- **Comprehensive Testing Suite:** Developed rigorous edge-case unit testing utilizing JUnit 5 and Mockito, thoroughly verifying Milestone 2 features including `DeviceService` and `EnergyUsageLogService` reliability under stress environments.
- **Milestone Feature Delivery:** Orchestrated the dynamic device tracking mechanisms, energy usage log generation logic simulation, and API endpoint robustification.

📥 **[Download Milestone 2 Presentation (PPTX)](Milestone-2-Backend-Achievements.pptx)**

<br/>

## 📸 Screenshots

Here is a glimpse of the application interfaces based on user roles. The UI was built with a keen eye for aesthetics, glassmorphism, and responsive behavior.

### 🚀 Onboarding
| Registration Page | Login Page |
| :---: | :---: |
| <img src="registration.png" alt="Registration" width="400"/> | <img src="login.png" alt="Login" width="400"/> |

### 🏠 Owner Console
| Dashboard | Devices Overview |
| :---: | :---: |
| <img src="Images/Owner/Screenshot 2026-02-26 232148.png" alt="Owner Dashboard" width="400"/> | <img src="Images/Owner/Screenshot 2026-02-26 232310.png" alt="Owner Devices" width="400"/> |
| **Device Details** | **Device Logs** |
| <img src="Images/Owner/Screenshot 2026-02-26 232330.png" alt="Owner Device Details" width="400"/> | <img src="Images/Owner/Screenshot 2026-02-27 125123.png" alt="Owner Device Logs" width="400"/> |

### 🔧 Technician Console
| Main Dashboard | Assigned Installations |
| :---: | :---: |
| <img src="Images/Tech/Screenshot 2026-02-27 130847.png" alt="Technician Dashboard" width="400"/> | <img src="Images/Tech/Screenshot 2026-02-27 130902.png" alt="Technician Installations" width="400"/> |

### 🛡️ Admin Console
| Platform Dashboard (Overview) | Dashboard Highlights |
| :---: | :---: |
| <img src="Images/Admin/Screenshot 2026-02-27 131059.png" alt="Admin Dashboard Overview" width="400"/> | <img src="Images/Admin/Screenshot 2026-02-27 131118.png" alt="Admin Dashboard Detail" width="400"/> |
| **Admin System Details** | **Device Registry** |
| <img src="Images/Admin/Screenshot 2026-02-27 131131.png" alt="Admin Details" width="400"/> | <img src="Images/Admin/Screenshot 2026-02-27 131141.png" alt="Admin Device Details" width="400"/> |
| **Technician Management** | |
| <img src="Images/Admin/Screenshot 2026-02-27 131200.png" alt="Admin Technician Details" width="400"/> | |

<br/>

## 📂 Project Milestones

### ✅ Milestone 1
- Authentication
- Database Integration
- Basic Dashboard

### ✅ Milestone 2
- Device CRUD Operations
- Energy Tracking
- Analytics Visualization
- UI Enhancement
- Performance Optimization

### ✅ Milestone 3 — Energy Tracking & API Integration
- IoT API Integration (Simulated / Real-time Data)
- Real-time Energy Consumption Display
- Total Household Energy Calculation
- Hourly/Daily Usage Data Fetching

### ✅ Milestone 4 — Analytics Dashboard
- Charts for Energy Consumption (Daily / Weekly / Monthly)
- Usage Comparison with Previous Data
- Energy Cost Prediction
- Peak vs Off-Peak Usage Analysis

### ✅ Milestone 5 — Automation & Recommendations
- Device Scheduling (ON/OFF Automation)
- Energy Overload Alerts / Notifications
- Personalized Energy-Saving Recommendations
- Smart Usage Insights (e.g., Off-peak Suggestions)

## 🚀 Setup Instructions

### 1. Database Setup

1. Start your MySQL server
2. The application will automatically create the database `smart_home_energy` on first run
3. Copy the example config and fill in your credentials:
   ```bash
   cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
   ```

> **Note:** Edit `backend/src/main/resources/application.properties` with your MySQL credentials, email (Gmail App Password), Google OAuth client ID/secret, and JWT secret. See `application.properties.example` for all required keys.

### 2. Backend Setup

Navigate to the backend directory and run:

```bash
cd backend

# Using Maven wrapper (Windows)
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Or using Maven directly
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory and run:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎨 Features

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Password encryption with BCrypt
- Forgot password functionality
- Remember me option

### User Roles
- Homeowner
- Technician
- Admin

### Design Theme
- **Primary Color:** Green/Emerald theme for eco-friendly energy management
- Modern, responsive UI with smooth animations
- Glass-morphism design elements
- Dark mode support (coming soon)

## 📱 Pages

1. **Home** - Landing page with system overview
2. **Login** - User authentication (Green-themed)
3. **Register** - New user registration
4. **Dashboard** - User dashboard with energy monitoring
5. **Forgot Password** - Password recovery

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Password reset

### Test Endpoints
- `GET /api/test/all` - Public content
- `GET /api/test/user` - User content (requires authentication)
- `GET /api/test/tech` - Technician content (requires TECH role)
- `GET /api/test/admin` - Admin content (requires ADMIN role)

## 🔒 Security

- JWT-based authentication
- Password encryption using BCrypt
- CORS enabled for frontend communication
- Session management with Spring Security
- Protected routes on both frontend and backend

## 📁 Project Structure

```
Smart Home Energy Management System/
├── backend/
│   ├── src/main/java/com/smarthome/energy/
│   │   ├── config/          # Security and app configuration
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # Entity models
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT and security services
│   │   └── service/         # Business logic services
│   └── src/main/resources/
│       └── application.properties  # App configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context (Auth, Theme)
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   └── package.json
└── README.md
```

## 🎨 Color Scheme

The application uses a green color palette to represent eco-friendly energy management:

- **Primary:** Green (#16a34a) to Emerald (#059669)
- **Background:** Green gradient (green-50 to emerald-50)
- **Accents:** Various shades of green for interactive elements
- **Text:** Slate colors for optimal readability

## 🔧 Configuration

### Backend Configuration
Copy `backend/src/main/resources/application.properties.example` → `application.properties` and fill in your values:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/smart_database?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT Secret (use a long random string in production)
smarthome.app.jwtSecret=REPLACE_WITH_A_LONG_RANDOM_SECRET_KEY
smarthome.app.jwtExpirationMs=86400000

# Gmail App Password (generate at https://myaccount.google.com/apppasswords)
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD

# Google OAuth2 (https://console.cloud.google.com/)
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

### Frontend Configuration
Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🐛 Troubleshooting

### Backend Issues
- **Port 8080 already in use:** Change the port in `application.properties`
- **Database connection failed:** Verify MySQL is running and credentials are correct
- **Build errors:** Ensure Java 17+ is installed

### Frontend Issues
- **Port 5173 already in use:** Vite will automatically use the next available port
- **API connection failed:** Verify backend is running on port 8080
- **Dependencies error:** Delete `node_modules` and run `npm install` again

## 📝 Default Test Credentials

After first run, you can create users through the registration page. The system starts with an empty database.

## 🔜 Future Features

- Real-time energy consumption monitoring
- Device management and control
- Energy usage analytics and reports
- Bill estimation and predictions
- Mobile app support
- Smart device integration
- Email notifications
- Admin panel for user management

## 📄 License

This project is for educational purposes.

## 👥 Support

For issues or questions, please create an issue in the project repository.

<hr/>
<div align="center">
  <b>Built with ❤️ for a Greener Tomorrow.</b><br/>
  🚀⚡
</div>
