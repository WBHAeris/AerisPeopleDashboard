param(
  [int]$Port = 5500,
  [string]$Path = '/index.html'
)

Write-Host "=== Aeris Localhost Diagnostic ===" -ForegroundColor Cyan
Write-Host ("Testing http://127.0.0.1:{0}{1}" -f $Port,$Path)

$result = [ordered]@{}

# Node version (if present)
try { $result.NodeVersion = (node -v) } catch { $result.NodeVersion = 'Node not found' }

# Port test
$tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue
$result.TcpTestSucceeded = $tcp.TcpTestSucceeded
$result.InterfaceAlias = $tcp.InterfaceAlias
$result.SourceAddress = $tcp.SourceAddress

# Process owning port (if listening)
try {
  $procId = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  if($procId){
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $result.PortProcess = if($p){"{0} (PID {1})" -f $p.ProcessName,$p.Id}else{"PID $procId (process info unavailable)"}
  } else {
    $result.PortProcess = 'No listening process'
  }
} catch { $result.PortProcess = 'Error retrieving process' }

# Hosts file entry
try {
  $hostsLine = Get-Content "$env:WINDIR\System32\drivers\etc\hosts" | Select-String -Pattern '^\s*127\.0\.0\.1\s+localhost' -SimpleMatch
  $result.HostsEntry = if($hostsLine){'Present'} else {'Missing (should add 127.0.0.1 localhost)'}
} catch { $result.HostsEntry = 'Could not read hosts file' }

# HTTP request
try {
  $url = "http://127.0.0.1:$Port$Path"
  $resp = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5
  $result.StatusCode = $resp.StatusCode
  $result.ContentLength = ($resp.RawContentLength)
} catch {
  $result.StatusCode = 'FAILED'
  $result.HttpError = $_.Exception.Message
}

# Summary logic
Write-Host "\n--- Results ---" -ForegroundColor Yellow
$result.GetEnumerator() | ForEach-Object { Write-Host ("{0}: {1}" -f $_.Key,$_.Value) }

Write-Host "\n--- Analysis ---" -ForegroundColor Yellow
if(-not $result.TcpTestSucceeded){
  Write-Host "Port $Port is not listening. Start the server: node server.js $Port" -ForegroundColor Red
} elseif($result.StatusCode -eq 'FAILED'){
  Write-Host "TCP open but HTTP failed: $($result.HttpError)" -ForegroundColor Red
} elseif($result.StatusCode -eq 200){
  Write-Host "Success: Dashboard responding (HTTP 200)." -ForegroundColor Green
} else {
  Write-Host "Unexpected HTTP status: $($result.StatusCode)" -ForegroundColor DarkYellow
}

if($result.HostsEntry -notlike 'Present'){
  Write-Host "Hosts file missing localhost entry; add: 127.0.0.1    localhost" -ForegroundColor DarkYellow
}

Write-Host "\nDone." -ForegroundColor Cyan
