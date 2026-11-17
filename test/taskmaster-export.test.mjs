import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTaskMasterExport,
  proposeTaskMasterReconciliation
} from '../src/planning/taskmaster-export.mjs';

const syntheticExport = () => ({
  exportedAt: '2026-09-28T10:30:00.000Z',
  module: 'synthetic-planning-module',
  preferences: { theme: 'synthetic-preference' },
  tasks: [
    {
      id: 'task-alpha',
      title: 'Synthetic task title',
      description: 'PRIVATE_TASK_DESCRIPTION_91',
      notes: 'PRIVATE_TASK_NOTES_82',
      status: 'pending',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-20T12:00:00.000Z',
      subtasks: [
        {
          id: 'subtask-alpha-1', title: 'Private subtask title',
          description: 'PRIVATE_SUBTASK_DESCRIPTION_73', complete: true,
          createdAt: '2026-09-02T00:00:00.000Z', updatedAt: '2026-09-03T00:00:00.000Z'
        },
        {
          id: 'subtask-alpha-2', title: 'Another private subtask',
          description: 'PRIVATE_SUBTASK_DESCRIPTION_64', complete: false,
          createdAt: '2026-09-04T00:00:00.000Z', updatedAt: '2026-09-05T00:00:00.000Z'
        }
      ]
    },
    {
      id: 'task-beta', title: 'Synthetic second task', description: '', notes: '',
      status: 'in-progress', createdAt: '2026-09-06T00:00:00.000Z',
      updatedAt: '2026-09-21T12:00:00.000Z', subtasks: []
    },
    {
      id: 'task-gamma', title: 'Synthetic completed task', description: '', notes: '',
      status: 'completed', createdAt: '2026-09-07T00:00:00.000Z',
      updatedAt: '2026-09-22T12:00:00.000Z', subtasks: []
    }
  ]
});

test('normalizes the export contract, statuses, timestamps, counts, and privacy boundary', () => {
  const normalized = normalizeTaskMasterExport(syntheticExport());
  assert.deepEqual(normalized, {
    provenance: {
      source: 'taskmaster-export',
      module: 'synthetic-planning-module',
      exportedAt: '2026-09-28T10:30:00.000Z'
    },
    tasks: [
      { id: 'task-alpha', title: 'Synthetic task title', status: 'queued', updatedAt: '2026-09-20T12:00:00.000Z', subtaskCount: 2, completedSubtaskCount: 1 },
      { id: 'task-beta', title: 'Synthetic second task', status: 'in_progress', updatedAt: '2026-09-21T12:00:00.000Z', subtaskCount: 0, completedSubtaskCount: 0 },
      { id: 'task-gamma', title: 'Synthetic completed task', status: 'done', updatedAt: '2026-09-22T12:00:00.000Z', subtaskCount: 0, completedSubtaskCount: 0 }
    ]
  });
  const output = JSON.stringify(normalized);
  for (const privateValue of [
    'PRIVATE_TASK_DESCRIPTION_91', 'PRIVATE_TASK_NOTES_82',
    'PRIVATE_SUBTASK_DESCRIPTION_73', 'PRIVATE_SUBTASK_DESCRIPTION_64',
    'Private subtask title', 'Another private subtask', 'synthetic-preference'
  ]) assert.equal(output.includes(privateValue), false);
  assert.equal(Object.hasOwn(normalized, 'preferences'), false);
});

test('rejects malformed contract fields, unsupported statuses, and malformed IDs', () => {
  const badStatus = syntheticExport();
  badStatus.tasks[0].status = 'blocked';
  assert.throws(() => normalizeTaskMasterExport(badStatus), /Invalid task status/);

  const malformedId = syntheticExport();
  malformedId.tasks[0].id = '   ';
  assert.throws(() => normalizeTaskMasterExport(malformedId), /id must be a non-empty string/);

  const malformedSubtaskId = syntheticExport();
  malformedSubtaskId.tasks[0].subtasks[0].id = '';
  assert.throws(() => normalizeTaskMasterExport(malformedSubtaskId), /id must be a non-empty string/);

  const malformedTimestamp = syntheticExport();
  malformedTimestamp.tasks[0].updatedAt = null;
  assert.throws(() => normalizeTaskMasterExport(malformedTimestamp), /updatedAt must be a string/);
});

test('rejects duplicate IDs across tasks and subtasks', () => {
  const duplicateTask = syntheticExport();
  duplicateTask.tasks[1].id = duplicateTask.tasks[0].id;
  assert.throws(() => normalizeTaskMasterExport(duplicateTask), /Duplicate tasks\[1\]\.id/);

  const duplicateSubtask = syntheticExport();
  duplicateSubtask.tasks[1].subtasks = [{
    id: duplicateSubtask.tasks[0].subtasks[0].id,
    title: 'Synthetic duplicate', description: '', complete: false,
    createdAt: '', updatedAt: ''
  }];
  assert.throws(() => normalizeTaskMasterExport(duplicateSubtask), /Duplicate .*\.id/);
});

test('reconciliation uses only explicit links, preserves queue order, and reports status conflicts without mutation', () => {
  const imported = normalizeTaskMasterExport(syntheticExport());
  const mapping = { 'task-alpha': 'node-existing', 'task-beta': 'node-new', 'task-gamma': 'node-not-in-graph' };
  const graphNodes = [{ id: 'node-existing' }, { id: 'node-new' }];
  const focusQueue = [
    { nodeId: 'node-existing', status: 'in_progress', nextReviewDate: '2026-10-01' },
    { nodeId: 'unrelated-node', status: 'blocked', nextReviewDate: '' }
  ];
  const originalQueue = structuredClone(focusQueue);
  const originalMapping = structuredClone(mapping);
  const result = proposeTaskMasterReconciliation(imported, mapping, graphNodes, focusQueue);

  assert.deepEqual(result.links, [
    { taskId: 'task-alpha', nodeId: 'node-existing', importedStatus: 'queued', localStatus: 'in_progress', statusConflict: true, requiresExplicitAction: true },
    { taskId: 'task-beta', nodeId: 'node-new', importedStatus: 'in_progress', localStatus: null, statusConflict: false, requiresExplicitAction: false }
  ]);
  assert.deepEqual(result.proposedQueue, [
    { nodeId: 'node-existing', status: 'in_progress', nextReviewDate: '2026-10-01' },
    { nodeId: 'unrelated-node', status: 'blocked', nextReviewDate: '' },
    { nodeId: 'node-new', status: 'in_progress', nextReviewDate: '' }
  ]);
  assert.deepEqual(focusQueue, originalQueue);
  assert.deepEqual(mapping, originalMapping);
  assert.equal(result.proposedQueue[0].status, 'in_progress');
});

test('does not fuzzy-match titles or accept links to absent graph nodes', () => {
  const imported = normalizeTaskMasterExport(syntheticExport());
  const result = proposeTaskMasterReconciliation(
    imported,
    { 'task-alpha': 'missing-node' },
    [{ id: 'Synthetic task title' }],
    []
  );
  assert.deepEqual(result.links, []);
  assert.deepEqual(result.proposedQueue, []);

  const inheritedMapping = Object.create({ 'task-alpha': 'Synthetic task title' });
  const inheritedResult = proposeTaskMasterReconciliation(imported, inheritedMapping, [{ id: 'Synthetic task title' }], []);
  assert.deepEqual(inheritedResult.links, []);
});
