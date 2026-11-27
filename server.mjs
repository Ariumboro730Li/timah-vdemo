import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'snapshot.json');
const SEED_CANDIDATES = [
  path.join(DATA_DIR, 'snapshot.seed.json'),
  path.join(ROOT_DIR, 'seed', 'snapshot.seed.json')
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function findSeedFile() {
  for (const candidate of SEED_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function ensureSnapshotExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const seedFile = findSeedFile();
  if (!fs.existsSync(SNAPSHOT_FILE) && seedFile) {
    fs.copyFileSync(seedFile, SNAPSHOT_FILE);
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, isAsset = false) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader(
    'Cache-Control',
    isAsset ? 'public, max-age=31536000, immutable' : 'no-cache'
  );
  fs.createReadStream(filePath).pipe(res);
}

export async function handleRequest(req, res) {
  const rawUrl = req.url || '/';
  const urlPath = decodeURIComponent(rawUrl.split('?')[0]);

  // Healthcheck endpoint
  if (urlPath === '/api/health' && req.method === 'GET') {
    ensureSnapshotExists();
    sendJson(res, 200, {
      ok: true,
      port: PORT,
      snapshotReady: fs.existsSync(SNAPSHOT_FILE)
    });
    return;
  }

  // Live Snapshot API — GET
  if (urlPath === '/api/snapshot' && req.method === 'GET') {
    try {
      ensureSnapshotExists();
      if (!fs.existsSync(SNAPSHOT_FILE)) {
        sendJson(res, 404, { error: 'File data/snapshot.json belum tersedia.' });
        return;
      }
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(raw);
    } catch (err) {
      sendJson(res, 500, { error: err?.message || 'Gagal membaca data/snapshot.json' });
    }
    return;
  }

  // Live Snapshot API — PUT / POST
  if (urlPath === '/api/snapshot' && (req.method === 'PUT' || req.method === 'POST')) {
    try {
      ensureSnapshotExists();
      const bodyText = await readRequestBody(req);
      const parsed = JSON.parse(bodyText);

      let currentRevision = 0;
      if (fs.existsSync(SNAPSHOT_FILE)) {
        try {
          const existing = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf-8'));
          currentRevision = Number(existing?.meta?.revision || 0);
        } catch {
          currentRevision = 0;
        }
      }

      const nextRevision = Math.max(currentRevision + 1, Number(parsed?.meta?.revision || 0));
      const updatedSnapshot = {
        ...parsed,
        meta: {
          version: parsed?.meta?.version || '1.0.0',
          revision: nextRevision,
          updatedAt: new Date().toISOString(),
          lastOperation: parsed?.meta?.lastOperation || 'Pembaruan data'
        }
      };

      const tempFile = `${SNAPSHOT_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(updatedSnapshot, null, 2) + '\n', 'utf-8');
      fs.renameSync(tempFile, SNAPSHOT_FILE);

      sendJson(res, 200, { ok: true, meta: updatedSnapshot.meta });
    } catch (err) {
      sendJson(res, 500, { error: err?.message || 'Gagal menyimpan data/snapshot.json' });
    }
    return;
  }

  // Live Snapshot API — Reset to seed
  if (urlPath === '/api/snapshot/reset' && req.method === 'POST') {
    try {
      const seedFile = findSeedFile();
      if (!seedFile) {
        sendJson(res, 404, { error: 'File snapshot.seed.json tidak ditemukan.' });
        return;
      }
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const seedRaw = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
      const resetSnapshot = {
        ...seedRaw,
        meta: {
          version: seedRaw?.meta?.version || '1.0.0',
          revision: 1,
          updatedAt: new Date().toISOString(),
          lastOperation: 'Reset snapshot ke data awal (seed)'
        }
      };
      const tempFile = `${SNAPSHOT_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(resetSnapshot, null, 2) + '\n', 'utf-8');
      fs.renameSync(tempFile, SNAPSHOT_FILE);

      sendJson(res, 200, resetSnapshot);
    } catch (err) {
      sendJson(res, 500, { error: err?.message || 'Gagal mereset snapshot' });
    }
    return;
  }

  // Static files in dist/
  if (req.method === 'GET' || req.method === 'HEAD') {
    const safeRelative = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const candidatePath = path.join(DIST_DIR, safeRelative === '/' ? 'index.html' : safeRelative);

    if (
      candidatePath.startsWith(DIST_DIR) &&
      fs.existsSync(candidatePath) &&
      fs.statSync(candidatePath).isFile()
    ) {
      serveFile(res, candidatePath, urlPath.startsWith('/assets/'));
      return;
    }

    // SPA History API fallback (e.g. /dashboard, /program-flagship, /seleksi-proposal)
    const indexHtml = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      serveFile(res, indexHtml, false);
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not Found');
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  ensureSnapshotExists();
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('Unhandled request error:', err);
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'Internal Server Error' });
      }
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`CSR TJSL PT Timah server listening on http://${HOST}:${PORT}`);
  });
}
