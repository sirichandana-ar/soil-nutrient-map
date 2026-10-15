@echo off
title TerraPulse Precision Ag - Launch System
echo ========================================================
echo        TERRAPULSE PRECISION SOIL INTELLIGENCE
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://localhost:8001 ...
start "TerraPulse Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8001"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "TerraPulse Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  Both services launched!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8001
echo  API Docs: http://localhost:8001/api/v1/docs
echo ========================================================
