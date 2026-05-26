<#
.SYNOPSIS
    Automation and management script for the Akshara World Codebase Knowledge Graph.
.DESCRIPTION
    Installs, builds, watches, and visualizes the local-first code-review-graph.
.PARAMETER Action
    The action to execute: Install, Build, Update, Watch, Status, Visualize, Wiki. Default is 'Status'.
.EXAMPLE
    .\scripts\setup-graph.ps1 -Action Build
#>
param (
    [ValidateSet('Install', 'Build', 'Update', 'Watch', 'Status', 'Visualize', 'Wiki')]
    [string]$Action = 'Status'
)

$ExecutablePath = "$env:USERPROFILE\AppData\Roaming\Python\Python314\Scripts\code-review-graph.exe"

# Utility: Verify Python and Pip are installed
function Assert-PythonAvailable {
    try {
        $null = python --version
        $null = pip --version
    } catch {
        Write-Error "Python or pip is not available on PATH. Please verify your Python installation."
        exit 1
    }
}

# Utility: Verify executable exists or install if missing
function Assert-ToolInstalled {
    if (-not (Test-Path $ExecutablePath)) {
        Write-Host "Code-Review-Graph not found. Installing..." -ForegroundColor Cyan
        Assert-PythonAvailable
        pip install --user code-review-graph
        if (-not (Test-Path $ExecutablePath)) {
            Write-Error "Failed to locate code-review-graph after installation. Check Python scripts path."
            exit 1
        }
        Write-Host "Successfully installed!" -ForegroundColor Green
    }
}

# Ensure tool is ready
Assert-ToolInstalled

switch ($Action) {
    'Install' {
        Write-Host "Registering code-review-graph..." -ForegroundColor Cyan
        & $ExecutablePath install
    }
    'Build' {
        Write-Host "Building complete repository knowledge graph..." -ForegroundColor Cyan
        & $ExecutablePath build
    }
    'Update' {
        Write-Host "Running incremental graph update..." -ForegroundColor Cyan
        & $ExecutablePath update
    }
    'Watch' {
        Write-Host "Starting watch mode... Press Ctrl+C to stop." -ForegroundColor Cyan
        & $ExecutablePath watch
    }
    'Status' {
        Write-Host "Retrieving repository knowledge graph status..." -ForegroundColor Cyan
        & $ExecutablePath status
    }
    'Visualize' {
        Write-Host "Generating interactive HTML graph visualization..." -ForegroundColor Cyan
        & $ExecutablePath visualize
    }
    'Wiki' {
        Write-Host "Generating markdown-based repository wiki..." -ForegroundColor Cyan
        & $ExecutablePath wiki
    }
}
