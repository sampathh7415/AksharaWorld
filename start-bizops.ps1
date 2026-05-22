# BizOps - one-shot setup and start (PowerShell)
# Works WITHOUT Docker: uses SQLite automatically if PostgreSQL is not available.

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$SchemaSqlite = "prisma/schema.sqlite.prisma"
Set-Location $Root

function Test-TcpPort {
  param([int]$Port)
  try {
    $r = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -ErrorAction Stop
    return $r.TcpTestSucceeded
  } catch {
    return $false
  }
}

function Wait-TcpPort {
  param([int]$Port, [int]$TimeoutSec = 60)
  for ($i = 0; $i -lt $TimeoutSec; $i++) {
    if (Test-TcpPort -Port $Port) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Write-BackendEnv {
  param([string]$Content)
  Set-Content -Path "$Root\backend\.env" -Value $Content -Encoding UTF8
}

Write-Host ""
Write-Host "=== BizOps: database ===" -ForegroundColor Cyan

$useSqlite = $false
$pgReady = Test-TcpPort -Port 5432

if ($pgReady) {
  Write-Host "PostgreSQL detected on port 5432." -ForegroundColor Green
} else {
  $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
  if ($dockerCmd) {
    Write-Host "Starting PostgreSQL + Redis with Docker..." -ForegroundColor Gray
    docker compose up -d postgres redis
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Waiting for PostgreSQL..." -ForegroundColor Gray
      if (Wait-TcpPort -Port 5432 -TimeoutSec 90) {
        $pgReady = $true
        Write-Host "PostgreSQL is ready." -ForegroundColor Green
      }
    }
  }

  if (-not $pgReady) {
    $useSqlite = $true
    Write-Host ""
    Write-Host "No PostgreSQL found - using SQLite (no Docker install needed)." -ForegroundColor Yellow
    Write-Host "Database file: backend\data\bizops.db" -ForegroundColor Gray
  }
}

New-Item -ItemType Directory -Force -Path "$Root\backend\data" | Out-Null

if ($useSqlite) {
  Write-BackendEnv @"
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./data/bizops.db
PRISMA_SCHEMA=$SchemaSqlite
REDIS_URL=
JWT_ACCESS_SECRET=dev-access-secret-change-in-production-32chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-32chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
THROTTLE_TTL=60
THROTTLE_LIMIT=100
"@
} else {
  if (-not (Test-Path "$Root\backend\.env")) {
    Copy-Item "$Root\backend\.env.example" "$Root\backend\.env"
  }
}

if (-not (Test-Path "$Root\frontend\.env.local")) {
  Copy-Item "$Root\frontend\.env.example" "$Root\frontend\.env.local"
}

Write-Host ""
Write-Host "=== Backend: install, database, seed ===" -ForegroundColor Cyan
Set-Location "$Root\backend"
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed in backend" }

if ($useSqlite) {
  $env:DATABASE_URL = "file:./data/bizops.db"
  npx prisma generate --schema $SchemaSqlite
  if ($LASTEXITCODE -ne 0) { throw "prisma generate (sqlite) failed" }
  npx prisma db push --schema $SchemaSqlite
  if ($LASTEXITCODE -ne 0) { throw "prisma db push failed" }
  npx tsx prisma/seed.ts
  if ($LASTEXITCODE -ne 0) { throw "seed failed" }
} else {
  npx prisma generate
  if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }
  npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }
  npx prisma db seed
  if ($LASTEXITCODE -ne 0) { throw "prisma db seed failed" }
}

Write-Host ""
Write-Host "=== Frontend: install ===" -ForegroundColor Cyan
Set-Location "$Root\frontend"
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed in frontend" }

Write-Host ""
Write-Host "=== Starting API and dashboard ===" -ForegroundColor Cyan
Set-Location $Root

$dbLabel = if ($useSqlite) { "SQLite" } else { "PostgreSQL" }
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\backend'; Write-Host 'BizOps API ($dbLabel) http://localhost:4000' -ForegroundColor Green; npm run start:dev"
)

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\frontend'; Write-Host 'BizOps UI http://localhost:3000' -ForegroundColor Green; npm run dev"
)

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  Dashboard : http://localhost:3000"
Write-Host "  API       : http://localhost:4000"
Write-Host "  Database  : $dbLabel"
Write-Host "  Login     : admin@bizops.local / Admin123!"
Write-Host ""
