@echo off
echo Stopping any running backend servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd /d "%~dp0"
npm start
