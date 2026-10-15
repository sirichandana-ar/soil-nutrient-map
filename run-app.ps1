# TerraPulse Precision Soil Intelligence - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Green
Write-Host "       TERRAPULSE PRECISION SOIL INTELLIGENCE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/2] Starting Python FastAPI Backend on http://localhost:8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8001"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host "`nServices Launched Successfully!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:8001" -ForegroundColor White
Write-Host "API Docs: http://localhost:8001/api/v1/docs" -ForegroundColor Cyan
