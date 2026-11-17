function replacePathInsensitive(value, path) {
  const lowerValue = value.toLowerCase();
  const lowerPath = path.toLowerCase();
  if (!lowerPath) return value;
  let result = '';
  let cursor = 0;
  let match = lowerValue.indexOf(lowerPath, cursor);
  while (match !== -1) {
    result += value.slice(cursor, match) + '[local vault path omitted]';
    cursor = match + path.length;
    match = lowerValue.indexOf(lowerPath, cursor);
  }
  return result + value.slice(cursor);
}

function scrubValue(value, privatePaths) {
  if (typeof value === 'string') {
    return privatePaths.reduce((text, path) => replacePathInsensitive(text, path), value);
  }
  if (Array.isArray(value)) return value.map(item => scrubValue(item, privatePaths));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrubValue(item, privatePaths)]));
  }
  return value;
}

export function snapshotForExport(snapshot) {
  const copy = structuredClone(snapshot);
  const graph = copy?.graph || (Array.isArray(copy?.sources) && Array.isArray(copy?.nodes) ? copy : null);
  const privatePaths = (graph?.sources || [])
    .filter(source => source.type === 'vault')
    .map(source => String(source.location || '').trim())
    .filter(path => path && path !== 'user-confirmed path required');
  const variants = privatePaths.flatMap(path => [path, path.replaceAll('\\', '/'), path.replaceAll('/', '\\')]);
  return scrubValue(copy, [...new Set(variants)]);
}
