# Copilot CLI Chat - PowerShell Launcher
Write-Host "===========================================`n" -ForegroundColor Blue
Write-Host "  Copilot CLI Chat - Launcher`n" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Blue

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/`n" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if npm packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies...`n" -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
        pause
        exit 1
    }
}

# Start the server in background
Write-Host "Starting local server...`n" -ForegroundColor Green
$serverProcess = Start-Process -FilePath "node" -ArgumentList "src/server/index.js" -PassThru -NoNewWindow

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Open browser to GUI
Write-Host "Opening GUI in browser...`n" -ForegroundColor Green
Start-Process "http://localhost:3000"

# Wait another moment
Start-Sleep -Seconds 1

# Start CLI
Write-Host "Starting CLI interface...`n" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

# Run the CLI
npm run cli

# Cleanup: Stop server when CLI exits
if ($serverProcess) {
    Write-Host "`nStopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Goodbye!`n" -ForegroundColor Green
