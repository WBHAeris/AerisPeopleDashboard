param(
  [int]$Port = 3000,
  [switch]$Once,
  [switch]$PythonFallback
)

Write-Host "=== Aeris People Dashboard Serve Script ===" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Yellow

function Test-PortFree {
  param([int]$Port)
  $inUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
  return -not $inUse
}

function Free-Port {
  param([int]$Port)
  $procs = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  if($procs){
    Write-Host "Killing processes on port $Port: $procs" -ForegroundColor Red
    foreach($p in $procs){
      try { Stop-Process -Id $p -Force -ErrorAction Stop } catch { Write-Warning "Could not kill PID $p: $_" }
    }
  }
}

if(-not (Test-PortFree -Port $Port)){
  Free-Port -Port $Port
  Start-Sleep 1
}

# Ensure http-server is available
$httpServerCmd = "npx http-server -p $Port --cors --log-ip"

function Start-HttpServer {
  param([int]$Port)
  Write-Host "Starting http-server on port $Port..." -ForegroundColor Green
  Start-Process -FilePath "powershell" -ArgumentList "-NoLogo","-NoProfile","-Command","$httpServerCmd" -WindowStyle Normal
}

function Start-PythonServer {
  param([int]$Port)
  Write-Host "Starting Python http.server on port $Port..." -ForegroundColor Green
  Start-Process -FilePath "powershell" -ArgumentList "-NoLogo","-NoProfile","-Command","python -m http.server $Port" -WindowStyle Normal
}

if($Once){
  if($PythonFallback){ Start-PythonServer -Port $Port } else { Start-HttpServer -Port $Port }
  Write-Host "Server started (single run)." -ForegroundColor Cyan
  exit 0
}

# Monitor loop
$attempt = 0
while($true){
  $attempt++
  if($PythonFallback){ Start-PythonServer -Port $Port } else { Start-HttpServer -Port $Port }
  Write-Host "Launched attempt #$attempt. Waiting 5s to probe..." -ForegroundColor DarkCyan
  Start-Sleep 5
  try {
    $resp = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:$Port/index.html -TimeoutSec 5
    if($resp.StatusCode -eq 200){
      Write-Host "Dashboard reachable at http://127.0.0.1:$Port/ (CTRL+C this window to stop monitoring)." -ForegroundColor Green
      # Passive wait; detect if process exits
      while($true){
        Start-Sleep 3
        $ok = (Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue).TcpTestSucceeded
        if(-not $ok){
          Write-Warning "Server stopped responding; restarting..."
          break
        }
      }
    } else {
      Write-Warning "Non-200 status ($($resp.StatusCode)). Restarting..."
    }
  } catch {
    Write-Warning "Probe failed ($_). Restarting in 3s..."
    Start-Sleep 3
  }
}
