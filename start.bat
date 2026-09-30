@echo off
echo ========================================================
echo   REEMA SAFRIN H - FRUIT QUALITY CLASSIFICATION
echo ========================================================

echo [1/2] Starting Flask Backend Server (Port 5000)...
cd backend
start "Fruit Quality Backend" cmd /k "python app.py"
cd ..

echo [2/2] Starting React Vite Frontend (Port 5173)...
cd frontend
start "Fruit Quality Frontend" cmd /k "npm.cmd run dev"
cd ..

echo ========================================================
echo Frontend Application: http://localhost:5173/
echo Backend REST API:     http://localhost:5000/
echo ========================================================
echo Press any key to exit this launcher window...
pause >nul
