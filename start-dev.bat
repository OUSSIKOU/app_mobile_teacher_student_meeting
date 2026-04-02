@echo off
echo Starting Easy Study Development Environment...
echo.

echo Starting MongoDB (make sure MongoDB is installed and configured)
echo.

echo Starting Backend Server...
start "Easy Study Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Client...
start "Easy Study Client" cmd /k "cd easy-study-mobile && npm start"

echo.
echo Both server and client are starting...
echo Backend: http://localhost:5000
echo Frontend: Follow Expo CLI instructions
echo.
pause
