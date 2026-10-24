@echo off
setlocal
title Gyrna - Launcher
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo Python environment not found. Follow the installation steps in README.md.
    goto failed
)
where bun >nul 2>&1
if errorlevel 1 (
    echo Bun was not found in PATH. Install Bun and reopen this launcher.
    goto failed
)
if not exist "frontend\node_modules" (
    echo Frontend dependencies are missing. Run bun install in the frontend folder.
    goto failed
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort 8017,4173 -ErrorAction SilentlyContinue) { exit 1 }; exit 0"
if errorlevel 1 (
    echo Port 8017 or 4173 is already in use. Close the existing server before retrying.
    goto failed
)

echo Preparing the database...
cd /d "%~dp0backend"
"%~dp0.venv\Scripts\python.exe" -m alembic upgrade head
if errorlevel 1 goto failed

cd /d "%~dp0frontend"
if not exist "dist\index.html" (
    echo Building the application...
    call bun run build
    if errorlevel 1 goto failed
)

echo Starting Gyrna...
start "Gyrna - Backend" /D "%~dp0backend" "%ComSpec%" /d /k ""%~dp0.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8017 --no-access-log"
start "Gyrna - Frontend" /D "%~dp0frontend" "%ComSpec%" /d /k "bun run preview --port 4173 --strictPort"

powershell -NoProfile -Command "for ($attempt = 0; $attempt -lt 60; $attempt++) { $ports = @(Get-NetTCPConnection -State Listen -LocalPort 8017,4173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort -Unique); if ($ports.Count -eq 2) { exit 0 }; Start-Sleep -Milliseconds 500 }; exit 1"
if errorlevel 1 (
    echo Startup did not finish. Check the Backend and Frontend windows for errors.
    goto failed
)

start "" "http://localhost:4173"
exit /b 0

:failed
echo.
pause
exit /b 1
