# Aeris People Dashboard – Localhost Quick Recovery Guide

Use this when the dashboard suddenly "refuses to connect" so you can recover fast.

---
## 1. Standard Start
Preferred (auto‑restart + optional auto‑open):
```powershell
./run-dashboard.ps1 -Port 58123 -Open
```
Manual:
```powershell
node server.js 58123
```
Keep this window open. Do NOT run verification commands in the same window.

---
## 2. Verification Window Commands
Open a second PowerShell window in the project folder:
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 58123 | Select-Object -ExpandProperty TcpTestSucceeded
(Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:58123/).StatusCode
```
Expected results: `True` and `200`.

If both are good, open (or refresh) your browser:
```
http://127.0.0.1:58123/
```

---
## 3. Fast Decision Tree
| Symptom | Check | Action |
|---------|-------|--------|
| Browser: ERR_CONNECTION_REFUSED | `Test-NetConnection` False | Server not running → (Re)start it. |
| Browser: Refused; Test True | Run `Invoke-WebRequest` | If non‑200, see status & logs. |
| 200 from Invoke-WebRequest but blank page | Press Ctrl+F5 | Clear cache; check DevTools Network. |
| Port busy (EADDRINUSE) on start | `netstat -ano | findstr :58123` | Another process on port → choose new port or kill PID. |
| Intermittent crashes | Watch server window / use run-dashboard.ps1 | Investigate last log line or add more logging. |

---
## 4. Minimal Fallback Server (Isolation Test)
If you suspect `server.js` itself has an issue:
```powershell
node -e "require('http').createServer((q,r)=>r.end('ok')).listen(58123,'0.0.0.0',()=>console.log('mini up'))"
```
Then browse: http://127.0.0.1:58123/  (Expect to see `ok`).
If this works while `server.js` does not, the problem is inside the static file logic.

---
## 5. Common Mistakes (Avoid These)
1. Typing a raw URL directly into PowerShell (e.g. `http://127.0.0.1:58123/`) – PowerShell treats it as invalid syntax.
2. Missing or extra parentheses: must be `(Invoke-WebRequest ...).StatusCode` for single‑line.
3. Truncating `.StatusCode` to `.StatusCod`.
4. Starting server then immediately reusing the same window for tests (accidental Ctrl+C or new command kills server).
5. Typos in file name (e.g. `srever.js`).
6. Confusing which port you actually started (banner always shows the real one).

---
## 6. Reading the New Request Logs
Each request line (after enhancement) looks like:
```
2025-09-19T14:12:33.512Z ::1 "GET /index.html" 200 OK 4ms
```
- `::1` = IPv6 loopback (localhost). Your LAN IP will appear for remote devices.
- Status >=400 prints as warn; >=500 prints as error.

---
## 7. Port / Process Inspection
```powershell
# Show any listener on 58123
netstat -ano | findstr :58123

# If you see a LISTENING line, note the PID (last column), then:
Get-Process -Id <PID>
```
To free a stuck port (after verifying it's safe):
```powershell
Stop-Process -Id <PID>
```

---
## 8. Firewall / External Access (Only If Remote Fails)
If remote device on same LAN can’t connect via `http://<your-IP>:58123/`:
1. Ensure you started with host binding 0.0.0.0 (our `server.js` already does this).
2. Temporarily test Windows firewall rule:
```powershell
# Should show LISTENING
netstat -ano | findstr :58123
```
3. If remote still fails but local works, create an inbound firewall rule for the chosen port (Windows Defender Firewall > Advanced Settings) or change to a commonly allowed port (e.g. 8081, 8888).

---
## 9. Quick Recovery Script Pattern
If you want a one-off test on a new random high port:
```powershell
$port = Get-Random -Minimum 50000 -Maximum 59999
node server.js $port
```
Then browse: http://127.0.0.1:$port/

---
## 10. When to Escalate
Gather this info before asking for help:
- Command you used to start server
- Exact port
- Output of: `Test-NetConnection -ComputerName 127.0.0.1 -Port <port> | Select -ExpandProperty TcpTestSucceeded`
- Output of: `(Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:<port>/).StatusCode`
- First 3 and any red (error) log lines from the server window

---
## 11. TL;DR One Screen Cheatsheet
Start:
```powershell
./run-dashboard.ps1 -Port 58123 -Open
```
Verify:
```powershell
Test-NetConnection 127.0.0.1 -Port 58123 | Select -ExpandProperty TcpTestSucceeded
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:58123/).StatusCode
```
If refused → restart server. If True + 200 but still blank → hard refresh & check logs.

---
Commit this file so it’s always in the repo. Feel free to extend as workflow evolves.
