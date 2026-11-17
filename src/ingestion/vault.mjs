import { open, readdir, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

const allowedExtensions = new Set(['.md', '.mdx']);

async function walk(root, current, files, limit) {
  if (files.length >= limit) return;
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (files.length >= limit) break;
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) await walk(root, fullPath, files, limit);
    else if (allowedExtensions.has(extname(entry.name).toLowerCase())) files.push(fullPath);
  }
}

function matchesFolder(relativePath, folders = []) {
  if (!folders.length) return true;
  const normalized = relativePath.replaceAll('\\', '/');
  return folders.some(folder => {
    const candidate = String(folder).replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    return !candidate || normalized === candidate || normalized.startsWith(candidate + '/');
  });
}

function headingsAndTags(text) {
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].slice(0, 30).map(match => match[1].trim());
  const tags = [...text.matchAll(/(?:^|\s)#([a-zA-Z0-9_-]+)/g)].slice(0, 30).map(match => match[1]);
  return { headings, tags: [...new Set(tags)] };
}

export async function inspectVault(rootPath, options = {}) {
  if (!rootPath) throw new Error('A vault path must be confirmed before indexing.');
  try {
    const rootInfo = await stat(rootPath);
    if (!rootInfo.isDirectory()) throw new Error('Vault path is not a directory.');
    const files = [];
    await walk(rootPath, rootPath, files, options.limit || 500);
    const notes = [];
    for (const filePath of files) {
      const relativePath = relative(rootPath, filePath).replaceAll('\\', '/');
      if (options.includeFolders?.length && !matchesFolder(relativePath, options.includeFolders)) continue;
      if (options.excludeFolders?.length && matchesFolder(relativePath, options.excludeFolders)) continue;
      if (options.includeNotes?.length && !options.includeNotes.includes(relativePath)) continue;
      const info = await stat(filePath);
      const handle = await open(filePath, 'r');
      const buffer = Buffer.alloc(16000);
      let readResult;
      try { readResult = await handle.read(buffer, 0, buffer.length, 0); }
      finally { await handle.close(); }
      const metadata = headingsAndTags(buffer.toString('utf8', 0, readResult.bytesRead));
      notes.push({ path: relativePath, size: info.size, modifiedAt: info.mtime.toISOString(), headings: metadata.headings, tags: metadata.tags });
    }
    return { root: rootPath, mode: 'metadata-only', noteCount: notes.length, notes, filters: { includeFolders: options.includeFolders || [], excludeFolders: options.excludeFolders || [], includeNotes: options.includeNotes || [] }, bodyContentIncluded: false, scannedAt: new Date().toISOString() };
  } catch (error) {
    if (error.message === 'Vault path is not a directory.') throw error;
    const code = /^[A-Z0-9_]+$/.test(String(error.code || '')) ? error.code : 'UNKNOWN';
    throw new Error('Vault inspection failed (' + code + ').');
  }
}

export function deriveVaultCandidates(scan, options = {}) {
  const tagCounts = new Map();
  const headingCounts = new Map();
  for (const note of scan.notes || []) {
    for (const tag of note.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    for (const heading of note.headings || []) headingCounts.set(heading, (headingCounts.get(heading) || 0) + 1);
  }
  const minimum = options.minimumOccurrences || 2;
  const tags = [...tagCounts.entries()].filter(([, count]) => count >= minimum).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const headings = [...headingCounts.entries()].filter(([, count]) => count >= minimum).sort((a, b) => b[1] - a[1]).slice(0, 12);
  return { source: scan.root, mode: 'metadata-only', candidates: [...tags.map(([tag, count]) => ({ id: 'vault-tag-' + tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'), kind: 'idea', title: tag + ' theme', tags: [tag], evidenceCount: count, confidence: Math.min(0.85, 0.45 + count * 0.05), provenance: { source: scan.root, metadata: 'explicit tag' } })), ...headings.map(([heading, count]) => ({ id: 'vault-heading-' + heading.toLowerCase().replace(/[^a-z0-9]+/g, '-'), kind: 'capability', title: heading, tags: [], evidenceCount: count, confidence: Math.min(0.8, 0.4 + count * 0.05), provenance: { source: scan.root, metadata: 'repeated heading' } }))] };
}
