import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './server/api-router.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env loader
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Route API requests
  if (pathname.startsWith('/api/')) {
    try {
      // Build standard web Request from Node IncomingMessage
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = chunks.length ? Buffer.concat(chunks) : null;

      const webReq = new Request(urlObj.toString(), {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : body,
      });

      const webRes = await handleApiRequest(webReq);

      res.statusCode = webRes.status;
      webRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });

      const arrayBuf = await webRes.arrayBuffer();
      res.end(Buffer.from(arrayBuf));
      return;
    } catch (err) {
      console.error('API Error in dev server:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
      return;
    }
  }

  // Route static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try appending .html
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('File Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Trade-in Reconciliation Server running at: http://localhost:${PORT}`);
  console.log(`   - Main Application:  http://localhost:${PORT}/`);
  console.log(`   - Admin Dashboard:   http://localhost:${PORT}/admin.html`);
  console.log(`   - API Endpoint:      http://localhost:${PORT}/api/config\n`);
});

