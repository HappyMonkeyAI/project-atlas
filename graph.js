const ATLAS_STORAGE_KEY = 'project-atlas.graph.v1';
const ATLAS_QUEUE_KEY = 'project-atlas.focus-queue.v1';
const ATLAS_SELECTED_KEY = 'project-atlas.selected-node.v1';
const ATLAS_DEMO_SEED = {
  version: 1, generatedAt: '2026-11-17',
  nodes: [
    { id: 'atlas', kind: 'project', title: 'Project Atlas', meta: 'Active project · demo seed', icon: 'A', description: 'Local-first roadmap intelligence: map repositories, knowledge, current work, and ideas with provenance and reviewable relationships.', tags: ['#visualization', '#ai', '#productivity'], progress: 40, status: 'active', displayStatus: 'On track', sources: ['atlas-source'], confidence: 0.98 },
    { id: 'taskmaster', kind: 'project', title: 'TaskMaster', meta: 'Built project · example', icon: '✓', description: 'Example completed project (HappyMonkeyAI/VueJS-Todo): nested tasks, goals, notes, and local persistence patterns.', tags: ['#vue', '#todos', '#ai'], progress: 86, status: 'built', displayStatus: 'Built', sources: ['taskmaster-repo'], confidence: 0.99 },
    { id: 'vibes', kind: 'project', title: 'Vibes Dashboard', meta: 'Built project · example', icon: 'V', description: 'Example modular dashboard shell (HappyMonkeyAI/vibes-dashboard) showing reusable UI and Three.js backdrop patterns.', tags: ['#modules', '#threejs', '#dashboard'], progress: 72, status: 'built', displayStatus: 'Built', sources: ['vibes-repo'], confidence: 0.99 },
    { id: 'agents-protocol', kind: 'capability', title: 'Agents Protocol', meta: 'Capability · verification spine', icon: '∿', description: 'Documented agent-development framework with context files, ADRs, MCP routing, and a verification ladder.', tags: ['#agents', '#verification', '#workflow'], progress: 62, status: 'active', displayStatus: 'Available', sources: ['agents-protocol-repo'], confidence: 0.9 },
    { id: 'vault', kind: 'source', title: 'Knowledge vault', meta: 'Local source · metadata-only', icon: '⌁', description: 'Connect your own notes vault at a user-confirmed path. Atlas indexes metadata (titles, tags, headings) — never note bodies by default.', tags: ['#knowledge', '#notes', '#local'], progress: 64, status: 'active', displayStatus: 'Ready', sources: ['vault-source'], confidence: 0.7 },
    { id: 'cli', kind: 'capability', title: 'Dev tooling', meta: 'Capability · automation', icon: '>_', description: 'Reusable development utilities that can become building blocks for the roadmap system.', tags: ['#tooling', '#automation', '#github'], progress: 58, status: 'active', displayStatus: 'Available', sources: ['taskmaster-repo', 'vibes-repo'], confidence: 0.75 },
    { id: 'mentor', kind: 'idea', title: 'AI study buddy', meta: 'Future idea · example', icon: '✦', description: 'Example future idea: a learning companion that turns notes and repos into explanations and guided next steps.', tags: ['#learning', '#ai', '#future'], progress: 22, status: 'idea', displayStatus: 'Idea', sources: ['vault-source'], confidence: 0.62 },
    { id: 'graph', kind: 'idea', title: 'Knowledge graph intelligence', meta: 'Future idea · example', icon: '◌', description: 'Connect notes, repositories, capabilities, and ideas into an explainable recommendation layer.', tags: ['#graph', '#recommendations', '#future'], progress: 18, status: 'idea', displayStatus: 'Idea', sources: ['atlas-source', 'vault-source'], confidence: 0.84 },
    { id: 'candidate-approval-pattern', kind: 'candidate', title: 'Approval-gated actions (pattern)', meta: 'Disposition · pattern', icon: '◎', description: 'Example candidate: observe → approve → act → verify. Mine the pattern; do not adopt a third-party product wholesale.', tags: ['#approval', '#agents', '#pattern'], progress: 30, status: 'planned', displayStatus: 'Pattern', disposition: 'pattern', sources: ['demo-research-notes'], confidence: 0.8 },
    { id: 'candidate-sandbox', kind: 'candidate', title: 'Disposable sandbox (benchmark)', meta: 'Disposition · benchmark', icon: '◎', description: 'Example candidate: evaluate isolation runtimes in a disposable lab before any host-local smoke with real credentials.', tags: ['#sandbox', '#safety', '#benchmark'], progress: 25, status: 'planned', displayStatus: 'Benchmark', disposition: 'benchmark', sources: ['demo-research-notes'], confidence: 0.76 },
    { id: 'candidate-memory-flood', kind: 'candidate', title: 'Yet another memory system (reject)', meta: 'Disposition · reject', icon: '◎', description: 'Example reject: do not add another memory stack until a scrubbed benchmark beats your existing wiki + search path.', tags: ['#memory', '#rag', '#reject'], progress: 10, status: 'planned', displayStatus: 'Reject', disposition: 'reject', sources: ['demo-research-notes'], confidence: 0.7 }
  ],
  edges: [
    { id: 'edge-taskmaster-atlas', from: 'taskmaster', to: 'atlas', kind: 'related_to', confidence: 0.85, review: 'accepted', evidence: ['github:HappyMonkeyAI/VueJS-Todo'] },
    { id: 'edge-vibes-atlas', from: 'vibes', to: 'atlas', kind: 'related_to', confidence: 0.85, review: 'accepted', evidence: ['github:HappyMonkeyAI/vibes-dashboard'] },
    { id: 'edge-protocol-atlas', from: 'agents-protocol', to: 'atlas', kind: 'enables', confidence: 0.9, review: 'accepted', evidence: ['github:HappyMonkeyAI/AgentsProtocol'] },
    { id: 'edge-cli-atlas', from: 'cli', to: 'atlas', kind: 'enables', confidence: 0.7, review: 'suggested', evidence: ['shared tooling patterns'] },
    { id: 'edge-vault-mentor', from: 'vault', to: 'mentor', kind: 'enables', confidence: 0.75, review: 'suggested', evidence: ['metadata themes'] },
    { id: 'edge-vault-graph', from: 'vault', to: 'graph', kind: 'enables', confidence: 0.8, review: 'suggested', evidence: ['knowledge provenance'] },
    { id: 'edge-atlas-graph', from: 'atlas', to: 'graph', kind: 'enables', confidence: 0.88, review: 'accepted', evidence: ['shared graph model'] },
    { id: 'edge-cli-graph', from: 'cli', to: 'graph', kind: 'related_to', confidence: 0.65, review: 'suggested', evidence: ['automation adjacency'] },
    { id: 'edge-taskmaster-mentor', from: 'taskmaster', to: 'mentor', kind: 'enables', confidence: 0.7, review: 'suggested', evidence: ['goals and notes patterns'] },
    { id: 'edge-vault-approval', from: 'vault', to: 'candidate-approval-pattern', kind: 'derived_from', confidence: 0.7, review: 'suggested', evidence: ['demo research notes'] },
    { id: 'edge-vault-sandbox', from: 'vault', to: 'candidate-sandbox', kind: 'derived_from', confidence: 0.7, review: 'suggested', evidence: ['demo research notes'] },
    { id: 'edge-vault-memory', from: 'vault', to: 'candidate-memory-flood', kind: 'derived_from', confidence: 0.7, review: 'suggested', evidence: ['demo research notes'] },
    { id: 'edge-protocol-approval', from: 'agents-protocol', to: 'candidate-approval-pattern', kind: 'related_to', confidence: 0.72, review: 'suggested', evidence: ['verification ladder adjacency'] }
  ],
  sources: [
    { id: 'atlas-source', type: 'repository', label: 'Project Atlas workspace', location: 'local', enabled: true },
    { id: 'taskmaster-repo', type: 'repository', label: 'HappyMonkeyAI/VueJS-Todo', location: 'https://github.com/HappyMonkeyAI/VueJS-Todo', enabled: true, audience: { stars: 1, forks: 1, snapshot: 'demo' } },
    { id: 'vibes-repo', type: 'repository', label: 'HappyMonkeyAI/vibes-dashboard', location: 'https://github.com/HappyMonkeyAI/vibes-dashboard', enabled: true, audience: { stars: 2, forks: 1, snapshot: 'demo' } },
    { id: 'agents-protocol-repo', type: 'repository', label: 'HappyMonkeyAI/AgentsProtocol', location: 'https://github.com/HappyMonkeyAI/AgentsProtocol', enabled: true, audience: { stars: 5, forks: 3, snapshot: 'demo' } },
    { id: 'vault-source', type: 'vault', label: 'Local knowledge vault', location: 'user-confirmed path required', enabled: false },
    { id: 'demo-research-notes', type: 'wiki-page', label: 'Demo research notes (replace with your wiki)', location: 'local', enabled: true }
  ]
};
const atlasGraph = (globalThis.__atlasLocalSeed && typeof globalThis.__atlasLocalSeed === 'object' && Array.isArray(globalThis.__atlasLocalSeed.nodes))
  ? globalThis.__atlasLocalSeed
  : ATLAS_DEMO_SEED;

