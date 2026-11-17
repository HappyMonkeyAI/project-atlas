const TASK_STATUSES = new Set(['pending', 'in-progress', 'completed']);
const STATUS_MAP = Object.freeze({
  pending: 'queued',
  'in-progress': 'in_progress',
  completed: 'done'
});

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function requireString(value, label) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be a string`);
}

function requireId(value, label, seenIds) {
  requireString(value, label);
  if (!value.trim()) throw new TypeError(`${label} must be a non-empty string`);
  if (seenIds.has(value)) throw new TypeError(`Duplicate ${label}`);
  seenIds.add(value);
}

/**
 * Validate and normalize an already-parsed TaskMaster export without retaining
 * the source object or any free-text fields other than task titles.
 */
export function normalizeTaskMasterExport(exportData) {
  requireObject(exportData, 'TaskMaster export');
  requireString(exportData.exportedAt, 'exportedAt');
  requireString(exportData.module, 'module');
  requireObject(exportData.preferences, 'preferences');
  if (!Array.isArray(exportData.tasks)) throw new TypeError('tasks must be an array');

  const seenIds = new Set();
  const tasks = exportData.tasks.map((task, taskIndex) => {
    requireObject(task, `tasks[${taskIndex}]`);
    requireId(task.id, `tasks[${taskIndex}].id`, seenIds);
    requireString(task.title, `tasks[${taskIndex}].title`);
    requireString(task.description, `tasks[${taskIndex}].description`);
    requireString(task.notes, `tasks[${taskIndex}].notes`);
    requireString(task.createdAt, `tasks[${taskIndex}].createdAt`);
    requireString(task.updatedAt, `tasks[${taskIndex}].updatedAt`);
    if (!TASK_STATUSES.has(task.status)) throw new TypeError(`Invalid task status at tasks[${taskIndex}]`);
    if (!Array.isArray(task.subtasks)) throw new TypeError(`tasks[${taskIndex}].subtasks must be an array`);

    let completedSubtaskCount = 0;
    task.subtasks.forEach((subtask, subtaskIndex) => {
      const label = `tasks[${taskIndex}].subtasks[${subtaskIndex}]`;
      requireObject(subtask, label);
      requireId(subtask.id, `${label}.id`, seenIds);
      requireString(subtask.title, `${label}.title`);
      requireString(subtask.description, `${label}.description`);
      requireString(subtask.createdAt, `${label}.createdAt`);
      requireString(subtask.updatedAt, `${label}.updatedAt`);
      if (typeof subtask.complete !== 'boolean') throw new TypeError(`${label}.complete must be a boolean`);
      if (subtask.complete) completedSubtaskCount += 1;
    });

    return {
      id: task.id,
      title: task.title,
      status: STATUS_MAP[task.status],
      updatedAt: task.updatedAt,
      subtaskCount: task.subtasks.length,
      completedSubtaskCount
    };
  });

  return {
    provenance: {
      source: 'taskmaster-export',
      module: exportData.module,
      exportedAt: exportData.exportedAt
    },
    tasks
  };
}

/**
 * Create an explicit-link reconciliation preview. This function never changes
 * graph nodes or the supplied focus queue; unmapped and unknown links are ignored.
 */
export function proposeTaskMasterReconciliation(normalizedImport, taskNodeMapping, graphNodes, focusQueue) {
  requireObject(normalizedImport, 'normalized import');
  if (!Array.isArray(normalizedImport.tasks)) throw new TypeError('normalized import tasks must be an array');
  requireObject(taskNodeMapping, 'task-node mapping');
  if (!Array.isArray(graphNodes)) throw new TypeError('graphNodes must be an array');
  if (!Array.isArray(focusQueue)) throw new TypeError('focusQueue must be an array');

  const graphNodeIds = new Set(graphNodes.map(node => node?.id).filter(id => typeof id === 'string'));
  const queueByNodeId = new Map();
  for (const entry of focusQueue) {
    if (entry && typeof entry.nodeId === 'string' && !queueByNodeId.has(entry.nodeId)) {
      queueByNodeId.set(entry.nodeId, entry);
    }
  }

  const links = [];
  const proposedQueue = focusQueue.map(entry => entry && typeof entry === 'object' ? { ...entry } : entry);
  const queuedNodeIds = new Set(proposedQueue.map(entry => entry?.nodeId).filter(id => typeof id === 'string'));
  for (const task of normalizedImport.tasks) {
    if (!Object.hasOwn(taskNodeMapping, task.id)) continue;
    const nodeId = taskNodeMapping[task.id];
    if (typeof nodeId !== 'string' || !graphNodeIds.has(nodeId)) continue;

    const localEntry = queueByNodeId.get(nodeId);
    const localStatus = localEntry?.status ?? null;
    const statusConflict = localStatus !== null && localStatus !== task.status;
    links.push({
      taskId: task.id,
      nodeId,
      importedStatus: task.status,
      localStatus,
      statusConflict,
      requiresExplicitAction: statusConflict
    });

    if (!queuedNodeIds.has(nodeId)) {
      proposedQueue.push({ nodeId, status: task.status, nextReviewDate: '' });
      queuedNodeIds.add(nodeId);
    }
  }

  return { links, proposedQueue };
}
