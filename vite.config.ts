import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'snapshot.json');
const SEED_FILE = path.join(DATA_DIR, 'snapshot.seed.json');

function ensureSnapshotExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SNAPSHOT_FILE) && fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, SNAPSHOT_FILE);
  }
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function attachSnapshotMiddleware(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) {
  middlewares.use(async (req, res, next) => {
    const urlPath = (req.url || '').split('?')[0];

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
      } catch (err: any) {
        sendJson(res, 500, { error: err?.message || 'Gagal membaca data/snapshot.json' });
      }
      return;
    }

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

        // Atomic write via temp file to prevent partial JSON corruption
        const tempFile = `${SNAPSHOT_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(updatedSnapshot, null, 2) + '\n', 'utf-8');
        fs.renameSync(tempFile, SNAPSHOT_FILE);

        sendJson(res, 200, { ok: true, meta: updatedSnapshot.meta });
      } catch (err: any) {
        sendJson(res, 500, { error: err?.message || 'Gagal menyimpan data/snapshot.json' });
      }
      return;
    }

    if (urlPath === '/api/snapshot/reset' && req.method === 'POST') {
      try {
        if (!fs.existsSync(SEED_FILE)) {
          sendJson(res, 404, { error: 'File data/snapshot.seed.json tidak ditemukan.' });
          return;
        }
        const seedRaw = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
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
      } catch (err: any) {
        sendJson(res, 500, { error: err?.message || 'Gagal mereset snapshot' });
      }
      return;
    }

    next();
  });
}

function jsonSnapshotApiPlugin(): Plugin {
  return {
    name: 'json-snapshot-api',
    configureServer(server) {
      attachSnapshotMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachSnapshotMiddleware(server.middlewares);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonSnapshotApiPlugin()],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/data/snapshot.json', '**/data/snapshot.json.tmp']
    }
  }
});
