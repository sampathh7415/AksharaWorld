# Akshara World - Windows PowerShell Setup Script
# Run this to set up the complete project

Write-Host "🚀 Akshara World - Complete Project Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "g:\My Drive\Antigravity"

# Install main dashboard
Write-Host "📦 Installing Main Dashboard..." -ForegroundColor Yellow
Set-Location "$baseDir\dashboard"
npm install --legacy-peer-deps
Write-Host "✅ Main Dashboard dependencies installed!" -ForegroundColor Green
Write-Host ""

# Install Akshara dashboard
Write-Host "📦 Installing Akshara Dashboard..." -ForegroundColor Yellow
Set-Location "$baseDir\akshara-world-dashboard"
npm install --legacy-peer-deps
Write-Host "✅ Akshara Dashboard dependencies installed!" -ForegroundColor Green
Write-Host ""

# Verify Node modules
Write-Host "🔍 Verifying installations..." -ForegroundColor Yellow
if ((Test-Path "$baseDir\dashboard\node_modules") -and (Test-Path "$baseDir\akshara-world-dashboard\node_modules")) {
    Write-Host "✅ All dependencies verified!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some dependencies may be missing" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Main Dashboard:    cd dashboard && npm run dev" -ForegroundColor White
Write-Host "  2. Akshara Dashboard: cd akshara-world-dashboard && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more info, see: COMPLETE_SETUP.md" -ForegroundColor Cyan
