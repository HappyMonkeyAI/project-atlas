import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotForExport } from '../src/privacy/snapshot-export.mjs';

test('snapshot export omits local vault paths without mutating local state', () => {
  const localPath = 'C:\\Users\\private\\kb_vault';
  const snapshot = {
    graph: {
      sources: [{ id: 'vault-source', type: 'vault', location: localPath, enabled: true }],
      nodes: [{ id: 'vault-theme', title: 'planning theme', sources: ['vault-source'], provenance: { source: localPath } }],
      edges: []
    },
    focusQueue: ['vault-theme'],
    selectedNode: 'vault-theme'
  };
  const exported = snapshotForExport(snapshot);
  const serialized = JSON.stringify(exported);
  assert.equal(serialized.includes(localPath), false);
  assert.equal(serialized.toLowerCase().includes('c:/users/private/kb_vault'), false);
  assert.equal(exported.graph.sources[0].location, '[local vault path omitted]');
  assert.equal(exported.graph.nodes[0].provenance.source, '[local vault path omitted]');
  assert.equal(snapshot.graph.sources[0].location, localPath);
});

test('snapshot export is a safe no-op when no confirmed vault path is configured', () => {
  const snapshot = { graph: { sources: [{ id: 'vault-source', type: 'vault', location: 'user-confirmed path required' }], nodes: [], edges: [] } };
  assert.deepEqual(snapshotForExport(snapshot), snapshot);
});
