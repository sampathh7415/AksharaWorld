# Push BizOps project to GitHub
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1 -RepoUrl "https://github.com/YOUR_USER/bizops-platform.git"

param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
  Write-Host "Run start-bizops.ps1 setup first, or: git init && git add -A && git commit" -ForegroundColor Red
  exit 1
}

$hasCommit = git rev-parse HEAD 2>$null
if (-not $hasCommit) {
  git add -A
  git commit -m @"
feat: BizOps real-time business operations platform

- NestJS backend with JWT auth, RBAC, WebSocket events
- Next.js dashboard with live updates
- PostgreSQL/Prisma + SQLite local fallback
- Docker Compose, docs, tests, legacy PixelForge store
"@
}

git branch -M main

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $RepoUrl
} else {
  git remote set-url origin $RepoUrl
}

Write-Host "Pushing to $RepoUrl ..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "Success! Repository is on GitHub." -ForegroundColor Green
} else {
  Write-Host "Push failed. Create an empty repo on GitHub first, then run this script again." -ForegroundColor Red
}
