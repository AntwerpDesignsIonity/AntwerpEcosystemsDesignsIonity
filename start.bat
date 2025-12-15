@echo off
REM Copilot CLI Chat - CMD Launcher

echo ===========================================
echo   Copilot CLI Chat - Launcher
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the server in background
echo Starting local server...
echo.
start /B node src/server/index.js

REM Wait for server to start
timeout /t 2 /nobreak >nul

REM Open browser to GUI
echo Opening GUI in browser...
echo.
start http://localhost:3000

REM Wait a moment
timeout /t 1 /nobreak >nul

REM Start CLI
echo Starting CLI interface...
echo ===========================================
echo.

REM Run the CLI
call npm run cli

REM Cleanup note
echo.
echo Note: Please close the server window manually if still running.
echo.
pause
