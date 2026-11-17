import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectGitHubSource } from '../src/ingestion/github.mjs';
import { inspectVault, deriveVaultCandidates } from '../src/ingestion/vault.mjs';

test('vault adapter returns metadata without note bodies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-vault-'));
  try {
    await mkdir(join(root, 'notes'));
    await writeFile(join(root, 'notes', 'roadmap.md'), '# Roadmap\n\n#planning #atlas\n\nPrivate body that must not be returned.');
    await mkdir(join(root, 'archive'));
    await writeFile(join(root, 'archive', 'old.md'), '# Roadmap\n\n#planning\n');
    const result = await inspectVault(root);
    assert.equal(result.mode, 'metadata-only');
    assert.equal(result.bodyContentIncluded, false);
    assert.equal(result.noteCount, 2);
    const roadmap = result.notes.find(note => note.path.endsWith('roadmap.md'));
    assert.deepEqual(roadmap.headings, ['Roadmap']);
    assert.deepEqual(roadmap.tags, ['planning', 'atlas']);
    assert.equal(Object.prototype.hasOwnProperty.call(roadmap, 'body'), false);
    const filtered = await inspectVault(root, { excludeFolders: ['archive'] });
    assert.equal(filtered.noteCount, 1);
    const selected = await inspectVault(root, { includeNotes: ['notes/roadmap.md'] });
    assert.equal(selected.noteCount, 1);
    assert.equal(selected.notes[0].path, 'notes/roadmap.md');
    const candidates = deriveVaultCandidates(result);
    assert.equal(candidates.candidates.some(candidate => candidate.title === 'planning theme'), true);
    const relaxedCandidates = deriveVaultCandidates(result, { minimumOccurrences: 1 });
    assert.equal(relaxedCandidates.candidates.some(candidate => candidate.title === 'planning theme'), true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('vault access errors never echo a confirmed local path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-private-path-'));
  const inaccessible = join(root, 'private-path-marker', 'missing');
  const notDirectory = join(root, 'not-a-directory');
  try {
    await writeFile(notDirectory, 'fixture');
    await assert.rejects(inspectVault(inaccessible), error => {
      assert.equal(error.message, 'Vault inspection failed (ENOENT).');
      assert.equal(error.message.includes('private-path-marker'), false);
      return true;
    });
    await assert.rejects(inspectVault(notDirectory), error => {
      assert.equal(error.message, 'Vault path is not a directory.');
      assert.equal(error.message.includes(notDirectory), false);
      return true;
    });
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('GitHub adapter normalizes an offline snapshot with provenance', async () => {
  const result = await inspectGitHubSource({
    id: 'fixture-repo',
    url: 'https://github.com/example/fixture-repo',
    offlineSnapshot: {
      repository: { name: 'fixture-repo', description: 'Fixture repo', default_branch: 'main', stargazers_count: 0, forks_count: 0, language: 'JavaScript', updated_at: '2026-09-09T00:00:00Z', html_url: 'https://github.com/example/fixture-repo' },
      readme: 'Fixture README',
      packageJson: '{"name":"fixture-repo"}',
      agents: 'Fixture guidance',
      commits: []
    }
  }, { fetchImpl: async () => { throw new Error('fixture network unavailable'); } });
  assert.equal(result.mode, 'offline-snapshot');
  assert.equal(result.repository.title, 'fixture-repo');
  assert.equal(result.evidence.length, 4);
  assert.ok(result.evidence.every(item => item.source));
});

test('GitHub adapter fails explicitly without a snapshot and uses provenance-bearing fallback when available', async () => {
  const source = { id: 'offline-repo', url: 'https://github.com/example/offline-repo' };
  const unavailable = async () => { throw new Error('fixture network unavailable'); };
  await assert.rejects(inspectGitHubSource(source, { fetchImpl: unavailable }), /fixture network unavailable/);
  const fallback = await inspectGitHubSource({
    ...source,
    offlineSnapshot: {
      repository: { name: 'offline-repo', default_branch: 'main', html_url: source.url },
      readme: 'Offline fixture',
      packageJson: '{"name":"offline-repo"}',
      agents: '',
      commits: []
    }
  }, { fetchImpl: unavailable });
  assert.equal(fallback.mode, 'offline-snapshot');
  assert.equal(fallback.repository.title, 'offline-repo');
  assert.ok(fallback.evidence.every(item => item.source));
});
