@echo off
echo ====================================
echo Smart Home Energy Management System
echo ====================================
echo.
echo Starting Backend Server...
echo.

cd backend
start "Backend Server" cmd /k "mvnw.cmd spring-boot:run"

echo.
echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak

echo.
echo Starting Frontend Server...
echo.

cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ====================================
echo Both servers are starting!
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo ====================================
echo.
echo Press any key to exit this window...
pause > nul
