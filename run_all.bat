@echo off
TITLE AksharaWorld Launcher
echo =======================================================
echo        Starting AksharaWorld Services (Local)
echo =======================================================
echo.

echo [1/2] Starting Next.js Frontend on port 3000...
start "AksharaWorld - Next.js Frontend (Port 3000)" cmd /k "pnpm dev"

echo [2/2] Starting Sam AI Backend on port 8765...
IF EXIST "venv\Scripts\python.exe" (
    start "AksharaWorld - Sam Backend (Port 8765)" cmd /k "venv\Scripts\python.exe start_sam.py"
) ELSE (
    start "AksharaWorld - Sam Backend (Port 8765)" cmd /k "python start_sam.py"
)

echo.
echo =======================================================
echo All servers have been launched in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8765
echo =======================================================
pause
