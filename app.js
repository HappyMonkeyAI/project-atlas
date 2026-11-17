import { snapshotForExport } from './src/privacy/snapshot-export.mjs';
import { normalizeTaskMasterExport, proposeTaskMasterReconciliation } from './src/planning/taskmaster-export.mjs';
import { normalizeActivityResults, selectActivitySources } from './src/planning/activity-feed.mjs';
import { searchGraphNodes } from './src/planning/graph-search.mjs';
import { graphSectionNodes } from './src/planning/graph-sections.mjs';
import {
  countNodesMatchingMapFilter,
  mapFilterAriaLabel,
  mapFilterLabel,
  mapZoomLabel,
  nextMapFilter,
  nextMapZoom,
  nodeMatchesMapFilter,
  normalizeMapFilter,
  normalizeMapZoom,
  reviewedFilterEmptyMessage,
  treeFilterEmptyMessage
} from './src/planning/map-controls.mjs';

const atlasState = loadAtlasState();
const data = Object.fromEntries(atlasState.graph.nodes.map(node => [node.id, node]));
const INVENTORY_REVIEW_KEY = 'project-atlas.inventory-review.v1';
const INVENTORY_MAPPING_KEY = 'project-atlas.inventory-mappings.v1';
const INVENTORY_ACK_KEY = 'project-atlas.inventory-acknowledged.v1';
const MAP_CONTROLS_KEY = 'project-atlas.map-controls.v1';
let inventoryRequest = 0;
let inventoryResults = [];
let activityRequest = 0;
let taskMasterImport = null;
let taskMasterMapping = Object.create(null);
let mapFilterKind = 'all';
let mapZoomPercent = 100;
const toast = document.getElementById('toast');
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.querySelector('.views').setAttribute('role', 'tablist');
document.querySelector('.views').setAttribute('aria-label', 'Project map views');
document.querySelectorAll('.view').forEach((button, index) => { button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', index === 0 ? 'true' : 'false'); });
document.querySelector('.tree').setAttribute('aria-label', 'Graph-derived prerequisite dependency view');
function renderSources() {
  const panel = document.getElementById('sourcePanel');
  const sources = atlasState.graph.sources.filter(source => source.id !== 'atlas-source');
  const sourceRows = sources.map(source => '<label><input type="checkbox" data-source-toggle="' + source.id + '" ' + (source.enabled ? 'checked' : '') + '><span>' + escapeHtml(source.label) + '</span><small>' + escapeHtml(source.type) + '</small></label>' + (source.type === 'vault' ? '<div class="vault-config"><input aria-label="Confirmed vault path" data-vault-path placeholder="Confirmed local path" value="' + escapeHtml(source.location === 'user-confirmed path required' ? '' : source.location) + '"><button class="secondary" data-index-vault>Index metadata</button></div>' : '')).join('');
  panel.innerHTML = '<b>INDEX SOURCES</b>' + sourceRows + '<section class="taskmaster-import" id="taskmasterImportSection"><h3>TaskMaster export</h3><p>Read-only local import. Task records and TaskMaster IDs stay in this tab; they are not uploaded or included in snapshots. If you explicitly apply an imported status, it is saved as Atlas focus-queue state and exported with the queue.</p><label for="taskmasterImportFile">Choose JSON export<input id="taskmasterImportFile" type="file" accept=".json,application/json"></label><div class="taskmaster-message" id="taskmasterImportMessage" role="status">No export loaded.</div><div id="taskmasterTaskControls" hidden><label for="taskmasterSearch">Find task<input id="taskmasterSearch" type="search" placeholder="Search task titles"></label><label for="taskmasterTaskSelect">Task<select id="taskmasterTaskSelect"></select></label><div class="taskmaster-detail" id="taskmasterTaskDetail"></div><label for="taskmasterNodeSelect">Link to existing graph node<select id="taskmasterNodeSelect"></select></label><button id="taskmasterLinkButton" type="button">Link selected task</button><div class="taskmaster-message" id="taskmasterLinkMessage" role="status"></div><div id="taskmasterReconciliation"></div></div></section><div class="inventory-review" id="inventoryReview"><div class="inventory-heading"><b>PROJECT INVENTORY</b><span>Loading…</span></div></div>';
  renderTaskMasterImport();
  loadInventoryReview();
}

function taskMasterSelectedTask() {
  return taskMasterImport?.tasks.find(task => task.id === document.getElementById('taskmasterTaskSelect')?.value) || null;
}
function taskMasterReconciliation() {
  return taskMasterImport ? proposeTaskMasterReconciliation(taskMasterImport, taskMasterMapping, atlasState.graph.nodes, atlasState.focusQueue) : { links: [], proposedQueue: atlasState.focusQueue };
}
function renderTaskMasterImport() {
  const controls = document.getElementById('taskmasterTaskControls');
  const message = document.getElementById('taskmasterImportMessage');
  if (!controls || !message) return;
  controls.hidden = !taskMasterImport;
  if (!taskMasterImport) { message.textContent = 'No export loaded.'; return; }
  message.textContent = 'Loaded ' + taskMasterImport.tasks.length + ' task records · ' + taskMasterImport.provenance.module + ' · exported ' + taskMasterImport.provenance.exportedAt + '. In memory only.';
  const search = document.getElementById('taskmasterSearch');
  const select = document.getElementById('taskmasterTaskSelect');
  const previous = select.value;
  const query = (search.value || '').trim().toLocaleLowerCase();
  const filtered = taskMasterImport.tasks.filter(task => task.title.toLocaleLowerCase().includes(query) || task.id.toLocaleLowerCase().includes(query));
  select.innerHTML = filtered.map(task => '<option value="' + escapeHtml(task.id) + '">' + escapeHtml(task.title) + ' · ' + escapeHtml(task.status) + '</option>').join('');
  if (filtered.some(task => task.id === previous)) select.value = previous;
  const task = taskMasterSelectedTask();
  const detail = document.getElementById('taskmasterTaskDetail');
  detail.innerHTML = task ? '<strong>' + escapeHtml(task.title) + '</strong><small>ID ' + escapeHtml(task.id) + ' · ' + escapeHtml(task.status) + ' · updated ' + escapeHtml(task.updatedAt) + ' · subtasks ' + task.completedSubtaskCount + '/' + task.subtaskCount + ' complete</small>' : '<small>No tasks match this search.</small>';
  const nodeSelect = document.getElementById('taskmasterNodeSelect');
  const priorNode = taskMasterMapping[task?.id] || nodeSelect.value;
  nodeSelect.innerHTML = '<option value="">Choose graph node…</option>' + atlasState.graph.nodes.map(node => '<option value="' + escapeHtml(node.id) + '">' + escapeHtml(node.title) + ' · ' + escapeHtml(node.id) + '</option>').join('');
  if (priorNode && atlasState.graph.nodes.some(node => node.id === priorNode)) nodeSelect.value = priorNode;
  const linkMessage = document.getElementById('taskmasterLinkMessage');
  linkMessage.textContent = task && taskMasterMapping[task.id] ? 'Explicitly mapped to ' + (data[taskMasterMapping[task.id]]?.title || taskMasterMapping[task.id]) + '.' : 'No node mapping for this task.';
  const reconciliation = taskMasterReconciliation();
  document.getElementById('taskmasterReconciliation').innerHTML = reconciliation.links.length ? reconciliation.links.map(link => {
    const taskRecord = taskMasterImport.tasks.find(record => record.id === link.taskId);
    const node = data[link.nodeId];
    const action = link.statusConflict ? '<div class="taskmaster-conflict">Export says ' + escapeHtml(link.importedStatus) + '; focus queue says ' + escapeHtml(link.localStatus) + '. Choose which status to use:</div><div class="taskmaster-actions"><button type="button" data-taskmaster-status="' + escapeHtml(link.nodeId) + '" data-status-choice="' + escapeHtml(link.importedStatus) + '">Use export</button><button type="button" data-taskmaster-status="' + escapeHtml(link.nodeId) + '" data-status-choice="' + escapeHtml(link.localStatus) + '">Keep queue</button></div>' : '<button type="button" data-taskmaster-add="' + escapeHtml(link.nodeId) + '" data-taskmaster-status-value="' + escapeHtml(link.importedStatus) + '">' + (link.localStatus ? 'Confirm mapping' : 'Add to focus queue') + '</button>';
    return '<div class="taskmaster-detail"><strong>' + escapeHtml(taskRecord?.title || link.taskId) + ' → ' + escapeHtml(node?.title || link.nodeId) + '</strong><small>Task ID ' + escapeHtml(link.taskId) + ' · export status ' + escapeHtml(link.importedStatus) + ' · queue ' + escapeHtml(link.localStatus || 'not queued') + '</small>' + action + '</div>';
  }).join('') : '<small>No explicit task-to-node links yet.</small>';
}
async function loadTaskMasterFile(file) {
  if (!file) return;
  try {
    if (file.size > 5_000_000) throw new Error('Export exceeds the 5 MB local import limit.');
    taskMasterImport = normalizeTaskMasterExport(JSON.parse(await file.text()));
    taskMasterMapping = Object.create(null);
    renderTaskMasterImport();
  } catch (error) {
    taskMasterImport = null;
    taskMasterMapping = Object.create(null);
    renderTaskMasterImport();
    const message = document.getElementById('taskmasterImportMessage');
    if (message) message.textContent = 'Import rejected: ' + error.message;
  }
}

function inventoryReviews() {
  try { const value = JSON.parse(localStorage.getItem(INVENTORY_REVIEW_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}
function inventoryMappings() {
  try { const value = JSON.parse(localStorage.getItem(INVENTORY_MAPPING_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}
function inventoryAcknowledgements() {
  try { const value = JSON.parse(localStorage.getItem(INVENTORY_ACK_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
}

function inventoryNodeId(result) { return 'inventory-' + result.id; }
function inventorySourceId(result) { return 'inventory-source-' + result.id; }
function inventoryStateLabel(state) { return String(state || 'unknown').replaceAll('-', ' '); }
function inventoryStateExplanation(state) { return { clean: 'Tracked branch with no local changes', dirty: 'Tracked branch with local changes', detached: 'No active branch is checked out', stale: 'Last commit is more than 30 days old', 'stale-detached': 'Old last commit and no active branch', 'inspection-error': 'Repository metadata could not be read' }[state] || 'State not available'; }
function repositoryIdentity(remote) { return String(remote || '').trim().toLowerCase().replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '').replace(/\/$/, ''); }
function repositoryLabel(remote) { const identity = repositoryIdentity(remote); return identity.replace(/^https:\/\/github\.com\//, ''); }
function renderInventorySummary(results) {
  const summary = document.getElementById('inventorySummary');
  if (!summary) return;
  const reviews = inventoryReviews();
  const counts = results.reduce((all, result) => { const state = result.state || (result.status === 'ok' ? (result.dirty ? 'dirty' : 'clean') : 'inspection-error'); all[state] = (all[state] || 0) + 1; return all; }, {});
  const parts = ['Inventory ' + results.length];
  ['clean', 'dirty', 'detached', 'stale', 'stale-detached', 'inspection-error'].forEach(state => { if (counts[state]) parts.push(counts[state] + ' ' + inventoryStateLabel(state)); });
  parts.push(Object.values(reviews).filter(value => value === 'reviewed').length + ' reviewed');
  summary.textContent = parts.join(' · ');
  summary.title = parts.join(' · ');
}
function renderReviewedProjects() {
  const list = document.getElementById('reviewedProjectsList');
  if (!list) return;
  const projects = atlasState.graph.nodes.filter(node => node.id.startsWith('inventory-'));
  list.innerHTML = projects.length ? projects.map(node => '<button class="reviewed-project" data-node="' + escapeHtml(node.id) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml(node.displayStatus || 'Reviewed') + ' · ' + escapeHtml(node.meta.replace('Inventory record · ', '')) + '</small></button>').join('') : '<small>No reviewed inventory projects yet.</small>';
}
function renderFocusQueue() {
  const list = document.getElementById('focusQueueList');
  if (!list) return;
  const steps = atlasState.focusQueue.map(entry => ({ entry, node: data[entry.nodeId] })).filter(step => step.node);
  list.innerHTML = steps.length ? steps.map(({ entry, node }, index) => '<div class="focus-step-row"><button class="focus-step" data-node="' + escapeHtml(node.id) + '">' + escapeHtml(node.title) + '<em>' + (index + 1) + '</em></button><button class="focus-remove" data-focus-remove="' + escapeHtml(node.id) + '" aria-label="Remove ' + escapeHtml(node.title) + ' from focus queue">×</button><label class="focus-field">Status<select data-focus-status="' + escapeHtml(node.id) + '" aria-label="Status for ' + escapeHtml(node.title) + '">' + [['queued', 'Queued'], ['in_progress', 'In progress'], ['blocked', 'Blocked'], ['done', 'Done']].map(([value, label]) => '<option value="' + value + '" ' + (entry.status === value ? 'selected' : '') + '>' + label + '</option>').join('') + '</select></label><label class="focus-field">Next review<input type="date" data-focus-date="' + escapeHtml(node.id) + '" aria-label="Next review date for ' + escapeHtml(node.title) + '" value="' + escapeHtml(entry.nextReviewDate) + '"></label></div>').join('') : '<small>No focused steps yet.</small>';
  renderGraphSectionCounts();
}
function syncReviewedInventory(results, reviews) {
  const reviewed = new Set(results.filter(result => result.status === 'ok' && reviews[result.id] === 'reviewed').map(result => result.id));
  atlasState.graph.nodes = atlasState.graph.nodes.filter(node => !node.id.startsWith('inventory-') || reviewed.has(node.id.slice('inventory-'.length)));
  atlasState.graph.sources = atlasState.graph.sources.filter(source => !source.id.startsWith('inventory-source-') || reviewed.has(source.id.slice('inventory-source-'.length)));
  results.filter(result => reviewed.has(result.id)).forEach(result => {
    const nodeId = inventoryNodeId(result);
    const sourceId = inventorySourceId(result);
    const title = result.label || result.id;
    const existingNode = atlasState.graph.nodes.find(node => node.id === nodeId);
    const state = result.state || (result.dirty ? 'dirty' : 'clean');
    const repositoryKey = repositoryIdentity(result.remote);
    const node = { id: nodeId, kind: 'project', title, meta: 'Inventory record · ' + (result.branch || 'detached'), icon: '⌘', description: 'Read-only project metadata imported after explicit review. Source contents were not read.', tags: ['#inventory', '#reviewed'], progress: result.dirty ? 45 : 60, status: result.dirty ? 'active' : 'built', displayStatus: inventoryStateLabel(state), sources: [sourceId], confidence: 0.82, repositoryKey };
    if (existingNode) Object.assign(existingNode, node); else atlasState.graph.nodes.push(node);
    const source = atlasState.graph.sources.find(candidate => candidate.id === sourceId);
    const sourceRecord = { id: sourceId, type: 'project-inventory', label: title, location: result.host, enabled: true, state, branch: result.branch || '(detached)', revision: result.revision || null, remote: result.remote || null, repositoryKey, mappedSourceId: inventoryMappings()[result.id] || null, acknowledged: inventoryAcknowledgements()[result.id] === true, dirty: Boolean(result.dirty), dirtyCount: result.dirtyCount || 0, lastCommit: result.lastCommit || null, scannedAt: result.scannedAt || null };
    if (source) Object.assign(source, sourceRecord); else atlasState.graph.sources.push(sourceRecord);
    data[nodeId] = node;
  });
  atlasState.graph.edges = atlasState.graph.edges.filter(edge => !edge.id.startsWith('inventory-edge-'));
  const reviewedResults = results.filter(result => reviewed.has(result.id) && result.remote);
  reviewedResults.forEach(result => {
    const identity = repositoryIdentity(result.remote);
    const matchingSource = atlasState.graph.sources.find(source => source.id !== inventorySourceId(result) && repositoryIdentity(source.location) === identity);
    if (matchingSource) {
      const matchingNode = atlasState.graph.nodes.find(node => node.sources?.includes(matchingSource.id));
      if (matchingNode) atlasState.graph.edges.push({ id: 'inventory-edge-' + result.id + '-matches-' + matchingNode.id, from: inventoryNodeId(result), to: matchingNode.id, kind: 'same_repository', confidence: 0.96, review: 'accepted', evidence: ['inventory:' + result.id + ':remote', 'source:' + matchingSource.id + ':location'] });
    }
  });
  reviewedResults.forEach((result, index) => reviewedResults.slice(index + 1).filter(other => repositoryIdentity(other.remote) === repositoryIdentity(result.remote)).forEach(other => atlasState.graph.edges.push({ id: 'inventory-edge-' + result.id + '-checkout-' + other.id, from: inventoryNodeId(result), to: inventoryNodeId(other), kind: 'same_repository_checkout', confidence: 0.98, review: 'accepted', evidence: ['inventory:' + result.id + ':remote', 'inventory:' + other.id + ':remote'] })));
  saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
  renderGraphSectionCounts();
}

function renderInventoryResults(panel, results) {
  renderInventorySummary(results);
  const reviews = inventoryReviews();
  syncReviewedInventory(results, reviews);
  renderReviewedProjects();
  const reviewed = results.filter(result => reviews[result.id] === 'reviewed').length;
  const repositorySources = atlasState.graph.sources.filter(source => source.type === 'repository' && source.id !== 'atlas-source');
  const emptyCta = reviewed === 0 && results.length
    ? '<p class="inventory-empty-cta">No projects reviewed yet. Use Review on a successful record to project it into the graph / Tree.</p>'
    : '';
  panel.innerHTML = '<div class="inventory-heading"><b>PROJECT INVENTORY</b><span>' + reviewed + '/' + results.length + ' reviewed</span></div>' + emptyCta + results.map(result => {
    const reviewState = reviews[result.id] || 'unreviewed';
    const repositoryState = result.state || (result.status === 'ok' ? (result.dirty ? 'dirty' : 'clean') : 'inspection-error');
    const label = result.status === 'ok' ? (result.branch || 'detached') + ' · ' + (result.revision || 'no revision') : 'Inspection error';
    const mapping = inventoryMappings()[result.id] || '';
    const mappingControl = result.status === 'ok' && reviewState === 'reviewed' ? '<label class="inventory-mapping">Map to source<select data-inventory-map="' + escapeHtml(result.id) + '" aria-label="Map ' + escapeHtml(result.label || result.id) + ' to an existing source"><option value="">No explicit mapping</option>' + repositorySources.map(source => '<option value="' + escapeHtml(source.id) + '" ' + (mapping === source.id ? 'selected' : '') + '>' + escapeHtml(source.label) + '</option>').join('') + '</select></label>' : '';
    const acknowledged = inventoryAcknowledgements()[result.id] === true;
    const acknowledgementControl = result.status === 'ok' && result.dirty ? '<button class="secondary inventory-ack-button" data-inventory-ack="' + escapeHtml(result.id) + '">' + (acknowledged ? 'Dev-server changes acknowledged' : 'Acknowledge dev-server changes') + '</button>' : '';
    return '<div class="inventory-item ' + reviewState + '"><div><strong>' + escapeHtml(result.label || result.id) + '</strong><small>' + escapeHtml(result.host + ' · ' + label) + '</small><span class="inventory-state state-' + escapeHtml(repositoryState) + '">' + escapeHtml(inventoryStateLabel(repositoryState)) + '</span><em class="inventory-explanation">' + escapeHtml(inventoryStateExplanation(repositoryState)) + '</em>' + mappingControl + acknowledgementControl + '</div><div class="inventory-actions"><button class="secondary inventory-refresh-button" data-inventory-refresh="' + escapeHtml(result.id) + '">Refresh</button><button class="secondary inventory-review-button" data-inventory-review="' + escapeHtml(result.id) + '">' + (reviewState === 'reviewed' ? 'Reviewed' : 'Review') + '</button></div></div>';
  }).join('');
}

async function refreshInventoryRecord(button) {
  const id = button.dataset.inventoryRefresh;
  button.disabled = true;
  button.textContent = '…';
  try {
    const response = await fetch('/api/inventory?source=' + encodeURIComponent(id));
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.results) || payload.results.length !== 1) throw new Error(payload.error || 'Refresh unavailable');
    inventoryResults = inventoryResults.map(result => result.id === id ? payload.results[0] : result);
    renderInventoryResults(document.getElementById('inventoryReview'), inventoryResults);
    flash('Inventory refreshed: ' + (payload.results[0].state || payload.results[0].status) + '.');
  } catch (error) {
    flash('Inventory refresh failed: ' + error.message);
    button.disabled = false;
    button.textContent = 'Refresh';
  }
}

async function loadInventoryReview() {
  const panel = document.getElementById('inventoryReview');
  if (!panel) return;
  const request = ++inventoryRequest;
  try {
    const response = await fetch('/api/inventory');
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.results)) throw new Error(payload.error || 'Inventory unavailable');
    if (request !== inventoryRequest) return;
    inventoryResults = payload.results;
    renderInventoryResults(panel, inventoryResults);
  } catch (error) {
    if (request !== inventoryRequest) return;
    panel.innerHTML = '<div class="inventory-heading"><b>PROJECT INVENTORY</b><span>Unavailable</span></div><small class="inventory-error">' + escapeHtml(error.message) + '</small>';
  }
}

async function refreshInventorySummary() {
  const summary = document.getElementById('inventorySummary');
  try {
    const response = await fetch('/api/inventory');
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.results)) throw new Error(payload.error || 'Inventory unavailable');
    inventoryResults = payload.results;
    syncReviewedInventory(inventoryResults, inventoryReviews());
    renderReviewedProjects();
    renderInventorySummary(inventoryResults);
  } catch (error) {
    if (summary) { summary.textContent = 'Inventory health unavailable'; summary.title = error.message; }
  }
}

function flash(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2100);
}

function dependencyNodeMarkup(node, selectedId) {
  const status = node.displayStatus || node.status || 'Unspecified';
  return '<button class="dependency-node' + (node.id === selectedId ? ' selected' : '') + '" data-node="' + escapeHtml(node.id) + '" data-tree-node="' + escapeHtml(node.id) + '" aria-label="' + escapeHtml(node.title + ', ' + status) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml(status) + '</small></button>';
}

function drawDependencyLinks(container, edges, includedIds) {
  const svg = container.querySelector('.dependency-links');
  if (!svg) return;
  const box = container.getBoundingClientRect();
  const width = Math.max(container.scrollWidth, box.width);
  const height = Math.max(container.scrollHeight, box.height);
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  const paths = edges.filter(edge => includedIds.has(edge.from) && includedIds.has(edge.to)).map(edge => {
    const from = container.querySelector('[data-tree-node="' + CSS.escape(edge.from) + '"]');
    const to = container.querySelector('[data-tree-node="' + CSS.escape(edge.to) + '"]');
    if (!from || !to) return '';
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const x1 = a.right - box.left + container.scrollLeft;
    const y1 = a.top + a.height / 2 - box.top + container.scrollTop;
    const x2 = b.left - box.left + container.scrollLeft;
    const y2 = b.top + b.height / 2 - box.top + container.scrollTop;
    const bend = Math.max(18, (x2 - x1) * 0.45);
    return '<path class="dependency-link ' + (edge.review === 'suggested' ? 'suggested' : '') + '" d="M ' + x1 + ' ' + y1 + ' C ' + (x1 + bend) + ' ' + y1 + ', ' + (x2 - bend) + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" />';
  }).join('');
  svg.innerHTML = '<defs><marker id="dependency-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#49df98" /></marker></defs>' + paths;
}

function renderDependencyTree(targetId = atlasState.selectedNode) {
  const container = document.getElementById('dependencyTree');
  const target = data[targetId];
  const label = document.getElementById('dependencyTreeTarget');
  if (!container || !target) return;
  if (label) label.textContent = 'Prerequisite chain for ' + target.title;
  const path = deriveBuildPath(atlasState.graph, targetId);
  const includedIds = new Set(path);
  const levels = new Map();
  path.forEach(id => {
    const knownParents = prerequisiteEdges(atlasState.graph, id).map(edge => levels.get(edge.from)).filter(level => Number.isInteger(level));
    levels.set(id, knownParents.length ? Math.max(...knownParents) + 1 : 0);
  });
  const maxLevel = Math.max(0, ...levels.values());
  const layers = Array.from({ length: maxLevel + 1 }, (_, level) => path.filter(id => levels.get(id) === level));
  const edgeList = atlasState.graph.edges.filter(edge => isPrerequisiteEdge(edge) && includedIds.has(edge.from) && includedIds.has(edge.to));
  const layerMarkup = layers.map((ids, index) => '<div class="dependency-layer"><h4 class="dependency-layer-label">' + (index === layers.length - 1 ? 'Target' : 'Prerequisites · tier ' + (index + 1)) + '</h4>' + ids.map(id => dependencyNodeMarkup(data[id], targetId)).join('') + '</div>').join('');
  const noDependencies = prerequisiteEdges(atlasState.graph, targetId).length === 0;
  container.innerHTML = '<svg class="dependency-links" aria-hidden="true"></svg>' + layerMarkup + (noDependencies ? '<span class="dependency-empty">No prerequisite edges recorded for this node. The view does not infer missing requirements.</span>' : '');
  applyMapFilter();
  requestAnimationFrame(() => drawDependencyLinks(container, edgeList, includedIds));
}

function renderDependencyList(nodeId, edges, direction, emptyText) {
  const list = document.getElementById(direction === 'in' ? 'nodePrerequisites' : 'nodeUnlocks');
  const count = document.getElementById(direction === 'in' ? 'prerequisiteCount' : 'unlockCount');
  const relevant = direction === 'in' ? prerequisiteEdges(atlasState.graph, nodeId) : unlockEdges(atlasState.graph, nodeId);
  if (!list) return;
  if (count) count.textContent = String(relevant.length);
  list.innerHTML = relevant.length ? relevant.map(edge => {
    const id = direction === 'in' ? edge.from : edge.to;
    const related = data[id];
    const title = related?.title || id;
    const evidenceCount = Array.isArray(edge.evidence) ? edge.evidence.length : 0;
    return '<div class="dependency-inspector-item"><button data-node="' + escapeHtml(id) + '">' + escapeHtml(title) + '</button><span class="review-state ' + escapeHtml(edge.review) + '">' + escapeHtml(edge.review) + '</span><small>' + escapeHtml(edge.kind.replaceAll('_', ' ')) + ' · ' + Math.round(edge.confidence * 100) + '% confidence · ' + evidenceCount + ' evidence ref' + (evidenceCount === 1 ? '' : 's') + '</small></div>';
  }).join('') : '<small>' + emptyText + '</small>';
}

function renderNextBuildSummary() {
  const candidate = data.graph || atlasState.graph.nodes.find(node => node.kind === 'idea');
  if (!candidate) return;
  const prerequisites = prerequisiteEdges(atlasState.graph, candidate.id);
  const title = document.getElementById('nextBuildTitle');
  const description = document.getElementById('nextBuildDescription');
  const count = document.getElementById('nextPrerequisiteCount');
  const score = document.getElementById('nextRecommendationScore');
  if (title) title.textContent = candidate.title;
  if (description) description.textContent = candidate.description || candidate.meta || 'Recommendation from the current graph.';
  if (count) count.textContent = String(prerequisites.length);
  if (score) score.textContent = scoreNode(atlasState.graph, candidate.id).score + '/100';
}

function loadMapControls() {
  try {
    const saved = JSON.parse(localStorage.getItem(MAP_CONTROLS_KEY) || '{}');
    mapFilterKind = normalizeMapFilter(saved.filterKind);
    mapZoomPercent = normalizeMapZoom(saved.zoomPercent);
  } catch {
    mapFilterKind = 'all';
    mapZoomPercent = 100;
  }
}

function saveMapControls() {
  localStorage.setItem(MAP_CONTROLS_KEY, JSON.stringify({ filterKind: mapFilterKind, zoomPercent: mapZoomPercent }));
}

function applyMapZoom() {
  const stage = document.getElementById('mapStage');
  const button = document.getElementById('mapZoom');
  if (stage) {
    stage.dataset.mapZoom = String(mapZoomPercent);
    stage.style.setProperty('--map-zoom', String(mapZoomPercent / 100));
  }
  if (button) {
    button.textContent = mapZoomLabel(mapZoomPercent);
    button.setAttribute('aria-label', 'Map zoom ' + mapZoomPercent + ' percent. Click to cycle.');
  }
}

function graphNodeRank(node) {
  return node.kind === 'candidate' ? 0 : node.kind === 'project' ? 1 : node.kind === 'capability' ? 2 : 3;
}

function syncExtrasHost(hostId, panelSelector, buildButton) {
  const host = document.getElementById(hostId);
  const panel = document.querySelector(panelSelector);
  if (!host || !panel) return;
  const onSeededMap = new Set(
    [...panel.querySelectorAll('[data-node]')]
      .filter(el => !host.contains(el))
      .map(el => el.dataset.node)
  );
  const graphIds = new Set(atlasState.graph.nodes.map(node => node.id));
  [...host.querySelectorAll('[data-node]')].forEach(el => {
    if (!graphIds.has(el.dataset.node) || onSeededMap.has(el.dataset.node)) el.remove();
  });
  const alreadyExtra = new Set([...host.querySelectorAll('[data-node]')].map(el => el.dataset.node));
  atlasState.graph.nodes
    .filter(node => !onSeededMap.has(node.id) && !alreadyExtra.has(node.id))
    .sort((a, b) => graphNodeRank(a) - graphNodeRank(b) || String(a.title).localeCompare(String(b.title)))
    .forEach(node => {
      host.appendChild(buildButton(node));
      alreadyExtra.add(node.id);
    });
}

function syncConstellationExtras() {
  syncExtrasHost('constellationExtras', '.panel.constellation', node => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'node extra' + (node.kind === 'candidate' ? ' candidate' : '');
    button.dataset.node = node.id;
    const icon = node.icon || (node.kind === 'candidate' ? '◎' : '•');
    const subtitle = node.kind === 'candidate' && node.disposition
      ? (node.disposition + (node.displayStatus ? ' · ' + node.displayStatus : ''))
      : (node.meta || node.kind || '');
    button.innerHTML = '<strong>' + escapeHtml(icon) + '</strong><b>' + escapeHtml(node.title) + '</b><small>' + escapeHtml(subtitle) + '</small>';
    return button;
  });
}

function syncRadialExtras() {
  syncExtrasHost('radialExtras', '.panel.radial', node => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = node.kind === 'candidate' ? 'candidate' : '';
    button.dataset.node = node.id;
    button.textContent = node.kind === 'candidate' && node.disposition
      ? (node.title + ' · ' + node.disposition)
      : node.title;
    return button;
  });
}

function syncHexExtras() {
  syncExtrasHost('hexExtras', '.panel.hex', node => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hex' + (node.kind === 'candidate' ? ' candidate' : '');
    button.dataset.node = node.id;
    const status = node.kind === 'candidate' && node.disposition
      ? node.disposition
      : (node.displayStatus || node.kind || '');
    button.innerHTML = '<b>' + escapeHtml(node.title) + '</b><small>' + escapeHtml(status) + '</small>';
    return button;
  });
}

function syncMapExtras() {
  syncConstellationExtras();
  syncRadialExtras();
  syncHexExtras();
}

function syncTreeFilterHonesty() {
  const container = document.getElementById('dependencyTree');
  if (container) {
    const nodes = [...container.querySelectorAll('[data-node]')];
    const visible = nodes.filter(element => !element.classList.contains('map-filter-hidden') && !element.hidden);
    const message = nodes.length && visible.length === 0 ? treeFilterEmptyMessage(mapFilterKind) : null;
    let note = document.getElementById('treeFilterEmpty');
    if (message) {
      if (!note) {
        note = document.createElement('span');
        note.id = 'treeFilterEmpty';
        note.className = 'dependency-empty';
        container.appendChild(note);
      }
      note.textContent = message;
      note.hidden = false;
    } else if (note) {
      note.remove();
    }
  }

  const list = document.getElementById('reviewedProjectsList');
  if (!list) return;
  const projects = [...list.querySelectorAll('[data-node]')];
  const visibleProjects = projects.filter(element => !element.classList.contains('map-filter-hidden') && !element.hidden);
  const listMessage = projects.length && visibleProjects.length === 0
    ? reviewedFilterEmptyMessage(mapFilterKind)
    : null;
  let listNote = document.getElementById('reviewedFilterEmpty');
  if (listMessage) {
    if (!listNote) {
      listNote = document.createElement('small');
      listNote.id = 'reviewedFilterEmpty';
      listNote.className = 'graph-section-empty';
      list.appendChild(listNote);
    }
    listNote.textContent = listMessage;
    listNote.hidden = false;
  } else if (listNote) {
    listNote.remove();
  }
}

function applyMapFilter() {
  const count = countNodesMatchingMapFilter(atlasState.graph.nodes, mapFilterKind);
  const button = document.getElementById('mapFilter');
  if (button) {
    button.textContent = mapFilterLabel(mapFilterKind, count);
    button.setAttribute('aria-label', mapFilterAriaLabel(mapFilterKind, count));
  }
  syncMapExtras();
  document.querySelectorAll('.stage [data-node]').forEach(element => {
    const node = data[element.dataset.node];
    const visible = nodeMatchesMapFilter(node, mapFilterKind);
    element.classList.toggle('map-filter-hidden', !visible);
    element.hidden = !visible;
    if (!visible) element.setAttribute('aria-hidden', 'true');
    else element.removeAttribute('aria-hidden');
  });
  document.querySelectorAll('#graphSectionNodes [data-node]').forEach(element => {
    const node = data[element.dataset.node];
    const visible = nodeMatchesMapFilter(node, mapFilterKind);
    element.classList.toggle('map-filter-hidden', !visible);
    element.hidden = !visible;
  });
  syncTreeFilterHonesty();
}

function cycleMapFilter() {
  mapFilterKind = nextMapFilter(mapFilterKind);
  saveMapControls();
  applyMapFilter();
  const activeSection = document.querySelector('[data-graph-section].active')?.dataset.graphSection;
  if (activeSection && activeSection !== 'map') renderGraphSection(activeSection);
  const count = countNodesMatchingMapFilter(atlasState.graph.nodes, mapFilterKind);
  flash(mapFilterLabel(mapFilterKind, count) + ' on map panels.');
}

function cycleMapZoom() {
  mapZoomPercent = nextMapZoom(mapZoomPercent);
  saveMapControls();
  applyMapZoom();
  flash(mapZoomLabel(mapZoomPercent) + '.');
}

function renderConstellationNeighbors(selectedId) {
  const neighbors = new Set(atlasState.graph.edges.filter(edge => edge.from === selectedId || edge.to === selectedId).map(edge => edge.from === selectedId ? edge.to : edge.from));
  document.querySelectorAll('.panel.constellation [data-node]').forEach(element => {
    const isSelected = element.dataset.node === selectedId;
    const isNeighbor = !isSelected && neighbors.has(element.dataset.node);
    element.classList.toggle('selected', isSelected);
    element.classList.toggle('neighbor', isNeighbor);
    element.classList.toggle('unrelated', !isSelected && !isNeighbor);
    element.title = isSelected ? 'Selected node' : isNeighbor ? 'Directly connected to selected node' : 'Unrelated to selected node';
  });
  applyMapFilter();
}

function selectNode(key) {
  const node = data[key] || data.atlas;
  document.getElementById('icon').textContent = node.icon;
  document.getElementById('title').textContent = node.title;
  document.getElementById('meta').textContent = node.meta;
  document.getElementById('description').textContent = node.description;
  const dispositionLine = document.getElementById('dispositionLine');
  if (dispositionLine) {
    if (node.kind === 'candidate' && node.disposition) {
      dispositionLine.hidden = false;
      dispositionLine.textContent = 'Disposition: ' + node.disposition + ' · see kb_vault research-knowledge-ecosystem';
    } else {
      dispositionLine.hidden = true;
      dispositionLine.textContent = '';
    }
  }
  document.getElementById('tags').innerHTML = node.tags.map(tag => '<span>' + tag + '</span>').join('');
  document.getElementById('progress').style.width = node.progress + '%';
  const scoring = scoreNode(atlasState.graph, node.id);
  document.getElementById('status').textContent = node.kind === 'idea' ? node.displayStatus + ' · ' + scoring.score + '/100' : node.displayStatus;
  renderEvidence(node);
  renderDependencyList(node.id, atlasState.graph.edges, 'in', 'No prerequisite edges recorded.');
  renderDependencyList(node.id, atlasState.graph.edges, 'out', 'No unlock edges recorded.');
  renderDependencyTree(node.id);
  renderNextBuildSummary();
  renderConstellationNeighbors(key);
  const cta = document.getElementById('cta');
  if (cta?.firstChild) cta.firstChild.textContent = 'Plan this path ';
  const prioritizeButton = document.getElementById('prioritize');
  if (prioritizeButton?.firstChild) {
    prioritizeButton.firstChild.textContent = node.kind === 'idea' ? 'Prioritize this idea ' : 'Prioritize this node ';
  }
  const footerStars = document.getElementById('footerStars');
  const footerUpdated = document.getElementById('footerUpdated');
  if (footerStars) {
    footerStars.textContent = scoring.audience.available
      ? ('Stars ' + scoring.audience.stars + ' · Forks ' + scoring.audience.forks)
      : 'Audience N/A';
  }
  if (footerUpdated) {
    const source = scoring.audience.sourceId
      ? atlasState.graph.sources.find(candidate => candidate.id === scoring.audience.sourceId)
      : null;
    footerUpdated.textContent = source?.audience?.fetchedAt
      ? ('Audience ' + String(source.audience.fetchedAt).slice(0, 10))
      : (scoring.audience.available ? 'Audience from snapshot' : 'No public GitHub link');
  }
  document.querySelectorAll('[data-node]').forEach(element => element.classList.toggle('selected', element.dataset.node === key));
  atlasState.selectedNode = key;
  saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
  if (document.querySelector('[data-tab].active')?.dataset.tab === 'activity') renderActivity(node);
}

const GRAPH_SECTION_DETAILS = {
  repositories: { title: 'Repositories', description: 'Roadmap nodes linked to repository or reviewed project-inventory sources.' },
  knowledge: { title: 'Knowledge', description: 'Roadmap nodes derived from or linked to the local knowledge source. Note bodies are not displayed here.' },
  'current-work': { title: 'Current work', description: 'Your ordered Focus Queue, using the same saved graph nodes.' },
  ideas: { title: 'Ideas', description: 'Graph nodes currently classified as ideas.' },
  candidates: { title: 'Candidates', description: 'Research leads with an explicit disposition (benchmark, pattern, reject, or adopt). Wired to the kb_vault research-knowledge-ecosystem page.' }
};

function renderGraphSectionCounts() {
  for (const section of Object.keys(GRAPH_SECTION_DETAILS)) {
    const count = graphSectionNodes(atlasState.graph, atlasState.focusQueue, section).length;
    const badge = document.getElementById('navCount-' + section);
    if (badge) badge.textContent = String(count);
  }
}

function renderGraphSection(section) {
  const details = GRAPH_SECTION_DETAILS[section];
  const nodes = graphSectionNodes(atlasState.graph, atlasState.focusQueue, section);
  document.getElementById('graphSectionTitle').textContent = details.title;
  document.getElementById('graphSectionDescription').textContent = details.description;
  const list = document.getElementById('graphSectionNodes');
  const visibleNodes = nodes.filter(node => nodeMatchesMapFilter(node, mapFilterKind));
  const filterNote = mapFilterKind === 'all' || visibleNodes.length === nodes.length ? '' : ' · filter ' + mapFilterKind;
  document.getElementById('graphSectionCount').textContent = visibleNodes.length + (visibleNodes.length === 1 ? ' node' : ' nodes') + (nodes.length !== visibleNodes.length ? ' of ' + nodes.length : '') + filterNote;
  list.innerHTML = visibleNodes.length ? visibleNodes.map(node => '<button class="graph-section-node" data-node="' + escapeHtml(node.id) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml([node.displayStatus, node.meta].filter(Boolean).join(' · ')) + '</small></button>').join('') : '<p class="graph-section-empty">' + (nodes.length && mapFilterKind !== 'all' ? 'No nodes match Filter: ' + mapFilterKind + ' in this section.' : (section === 'current-work' ? 'No nodes are in the Focus Queue yet. Add a node from its inspector to start tracking work.' : 'No graph nodes currently match this section.')) + '</p>';
}

function activateGraphSection(section) {
  const isMap = section === 'map';
  document.querySelectorAll('[data-graph-section]').forEach(button => {
    const active = button.dataset.graphSection === section;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const activeView = document.querySelector('.view.active')?.dataset.view || 'constellation';
  document.querySelectorAll('.panel').forEach(panel => {
    const visible = isMap ? panel.classList.contains(activeView) : panel.id === 'graphSectionView';
    panel.classList.toggle('hidden', !visible);
  });
  document.getElementById('sectionCrumb').textContent = isMap ? 'Overview' : GRAPH_SECTION_DETAILS[section].title;
  if (!isMap) renderGraphSection(section);
  else if (activeView === 'tree') renderDependencyTree(atlasState.selectedNode || 'atlas');
}

function escapeHtml(value) { return String(value).replace(/[&<>\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character])); }

const graphSearchDialog = document.getElementById('graphSearchDialog');
const graphSearchInput = document.getElementById('graphSearchInput');
const graphSearchResults = document.getElementById('graphSearchResults');

function renderGraphSearch() {
  const query = graphSearchInput.value;
  if (!query.trim()) {
    graphSearchResults.innerHTML = '<p class="search-empty">Search the current graph by title, tags, status, or metadata.</p>';
    return;
  }
  const matches = searchGraphNodes(atlasState.graph.nodes, query);
  if (!matches.length) {
    graphSearchResults.innerHTML = '<p class="search-empty">No roadmap nodes match that search.</p>';
    return;
  }
  graphSearchResults.innerHTML = matches.map(node => '<button type="button" class="search-result" data-search-node="' + escapeHtml(node.id) + '"><strong>' + escapeHtml(node.title) + '</strong><small>' + escapeHtml([node.kind, node.meta].filter(Boolean).join(' · ')) + '</small></button>').join('');
}

function openGraphSearch() {
  graphSearchInput.value = '';
  renderGraphSearch();
  graphSearchDialog.showModal();
  graphSearchInput.focus();
}

function renderEvidence(node) {
  const sourceMap = Object.fromEntries(atlasState.graph.sources.map(source => [source.id, source]));
  const relationships = atlasState.graph.edges.filter(edge => edge.from === node.id || edge.to === node.id).map(edge => {
    const otherId = edge.from === node.id ? edge.to : edge.from;
    const other = data[otherId] || { title: otherId };
    return '<div class="relationship"><div><b>' + escapeHtml(edge.kind.replace('_', ' ')) + '</b><small>' + escapeHtml(other.title) + ' · ' + Math.round(edge.confidence * 100) + '% confidence</small></div><span class="review-state ' + edge.review + '">' + escapeHtml(edge.review) + '</span>' + (edge.review === 'suggested' ? '<div class="review-actions"><button data-edge-review="accepted" data-edge-id="' + edge.id + '">Accept</button><button data-edge-review="rejected" data-edge-id="' + edge.id + '">Reject</button><button data-edge-review="deferred" data-edge-id="' + edge.id + '">Defer</button></div>' : '') + '</div>';
  }).join('');
  const scoring = scoreNode(atlasState.graph, node.id);
  const path = deriveBuildPath(atlasState.graph, node.id).map(id => data[id]?.title || id).join(' → ');
  const pathSummary = buildPathInventorySummary(atlasState.graph, node.id);
  const inventoryNote = scoring.inventory.repositories.length ? '<small class="path-note">Inventory signal: ' + scoring.breakdown.inventory + '/15 · freshness ' + scoring.breakdown.inventoryFreshness + '/10 · hygiene ' + scoring.breakdown.inventoryHygiene + '/3 · ' + scoring.inventory.repositories.length + ' canonical repository' + (scoring.inventory.repositories.length === 1 ? '' : 'ies') + '</small>' : '';
  const inventoryPathNote = scoring.inventoryPath.total ? '<small class="path-note">Inventory path: ' + scoring.inventoryPath.covered + '/' + scoring.inventoryPath.total + ' prerequisites have reviewed repository coverage · health ' + scoring.inventoryPath.health + '/10</small>' : '';
  const pathHealthNote = pathSummary.total ? '<small class="path-note">Build path coverage: ' + pathSummary.covered + '/' + pathSummary.total + ' checkpoints · health ' + pathSummary.health + '/10' + (pathSummary.blockers.length ? ' · attention: ' + pathSummary.blockers.map(blocker => '<button class="path-warning" data-node="' + escapeHtml(blocker.id) + '">' + escapeHtml(blocker.title) + '</button>').join(' ') : '') + '</small>' : '';
  const audienceNote = scoring.audience.available
    ? '<small class="path-note">Audience signal: ' + scoring.breakdown.audience + '/10 · ' + scoring.audience.stars + ' stars · ' + scoring.audience.forks + ' forks (capped; public GitHub only)</small>'
    : '<small class="path-note">Audience signal: N/A · no public GitHub audience linked to this node</small>';
  const sourceItemsWithAudience = node.sources.map(sourceId => {
    const source = sourceMap[sourceId] || { label: sourceId, location: 'Unknown source' };
    const mappedSource = source.mappedSourceId ? sourceMap[source.mappedSourceId] : null;
    const inventoryDetails = source.type === 'project-inventory' ? '<small>' + escapeHtml((source.branch || '(detached)') + ' · ' + (source.revision || 'no revision') + ' · ' + (source.dirty ? source.dirtyCount + ' local changes' : 'clean tree')) + '</small>' + (source.repositoryKey ? '<small>Repository identity: ' + escapeHtml(repositoryLabel(source.repositoryKey)) + '</small>' : '') + (mappedSource ? '<small>Human-reviewed mapping: ' + escapeHtml(mappedSource.label) + '</small>' : '') + (source.acknowledged ? '<small>Dev-server changes acknowledged locally</small>' : '') + (source.lastCommit?.subject ? '<small>Last commit: ' + escapeHtml(source.lastCommit.subject) + '</small>' : '') : '';
    const audienceDetails = source.audience
      ? '<small>GitHub audience: ' + escapeHtml(String(source.audience.stars ?? 0)) + ' stars · ' + escapeHtml(String(source.audience.forks ?? 0)) + ' forks' + (source.audience.origin ? ' · ' + escapeHtml(source.audience.origin) : '') + '</small>'
      : '';
    return '<div class="evidence-item"><b>' + escapeHtml(source.label) + '</b><small>' + escapeHtml(source.location) + '</small>' + inventoryDetails + audienceDetails + '</div>';
  }).join('');
  document.getElementById('evidencePanel').innerHTML = '<div class="evidence-heading"><b>Evidence provenance</b><span>' + node.sources.length + ' sources</span></div><div class="evidence-list">' + sourceItemsWithAudience + '</div><div class="evidence-heading"><b>Recommendation score</b><span>' + scoring.score + '/100</span></div><div class="score-breakdown"><span>Readiness <b>' + scoring.breakdown.readiness + '</b></span><span>Evidence <b>' + scoring.breakdown.evidence + '</b></span><span>Leverage <b>' + scoring.breakdown.leverage + '</b></span><span>Focus <b>' + scoring.breakdown.focus + '</b></span><span>Audience <b>' + scoring.breakdown.audience + '</b></span>' + (scoring.inventory.repositories.length ? '<span>Inventory <b>' + scoring.breakdown.inventory + '</b></span>' : '') + (scoring.inventoryPath.total ? '<span>Path coverage <b>' + scoring.breakdown.inventoryPath + '</b></span>' : '') + '</div>' + audienceNote + inventoryNote + inventoryPathNote + pathHealthNote + '<small class="path-note">Current path: ' + escapeHtml(path || 'No path yet') + '</small><button class="secondary path-action" data-add-path="' + escapeHtml(node.id) + '">Add path to focus queue</button><div class="evidence-heading"><b>Relationships</b><span>human review</span></div><div class="relationship-list">' + (relationships || '<small>No relationships recorded.</small>') + '</div>';
}

async function renderActivity(node) {
  const panel = document.getElementById('activityPanel');
  const request = ++activityRequest;
  if (!panel) return;
  panel.innerHTML = '<div class="evidence-heading"><b>Recent repository activity</b><span>Loading…</span></div>';
  const enabledRepositoryIds = new Set(atlasState.graph.sources.filter(source => source.type === 'repository' && source.enabled && node.sources?.includes(source.id)).map(source => source.id));
  if (!enabledRepositoryIds.size) {
    panel.innerHTML = '<div class="evidence-heading"><b>Recent repository activity</b></div><small>No enabled public GitHub sources are linked to this node. Local vault contents are not searched for activity.</small>';
    return;
  }
  try {
    const manifestResponse = await fetch('/api/source-manifest');
    if (!manifestResponse.ok) throw new Error('source manifest unavailable');
    const manifest = await manifestResponse.json();
    const sources = selectActivitySources(node, atlasState.graph.sources, manifest.sources);
    if (!sources.length) {
      panel.innerHTML = '<div class="evidence-heading"><b>Recent repository activity</b></div><small>No enabled public GitHub sources are available for this node.</small>';
      return;
    }
    const results = await Promise.allSettled(sources.map(async source => {
      const response = await fetch('/api/github/inspect?source=' + encodeURIComponent(source.id));
      if (!response.ok) throw new Error('source unavailable');
      const result = await response.json();
      return { source, activity: Array.isArray(result.activity) ? result.activity : [] };
    }));
    if (request !== activityRequest || atlasState.selectedNode !== node.id) return;
    const { entries, failures } = normalizeActivityResults(results);
    const heading = '<div class="evidence-heading"><b>Recent repository activity</b><span>' + entries.length + ' commits' + (failures ? ' · ' + failures + ' source' + (failures === 1 ? '' : 's') + ' unavailable' : '') + '</span></div>';
    if (!entries.length) {
      panel.innerHTML = heading + (failures ? '<small>Recent activity is unavailable for linked sources. Try again later.</small>' : '<small>No recent commits were reported by linked sources.</small>');
      return;
    }
    panel.innerHTML = heading + '<div class="activity-list">' + entries.slice(0, 20).map(item => {
      const safeUrl = item.url;
      const isoDate = item.date || '';
      const dateLabel = isoDate ? isoDate.slice(0, 10) : 'Date unavailable';
      const label = escapeHtml(item.message || 'Commit');
      return '<article class="activity-item"><strong>' + escapeHtml(item.sourceLabel) + '</strong><time' + (isoDate ? ' datetime="' + isoDate + '"' : '') + '>' + dateLabel + '</time><p>' + (safeUrl ? '<a href="' + escapeHtml(safeUrl) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>' : label) + '</p></article>';
    }).join('') + '</div>';
  } catch {
    if (request !== activityRequest || atlasState.selectedNode !== node.id) return;
    panel.innerHTML = '<div class="evidence-heading"><b>Recent repository activity</b></div><small>Activity could not be loaded. Try again later.</small>';
  }
}

function prioritizeSelected() {
  const key = atlasState.selectedNode || 'atlas';
  const title = data[key]?.title || key;
  const result = raiseFocusQueuePriority(atlasState.focusQueue, key, atlasState.graph.nodes.map(node => node.id));
  saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
  renderFocusQueue();
  renderGraphSectionCounts();
  if (!result.ok) {
    flash(result.full ? (title + ' could not be prioritized: the focus queue is full.') : (title + ' could not be prioritized.'));
    return;
  }
  flash(title + (result.added ? ' added at the top of your focus queue as In progress.' : ' raised to the top of your focus queue as In progress.'));
}

function prioritizePath(nodeId) {
  const path = deriveBuildPath(atlasState.graph, nodeId);
  if (!path.length) {
    flash('No build path is available for this node yet.');
    return;
  }
  const before = atlasState.focusQueue.length;
  const already = path.filter(id => atlasState.focusQueue.some(entry => entry.nodeId === id)).length;
  const pending = path.length - already;
  addFocusQueueNodes(atlasState.focusQueue, path, atlasState.graph.nodes.map(node => node.id));
  const added = atlasState.focusQueue.length - before;
  saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
  renderFocusQueue();
  renderGraphSectionCounts();
  if (added === 0 && already === path.length) {
    flash('All ' + path.length + ' path step' + (path.length === 1 ? '' : 's') + ' are already in your focus queue.');
    return;
  }
  flash(added + ' of ' + path.length + ' path step' + (path.length === 1 ? '' : 's') + ' added to your focus queue.' + (added < pending ? ' Queue limit reached.' : ''));
}

async function refreshSources() {
  const button = document.getElementById('refreshSources');
  button.disabled = true;
  button.textContent = 'Refreshing…';
  try {
    const manifest = await fetch('/api/source-manifest').then(response => response.json());
    const enabledIds = new Set(atlasState.graph.sources.filter(source => source.enabled).map(source => source.id));
    const sources = manifest.sources.filter(source => enabledIds.has(source.id) && source.kind === 'github-repository');
    const results = await Promise.all(sources.map(source => fetch('/api/github/inspect?source=' + encodeURIComponent(source.id)).then(response => response.json())));
    results.filter(result => result.repository).forEach(result => {
      const source = atlasState.graph.sources.find(candidate => candidate.id === result.sourceId);
      if (source) {
        source.audience = {
          stars: Number(result.repository.stars) || 0,
          forks: Number(result.repository.forks) || 0,
          origin: result.mode || 'live',
          fetchedAt: result.fetchedAt || new Date().toISOString()
        };
      }
      const node = Object.values(data).find(candidate => candidate.sources.includes(result.sourceId));
      if (!node) return;
      node.meta = 'Indexed · ' + result.evidence.length + ' evidence items';
      node.description = result.repository.description || node.description;
      node.progress = Math.min(99, Math.max(node.progress, 55));
    });
    atlasState.graph.nodes = Object.values(data);
    saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
    selectNode(atlasState.selectedNode || 'atlas');
    const liveCount = results.filter(result => result.mode === 'live').length;
    const offlineCount = results.filter(result => result.mode === 'offline-snapshot').length;
    flash('Sources refreshed: ' + liveCount + ' live, ' + offlineCount + ' offline snapshot.');
  } catch (error) {
    flash('Source refresh failed: ' + error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Refresh sources';
  }
}

async function indexVault() {
  const input = document.querySelector('[data-vault-path]');
  const path = input?.value.trim();
  if (!path) { flash('Enter a confirmed vault path first.'); return; }
  const button = document.querySelector('[data-index-vault]');
  button.disabled = true;
  button.textContent = 'Indexing…';
  try {
    const response = await fetch('/api/vault/inspect?path=' + encodeURIComponent(path));
    const result = await response.json();
    if (!response.ok || result.ok === false) throw new Error(result.error || 'Vault scan failed');
    const source = atlasState.graph.sources.find(candidate => candidate.id === 'vault-source');
    if (source) { source.location = path; source.enabled = true; source.lastIndexedAt = result.scannedAt; }
    const vaultNode = data.vault;
    if (vaultNode) { vaultNode.meta = 'Indexed · ' + result.noteCount + ' notes · metadata-only'; vaultNode.progress = Math.min(99, Math.max(vaultNode.progress, result.noteCount ? 72 : 64)); }
    (result.candidates?.candidates || []).forEach(candidate => {
      if (data[candidate.id]) return;
      const node = { id: candidate.id, kind: candidate.kind, title: candidate.title, meta: 'Vault signal · ' + candidate.evidenceCount + ' occurrences', icon: candidate.kind === 'idea' ? '✦' : '⌁', description: 'Metadata-derived candidate from the confirmed local vault. Note bodies are not included.', tags: (candidate.tags || []).map(tag => '#' + tag), progress: Math.round(candidate.confidence * 45), status: candidate.kind === 'idea' ? 'idea' : 'active', displayStatus: candidate.kind === 'idea' ? 'Idea' : 'Available', sources: ['vault-source'], confidence: candidate.confidence, provenance: candidate.provenance };
      atlasState.graph.nodes.push(node); data[node.id] = node;
    });
    saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
    renderGraphSectionCounts();
    renderSources();
    selectNode('vault');
    flash('Vault indexed: ' + result.noteCount + ' metadata-only notes.');
  } catch (error) { flash('Vault indexing failed: ' + error.message); }
  finally { button.disabled = false; button.textContent = 'Index metadata'; }
}

function exportSnapshot() {
  const snapshot = snapshotForExport({ graph: atlasState.graph, focusQueue: atlasState.focusQueue, selectedNode: atlasState.selectedNode });
  const payload = JSON.stringify(snapshot, null, 2);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'project-atlas-snapshot.json';
  link.click();
  URL.revokeObjectURL(link.href);
  flash('Graph snapshot exported.');
}

function importSnapshot(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.graph || !validateGraph(imported.graph).valid) throw new Error('Invalid graph snapshot');
      atlasState.graph = imported.graph;
      atlasState.focusQueue = normalizeFocusQueue(imported.focusQueue, atlasState.graph.nodes.map(node => node.id));
      atlasState.selectedNode = imported.selectedNode || 'atlas';
      Object.keys(data).forEach(key => delete data[key]);
      atlasState.graph.nodes.forEach(node => { data[node.id] = node; });
      saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
      renderFocusQueue();
      selectNode(atlasState.selectedNode);
      flash('Graph snapshot imported.');
    } catch (error) { flash('Import failed: ' + error.message); }
  };
  reader.readAsText(file);
}

document.addEventListener('click', event => {
  const graphSectionButton = event.target.closest('[data-graph-section]');
  if (graphSectionButton) { activateGraphSection(graphSectionButton.dataset.graphSection); return; }
  if (event.target.closest('[data-open-search], #openGraphSearch')) { openGraphSearch(); return; }
  const searchResult = event.target.closest('[data-search-node]');
  if (searchResult) {
    selectNode(searchResult.dataset.searchNode);
    graphSearchDialog.close();
    return;
  }
  if (event.target.closest('#taskmasterLinkButton')) {
    const task = taskMasterSelectedTask();
    const nodeId = document.getElementById('taskmasterNodeSelect').value;
    if (!task || !nodeId || !atlasState.graph.nodes.some(node => node.id === nodeId)) {
      document.getElementById('taskmasterLinkMessage').textContent = 'Choose a task and an existing graph node.';
    } else {
      taskMasterMapping[task.id] = nodeId;
      renderTaskMasterImport();
      document.getElementById('taskmasterLinkMessage').textContent = 'Explicit mapping saved for this tab only.';
    }
    return;
  }
  const statusChoice = event.target.closest('[data-taskmaster-status]');
  if (statusChoice) {
    const entry = atlasState.focusQueue.find(item => item.nodeId === statusChoice.dataset.taskmasterStatus);
    if (entry && ['queued', 'in_progress', 'blocked', 'done'].includes(statusChoice.dataset.statusChoice)) {
      entry.status = statusChoice.dataset.statusChoice;
      saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
      renderFocusQueue();
      renderTaskMasterImport();
      flash('Focus queue status updated by explicit choice.');
    }
    return;
  }
  const addMappedNode = event.target.closest('[data-taskmaster-add]');
  if (addMappedNode) {
    const nodeId = addMappedNode.dataset.taskmasterAdd;
    const status = addMappedNode.dataset.taskmasterStatusValue;
    let entry = atlasState.focusQueue.find(item => item.nodeId === nodeId);
    if (!entry && data[nodeId]) {
      if (atlasState.focusQueue.length >= 50) {
        document.getElementById('taskmasterLinkMessage').textContent = 'Focus queue is full (50 steps). Remove a step before adding this mapping.';
        return;
      }
      atlasState.focusQueue.push({ nodeId, status, nextReviewDate: '' });
      entry = atlasState.focusQueue.at(-1);
    }
    if (entry) {
      saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
      renderFocusQueue();
      renderTaskMasterImport();
      flash('Mapped roadmap node added to the local focus queue.');
    }
    return;
  }
  const remove = event.target.closest('[data-focus-remove]');
  if (remove) {
    const id = remove.dataset.focusRemove;
    removeFocusQueueNode(atlasState.focusQueue, id);
    saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
    renderFocusQueue();
    flash((data[id]?.title || id) + ' removed from your focus queue.');
    event.stopPropagation();
    return;
  }
  const node = event.target.closest('[data-node]');
  if (node) selectNode(node.dataset.node);
  const inventoryButton = event.target.closest('[data-inventory-review]');
  if (inventoryButton) {
    const reviews = inventoryReviews();
    const id = inventoryButton.dataset.inventoryReview;
    reviews[id] = reviews[id] === 'reviewed' ? 'unreviewed' : 'reviewed';
    localStorage.setItem(INVENTORY_REVIEW_KEY, JSON.stringify(reviews));
    loadInventoryReview();
    flash(reviews[id] === 'reviewed' ? 'Inventory record marked reviewed.' : 'Inventory record returned to review.');
  }
  const acknowledgementButton = event.target.closest('[data-inventory-ack]');
  if (acknowledgementButton) {
    const acknowledgements = inventoryAcknowledgements();
    const id = acknowledgementButton.dataset.inventoryAck;
    acknowledgements[id] = acknowledgements[id] !== true;
    localStorage.setItem(INVENTORY_ACK_KEY, JSON.stringify(acknowledgements));
    syncReviewedInventory(inventoryResults, inventoryReviews());
    renderInventoryResults(document.getElementById('inventoryReview'), inventoryResults);
    flash(acknowledgements[id] ? 'Dev-server changes acknowledged.' : 'Dev-server acknowledgement removed.');
  }
  const refreshButton = event.target.closest('[data-inventory-refresh]');
  if (refreshButton) refreshInventoryRecord(refreshButton);
  const view = event.target.closest('.view');
  if (view) {
    document.querySelectorAll('.view').forEach(button => { button.classList.toggle('active', button === view); button.setAttribute('aria-selected', button === view ? 'true' : 'false'); });
    activateGraphSection('map');
    flash(view.textContent + ' view active');
  }
  if (event.target.closest('#collapse')) {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    event.target.closest('#collapse').textContent = sidebar.classList.contains('collapsed') ? '→' : '←';
  }
  if (event.target.closest('#prioritize')) prioritizeSelected();
  if (event.target.closest('#cta')) prioritizePath(atlasState.selectedNode || 'atlas');
  const pathButton = event.target.closest('[data-add-path]');
  if (pathButton) prioritizePath(pathButton.dataset.addPath);
  if (event.target.closest('#refreshSources')) refreshSources();
  if (event.target.closest('[data-index-vault]')) indexVault();
  if (event.target.closest('#toggleSources')) { document.getElementById('sourcePanel').classList.toggle('hidden'); renderSources(); }
  if (event.target.closest('#mapFilter')) cycleMapFilter();
  if (event.target.closest('#mapZoom')) cycleMapZoom();
  if (event.target.closest('#exportSnapshot')) exportSnapshot();
  if (event.target.closest('#importSnapshot')) document.getElementById('snapshotFile').click();
  const reviewButton = event.target.closest('[data-edge-review]');
  if (reviewButton) {
    const edge = atlasState.graph.edges.find(candidate => candidate.id === reviewButton.dataset.edgeId);
    if (edge) { edge.review = reviewButton.dataset.edgeReview; saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode); selectNode(atlasState.selectedNode); flash('Relationship marked ' + edge.review + '.'); }
  }
  const tab = event.target.closest('[data-tab]');
  if (tab) {
    document.querySelectorAll('[data-tab]').forEach(button => { button.classList.toggle('active', button === tab); button.setAttribute('aria-selected', button === tab ? 'true' : 'false'); });
    document.getElementById('evidencePanel').classList.toggle('hidden', tab.dataset.tab !== 'evidence');
    document.getElementById('activityPanel').classList.toggle('hidden', tab.dataset.tab !== 'activity');
    if (tab.dataset.tab === 'evidence') renderEvidence(data[atlasState.selectedNode || 'atlas']);
    if (tab.dataset.tab === 'activity') renderActivity(data[atlasState.selectedNode || 'atlas']);
    return;
  }
  if (event.target.closest('#openSourceContext')) {
    document.querySelector('[data-tab="evidence"]')?.click();
    document.getElementById('evidencePanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'taskmasterImportFile') { loadTaskMasterFile(event.target.files[0]); return; }
  if (event.target.id === 'taskmasterTaskSelect') { renderTaskMasterImport(); return; }
  const status = event.target.closest('[data-focus-status]');
  const date = event.target.closest('[data-focus-date]');
  if (status || date) {
    const control = status || date;
    const nodeId = status ? status.dataset.focusStatus : date.dataset.focusDate;
    const changes = status ? { status: status.value } : { nextReviewDate: date.value };
    if (updateFocusQueueEntry(atlasState.focusQueue, nodeId, changes)) {
      saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode);
      renderFocusQueue();
      flash('Focus queue details saved.');
    } else {
      control.setCustomValidity('Choose a supported status or valid ISO date.');
      control.reportValidity();
      control.setCustomValidity('');
      renderFocusQueue();
    }
    return;
  }
  const mapping = event.target.closest('[data-inventory-map]');
  if (!mapping) return;
  const values = inventoryMappings();
  if (mapping.value) values[mapping.dataset.inventoryMap] = mapping.value; else delete values[mapping.dataset.inventoryMap];
  localStorage.setItem(INVENTORY_MAPPING_KEY, JSON.stringify(values));
  syncReviewedInventory(inventoryResults, inventoryReviews());
  renderInventoryResults(document.getElementById('inventoryReview'), inventoryResults);
  flash(mapping.value ? 'Inventory mapping saved for human review.' : 'Inventory mapping removed.');
});

document.addEventListener('input', event => {
 if (event.target.id === 'taskmasterSearch') renderTaskMasterImport();
 if (event.target.id === 'graphSearchInput') renderGraphSearch();
});

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!graphSearchDialog.open) openGraphSearch();
    return;
  }
  if (event.target.matches('input, textarea, select')) return;
  const viewIndex = { '1': 0, '2': 1, '3': 2, '4': 3 }[event.key];
  if (viewIndex === undefined) return;
  const view = document.querySelectorAll('.view')[viewIndex];
  if (view) view.click();
});

document.addEventListener('change', event => {
  const sourceId = event.target.dataset.sourceToggle;
  if (!sourceId) return;
  const source = atlasState.graph.sources.find(candidate => candidate.id === sourceId);
  if (source) { source.enabled = event.target.checked; saveAtlasState(atlasState.graph, atlasState.focusQueue, atlasState.selectedNode); flash(source.label + (source.enabled ? ' enabled.' : ' disabled.')); }
});

document.getElementById('snapshotFile').addEventListener('change', event => {
  if (event.target.files[0]) importSnapshot(event.target.files[0]);
});

const protocolNode = document.createElement('button');
protocolNode.className = 'node protocol';
protocolNode.dataset.node = 'agents-protocol';
protocolNode.innerHTML = '<strong>∿</strong><b>Agents Protocol</b><small>verification spine</small>';
document.querySelector('.constellation')?.append(protocolNode);
loadMapControls();
applyMapZoom();
syncMapExtras();
renderSources();
refreshInventorySummary();
renderReviewedProjects();
renderFocusQueue();
selectNode(atlasState.selectedNode || 'atlas');
applyMapFilter();
