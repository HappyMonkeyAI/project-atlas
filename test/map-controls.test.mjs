import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAP_FILTER_KINDS,
  MAP_ZOOM_PERCENTAGES,
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
} from '../src/planning/map-controls.mjs';

test('map filter cycles through known kinds and falls back to all', () => {
  assert.equal(normalizeMapFilter('bogus'), 'all');
  assert.equal(nextMapFilter('all'), 'project');
  assert.equal(nextMapFilter('source'), 'all');
  assert.deepEqual(MAP_FILTER_KINDS, ['all', 'project', 'capability', 'idea', 'candidate', 'source']);
});

test('map zoom cycles through bounded percentages', () => {
  assert.equal(normalizeMapZoom(12), 100);
  assert.equal(nextMapZoom(100), 125);
  assert.equal(nextMapZoom(150), 75);
  assert.deepEqual(MAP_ZOOM_PERCENTAGES, [75, 100, 125, 150]);
});

test('labels and node matching stay graph-kind honest', () => {
  assert.equal(mapFilterLabel('candidate'), 'Filter: Candidate');
  assert.equal(mapFilterLabel('candidate', 24), 'Filter: Candidate (24)');
  assert.equal(mapFilterLabel('idea', 0), 'Filter: Idea (0)');
  assert.equal(mapFilterLabel('all', 24), 'Filter: All');
  assert.equal(mapFilterLabel('all'), 'Filter: All');

  assert.equal(mapFilterAriaLabel('all', 24), 'Map filter all. Click to cycle node kinds.');
  assert.equal(mapFilterAriaLabel('candidate', 24), 'Map filter candidate (24). Click to cycle node kinds.');
  assert.equal(mapFilterAriaLabel('idea', 0), 'Map filter idea (0). Click to cycle node kinds.');

  assert.equal(mapZoomLabel(125), 'Zoom 125%');
  assert.equal(nodeMatchesMapFilter({ kind: 'idea' }, 'all'), true);
  assert.equal(nodeMatchesMapFilter({ kind: 'idea' }, 'idea'), true);
  assert.equal(nodeMatchesMapFilter({ kind: 'project' }, 'idea'), false);
  assert.equal(nodeMatchesMapFilter(null, 'project'), false);
});

test('countNodesMatchingMapFilter counts matching nodes correctly and handles edge cases', () => {
  const sampleNodes = [
    { id: '1', kind: 'candidate' },
    { id: '2', kind: 'candidate' },
    { id: '3', kind: 'idea' },
    { id: '4', kind: 'project' }
  ];

  assert.equal(countNodesMatchingMapFilter(sampleNodes, 'all'), 4);
  assert.equal(countNodesMatchingMapFilter(sampleNodes, 'candidate'), 2);
  assert.equal(countNodesMatchingMapFilter(sampleNodes, 'idea'), 1);
  assert.equal(countNodesMatchingMapFilter(sampleNodes, 'capability'), 0);
  assert.equal(countNodesMatchingMapFilter(sampleNodes, 'source'), 0);

  assert.equal(countNodesMatchingMapFilter([], 'candidate'), 0);
  assert.equal(countNodesMatchingMapFilter(null, 'candidate'), 0);
  assert.equal(countNodesMatchingMapFilter(undefined, 'candidate'), 0);
});

test('tree and reviewed empty notes stay honest for kind filters', () => {
  assert.equal(treeFilterEmptyMessage('all'), null);
  assert.equal(reviewedFilterEmptyMessage('all'), null);
  assert.equal(
    treeFilterEmptyMessage('candidate'),
    'No nodes match Filter: Candidate in this prerequisite path.'
  );
  assert.equal(
    reviewedFilterEmptyMessage('candidate'),
    'No reviewed projects match Filter: Candidate.'
  );
});