const ATLAS_NODE_KINDS = new Set(['project', 'capability', 'idea', 'source', 'candidate']);
const ATLAS_CANDIDATE_DISPOSITIONS = new Set(['benchmark', 'pattern', 'reject', 'adopt']);
function validateGraph(graph) {
  const ids = new Set(graph.nodes.map(node => node.id));
  const errors = [];
  graph.nodes.forEach(node => {
    if (!node.id || !node.title || !ATLAS_NODE_KINDS.has(node.kind)) errors.push('Invalid node: ' + node.id);
    if (!Array.isArray(node.sources)) errors.push('Missing sources: ' + node.id);
    if (node.kind === 'candidate' && !ATLAS_CANDIDATE_DISPOSITIONS.has(node.disposition)) {
      errors.push('Invalid candidate disposition: ' + node.id);
    }
  });
  graph.edges.forEach(edge => {
    if (!ids.has(edge.from) || !ids.has(edge.to)) errors.push('Dangling edge: ' + edge.from + ' -> ' + edge.to);
    if (!edge.kind || typeof edge.confidence !== 'number') errors.push('Invalid edge: ' + edge.from + ' -> ' + edge.to);
  });
  return { valid: errors.length === 0, errors };
}
function migrateGraph(saved) {
  if (saved && validateGraph(saved).valid) {
    // Demo seed must not merge into an existing browser graph (protects local portfolios).
    // Local overlay (__atlasLocalSeed) still merges so owner seed updates flow into saved state.
    if (!globalThis.__atlasLocalSeed) return saved;
    const graph = saved;
    const nodeIds = new Set(graph.nodes.map(node => node.id));
    atlasGraph.nodes.forEach(node => { if (!nodeIds.has(node.id)) graph.nodes.push(structuredClone(node)); });
    const sourceIds = new Set(graph.sources.map(source => source.id));
    atlasGraph.sources.forEach(source => {
      if (!sourceIds.has(source.id)) graph.sources.push(structuredClone(source));
      else {
        const existing = graph.sources.find(candidate => candidate.id === source.id);
        if (existing && source.audience && !existing.audience) existing.audience = structuredClone(source.audience);
      }
    });
    const edgeIds = new Set(graph.edges.map(edge => edge.id));
    atlasGraph.edges.forEach(edge => { if (!edgeIds.has(edge.id)) graph.edges.push(structuredClone(edge)); });
    return graph;
  }
  return structuredClone(atlasGraph);
}
const FOCUS_QUEUE_STATUSES = ['queued', 'in_progress', 'blocked', 'done'];
const MAX_FOCUS_QUEUE_LENGTH = 50;
function isIsoReviewDate(value) { if (value === '') return true; if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(value + 'T00:00:00.000Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value; }
function normalizeFocusQueue(queue, nodeIds) {
  if (!Array.isArray(queue)) return [];
  const known = nodeIds instanceof Set ? nodeIds : new Set(nodeIds || []);
  const seen = new Set();
  const normalized = [];
  for (const entry of queue) {
    const nodeId = typeof entry === 'string' ? entry : entry && typeof entry === 'object' && !Array.isArray(entry) ? entry.nodeId : null;
    if (typeof nodeId !== 'string' || !known.has(nodeId) || seen.has(nodeId)) continue;
    const status = typeof entry === 'object' && entry && FOCUS_QUEUE_STATUSES.includes(entry.status) ? entry.status : 'queued';
    const nextReviewDate = typeof entry === 'object' && entry && isIsoReviewDate(entry.nextReviewDate) ? entry.nextReviewDate : '';
    normalized.push({ nodeId, status, nextReviewDate });
    seen.add(nodeId);
    if (normalized.length >= MAX_FOCUS_QUEUE_LENGTH) break;
  }
  return normalized;
}
function updateFocusQueueEntry(queue, nodeId, changes) {
  const index = queue.findIndex(entry => entry.nodeId === nodeId);
  if (index < 0 || !changes || typeof changes !== 'object') return false;
  const current = queue[index];
  const status = Object.hasOwn(changes, 'status') ? changes.status : current.status;
  const nextReviewDate = Object.hasOwn(changes, 'nextReviewDate') ? changes.nextReviewDate : current.nextReviewDate;
  if (!FOCUS_QUEUE_STATUSES.includes(status) || !isIsoReviewDate(nextReviewDate)) return false;
  queue[index] = { nodeId, status, nextReviewDate };
  return true;
}
function addFocusQueueNodes(queue, nodeIds, knownNodeIds, limit = MAX_FOCUS_QUEUE_LENGTH) {
  const known = knownNodeIds instanceof Set ? knownNodeIds : new Set(knownNodeIds || []);
  const existing = new Set(queue.map(entry => entry.nodeId));
  for (const nodeId of nodeIds) {
    if (queue.length >= Math.min(MAX_FOCUS_QUEUE_LENGTH, limit)) break;
    if (typeof nodeId !== 'string' || !known.has(nodeId) || existing.has(nodeId)) continue;
    queue.push({ nodeId, status: 'queued', nextReviewDate: '' });
    existing.add(nodeId);
  }
  return queue;
}
function raiseFocusQueuePriority(queue, nodeId, knownNodeIds) {
  const known = knownNodeIds instanceof Set ? knownNodeIds : new Set(knownNodeIds || []);
  if (typeof nodeId !== 'string' || !known.has(nodeId)) return { ok: false, added: false, raised: false };
  const index = queue.findIndex(entry => entry.nodeId === nodeId);
  if (index < 0) {
    if (queue.length >= MAX_FOCUS_QUEUE_LENGTH) return { ok: false, added: false, raised: false, full: true };
    queue.unshift({ nodeId, status: 'in_progress', nextReviewDate: '' });
    return { ok: true, added: true, raised: true, status: 'in_progress' };
  }
  const [entry] = queue.splice(index, 1);
  entry.status = 'in_progress';
  queue.unshift(entry);
  return { ok: true, added: false, raised: true, status: 'in_progress' };
}
function removeFocusQueueNode(queue, nodeId) { const index = queue.findIndex(entry => entry.nodeId === nodeId); if (index < 0) return false; queue.splice(index, 1); return true; }
function audiencePoints(stars, forks) {
  const starCount = Math.max(0, Number(stars) || 0);
  const forkCount = Math.max(0, Number(forks) || 0);
  return Math.min(10, Math.round((Math.log10(1 + starCount) * 3.5) + (Math.log10(1 + forkCount) * 2.5)));
}
function audienceScore(graph, node) {
  const sourceIds = Array.isArray(node?.sources) ? node.sources : [];
  const linked = sourceIds.map(id => graph.sources.find(source => source.id === id)).filter(source => source && source.audience && typeof source.audience === 'object');
  if (!linked.length) return { score: 0, stars: null, forks: null, sourceId: null, available: false };
  let best = linked[0];
  let bestScore = audiencePoints(best.audience.stars, best.audience.forks);
  for (const source of linked.slice(1)) {
    const points = audiencePoints(source.audience.stars, source.audience.forks);
    if (points > bestScore) {
      best = source;
      bestScore = points;
    }
  }
  return {
    score: bestScore,
    stars: Number(best.audience.stars) || 0,
    forks: Number(best.audience.forks) || 0,
    sourceId: best.id,
    available: true
  };
}
function loadAtlasState() {
  let saved = null;
  let queue = [];
  let selectedNode = 'atlas';
  try { saved = JSON.parse(localStorage.getItem(ATLAS_STORAGE_KEY) || 'null'); } catch {}
  try { queue = JSON.parse(localStorage.getItem(ATLAS_QUEUE_KEY) || '[]'); } catch {}
  try { selectedNode = localStorage.getItem(ATLAS_SELECTED_KEY) || 'atlas'; } catch {}
  const graph = ensureHeuristicEdges(migrateGraph(saved));
  return { graph, focusQueue: normalizeFocusQueue(queue, graph.nodes.map(node => node.id)), selectedNode };
}
function saveAtlasState(graph, focusQueue, selectedNode) {
  const queue = normalizeFocusQueue(focusQueue, graph.nodes.map(node => node.id));
  localStorage.setItem(ATLAS_STORAGE_KEY, JSON.stringify(graph));
  localStorage.setItem(ATLAS_QUEUE_KEY, JSON.stringify(queue));
  localStorage.setItem(ATLAS_SELECTED_KEY, selectedNode || 'atlas');
}
function inventoryScore(graph, node) {
  const inventorySources = graph.sources.filter(source => source.type === 'project-inventory' && source.repositoryKey);
  const sources = inventorySources.filter(inventory => node.sources?.includes(inventory.id) || node.sources?.some(sourceId => {
    const source = graph.sources.find(candidate => candidate.id === sourceId);
    return source && (inventory.repositoryKey === repositoryIdentity(source.location) || inventory.mappedSourceId === source.id);
  }));
  if (!sources.length) return { score: 0, freshness: 0, hygiene: 0, coverage: 0, repositories: [] };
  const freshnessByState = { clean: 10, stale: 7, dirty: 5, detached: 5, 'stale-detached': 3, 'inspection-error': 0 };
  const freshness = Math.max(...sources.map(source => freshnessByState[source.state] ?? 0));
  const hygiene = sources.every(source => !source.dirty || source.acknowledged) ? 3 : 1;
  const repositories = [...new Set(sources.map(source => source.repositoryKey || source.remote).filter(Boolean))];
  const coverage = Math.min(2, repositories.length);
  return { score: Math.min(15, freshness + hygiene + coverage), freshness, hygiene, coverage, repositories };
}
function inventoryPrerequisiteScore(graph, node) {
  if (node.kind !== 'idea') return { score: 0, covered: 0, total: 0, health: 0 };
  const prerequisiteIds = prerequisiteEdges(graph, node.id).map(edge => edge.from);
  const prerequisites = prerequisiteIds.map(id => graph.nodes.find(candidate => candidate.id === id)).filter(Boolean);
  if (!prerequisites.length) return { score: 0, covered: 0, total: 0, health: 0 };
  const inventorySources = graph.sources.filter(source => source.type === 'project-inventory' && source.repositoryKey);
  const covered = prerequisites.filter(prerequisite => prerequisite.sources?.some(sourceId => {
    const source = graph.sources.find(candidate => candidate.id === sourceId);
    return source && inventorySources.some(inventory => inventory.repositoryKey === repositoryIdentity(source.location) || inventory.mappedSourceId === source.id);
  }));
  const health = covered.length ? Math.round(covered.reduce((sum, prerequisite) => {
    const prerequisiteSourceIds = prerequisite.sources || [];
    const source = inventorySources.find(inventory => prerequisiteSourceIds.some(sourceId => {
      const prerequisiteSource = graph.sources.find(candidate => candidate.id === sourceId);
      return prerequisiteSource && (inventory.repositoryKey === repositoryIdentity(prerequisiteSource.location) || inventory.mappedSourceId === prerequisiteSource.id);
    }));
    return sum + (source ? ({ clean: 10, stale: 7, dirty: 5, detached: 5, 'stale-detached': 3 }[source.state] || 0) : 0);
  }, 0) / covered.length) : 0;
  return { score: Math.min(10, covered.length * 3 + (health >= 7 ? 1 : 0)), covered: covered.length, total: prerequisites.length, health };
}
function scoreNode(graph, nodeId) {
  const node = graph.nodes.find(candidate => candidate.id === nodeId);
  if (!node) return { score: 0, breakdown: {} };
  const edges = graph.edges.filter(edge => edge.from === nodeId || edge.to === nodeId);
  const accepted = edges.filter(edge => edge.review === 'accepted').length;
  const suggested = edges.filter(edge => edge.review === 'suggested').length;
  const readiness = Math.round(node.progress * 0.35);
  const evidence = Math.round(node.confidence * 25);
  const leverage = Math.min(20, (accepted * 8) + (suggested * 4));
  const focus = Math.min(20, node.sources.length * 7);
  const inventory = inventoryScore(graph, node);
  const inventoryPath = inventoryPrerequisiteScore(graph, node);
  const audience = audienceScore(graph, node);
  return {
    score: Math.min(100, readiness + evidence + leverage + focus + inventory.score + inventoryPath.score + audience.score),
    breakdown: {
      readiness,
      evidence,
      leverage,
      focus,
      inventory: inventory.score,
      inventoryFreshness: inventory.freshness,
      inventoryHygiene: inventory.hygiene,
      inventoryCoverage: inventory.coverage,
      inventoryPath: inventoryPath.score,
      audience: audience.score
    },
    inventory,
    inventoryPath,
    audience
  };
}
function ensureHeuristicEdges(graph) {
  const existing = new Set(graph.edges.map(edge => edge.from + '>' + edge.to));
  graph.nodes.filter(node => node.kind === 'idea').forEach(target => {
    graph.nodes.filter(candidate => candidate.id !== target.id && candidate.kind !== 'source').forEach(candidate => {
      const shared = (candidate.tags || []).filter(tag => (target.tags || []).includes(tag));
      const pair = candidate.id + '>' + target.id;
      if (shared.length && !existing.has(pair)) {
        graph.edges.push({ id: 'heuristic-' + candidate.id + '-' + target.id, from: candidate.id, to: target.id, kind: 'related_to', confidence: Math.min(0.78, 0.5 + (shared.length * 0.08)), review: 'suggested', evidence: ['heuristic:shared-tag:' + shared.join(',')] });
        existing.add(pair);
      }
    });
  });
  return graph;
}
function isPrerequisiteEdge(edge) { return ['depends_on', 'enables'].includes(edge.kind) && ['accepted', 'suggested'].includes(edge.review); }
function prerequisiteEdges(graph, nodeId) { return graph.edges.filter(edge => edge.to === nodeId && isPrerequisiteEdge(edge)); }
function unlockEdges(graph, nodeId) { return graph.edges.filter(edge => edge.from === nodeId && isPrerequisiteEdge(edge)); }
function deriveBuildPath(graph, targetId) {
  const path = [];
  const seen = new Set();
  function visit(id) { if (seen.has(id)) return; seen.add(id); prerequisiteEdges(graph, id).forEach(edge => visit(edge.from)); const node = graph.nodes.find(candidate => candidate.id === id); if (node) path.push(node.id); }
  visit(targetId);
  return path;
}
function buildPathInventorySummary(graph, targetId) {
  const path = deriveBuildPath(graph, targetId);
  const checkpoints = path.map(id => graph.nodes.find(node => node.id === id)).filter(Boolean).map(node => ({ node, scoring: scoreNode(graph, node.id) }));
  const covered = checkpoints.filter(item => item.scoring.inventory.score > 0);
  const blockers = covered.filter(item => item.scoring.inventory.freshness < 7 || item.scoring.inventory.hygiene < 3).map(item => ({ id: item.node.id, title: item.node.title }));
  return { total: checkpoints.length, covered: covered.length, blockers, health: covered.length ? Math.round(covered.reduce((sum, item) => sum + item.scoring.inventory.freshness, 0) / covered.length) : 0 };
}
const graphValidation = validateGraph(atlasGraph); if (!graphValidation.valid) console.error('Graph fixture failed validation', graphValidation.errors);

globalThis.__atlasGraph = atlasGraph;
