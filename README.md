# Aeris Tech People Dashboard

A modern, responsive dashboard for managing Aeris Tech's people operations, including employee tracking and hiring management.

## Features

### 🏠 Dashboard Overview
- Real-time employee statistics
- Quick action buttons for navigation
- Performance metrics visualization
- Clean, modern interface

### 📊 Employee Tracking
- Filter employees by department and status
- View employee performance metrics
- Track employee activities and last login
- Status management (Active, Inactive, On Leave)

### 👥 Hiring Management
- Manage job openings and positions
- Track applicant applications
- View hiring pipeline status
- Recent applications monitoring

## Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Grid and Flexbox
- **JavaScript** - Interactive functionality and navigation
- **Font Awesome** - Icons and visual elements

## Getting Started

1. **Clone or download** the project files to your local machine
2. **Open `index.html`** in your web browser
3. **Navigate** through the dashboard using the sidebar menu

### Optional: Run via Local Static Server (Recommended)
While you can double‑click `index.html`, using the included lightweight Node server avoids certain browser security restrictions and lets you view logs.

1. Install Node.js (if not already installed) from https://nodejs.org
2. In this folder run:
	```powershell
	node server.js 58123
	```
	Then browse: http://127.0.0.1:58123/

### One-Command Smart Startup
Use the idempotent launcher (starts only if not already running):
```powershell
./start-dashboard.ps1 -Port 58123 -Open
```
Or the auto‑restart runner:
```powershell
./run-dashboard.ps1 -Port 58123 -Open
```

### What the Scripts Do
| Script | Purpose |
|--------|---------|
| `server.js` | Minimal static file server (no dependencies) |
| `run-dashboard.ps1` | Auto-restart wrapper; restarts if the server crashes |
| `start-dashboard.ps1` | Safe idempotent launcher (only starts a new instance if port free) |

### Quick Verification Commands
In a second PowerShell window (do not close the server window):
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 58123 | Select-Object -ExpandProperty TcpTestSucceeded
(Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:58123/).StatusCode
```
Expected: `True` and `200`.

### Startup at User Logon (Windows Task Scheduler)
1. Open Task Scheduler > Create Task.
2. General: Name = "Aeris Dashboard"; Run only when user is logged on.
3. Trigger: At log on (your user).
4. Action: Start a program.
	- Program/script: `powershell.exe`
	- Arguments: `-NoLogo -ExecutionPolicy Bypass -File "<full-path>\start-dashboard.ps1" -Port 58123 -Minimized -Open`
	- Start in: folder containing the script.
5. Save. Log off/on to confirm the browser tab opens and server logs appear in a minimized window.

### Minimal Fallback Test (If Troubleshooting)
```powershell
node -e "require('http').createServer((q,r)=>r.end('ok')).listen(58123,'0.0.0.0',()=>console.log('mini up'))"
```
Browse to http://127.0.0.1:58123/ and expect "ok". If that works but `server.js` does not, inspect console errors.

## File Structure

```
AerisPeopleDashboard/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Features Overview

### Navigation
- **Dashboard**: Overview of key metrics and quick actions
- **Tracking**: Employee monitoring and performance tracking
- **Hiring**: Job posting management and applicant tracking

### Responsive Design
- Mobile-friendly responsive layout
- Optimized for desktop, tablet, and mobile devices
- Clean grid-based design system

### Interactive Elements
- Hover effects on cards and buttons
- Smooth transitions and animations
- Dynamic section switching
- Real-time data simulation

## Keyboard Shortcuts

- `Alt + 1` - Switch to Dashboard
- `Alt + 2` - Switch to Tracking
- `Alt + 3` - Switch to Hiring
- `Alt + R` - Refresh dashboard data

## Customization

### Colors and Branding
The dashboard uses a modern color scheme with gradients. To customize:

1. Edit the CSS variables in `styles.css`
2. Update the gradient colors in the header and buttons
3. Modify the Aeris branding elements

### Adding New Sections
To add new dashboard sections:

1. Add a new menu item in the sidebar
2. Create a corresponding content section
3. Update the JavaScript navigation logic
4. Add styling for the new section

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] User authentication
- [ ] Role-based permissions
- [ ] Advanced analytics and reporting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is designed for Aeris Tech internal use.

## Support

For questions or support regarding the dashboard, please contact the development team.
