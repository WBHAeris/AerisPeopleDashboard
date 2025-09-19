// Minimal static server (no external dependencies)
// Usage: node server.js [port]
// Default port: 3000

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2], 10) || 3000;
const root = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(res, status, body, headers={}) {
  res.writeHead(status, Object.assign({'Cache-Control': 'no-cache'}, headers));
  res.end(body);
}

const server = http.createServer((req, res) => {
  const start = Date.now();
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(root, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    logRequest(req, 403, start, 'FORBIDDEN');
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      logRequest(req, 404, start, 'MISS');
      return send(res, 404, 'Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        logRequest(req, 500, start, 'ERROR');
        return send(res, 500, 'Server Error');
      }
      logRequest(req, 200, start, 'OK');
      send(res, 200, data, {'Content-Type': type});
    });
  });
});

function logRequest(req, status, start, tag) {
  const ms = Date.now() - start;
  const line = `${new Date().toISOString()} ${req.socket.remoteAddress} "${req.method} ${req.url}" ${status} ${tag} ${ms}ms`;
  if (status >= 500) {
    console.error(line);
  } else if (status >= 400) {
    console.warn(line);
  } else {
    console.log(line);
  }
}

const host = '0.0.0.0'; // Bind all interfaces for compatibility (localhost + LAN)
server.listen(port, host, () => {
  console.log('============================');
  console.log(' AERIS DASHBOARD STATIC SERVER');
  console.log('============================');
  console.log(`Listening on: http://127.0.0.1:${port}/`);
  console.log(`If remote/LAN needed try:   http://<your-IP>:${port}/`);
  console.log('Press CTRL+C to stop');
  try {
    const os = require('os');
    const ifaces = os.networkInterfaces();
    Object.values(ifaces).flat().filter(i => i && i.family === 'IPv4' && !i.internal).forEach(i => {
      console.log(`Interface ${i.address} -> http://${i.address}:${port}/`);
    });
  } catch {}
});

server.on('error', (e) => {
  console.error('Server error:', e.message);
});
