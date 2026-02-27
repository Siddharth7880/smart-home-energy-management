# Smart Home Energy Management System

A full-stack web application for managing smart home energy consumption with user authentication and real-time monitoring.

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

  ## 📸 Application Preview

### 🔐 Register Page
<img src="Screenshots\Screenshot 2026-02-27 124625.png" width="800"/>

### 🔐 Login Page
<img src="C:\Users\Admin\OneDrive\Pictures\Screenshots\Screenshot 2026-02-26 232000.png" width="800"/>

### 📊 Owner Dashboard
<img src="C:\Users\Admin\OneDrive\Pictures\Screenshots\Screenshot 2026-02-26 232148.png" width="800"/>

### ⚡ Owner Device Management
<img src="C:\Users\Admin\OneDrive\Pictures\Screenshots\Screenshot 2026-02-27 125107.png" width="800"/>

### 📈 Owner Analytics
<img src="C:\Users\Admin\OneDrive\Pictures\Screenshots\Screenshot 2026-02-27 125123.png" width="800"/>

---


## 👨‍💻 My Contribution

As the primary developer of this project, I was responsible for:

- Designing complete backend architecture
- Implementing secure JWT authentication
- Creating scalable REST APIs
- Database schema design
- Building interactive React dashboard
- Implementing device management module
- Developing analytics system
- Full frontend-backend integration
- Debugging and optimization

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

---

**Happy Coding! 🚀⚡**
