@echo off
setlocal
title Gyrna - Stop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-gyrna.ps1" -StopServers
if errorlevel 1 (
    echo.
    echo Gyrna could not stop. Read the error above.
    pause
    exit /b 1
)
exit /b 0
