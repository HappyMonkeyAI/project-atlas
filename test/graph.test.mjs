import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadGraphApi() {
  const source = await readFile(new URL('../graph.js', import.meta.url), 'utf8');
  const context = { repositoryIdentity: value => String(value || '').trim().toLowerCase() };
  vm.runInNewContext(source + '\nthis.__api = { validateGraph, deriveBuildPath, prerequisiteEdges, unlockEdges, inventoryPrerequisiteScore, audiencePoints, audienceScore, scoreNode };', context);
  return context.__api;
}

test('large graph validation and path derivation stay bounded', async () => {
  const { validateGraph, deriveBuildPath } = await loadGraphApi();
  const nodes = Array.from({ length: 1200 }, (_, index) => ({ id: 'node-' + index, kind: index === 1199 ? 'idea' : 'capability', title: 'Node ' + index, status: index === 1199 ? 'idea' : 'built', progress: index === 1199 ? 10 : 80, tags: [], sources: ['fixture'], confidence: 0.8 }));
  const edges = Array.from({ length: 1199 }, (_, index) => ({ id: 'edge-' + index, from: 'node-' + index, to: 'node-' + (index + 1), kind: 'enables', confidence: 0.8, review: 'accepted', evidence: ['fixture'] }));
  const graph = { nodes, edges, sources: [{ id: 'fixture', type: 'fixture', label: 'Fixture', location: 'test', enabled: true }] };
  const started = performance.now();
  assert.equal(validateGraph(graph).valid, true);
  const path = deriveBuildPath(graph, 'node-1199');
  const elapsed = performance.now() - started;
  assert.equal(path.length, 1200);
  assert.ok(elapsed < 1000, 'large graph operations exceeded 1 second: ' + Math.round(elapsed) + 'ms');
});

test('build paths include only non-rejected prerequisite and enabling edges', async () => {
  const { deriveBuildPath, prerequisiteEdges, unlockEdges } = await loadGraphApi();
  const nodes = ['base', 'branch', 'target', 'related', 'derived'].map(id => ({ id, title: id }));
  const graph = { nodes, edges: [
    { id: 'base-target', from: 'base', to: 'target', kind: 'depends_on', review: 'accepted' },
    { id: 'branch-target', from: 'branch', to: 'target', kind: 'enables', review: 'suggested' },
    { id: 'related-target', from: 'related', to: 'target', kind: 'related_to', review: 'accepted' },
    { id: 'derived-target', from: 'derived', to: 'target', kind: 'derived_from', review: 'accepted' },
    { id: 'rejected-target', from: 'related', to: 'target', kind: 'depends_on', review: 'rejected' },
    { id: 'deferred-target', from: 'related', to: 'target', kind: 'enables', review: 'deferred' }
  ] };
  assert.deepEqual(Array.from(prerequisiteEdges(graph, 'target'), edge => edge.from), ['base', 'branch']);
  assert.deepEqual(Array.from(unlockEdges(graph, 'base'), edge => edge.to), ['target']);
  assert.deepEqual(Array.from(deriveBuildPath(graph, 'target')), ['base', 'branch', 'target']);
  assert.deepEqual(Array.from(deriveBuildPath(graph, 'missing')), []);
});

test('build path traversal terminates on prerequisite cycles', async () => {
  const { deriveBuildPath } = await loadGraphApi();
  const graph = { nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], edges: [
    { from: 'a', to: 'b', kind: 'depends_on', review: 'accepted' },
    { from: 'b', to: 'a', kind: 'enables', review: 'accepted' },
    { from: 'b', to: 'c', kind: 'depends_on', review: 'accepted' }
  ] };
  assert.deepEqual(Array.from(deriveBuildPath(graph, 'c')), ['a', 'b', 'c']);
});

test('audience score is capped and ignores nodes without public GitHub audience', async () => {
  const { audiencePoints, audienceScore, scoreNode } = await loadGraphApi();
  assert.equal(audiencePoints(0, 0), 0);
  assert.ok(audiencePoints(1000, 100) <= 10);
  assert.ok(audiencePoints(1000, 100) > audiencePoints(10, 1));
  const graph = {
    nodes: [
      { id: 'taskmaster', kind: 'project', progress: 80, confidence: 0.9, sources: ['taskmaster-repo'], tags: [] },
      { id: 'vault', kind: 'source', progress: 60, confidence: 0.7, sources: ['vault-source'], tags: [] }
    ],
    edges: [],
    sources: [
      { id: 'taskmaster-repo', type: 'repository', audience: { stars: 120, forks: 18 } },
      { id: 'vault-source', type: 'vault' }
    ]
  };
  assert.equal(audienceScore(graph, graph.nodes[1]).available, false);
  assert.equal(audienceScore(graph, graph.nodes[1]).score, 0);
  const scored = audienceScore(graph, graph.nodes[0]);
  assert.equal(scored.available, true);
  assert.equal(scored.stars, 120);
  assert.ok(scored.score > 0 && scored.score <= 10);
  assert.equal(scoreNode(graph, 'taskmaster').breakdown.audience, scored.score);
});

test('candidate nodes require a valid disposition and accept the candidate kind', async () => {
  const { validateGraph } = await loadGraphApi();
  const base = {
    nodes: [
      { id: 'vault', kind: 'source', title: 'Vault', sources: ['vault-source'] },
      { id: 'cand', kind: 'candidate', title: 'Lead', sources: ['research-ecosystem-wiki'], disposition: 'pattern' }
    ],
    edges: [],
    sources: [
      { id: 'vault-source', type: 'vault', label: 'Vault', location: 'local', enabled: true },
      { id: 'research-ecosystem-wiki', type: 'wiki-page', label: 'Ecosystem', location: 'kb_vault', enabled: true }
    ]
  };
  assert.equal(validateGraph(base).valid, true);
  assert.equal(validateGraph({ ...base, nodes: [{ id: 'bad', kind: 'candidate', title: 'Bad', sources: [], disposition: 'maybe' }] }).valid, false);
  assert.equal(validateGraph({ ...base, nodes: [{ id: 'bad2', kind: 'candidate', title: 'Bad', sources: [] }] }).valid, false);
});

test('inventory prerequisite coverage ignores related and derived edges', async () => {
  const { inventoryPrerequisiteScore } = await loadGraphApi();
  const graph = {
    nodes: [
      { id: 'prereq', kind: 'project', sources: ['source-a'] },
      { id: 'related', kind: 'project', sources: ['source-b'] },
      { id: 'idea', kind: 'idea', sources: [] }
    ],
    sources: [
      { id: 'source-a', location: 'https://github.com/example/a' },
      { id: 'source-b', location: 'https://github.com/example/b' },
      { id: 'inventory-a', type: 'project-inventory', repositoryKey: 'https://github.com/example/a', state: 'clean' },
      { id: 'inventory-b', type: 'project-inventory', repositoryKey: 'https://github.com/example/b', state: 'clean' }
    ],
    edges: [
      { from: 'prereq', to: 'idea', kind: 'depends_on', review: 'accepted' },
      { from: 'related', to: 'idea', kind: 'related_to', review: 'accepted' },
      { from: 'related', to: 'idea', kind: 'derived_from', review: 'accepted' }
    ]
  };
  assert.deepEqual(JSON.parse(JSON.stringify(inventoryPrerequisiteScore(graph, graph.nodes[2]))), { score: 4, covered: 1, total: 1, health: 10 });
});
