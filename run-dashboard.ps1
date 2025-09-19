<#
Run the Aeris People Dashboard static server with logging & auto-restart.
Usage examples:
  ./run-dashboard.ps1              # default port 3000
  ./run-dashboard.ps1 -Port 58123  # custom port
  ./run-dashboard.ps1 -Port 58123 -Open
#>
param(
  [int]$Port = 3000,
  [switch]$Open
)

Write-Host "Starting Aeris Dashboard on port $Port ..." -ForegroundColor Cyan

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error 'Node.js runtime (node) not found in PATH.'; exit 1 }

$script:restartCount = 0

while ($true) {
  $startTime = Get-Date
  Write-Host "[RUN] $(Get-Date -Format o) launching server.js (restart #$script:restartCount)" -ForegroundColor Yellow
  $proc = Start-Process node -ArgumentList "server.js", $Port -PassThru -NoNewWindow

  if ($Open -and $script:restartCount -eq 0) {
    Start-Sleep -Seconds 1
    Start-Process "http://127.0.0.1:$Port/"
  }

  Wait-Process $proc.Id
  $exitCode = $proc.ExitCode
  $uptime = (Get-Date) - $startTime
  Write-Warning "server.js exited (code=$exitCode, uptime=$([int]$uptime.TotalSeconds)s)"
  $script:restartCount++
  Start-Sleep -Seconds 1
}
