export type AtlasNode = { id: string; title: string; kind: 'project' | 'capability' | 'idea' | 'source' | 'candidate'; status: 'active' | 'complete' | 'future'; summary: string; color: string; x: number; y: number; z: number; disposition?: 'benchmark' | 'pattern' | 'reject' | 'adopt' }
export const atlasNodes: AtlasNode[] = [
  { id: 'atlas', title: 'Project Atlas', kind: 'project', status: 'active', summary: 'Roadmap intelligence workspace', color: '#28d7ea', x: 0, y: 0, z: 0 },
  { id: 'taskmaster', title: 'TaskMaster', kind: 'project', status: 'complete', summary: 'Tasks and goals · example', color: '#f6bc5f', x: -2.8, y: 1.1, z: -.2 },
  { id: 'vibes', title: 'Vibes Dashboard', kind: 'project', status: 'active', summary: 'Modular shell · example', color: '#4d9dff', x: 2.7, y: 1.1, z: -.4 },
  { id: 'vault', title: 'Knowledge vault', kind: 'source', status: 'complete', summary: 'Local notes · metadata-only', color: '#49df98', x: -2.4, y: -1.5, z: .1 },
  { id: 'protocol', title: 'Agents Protocol', kind: 'capability', status: 'active', summary: 'Verification spine', color: '#b98dff', x: 2.1, y: -1.5, z: 0 },
  { id: 'cli', title: 'Dev tooling', kind: 'capability', status: 'active', summary: 'Automation building blocks', color: '#f6bc5f', x: -1.2, y: -2.2, z: .1 },
  { id: 'mentor', title: 'AI study buddy', kind: 'idea', status: 'future', summary: 'Guided learning workspace', color: '#49df98', x: -4.4, y: 2.7, z: -.6 },
  { id: 'graph', title: 'Knowledge graph', kind: 'idea', status: 'future', summary: 'Recommendation layer', color: '#b98dff', x: 4.3, y: -2.4, z: -.8 },
  { id: 'candidate-approval-pattern', title: 'Approval-gated actions', kind: 'candidate', status: 'future', summary: 'Pattern · observe→approve→act', color: '#f6bc5f', x: -1.2, y: 3.2, z: -.4, disposition: 'pattern' },
  { id: 'candidate-sandbox', title: 'Disposable sandbox', kind: 'candidate', status: 'future', summary: 'Benchmark · isolation lab first', color: '#49df98', x: 1.4, y: 3.1, z: -.5, disposition: 'benchmark' },
  { id: 'candidate-memory-flood', title: 'Yet another memory system', kind: 'candidate', status: 'future', summary: 'Reject · benchmark before adopt', color: '#b98dff', x: 3.4, y: 3.5, z: -.5, disposition: 'reject' },
]
export const atlasEdges: Array<[string, string]> = [
  ['taskmaster', 'atlas'], ['vibes', 'atlas'], ['protocol', 'atlas'], ['cli', 'atlas'],
  ['vault', 'graph'], ['atlas', 'graph'], ['cli', 'graph'], ['vault', 'mentor'],
  ['taskmaster', 'mentor'],
  ['vault', 'candidate-approval-pattern'], ['vault', 'candidate-sandbox'], ['vault', 'candidate-memory-flood'],
  ['protocol', 'candidate-approval-pattern'],
]
