# watch-download.ps1
# Run this in PowerShell to watch qwen3 download progress live
# Usage: .\watch-download.ps1

$targetGB = 5.2  # qwen3 total size

Write-Host ""
Write-Host "  Watching qwen3 download (5.2 GB total)..." -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop watching" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $blobs    = Get-ChildItem "$env:USERPROFILE\.ollama\models\blobs" -ErrorAction SilentlyContinue
    $totalGB  = [math]::Round(($blobs | Measure-Object -Property Length -Sum).Sum / 1GB, 2)
    $baseGB   = 1.3   # llama3.2:1b already there
    $qwenGB   = [math]::Round($totalGB - $baseGB, 2)
    $pct      = [math]::Min([math]::Round(($qwenGB / $targetGB) * 100, 1), 100)
    $bar      = ('#' * [int]($pct / 5)).PadRight(20)
    $models   = ollama list 2>&1 | Select-String "qwen3"

    Clear-Host
    Write-Host ""
    Write-Host "  ======================================" -ForegroundColor Cyan
    Write-Host "    qwen3 Download Progress" -ForegroundColor White
    Write-Host "  ======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [$bar] $pct%" -ForegroundColor Green
    Write-Host "  Downloaded : $qwenGB GB / $targetGB GB" -ForegroundColor White
    Write-Host "  Total disk : $totalGB GB (includes llama3.2:1b)" -ForegroundColor Gray
    Write-Host ""

    if ($models) {
        Write-Host "  STATUS: COMPLETE! qwen3 is ready." -ForegroundColor Green
        Write-Host ""
        Write-Host "  Next: Update sam.env  ->  SAM_MODEL=qwen3" -ForegroundColor Yellow
        Write-Host "        Update .env.local -> OLLAMA_MODEL_SAM=qwen3" -ForegroundColor Yellow
        Write-Host "        Restart Sam: .\setup-sam.ps1 -Start" -ForegroundColor Yellow
        Write-Host ""
        break
    } else {
        Write-Host "  STATUS: Downloading..." -ForegroundColor Yellow
        Write-Host "  (refreshes every 10 seconds)" -ForegroundColor Gray
    }
    Write-Host ""

    Start-Sleep -Seconds 10
}
