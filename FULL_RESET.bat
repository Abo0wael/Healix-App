@echo off
echo ===========================================
echo   ⚠️  FULL RESET IN PROGRESS
echo   This will close Expo and Backend.
echo   You will need to restart Expo after this.
echo ===========================================

echo [1/3] Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo [2/3] Installing Dependencies (Just in case)...
cd backend
call npm install @google/generative-ai dotenv cors express
cd ..

echo [3/3] Starting Backend Server...
echo -------------------------------------------
echo   Use a NEW terminal to run: npx expo start
echo -------------------------------------------
cd backend
npm start
