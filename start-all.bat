@echo off
echo ========================================================
echo               STARTING TRIPNEST SERVERS
echo ========================================================
echo.

start "TripNest Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "TripNest Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev -- --host 0.0.0.0 --port 5173"

timeout /t 3 /nobreak >nul

start "TripNest Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://localhost:5173"

echo.
echo All services launched!
echo Opening TripNest in your web browser...
start http://localhost:5173

echo.
echo ========================================================
echo TripNest is now running!
echo - Web App URL: http://localhost:5173
echo - Backend API: http://localhost:8000/docs
echo - For phone access: check the "TripNest Cloudflare Tunnel" window
echo ========================================================
echo.
pause
