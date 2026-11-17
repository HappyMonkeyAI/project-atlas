import test from 'node:test';
import assert from 'node:assert/strict';
import { graphSectionNodes } from '../src/planning/graph-sections.mjs';

const graph = {
  sources: [
    { id: 'repo', type: 'repository' },
    { id: 'inventory', type: 'project-inventory' },
    { id: 'vault-source', type: 'vault' },
    { id: 'wiki', type: 'wiki-page' }
  ],
  nodes: [
    { id: 'atlas', kind: 'project', sources: ['repo'] },
    { id: 'reviewed-checkout', kind: 'project', sources: ['inventory'] },
    { id: 'knowledge', kind: 'source', sources: ['vault-source'] },
    { id: 'idea', kind: 'idea', sources: ['vault-source', 'repo'] },
    { id: 'tool', kind: 'capability', sources: [] },
    { id: 'cand', kind: 'candidate', disposition: 'pattern', sources: ['wiki'] }
  ]
};

test('graph sections derive repository, knowledge, and idea nodes from shared graph provenance', () => {
  assert.deepEqual(graphSectionNodes(graph, [], 'repositories').map(node => node.id), ['atlas', 'reviewed-checkout', 'idea']);
  assert.deepEqual(graphSectionNodes(graph, [], 'knowledge').map(node => node.id), ['knowledge', 'idea', 'cand']);
  assert.deepEqual(graphSectionNodes(graph, [], 'ideas').map(node => node.id), ['idea']);
  assert.deepEqual(graphSectionNodes(graph, [], 'candidates').map(node => node.id), ['cand']);
});

test('current work follows valid focus-queue order and ignores unknown node IDs', () => {
  assert.deepEqual(graphSectionNodes(graph, [{ nodeId: 'tool' }, 'atlas', { nodeId: 'missing' }], 'current-work').map(node => node.id), ['tool', 'atlas']);
});

test('Map returns the full shared graph, including an empty-queue Current work result', () => {
  assert.deepEqual(graphSectionNodes(graph, [], 'map'), graph.nodes);
  assert.deepEqual(graphSectionNodes(graph, [], 'current-work'), []);
});
