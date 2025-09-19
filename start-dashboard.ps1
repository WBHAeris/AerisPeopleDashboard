<#
start-dashboard.ps1
Idempotent launcher for Aeris People Dashboard.
- Checks if the configured port already has a listening Node process running server.js
- If not, starts it (optionally minimized) and writes a small status line.
- Can be safely invoked multiple times (e.g. at user logon via Task Scheduler).

Parameters:
  -Port <int>          Port to check/start (default 58123)
  -Open                Open browser on first successful start
  -Minimized           Start a separate PowerShell window minimized
  -UseRunner           Use run-dashboard.ps1 (auto-restart) instead of plain node server.js
  -LogFile <path>      Append server stdout/stderr to a log file (only for plain node mode)

Examples:
  ./start-dashboard.ps1
  ./start-dashboard.ps1 -Port 60000 -Open
  ./start-dashboard.ps1 -Minimized -Open -UseRunner
  ./start-dashboard.ps1 -LogFile "$env:LOCALAPPDATA/AerisDashboard/server.log"
#>
[CmdletBinding()]
param(
  [int]$Port = 58123,
  [switch]$Open,
  [switch]$Minimized,
  [switch]$UseRunner,
  [string]$LogFile
)

$ErrorActionPreference = 'Stop'

function Test-PortListening {
  param([int]$Port)
  $net = netstat -ano | Select-String ":$Port" | Where-Object { $_ -match 'LISTENING' }
  if (-not $net) { return $false }
  # Extract PID (last token)
  $listenerPid = ($net -split '\s+')[-1]
  try {
    $proc = Get-Process -Id $listenerPid -ErrorAction Stop
    if ($proc.ProcessName -match 'node') { return $true } else { return $false }
  } catch { return $false }
}

function Start-ServerPlain {
  param([int]$Port, [string]$LogFile, [switch]$Minimized)
  $launchCmd = "node server.js $Port"
  if ($LogFile) {
    $dir = Split-Path $LogFile -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    Write-Host "Logging to $LogFile" -ForegroundColor DarkCyan
    if ($Minimized) {
      Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoLogo -NoExit -Command $launchCmd *> '$LogFile'" | Out-Null
    } else {
      Start-Process powershell -ArgumentList "-NoLogo -NoExit -Command $launchCmd | Tee-Object -FilePath '$LogFile'" | Out-Null
    }
  } else {
    if ($Minimized) {
      Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoLogo -NoExit -Command $launchCmd" | Out-Null
    } else {
      Start-Process powershell -ArgumentList "-NoLogo -NoExit -Command $launchCmd" | Out-Null
    }
  }
}

function Start-ServerRunner {
  param([int]$Port, [switch]$Minimized, [switch]$Open)
  $cmd = "./run-dashboard.ps1 -Port $Port"
  if ($Open) { $cmd += ' -Open' }
  if ($Minimized) {
    Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoLogo -NoExit -Command $cmd" | Out-Null
  } else {
    Start-Process powershell -ArgumentList "-NoLogo -NoExit -Command $cmd" | Out-Null
  }
}

Write-Host "[start-dashboard] Checking port $Port..." -ForegroundColor Cyan
if (Test-PortListening -Port $Port) {
  Write-Host "Dashboard already running on http://127.0.0.1:$Port/ (node)" -ForegroundColor Green
  if ($Open) { Start-Process "http://127.0.0.1:$Port/" }
  exit 0
}

Write-Host "No existing server detected. Starting..." -ForegroundColor Yellow
if ($UseRunner) {
  Start-ServerRunner -Port $Port -Minimized:$Minimized -Open:$Open
} else {
  Start-ServerPlain -Port $Port -LogFile $LogFile -Minimized:$Minimized
  if ($Open) { Start-Sleep -Seconds 1; Start-Process "http://127.0.0.1:$Port/" }
}

# Post-check (simple wait & verify)
Start-Sleep -Seconds 2
if (Test-PortListening -Port $Port) {
  Write-Host "Dashboard started successfully on http://127.0.0.1:$Port/" -ForegroundColor Green
} else {
  Write-Warning "Startup attempt did not produce a listening node process. Check any spawned window for errors."}
