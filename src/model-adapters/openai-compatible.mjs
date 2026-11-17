const baseUrl = process.env.OPENAI_BASE_URL || 'http://192.168.5.229:1234/v1';
const configuredModel = process.env.OPENAI_MODEL || 'google/gemma-4-e2b';

export async function discoverLocalModel() {
  const response = await fetch(baseUrl.replace(/\/$/, '') + '/models', { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Local model endpoint returned ' + response.status);
  const payload = await response.json();
  const models = Array.isArray(payload.data) ? payload.data.map(model => model.id).filter(Boolean) : [];
  return {
    reachable: true,
    baseUrl,
    configuredModel,
    models,
    configuredModelAvailable: models.includes(configuredModel),
    embeddingModels: models.filter(model => model.includes('embed')),
    vision: 'unverified',
    checkedAt: new Date().toISOString()
  };
}
