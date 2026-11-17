const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'project-atlas-local-index'
};

function repoPath(source) {
  const match = source.url && source.url.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/);
  if (!match) throw new Error('Unsupported GitHub source URL: ' + source.url);
  return match[1];
}

async function readJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: githubHeaders, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('GitHub request failed (' + response.status + '): ' + url);
  return response.json();
}

async function readText(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': githubHeaders['User-Agent'] }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return response.text();
}

function compactText(value, max = 420) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function inspectGitHubSource(source, { fetchImpl = fetch } = {}) {
  const path = repoPath(source);
  let repository;
  let commits;
  let live = true;
  try {
    repository = await readJson('https://api.github.com/repos/' + path, fetchImpl);
    commits = await readJson('https://api.github.com/repos/' + path + '/commits?per_page=5', fetchImpl);
  } catch (error) {
    if (!source.offlineSnapshot) throw error;
    live = false;
    repository = source.offlineSnapshot.repository;
    commits = source.offlineSnapshot.commits || [];
  }
  const rawBase = 'https://raw.githubusercontent.com/' + path + '/' + repository.default_branch + '/';
  let readme = null;
  let packageJson = null;
  let agents = null;
  if (live) [readme, packageJson, agents] = await Promise.all([readText(rawBase + 'README.md', fetchImpl), readText(rawBase + 'package.json', fetchImpl), readText(rawBase + 'AGENTS.md', fetchImpl)]);
  else { readme = source.offlineSnapshot.readme; packageJson = source.offlineSnapshot.packageJson; agents = source.offlineSnapshot.agents; }
  let packageInfo = null;
  try { packageInfo = packageJson ? JSON.parse(packageJson) : null; } catch { packageInfo = null; }
  const evidence = [
    { id: source.id + ':repository', type: 'repository-metadata', source: source.url, summary: repository.description || 'Public GitHub repository', details: { stars: repository.stargazers_count, forks: repository.forks_count, language: repository.language, defaultBranch: repository.default_branch } },
    { id: source.id + ':readme', type: 'readme', source: rawBase + 'README.md', summary: compactText(readme) || 'README unavailable' },
    { id: source.id + ':package', type: 'package-manifest', source: rawBase + 'package.json', summary: packageInfo ? (packageInfo.description || packageInfo.name || 'Package manifest found') : 'package.json unavailable', details: packageInfo ? { name: packageInfo.name, version: packageInfo.version, dependencies: Object.keys(packageInfo.dependencies || {}).slice(0, 20) } : {} },
    { id: source.id + ':agents', type: 'agent-guidance', source: rawBase + 'AGENTS.md', summary: compactText(agents) || 'AGENTS.md unavailable' }
  ];
  return {
    sourceId: source.id,
    repository: { id: source.id, title: repository.name, description: repository.description, defaultBranch: repository.default_branch, stars: repository.stargazers_count, forks: repository.forks_count, language: repository.language, updatedAt: repository.updated_at, url: repository.html_url },
    activity: commits.map(commit => ({ sha: commit.sha, message: compactText(commit.commit?.message, 180), date: commit.commit?.author?.date, url: commit.html_url })),
    evidence,
    mode: live ? 'live' : 'offline-snapshot',
    fetchedAt: new Date().toISOString()
  };
}
