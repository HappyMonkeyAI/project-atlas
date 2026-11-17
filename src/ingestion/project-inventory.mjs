import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const safePath = /^[A-Za-z0-9_./~:-]+$/;

function resolveAllowedHosts(policy) {
  const fromPolicy = Array.isArray(policy?.hosts) ? policy.hosts : [];
  const fromEnv = String(process.env.ATLAS_INVENTORY_HOSTS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  return new Set(['local', ...fromPolicy, ...fromEnv]);
}

export function validateInventorySource(source, policy) {
  if (!source?.id || !source.host || !source.path) throw new Error('Inventory source requires id, host, and path');
  const allowedHosts = resolveAllowedHosts(policy);
  if (!allowedHosts.has(source.host)) throw new Error('unsupported inventory host: ' + source.host);
  if (!safePath.test(source.path) || source.path.includes('..') || source.path === '.') {
    throw new Error('unsafe repository path: ' + source.path);
  }
  return source;
}

export function parseGitStatus(output) {
  const lines = String(output || '').split(/\r?\n/).filter(Boolean);
  return { dirty: lines.length > 0, dirtyCount: lines.length };
}

export function classifyInventoryState(record, now = new Date()) {
  if (record.status === 'error') return 'inspection-error';
  const detached = !record.branch || record.branch === '(detached)';
  const commitTime = record.lastCommit?.date ? Date.parse(record.lastCommit.date + 'T00:00:00Z') : NaN;
  const stale = Number.isFinite(commitTime) && now.getTime() - commitTime > 30 * 24 * 60 * 60 * 1000;
  const tree = record.dirty ? 'dirty' : 'clean';
  if (stale && detached) return 'stale-detached';
  if (stale) return 'stale';
  if (detached) return 'detached';
  return tree;
}

export function normalizeInventoryRecord(record) {
  const normalized = {
    id: record.id,
    kind: 'project-inventory',
    host: record.host,
    path: record.path,
    branch: record.branch || '(detached)',
    revision: record.revision || null,
    remote: record.remote || null,
    dirty: Boolean(record.dirty),
    dirtyCount: record.dirtyCount || 0,
    lastCommit: record.lastCommit || null
  };
  if (record.label) normalized.label = record.label;
  return normalized;
}

async function runGit(source, args) {
  if (source.host === 'local') return execFileAsync('git', ['-C', source.path, ...args], { timeout: 10000, windowsHide: true });
  const sshUser = source.sshUser || process.env.ATLAS_INVENTORY_SSH_USER;
  if (!sshUser) throw new Error('Remote inventory requires source.sshUser or ATLAS_INVENTORY_SSH_USER');
  return execFileAsync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', sshUser + '@' + source.host, 'git', '-C', source.path, ...args], { timeout: 15000, windowsHide: true });
}

async function readGitValue(source, args) {
  try { const result = await runGit(source, args); return result.stdout.trim(); } catch { return ''; }
}

export async function inspectProject(source, policy) {
  validateInventorySource(source, policy);
  const root = await readGitValue(source, ['rev-parse', '--show-toplevel']);
  if (!root) return { id: source.id, label: source.label, kind: 'project-inventory', host: source.host, path: source.path, status: 'error', state: 'inspection-error', error: 'Repository could not be inspected' };
  const [branch, revision, remote, commit, statusOutput] = await Promise.all([
    readGitValue(source, ['branch', '--show-current']),
    readGitValue(source, ['rev-parse', '--short', 'HEAD']),
    readGitValue(source, ['remote', 'get-url', 'origin']),
    readGitValue(source, ['log', '-1', '--format=%h%x09%ad%x09%s', '--date=short']),
    readGitValue(source, ['status', '--porcelain'])
  ]);
  const [commitRevision, commitDate, ...subjectParts] = commit.split('\t');
  return {
    ...normalizeInventoryRecord({ id: source.id, label: source.label, host: source.host, path: source.path, branch, revision, remote, ...parseGitStatus(statusOutput), lastCommit: commit ? { revision: commitRevision, date: commitDate, subject: subjectParts.join('\t').slice(0, 180) } : null }),
    status: 'ok',
    state: classifyInventoryState({ status: 'ok', branch, dirty: parseGitStatus(statusOutput).dirty, lastCommit: commit ? { date: commitDate } : null }),
    scannedAt: new Date().toISOString()
  };
}

export async function inspectInventory(sources, policy) {
  if (!Array.isArray(sources)) throw new Error('Inventory sources must be an array');
  return Promise.all(sources.map(source => inspectProject(source, policy)));
}
