@echo off
echo ========================================
echo   FIXING BACKEND DEPENDENCIES & STARTING
echo ========================================

cd /d "%~dp0"

echo [1/3] Installing Google AI SDK...
call npm install @google/generative-ai dotenv cors express

echo [2/3] Cleaning up old processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [3/3] Starting Server...
npm start
