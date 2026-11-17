import test from 'node:test';
import assert from 'node:assert/strict';
import { selectActivitySources, normalizeActivityResults } from '../src/planning/activity-feed.mjs';

test('activity source selection requires an enabled linked GitHub repository', () => {
  const node = { sources: ['repo-a', 'repo-disabled', 'vault-a'] };
  const graphSources = [
    { id: 'repo-a', type: 'repository', enabled: true },
    { id: 'repo-disabled', type: 'repository', enabled: false },
    { id: 'vault-a', type: 'vault', enabled: true },
    { id: 'repo-unlinked', type: 'repository', enabled: true }
  ];
  const manifestSources = [
    { id: 'repo-a', kind: 'github-repository', label: 'Owner/Repo A' },
    { id: 'repo-disabled', kind: 'github-repository', label: 'Owner/Disabled' },
    { id: 'vault-a', kind: 'vault', label: 'Local vault' },
    { id: 'repo-unlinked', kind: 'github-repository', label: 'Owner/Unlinked' }
  ];
  assert.deepEqual(selectActivitySources(node, graphSources, manifestSources), [manifestSources[0]]);
});

test('activity normalization sorts, bounds, and limits entries to public GitHub commits', () => {
  const results = [
    { status: 'fulfilled', value: { source: { id: 'repo-a', label: 'Owner/Repo A' }, activity: [
      { message: 'Older commit', date: '2026-09-01T00:00:00Z', url: 'https://github.com/owner/repo/commit/old' },
      { message: ' <img src=x> newest\ncommit ', date: '2026-09-03T00:00:00Z', url: 'https://github.com/owner/repo/commit/new' },
      { message: 'Bad host', date: '2026-08-30T00:00:00Z', url: 'https://evil.example/commit/no' },
      { message: 'Very old commit', date: '2026-08-01T00:00:00Z', url: 'https://github.com/owner/repo/commit/very-old' }
    ] } },
    { status: 'rejected', reason: new Error('private error detail') }
  ];
  const normalized = normalizeActivityResults(results, 3);
  assert.equal(normalized.failures, 1);
  assert.equal(normalized.entries.length, 3);
  assert.equal(normalized.entries[0].message, '<img src=x> newest commit');
  assert.equal(normalized.entries[0].url, 'https://github.com/owner/repo/commit/new');
  assert.equal(normalized.entries[1].message, 'Older commit');
  assert.equal(normalized.entries[2].message, 'Bad host');
  assert.equal(normalized.entries[2].url, null);
  assert.equal(normalized.entries.some(entry => entry.message === 'Very old commit'), false);
  assert.equal(JSON.stringify(normalized).includes('private error detail'), false);
});

test('activity normalization handles empty and malformed commit rows safely', () => {
  const normalized = normalizeActivityResults([
    { status: 'fulfilled', value: { source: { id: 'repo-a' }, activity: [
      { message: '', date: 'not-a-date', url: '/relative' }, null
    ] } }
  ]);
  assert.equal(normalized.failures, 0);
  assert.deepEqual(normalized.entries, [
    { sourceLabel: 'repo-a', message: 'Commit', date: null, url: null }
  ]);
});
