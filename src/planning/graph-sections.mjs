const REPOSITORY_SOURCE_TYPES = new Set(['repository', 'project-inventory', 'github-repository']);

function nodeSourceIds(node) {
  return Array.isArray(node?.sources) ? node.sources.filter(id => typeof id === 'string') : [];
}

export function graphSectionNodes(graph, focusQueue = [], section = 'map') {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  if (section === 'map') return nodes;

  if (section === 'current-work') {
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    return (Array.isArray(focusQueue) ? focusQueue : [])
      .map(entry => typeof entry === 'string' ? entry : entry?.nodeId)
      .map(nodeId => nodeById.get(nodeId))
      .filter(Boolean);
  }

  if (section === 'ideas') return nodes.filter(node => node.kind === 'idea');
  if (section === 'candidates') return nodes.filter(node => node.kind === 'candidate');

  const sources = new Map((Array.isArray(graph?.sources) ? graph.sources : []).map(source => [source.id, source]));
  if (section === 'repositories') {
    return nodes.filter(node => nodeSourceIds(node).some(id => REPOSITORY_SOURCE_TYPES.has(sources.get(id)?.type)));
  }
  if (section === 'knowledge') {
    return nodes.filter(node => nodeSourceIds(node).some(id => id === 'vault-source' || sources.get(id)?.type === 'vault' || sources.get(id)?.type === 'wiki-page'));
  }
  return [];
}
