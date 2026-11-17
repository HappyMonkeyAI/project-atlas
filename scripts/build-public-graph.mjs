/**
 * Maintainer-only helper (not CI / not npm script).
 * Regenerates the committed public demo `graph.js` from a gitignored private
 * backup on the author's machine. Clones already have `graph.js` — you do not
 * need this script to run Atlas.
 *
 * Requires: data/private/graph.backup-*.js (gitignored), or set ATLAS_GRAPH_BACKUP.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const backupPath = process.env.ATLAS_GRAPH_BACKUP || 'data/private/graph.backup-2026-11-17.js';
if (!existsSync(backupPath)) {
  console.error(
    'build-public-graph: missing private backup at ' + backupPath + '.\n' +
    'This is a one-time local maintainer tool. Committed graph.js is already the public artifact.\n' +
    'Set ATLAS_GRAPH_BACKUP to a local prior graph.js if you need to regenerate.'
  );
  process.exit(1);
}

const backup = readFileSync(backupPath, 'utf8').replace(/\r\n/g, '\n');
const marker = 'const ATLAS_NODE_KINDS';
const idx = backup.indexOf(marker);
if (idx < 0) throw new Error('helpers marker missing');
const migrateStart = backup.indexOf('function migrateGraph(saved)', idx);
const migrateEnd = backup.indexOf('const FOCUS_QUEUE_STATUSES', migrateStart);
if (migrateStart < 0 || migrateEnd < 0) throw new Error('migrateGraph block not found for replacement');

const newMigrate = `function migrateGraph(saved) {
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
`;

const helpers = backup.slice(idx, migrateStart) + newMigrate + backup.slice(migrateEnd);

const demo = `const ATLAS_STORAGE_KEY = 'project-atlas.graph.v1';
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
`;

writeFileSync('graph.js', demo + '\n' + helpers);
console.log('wrote graph.js bytes=' + readFileSync('graph.js').length);
