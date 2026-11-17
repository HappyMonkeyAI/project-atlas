const MAX_ACTIVITY_ITEMS = 20;

export function selectActivitySources(node, graphSources, manifestSources) {
  const nodeSourceIds = new Set(Array.isArray(node?.sources) ? node.sources : []);
  const enabledRepositoryIds = new Set((Array.isArray(graphSources) ? graphSources : [])
    .filter(source => source?.type === 'repository' && source.enabled === true && nodeSourceIds.has(source.id))
    .map(source => source.id));
  return (Array.isArray(manifestSources) ? manifestSources : [])
    .filter(source => source?.kind === 'github-repository' && enabledRepositoryIds.has(source.id));
}

function safeCommitUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || !url.pathname.split('/').includes('commit')) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeActivityResults(results, limit = MAX_ACTIVITY_ITEMS) {
  const entries = [];
  let failures = 0;
  for (const result of Array.isArray(results) ? results : []) {
    if (!result || result.status !== 'fulfilled' || !result.value || typeof result.value !== 'object') {
      failures += 1;
      continue;
    }
    const source = result.value.source || {};
    const sourceLabel = typeof source.label === 'string' && source.label.trim() ? source.label.trim() : String(source.id || 'GitHub source');
    for (const item of Array.isArray(result.value.activity) ? result.value.activity : []) {
      if (!item || typeof item !== 'object') continue;
      const parsedDate = typeof item.date === 'string' ? Date.parse(item.date) : NaN;
      entries.push({
        sourceLabel,
        message: typeof item.message === 'string' && item.message.trim() ? item.message.replace(/\s+/g, ' ').trim().slice(0, 180) : 'Commit',
        date: Number.isFinite(parsedDate) ? new Date(parsedDate).toISOString() : null,
        url: safeCommitUrl(item.url)
      });
    }
  }
  entries.sort((a, b) => (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0));
  const boundedLimit = Number.isFinite(limit) ? Math.max(0, Math.min(MAX_ACTIVITY_ITEMS, Math.floor(limit))) : MAX_ACTIVITY_ITEMS;
  return { entries: entries.slice(0, boundedLimit), failures };
}
