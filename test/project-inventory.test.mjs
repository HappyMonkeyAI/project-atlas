import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyInventoryState, parseGitStatus, normalizeInventoryRecord, validateInventorySource } from '../src/ingestion/project-inventory.mjs';

const lanPolicy = { hosts: ['192.0.2.10'] };

test('inventory source validation only permits explicit repository targets', () => {
  assert.doesNotThrow(() => validateInventorySource({ id: 'atlas', host: 'local', path: 'C:/Atlas' }));
  assert.doesNotThrow(() => validateInventorySource({ id: 'remote', host: '192.0.2.10', path: '/home/user/projects/example' }, lanPolicy));
  assert.throws(() => validateInventorySource({ id: 'bad', host: '192.0.2.10', path: '/home/user/projects/example; cat .env' }, lanPolicy), /unsafe repository path/);
  assert.throws(() => validateInventorySource({ id: 'cwd', host: 'local', path: '.' }), /unsafe repository path/);
  assert.throws(() => validateInventorySource({ id: 'bad', host: 'example.com', path: '/tmp/repo' }, lanPolicy), /unsupported inventory host/);
  assert.throws(() => validateInventorySource({ id: 'denied', host: '192.0.2.10', path: '/home/user/projects/example' }), /unsupported inventory host/);
});

test('inventory parser keeps status metadata without exposing command output', () => {
  const status = parseGitStatus(' M src/app.js\n?? scratch.txt\n');
  assert.deepEqual(status, { dirty: true, dirtyCount: 2 });
  const record = normalizeInventoryRecord({
    id: 'remote', host: '192.0.2.10', path: '/home/user/projects/example', branch: 'main',
    revision: 'abc1234', remote: 'https://github.com/example/repo.git', dirty: status.dirty,
    dirtyCount: status.dirtyCount, lastCommit: { revision: 'abc1234', date: '2026-09-10', subject: 'add inventory' }
  });
  assert.deepEqual(record, {
    id: 'remote', kind: 'project-inventory', host: '192.0.2.10', path: '/home/user/projects/example',
    branch: 'main', revision: 'abc1234', remote: 'https://github.com/example/repo.git', dirty: true,
    dirtyCount: 2, lastCommit: { revision: 'abc1234', date: '2026-09-10', subject: 'add inventory' }
  });
  assert.equal('output' in record, false);
  assert.equal(normalizeInventoryRecord({ id: 'labeled', label: 'Example project', host: 'local', path: 'C:/Atlas' }).label, 'Example project');
});

test('inventory state distinguishes tree, branch, age, and inspection failures', () => {
  const now = new Date('2026-09-10T12:00:00Z');
  assert.equal(classifyInventoryState({ status: 'ok', branch: 'main', dirty: false, lastCommit: { date: '2026-09-09' } }, now), 'clean');
  assert.equal(classifyInventoryState({ status: 'ok', branch: 'main', dirty: true, lastCommit: { date: '2026-09-09' } }, now), 'dirty');
  assert.equal(classifyInventoryState({ status: 'ok', branch: '', dirty: false, lastCommit: { date: '2026-09-09' } }, now), 'detached');
  assert.equal(classifyInventoryState({ status: 'ok', branch: 'main', dirty: false, lastCommit: { date: '2026-07-01' } }, now), 'stale');
  assert.equal(classifyInventoryState({ status: 'ok', branch: '', dirty: false, lastCommit: { date: '2026-07-01' } }, now), 'stale-detached');
  assert.equal(classifyInventoryState({ status: 'error' }, now), 'inspection-error');
});
