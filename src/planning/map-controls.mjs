export const MAP_FILTER_KINDS = Object.freeze(['all', 'project', 'capability', 'idea', 'candidate', 'source']);
export const MAP_ZOOM_PERCENTAGES = Object.freeze([75, 100, 125, 150]);

export function normalizeMapFilter(kind) {
  return MAP_FILTER_KINDS.includes(kind) ? kind : 'all';
}

export function normalizeMapZoom(percent) {
  const value = Number(percent);
  return MAP_ZOOM_PERCENTAGES.includes(value) ? value : 100;
}

export function nextMapFilter(current) {
  const kind = normalizeMapFilter(current);
  const index = MAP_FILTER_KINDS.indexOf(kind);
  return MAP_FILTER_KINDS[(index + 1) % MAP_FILTER_KINDS.length];
}

export function nextMapZoom(current) {
  const percent = normalizeMapZoom(current);
  const index = MAP_ZOOM_PERCENTAGES.indexOf(percent);
  return MAP_ZOOM_PERCENTAGES[(index + 1) % MAP_ZOOM_PERCENTAGES.length];
}

export function countNodesMatchingMapFilter(nodes, kind) {
  if (!Array.isArray(nodes)) return 0;
  const filter = normalizeMapFilter(kind);
  if (filter === 'all') return nodes.length;
  return nodes.filter(node => nodeMatchesMapFilter(node, filter)).length;
}

export function mapFilterLabel(kind, matchCount = null) {
  const normalized = normalizeMapFilter(kind);
  const base = normalized === 'all' ? 'Filter: All' : 'Filter: ' + normalized.charAt(0).toUpperCase() + normalized.slice(1);
  if (normalized !== 'all' && typeof matchCount === 'number') {
    return base + ' (' + matchCount + ')';
  }
  return base;
}

export function mapFilterAriaLabel(kind, matchCount = null) {
  const normalized = normalizeMapFilter(kind);
  if (normalized === 'all') {
    return 'Map filter all. Click to cycle node kinds.';
  }
  const count = typeof matchCount === 'number' ? matchCount : 0;
  return 'Map filter ' + normalized + ' (' + count + '). Click to cycle node kinds.';
}

export function mapZoomLabel(percent) {
  return 'Zoom ' + normalizeMapZoom(percent) + '%';
}

export function nodeMatchesMapFilter(node, kind) {
  const filter = normalizeMapFilter(kind);
  if (filter === 'all') return true;
  return Boolean(node) && node.kind === filter;
}

/** When a kind filter hides every node in the Tree prerequisite path. */
export function treeFilterEmptyMessage(kind) {
  const filter = normalizeMapFilter(kind);
  if (filter === 'all') return null;
  return 'No nodes match ' + mapFilterLabel(filter) + ' in this prerequisite path.';
}

/** When a kind filter hides every reviewed-project button. */
export function reviewedFilterEmptyMessage(kind) {
  const filter = normalizeMapFilter(kind);
  if (filter === 'all') return null;
  return 'No reviewed projects match ' + mapFilterLabel(filter) + '.';
}
