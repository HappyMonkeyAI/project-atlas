const MAX_RESULTS = 20;

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim();
}

function searchableFields(node) {
  return [
    node.title,
    node.kind,
    node.status,
    node.displayStatus,
    node.disposition,
    node.meta,
    ...(Array.isArray(node.tags) ? node.tags : [])
  ].map(normalize).filter(Boolean);
}

export function searchGraphNodes(nodes, query, limit = MAX_RESULTS) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery || !Array.isArray(nodes)) return [];

  const terms = normalizedQuery.split(/\s+/);
  const boundedLimit = Math.max(0, Math.min(MAX_RESULTS, Number.isFinite(limit) ? Math.floor(limit) : MAX_RESULTS));
  if (boundedLimit === 0) return [];

  return nodes.map((node, index) => {
    const title = normalize(node.title);
    const fields = searchableFields(node);
    const searchableText = fields.join(' ');
    if (!terms.every(term => searchableText.includes(term))) return null;

    const rank = title === normalizedQuery ? 0
      : title.startsWith(normalizedQuery) ? 1
        : title.includes(normalizedQuery) ? 2
          : terms.some(term => title.includes(term)) ? 3
            : 4;
    return { node, index, rank };
  }).filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, boundedLimit)
    .map(match => match.node);
}
