@echo off
echo ============================================
echo  System Sentinel - Quick Setup (Windows)
echo ============================================

echo Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)
echo Node.js found.

echo.
echo Installing backend dependencies...
cd backend
if not exist ".env" (
    copy .env.example .env
    echo Created backend\.env - please edit it with your settings
)
npm install
echo Backend dependencies installed.

echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install
echo Frontend dependencies installed.

echo.
echo ============================================
echo Setup complete!
echo ============================================
echo.
echo To start:
echo   Terminal 1:  cd backend  ^&^& npm run dev
echo   Terminal 2:  cd frontend ^&^& npm run dev
echo   Browser:     http://localhost:5173
echo.
pause
