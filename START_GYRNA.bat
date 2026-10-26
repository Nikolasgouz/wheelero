@echo off
setlocal
title Wheelero - Update and Launch
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-gyrna.ps1" %*
if errorlevel 1 (
    echo.
    echo Wheelero could not start. Read the error above.
    pause
    exit /b 1
)
exit /b 0
