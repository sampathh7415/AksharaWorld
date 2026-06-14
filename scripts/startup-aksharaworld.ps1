# AksharaWorld Startup Script
# Runs on Windows boot to ensure all services are live
# Last updated: 2026-06-14

Write-Host "=== AksharaWorld System Startup ===" -ForegroundColor Cyan

# ── 1. Verify AksharaWorld-EmailBot scheduled task ────────────────────────────
Write-Host "`n[1/4] Checking AksharaWorld-EmailBot scheduled task..." -ForegroundColor Yellow
$emailTask = Get-ScheduledTask -TaskName "AksharaWorld-EmailBot" -ErrorAction SilentlyContinue
if ($emailTask) {
    $state = $emailTask.State
    Write-Host "  ✅ AksharaWorld-EmailBot found — State: $state" -ForegroundColor Green
    if ($state -ne "Ready" -and $state -ne "Running") {
        Write-Host "  ⚠️  Task not in Ready state. Enabling..." -ForegroundColor Yellow
        Enable-ScheduledTask -TaskName "AksharaWorld-EmailBot"
        Write-Host "  ✅ Task enabled." -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ AksharaWorld-EmailBot NOT found. Re-registering..." -ForegroundColor Red
    $action  = New-ScheduledTaskAction -Execute "python" -Argument "-u -X utf8 `"G:\My Drive\Antigravity\services\email-bot\main.py`""
    $trigger = New-ScheduledTaskTrigger -Daily -At 8:00AM
    Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "AksharaWorld-EmailBot" -RunLevel Highest -Force
    Write-Host "  ✅ AksharaWorld-EmailBot re-registered." -ForegroundColor Green
}

# ── 2. Start Docker Desktop (if not running) ──────────────────────────────────
Write-Host "`n[2/4] Checking Docker..." -ForegroundColor Yellow
$docker = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "  ✅ Docker Desktop is running." -ForegroundColor Green
} else {
    Write-Host "  ⏳ Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 15
    Write-Host "  ✅ Docker Desktop launched." -ForegroundColor Green
}

# ── 3. Verify Ollama is running ───────────────────────────────────────────────
Write-Host "`n[3/4] Checking Ollama (port 11434)..." -ForegroundColor Yellow
try {
    $ollamaResp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Ollama is live. Models: $($ollamaResp.models.Count)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Ollama not responding. Attempting start..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    Write-Host "  ✅ Ollama serve launched." -ForegroundColor Green
}

# ── 4. Verify FastAPI Sam daemon (port 8765) ──────────────────────────────────
Write-Host "`n[4/4] Checking Sam FastAPI daemon (port 8765)..." -ForegroundColor Yellow
try {
    $samResp = Invoke-RestMethod -Uri "http://localhost:8765/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Sam daemon is live." -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Sam daemon not responding. Attempting start..." -ForegroundColor Yellow
    $samPath = "G:\My Drive\Antigravity\sam\main.py"
    if (Test-Path $samPath) {
        Start-Process "python" -ArgumentList "-u $samPath" -WindowStyle Hidden
        Write-Host "  ✅ Sam daemon launched." -ForegroundColor Green
    } else {
        Write-Host "  ❌ sam\main.py not found. Skipping." -ForegroundColor Red
    }
}

Write-Host "`n=== Startup complete. AksharaWorld systems checked. ===" -ForegroundColor Cyan
