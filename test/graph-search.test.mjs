import test from 'node:test';
import assert from 'node:assert/strict';
import { searchGraphNodes } from '../src/planning/graph-search.mjs';

const nodes = [
  { id: 'idea-graph', kind: 'idea', title: 'Knowledge graph intelligence', status: 'idea', meta: 'Future idea', tags: ['#graph', '#recommendations'], description: 'PRIVATE NOTE BODY MUST NOT BE SEARCHED' },
  { id: 'repo-taskmaster', kind: 'project', title: 'TaskMaster', status: 'built', meta: 'Built project', tags: ['#tasks'] },
  { id: 'cap-graph', kind: 'capability', title: 'Graph tooling', status: 'active', meta: 'Available', tags: ['#graph'] },
  { id: 'cand-memory', kind: 'candidate', title: 'Memory trust benchmark', status: 'planned', disposition: 'benchmark', meta: 'Disposition · benchmark', tags: ['#memory'] }
];

test('search matches current graph titles, tags, statuses, and metadata but not descriptions', () => {
  assert.deepEqual(searchGraphNodes(nodes, 'knowledge graph').map(node => node.id), ['idea-graph']);
  assert.deepEqual(searchGraphNodes(nodes, 'built').map(node => node.id), ['repo-taskmaster']);
  assert.deepEqual(searchGraphNodes(nodes, 'private note body'), []);
  assert.deepEqual(searchGraphNodes(nodes, 'benchmark').map(node => node.id), ['cand-memory']);
});

test('search ranks title matches ahead of tag matches and enforces a bounded result count', () => {
  assert.deepEqual(searchGraphNodes(nodes, 'graph').map(node => node.id), ['cap-graph', 'idea-graph']);
  assert.equal(searchGraphNodes(nodes, 'graph', 1).length, 1);
  assert.deepEqual(searchGraphNodes(nodes, '   '), []);
});
