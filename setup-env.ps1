# Quick .env setup wizard
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
  Write-Host ".env already exists. Edit it manually or delete and re-run." -ForegroundColor Yellow
  exit 0
}

Copy-Item (Join-Path $PSScriptRoot ".env.example") $envPath
Write-Host "`n=== PixelForge AI — Environment Setup ===`n" -ForegroundColor Cyan
Write-Host "Stripe connects your BANK for payouts (not this script)."
Write-Host "1. Register: https://dashboard.stripe.com/register"
Write-Host "2. Link bank: Settings -> Bank accounts"
Write-Host "3. API key: Developers -> API keys`n"

$sk = Read-Host "Paste STRIPE_SECRET_KEY (or Enter to skip)"
if ($sk) {
  (Get-Content $envPath) -replace 'STRIPE_SECRET_KEY=.*', "STRIPE_SECRET_KEY=$sk" | Set-Content $envPath
}

$rep = Read-Host "Paste REPLICATE_API_TOKEN for real AI (or Enter to skip)"
if ($rep) {
  (Get-Content $envPath) -replace 'REPLICATE_API_TOKEN=.*', "REPLICATE_API_TOKEN=$rep" | Set-Content $envPath
}

Write-Host "`nSaved .env. Start store: node src\server.js" -ForegroundColor Green
Write-Host "Full guide: SETUP-STRIPE.md`n"
