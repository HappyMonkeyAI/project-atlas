# Project Atlas MVP development roadmap

## MVP outcome

Build a local-first web app that can ingest selected GitHub repositories and a confirmed local knowledge-vault path, normalize them into a shared project graph, and help choose a next build through four synchronized views.

The MVP is successful when a user can:

1. Add or confirm sources.
2. See projects, capabilities, ideas, and evidence in one graph.
3. Switch between Constellation, Radial, Tree, and Hex views without data drift.
4. Select an idea and understand its evidence, prerequisites, readiness, and next step.
5. Add the idea to a persistent focus queue.

## Scope boundary

### In scope

- Local web app and local persistence.
- Read-only GitHub indexing for selected repositories.
- Metadata-first vault indexing using headings, filenames, and timestamps.
- Shared graph model with provenance and confidence.
- Human-reviewable relationship suggestions.
- Four map views and a clear inspector.
- Focus queue and lightweight prioritization.
- Deterministic fixtures and browser verification.

### Out of scope for MVP

- Automatic commits, pushes, or GitHub write-back.
- Full-text vault indexing by default.
- Multi-user accounts or hosted collaboration.
- Autonomous AI graph changes without review.
- Production-scale 3D graph rendering.
- Replacing TaskMaster or Vibes Dashboard.

## Roadmap phases

### Phase 0 — Working agreement and source safety

- Confirm repository working-tree and branch policy.
- Confirm the exact local vault path.
- Define source inclusion and exclusion rules.
- Add privacy-safe fixtures.
- Add V0 checks and a browser verification checklist.

Exit criteria: the repo can be run and verified without private data or credentials.

### Phase 1 — Graph contract and fixture

- Implement source, project, capability, idea, and evidence nodes.
- Implement enables, depends_on, related_to, and derived_from edges.
- Add status, progress, tags, confidence, provenance, and review state.
- Create a fixture from TaskMaster, Vibes Dashboard, Project Atlas, and two future ideas.
- Validate the fixture at load time.

Exit criteria: all four views render from one validated graph fixture.

### Phase 2 — Source manifest and local persistence

- Add a source manifest for selected repositories and the vault.
- Persist sources, graph state, and focus queue locally.
- Add import/export of graph snapshots.
- Add refresh timestamps and partial-failure state.
- Add source enable/disable controls.

Exit criteria: refreshes and reloads preserve graph and focus state.

### Phase 3 — GitHub ingestion adapter

- Read repository metadata and default branch.
- Read README, package manifests, selected documentation, and recent commits.
- Extract candidate projects, capabilities, technologies, and activity signals.
- Record every claim with repository URL/path provenance.
- Show ingestion status and errors in the UI.

Exit criteria: selected repositories can be refreshed read-only and produce inspectable evidence.

### Phase 4 — Vault metadata adapter

- Index filenames, headings, folders, modified dates, and explicit tags.
- Keep note bodies local and excluded from logs and exports.
- Allow explicit folder or note inclusion.
- Extract candidate themes and ideas with confidence labels.
- Show which vault metadata contributed to an idea.

Exit criteria: the user can trace a recommendation to local sources while note bodies remain local.

### Phase 5 — Relationship review and recommendation layer

- Generate suggested edges from explicit metadata and lightweight heuristics.
- Add accept, reject, and defer review states.
- Score ideas using readiness, leverage, effort, interest, and evidence quality.
- Generate a shortest or lowest-risk build path.
- Explain the score and path in the inspector.

Exit criteria: every recommended idea has visible evidence, prerequisites, confidence, and a next action.

### Phase 6 — MVP hardening and acceptance

- Add empty, loading, partial, and error states.
- Test keyboard navigation and narrow layouts.
- Test larger fixture performance and graph filtering.
- Run V0–V3 verification and record evidence.
- Conduct Owner-as-Adversary review.
- Decide whether to keep Atlas standalone or integrate it as a Vibes Dashboard module.

Exit criteria: the user can use Atlas for a real planning session and trust its provenance.

## Critical path

    Graph contract → fixture → persistence → GitHub ingestion → vault metadata → reviewable recommendations → hardening

## Verification gates

- V0: syntax checks, fixture validation, deterministic serialization.
- V1: graph contract tests and adapter tests.
- V2: browser proof for source setup, view switching, node selection, prioritization, and reload persistence.
- V3: privacy, provenance, failure-state, and adversarial review.
- V4: user acceptance and explicit commit/ratchet decision.
