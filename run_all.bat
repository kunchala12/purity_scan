@echo off
echo Starting PureScan AI Services...

:: Start Backend (Flask) in a new window
start cmd /k "cd backend && python app.py"

:: Start Frontend (React) in a new window
:: Using 'cmd /c' to bypass PowerShell script restrictions automatically
start cmd /k "cd frontend && cmd /c "npm run dev""

echo.
echo ======================================================
echo  1. Backend is starting on http://localhost:5000
echo  2. Frontend is starting on http://localhost:5173
echo.
echo  Please visit http://localhost:5173 in your browser!
echo ======================================================
pause
