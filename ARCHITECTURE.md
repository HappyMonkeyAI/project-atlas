# Project Atlas architecture

## Shape

Atlas is a local-first graph application with four layers:

1. Ingestion adapters
2. Normalized graph store
3. Recommendation and planning services
4. Optional local intelligence services
5. Visualization and interaction shell

    GitHub / Vault / Tasks
            ↓
    Source adapters + provenance
            ↓
    Graph store
            ↓
    Edges, evidence, scores, build paths
            ↓
    Optional local model suggestions
            ↓
    Constellation / Radial / Tree / Hex views
            ↓
    Inspector + focus queue

## Proposed module boundaries

- src/ingestion/: source adapters and indexing jobs.
- src/graph/: entity types, edge types, validation, serialization.
- src/intelligence/: suggestions, scoring, and explainability.
- src/model-adapters/: OpenAI-compatible local text/vision adapter with capability detection and time/size limits.
- src/planning/: build paths, focus queue, task linkage.
- src/views/: view-specific projections over the graph.
- src/shell/: navigation, inspector, notifications, persistence.
- docs/adr/: durable architecture decisions.
- .agent/memories/: project-specific lessons and insights.

## Integration strategy

TaskMaster should be treated as a task and goal adapter. Vibes Dashboard should be treated as a possible host shell/module system and a source of reusable visual/runtime patterns. Neither project should be copied wholesale until the graph contract and ownership boundaries are proven.

## Data safety

The vault adapter should default to metadata-only indexing. Full note content should be opt-in, local-only, and excluded from logs and public exports.

## Local model boundary

The local model endpoint is a test-time enhancement, not a requirement for graph correctness. Deterministic parsers and human review must remain functional when the endpoint is unavailable. Model outputs become suggestions or evidence candidates and never accepted graph truth without review.
