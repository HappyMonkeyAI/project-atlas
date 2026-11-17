import { access, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspectGitHubSource } from './src/ingestion/github.mjs';
import { inspectVault, deriveVaultCandidates } from './src/ingestion/vault.mjs';
import { discoverLocalModel } from './src/model-adapters/openai-compatible.mjs';
import { inspectInventory } from './src/ingestion/project-inventory.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8'
};
const manifestPath = join(root, 'data', 'source-manifest.json');
const inventoryManifestPath = join(root, 'data', 'project-inventory.json');
const inventoryLocalPath = join(root, 'data', 'project-inventory.local.json');

try {
  await access(new URL('./graph.local.js', import.meta.url));
  await import(pathToFileURL(join(root, 'graph.local.js')).href);
} catch {
  // optional private seed overlay
}
await import('./graph.js');

async function jsonResponse(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

async function readInventoryManifest() {
  try {
    await access(inventoryLocalPath);
    return JSON.parse(await readFile(inventoryLocalPath, 'utf8'));
  } catch {
    return JSON.parse(await readFile(inventoryManifestPath, 'utf8'));
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/health') return jsonResponse(res, 200, { ok: true, service: 'project-atlas', time: new Date().toISOString() });
  if (url.pathname === '/api/model/health') {
    try { return jsonResponse(res, 200, await discoverLocalModel()); }
    catch (error) { return jsonResponse(res, 502, { reachable: false, error: error.message }); }
  }
  if (url.pathname === '/api/graph') return jsonResponse(res, 200, { ...globalThis.__atlasGraph, apiVersion: '1' });
  if (url.pathname === '/api/source-manifest') {
    try { return jsonResponse(res, 200, JSON.parse(await readFile(manifestPath, 'utf8'))); }
    catch (error) { return jsonResponse(res, 500, { ok: false, error: error.message }); }
  }
  if (url.pathname === '/api/inventory') {
    try {
      const manifest = await readInventoryManifest();
      const requested = url.searchParams.get('source');
      const sources = requested ? manifest.sources.filter(source => source.id === requested) : manifest.sources;
      if (requested && !sources.length) return jsonResponse(res, 404, { ok: false, error: 'Unknown inventory source' });
      return jsonResponse(res, 200, { version: manifest.version, policy: manifest.policy, results: await inspectInventory(sources, manifest.policy) });
    } catch (error) { return jsonResponse(res, 500, { ok: false, error: error.message }); }
  }
  if (url.pathname === '/api/github/inspect') {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      const source = manifest.sources.find(item => item.id === url.searchParams.get('source') && item.kind === 'github-repository');
      if (!source) return jsonResponse(res, 404, { ok: false, error: 'Unknown GitHub source' });
      return jsonResponse(res, 200, await inspectGitHubSource(source));
    } catch (error) { return jsonResponse(res, 502, { ok: false, error: error.message }); }
  }
  if (url.pathname === '/api/vault/inspect') {
    try {
      const scan = await inspectVault(url.searchParams.get('path'), {
        includeFolders: url.searchParams.getAll('includeFolder'),
        excludeFolders: url.searchParams.getAll('excludeFolder'),
        includeNotes: url.searchParams.getAll('includeNote')
      });
      return jsonResponse(res, 200, { ...scan, candidates: deriveVaultCandidates(scan) });
    } catch (error) { return jsonResponse(res, 400, { ok: false, error: error.message }); }
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = normalize(join(root, requested));
  const rootPrefix = root.endsWith(sep) ? root : root + sep;
  if (file !== root && !file.startsWith(rootPrefix)) { res.writeHead(403); res.end('Forbidden'); return; }

  if (requested === '/graph.local.js') {
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime['.js'] });
      res.end(body);
    } catch {
      res.writeHead(200, { 'Content-Type': mime['.js'] });
      res.end('/* no local Atlas seed overlay */\n');
    }
    return;
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log('Project Atlas running at http://localhost:' + port));
