# ============================================================
# setup-sam.ps1 — PowerShell-safe Sam setup + launch script
#
# Run this from PowerShell (as yourself, NOT as Administrator):
#   Set-Location "G:\My Drive\Antigravity"
#   .\setup-sam.ps1
#
# Or to just START Sam (after first setup):
#   .\setup-sam.ps1 -Start
#
# Or to check dependencies:
#   .\setup-sam.ps1 -Check
# ============================================================

param(
    [switch]$Start,
    [switch]$Check,
    [switch]$PullModels
)

# Always run from project root
$ProjectRoot = "G:\My Drive\Antigravity"
Set-Location $ProjectRoot
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Sam AI Agent Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Copy sam.env if missing ──────────────────────────────────────────
if (-not (Test-Path "$ProjectRoot\sam.env")) {
    Copy-Item "$ProjectRoot\sam.env.example" "$ProjectRoot\sam.env"
    Write-Host "[OK] Created sam.env from template" -ForegroundColor Green
    Write-Host "     Edit G:\My Drive\Antigravity\sam.env to set your keys" -ForegroundColor Yellow
} else {
    Write-Host "[OK] sam.env exists" -ForegroundColor Green
}

# ── Step 2: Install missing Python packages ───────────────────────────────────
Write-Host ""
Write-Host "[INSTALL] Installing Python dependencies..." -ForegroundColor Cyan
$packages = @(
    "aiosqlite",
    "langchain-ollama", 
    "croniter",
    "uvicorn[standard]",
    "fastapi",
    "aiofiles",
    "psutil",
    "langchain",
    "langgraph",
    "langchain-community",
    "fastembed"
)
foreach ($pkg in $packages) {
    $result = pip show ($pkg -split "\[")[0] 2>&1
    if ($LASTEXITCODE -ne 0 -or $result -match "not found") {
        Write-Host "  Installing $pkg..." -ForegroundColor Yellow
        pip install $pkg --quiet 2>&1 | Out-Null
        Write-Host "  [OK] $pkg installed" -ForegroundColor Green
    } else {
        Write-Host "  [OK] $pkg already installed" -ForegroundColor Green
    }
}

# ── Step 3: Check Ollama ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "[OLLAMA] Checking Ollama..." -ForegroundColor Cyan
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3
    $models = $ollamaCheck.models | ForEach-Object { $_.name }
    Write-Host "  [OK] Ollama is running" -ForegroundColor Green
    if ($models) {
        Write-Host "  Models: $($models -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] No models found!" -ForegroundColor Yellow
        Write-Host "         Run: ollama pull llama3.2:1b" -ForegroundColor Yellow
        Write-Host "         Run: ollama pull qwen3.6       (slower, better quality)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [FAIL] Ollama not running at localhost:11434" -ForegroundColor Red
    Write-Host "         Start it: ollama serve" -ForegroundColor Yellow
}

# ── Step 4: Pull models (if requested) ───────────────────────────────────────
if ($PullModels) {
    Write-Host ""
    Write-Host "[MODELS] Pulling Ollama models (this takes 5-30 minutes)..." -ForegroundColor Cyan
    Write-Host "  Pulling llama3.2:1b (fast, small ~1.3GB)..." -ForegroundColor Yellow
    ollama pull llama3.2:1b
    Write-Host "  Pulling qwen3.6 (Sam CEO brain ~4.5GB)..." -ForegroundColor Yellow
    ollama pull qwen3.6
    Write-Host "  [OK] Models ready" -ForegroundColor Green
}

if ($Check) {
    Write-Host ""
    Write-Host "[CHECK] Running full dependency check..." -ForegroundColor Cyan
    python start_sam.py --check
    exit
}

if ($Start) {
    Write-Host ""
    Write-Host "[LAUNCH] Starting Sam Agent on port 8765..." -ForegroundColor Cyan
    Write-Host "  Dashboard: http://localhost:8765/" -ForegroundColor Green
    Write-Host "  Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    $env:PYTHONIOENCODING = "utf-8"
    $env:HF_HUB_DISABLE_SYMLINKS = "1"
    python start_sam.py
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  To start Sam:     .\setup-sam.ps1 -Start" -ForegroundColor White
Write-Host "  To pull models:   .\setup-sam.ps1 -PullModels" -ForegroundColor White
Write-Host "  To check deps:    .\setup-sam.ps1 -Check" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
