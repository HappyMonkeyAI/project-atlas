import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadQueueApi(storage = {}) {
  const source = await readFile(new URL('../graph.js', import.meta.url), 'utf8');
  const values = new Map(Object.entries(storage));
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value))
  };
  const context = { localStorage, structuredClone, repositoryIdentity: value => String(value || '').trim().toLowerCase() };
  vm.runInNewContext(source + '\nthis.__api = { normalizeFocusQueue, updateFocusQueueEntry, addFocusQueueNodes, raiseFocusQueuePriority, removeFocusQueueNode, loadAtlasState, saveAtlasState, ATLAS_QUEUE_KEY, ATLAS_SELECTED_KEY };', context);
  return { ...context.__api, values };
}

const nodes = ['atlas', 'taskmaster', 'vibes'];
const asPlain = value => JSON.parse(JSON.stringify(value));

test('legacy string queues migrate in their original order with defaults and preserve selection', async () => {
  const { loadAtlasState } = await loadQueueApi({
    'project-atlas.focus-queue.v1': JSON.stringify(['vibes', 'atlas']),
    'project-atlas.selected-node.v1': 'taskmaster'
  });
  const state = loadAtlasState();
  assert.deepEqual(asPlain(state.focusQueue), [
    { nodeId: 'vibes', status: 'queued', nextReviewDate: '' },
    { nodeId: 'atlas', status: 'queued', nextReviewDate: '' }
  ]);
  assert.equal(state.selectedNode, 'taskmaster');
});

test('normalization filters malformed, duplicate, and unknown IDs without changing priority order', async () => {
  const { normalizeFocusQueue } = await loadQueueApi();
  assert.deepEqual(asPlain(normalizeFocusQueue([
    'vibes', { nodeId: 'atlas', status: 'in_progress', nextReviewDate: '2027-02-28' },
    { nodeId: 'vibes', status: 'done', nextReviewDate: '' }, { nodeId: 'missing' },
    { nodeId: 'taskmaster', status: 'not-a-status', nextReviewDate: '2027-02-30' }, null, 4
  ], nodes)), [
    { nodeId: 'vibes', status: 'queued', nextReviewDate: '' },
    { nodeId: 'atlas', status: 'in_progress', nextReviewDate: '2027-02-28' },
    { nodeId: 'taskmaster', status: 'queued', nextReviewDate: '' }
  ]);
});

test('bounded status and ISO-date updates reject invalid edits and retain prior entry', async () => {
  const { updateFocusQueueEntry } = await loadQueueApi();
  const queue = [{ nodeId: 'atlas', status: 'queued', nextReviewDate: '' }];
  assert.equal(updateFocusQueueEntry(queue, 'atlas', { status: 'blocked', nextReviewDate: '2027-02-28' }), true);
  assert.equal(updateFocusQueueEntry(queue, 'atlas', { status: 'blocked;alert(1)', nextReviewDate: '2027-02-30' }), false);
  assert.deepEqual(asPlain(queue), [{ nodeId: 'atlas', status: 'blocked', nextReviewDate: '2027-02-28' }]);
});

test('add and remove are deduplicated, ordered, and capped without automatic reordering', async () => {
  const { addFocusQueueNodes, removeFocusQueueNode } = await loadQueueApi();
  const queue = [{ nodeId: 'vibes', status: 'blocked', nextReviewDate: '' }];
  addFocusQueueNodes(queue, ['atlas', 'vibes', 'taskmaster'], nodes, 2);
  assert.deepEqual(asPlain(queue), [
    { nodeId: 'vibes', status: 'blocked', nextReviewDate: '' },
    { nodeId: 'atlas', status: 'queued', nextReviewDate: '' }
  ]);
  assert.equal(removeFocusQueueNode(queue, 'vibes'), true);
  assert.deepEqual(asPlain(queue), [{ nodeId: 'atlas', status: 'queued', nextReviewDate: '' }]);
  const manyIds = Array.from({ length: 55 }, (_, index) => 'node-' + index);
  const capped = [];
  addFocusQueueNodes(capped, manyIds, manyIds);
  assert.equal(capped.length, 50);
  assert.equal(capped[49].nodeId, 'node-49');
});

test('raiseFocusQueuePriority moves a node to the front as in_progress', async () => {
  const { raiseFocusQueuePriority } = await loadQueueApi();
  const queue = [
    { nodeId: 'atlas', status: 'queued', nextReviewDate: '' },
    { nodeId: 'taskmaster', status: 'blocked', nextReviewDate: '2027-01-01' }
  ];
  const raised = raiseFocusQueuePriority(queue, 'taskmaster', nodes);
  assert.equal(raised.ok, true);
  assert.equal(raised.added, false);
  assert.equal(raised.raised, true);
  assert.equal(raised.status, 'in_progress');
  assert.deepEqual(asPlain(queue), [
    { nodeId: 'taskmaster', status: 'in_progress', nextReviewDate: '2027-01-01' },
    { nodeId: 'atlas', status: 'queued', nextReviewDate: '' }
  ]);
  const added = raiseFocusQueuePriority(queue, 'vibes', nodes);
  assert.equal(added.ok, true);
  assert.equal(added.added, true);
  assert.equal(added.raised, true);
  assert.equal(queue[0].nodeId, 'vibes');
  assert.equal(queue[0].status, 'in_progress');
});

test('normalized status/date round-trip through persistence and snapshot data', async () => {
  const { loadAtlasState, saveAtlasState, values } = await loadQueueApi();
  const graph = loadAtlasState().graph;
  const queue = [
    { nodeId: 'taskmaster', status: 'in_progress', nextReviewDate: '2027-12-31' },
    { nodeId: 'vibes', status: 'done', nextReviewDate: '' }
  ];
  saveAtlasState(graph, queue, 'vibes');
  const importedSnapshot = JSON.parse(JSON.stringify({ graph, focusQueue: JSON.parse(values.get('project-atlas.focus-queue.v1')), selectedNode: 'vibes' }));
  const reloaded = await loadQueueApi({
    'project-atlas.graph.v1': JSON.stringify(importedSnapshot.graph),
    'project-atlas.focus-queue.v1': JSON.stringify(importedSnapshot.focusQueue),
    'project-atlas.selected-node.v1': importedSnapshot.selectedNode
  });
  const state = reloaded.loadAtlasState();
  assert.deepEqual(asPlain(state.focusQueue), queue);
  assert.equal(state.selectedNode, 'vibes');
});
