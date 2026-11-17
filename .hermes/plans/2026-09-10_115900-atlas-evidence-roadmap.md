# Project Atlas Evidence-First Roadmap

> **For Hermes:** Execute this roadmap in small verified slices. Preserve the current 2D frontend and treat every imported relationship as a claim requiring provenance.

**Goal:** Turn Atlas from a visual graph prototype into a trustworthy personal project intelligence system that inventories real work, explains what exists, and suggests defensible next builds.

**Architecture:** Keep the current local-first Node API and shared graph contract as the system of record. Add read-only inventory adapters for Git repositories, GitHub metadata, and the selected `llm-notes/personal-rd-hub` project; normalize their outputs into evidence-bearing source/project/capability/idea records. Keep the Astro frontend 2D and make all views projections of the same hydrated graph.

**Tech Stack:** Existing Node.js API, Astro static frontend, browser local persistence, Git CLI/API read-only inspection, optional local model at the configured OpenAI-compatible endpoint, deterministic Node tests.

---

## Findings that shape the roadmap

- Atlas currently has an 8-node, 7-edge, 5-source graph, but only three GitHub repositories are represented in `data/source-manifest.json`; the vault is disabled until explicitly confirmed.
- The checked-out Atlas repository has no commits yet and contains broad pre-existing untracked work. Nothing should be reset, cleaned, committed, or pushed without explicit direction.
- The current graph is useful as a shell but does not yet describe the user's wider project estate. The live GitHub repositories expose additional branch tips beyond the offline snapshots, including feature branches for VueJS-Todo, Vibes Dashboard, and AgentsProtocol.
- Host `192.168.5.215` contains a large project estate under `~/projects`, including agent infrastructure, games, dashboards, MCP servers, and application experiments. Host `192.168.5.80` contains a smaller active set including `MonkeySwarm`, `AuditScan`, and multiple `MRPGRealms` checkouts.
- `/mnt/sda5/devserver_backup/www/llm-notes/personal-rd-hub` is a relevant prior R&D/idea-generation application. Its documented design includes job-note capture, hybrid local/cloud research, embeddings, patterns, clusters, reusable solution templates, automated insights, and a Streamlit/FastAPI/Postgres implementation. It should be mined for concepts and isolated reusable algorithms, not copied wholesale.
- The previous project is a separate Git working tree, so its exact commit/remote state must be verified before any cherry-pick is considered. Any migration must be selective, security-reviewed, and adapted to Atlas's graph contract.
- The active Atlas frontend must remain 2D. Three.js, WebGL, Astro Spatial runtime dependencies, and a competing 3D map remain out of scope unless explicitly requested.

## Product north star

A user should be able to answer, from one local workspace:

1. What projects and capabilities actually exist across local hosts and GitHub?
2. Which sources support each claim, and how fresh is that evidence?
3. What work is active, dormant, duplicated, or foundational?
4. Which future ideas are grounded in repeated capabilities or signals?
5. What is the smallest credible next build path, and why was it recommended?

---

## Phase 0 — Freeze the baseline and define inventory evidence

### 0.1 Record the current Atlas baseline

**Files:** `STATUS.md`, `VERIFICATION.md`, optional `docs/evidence/atlas-baseline-*.md`

- Record the current branch/status, API graph counts, source manifest counts, frontend package dependencies, and the exact local URLs used for verification.
- Keep implementation state, deployment state, and browser evidence as separate fields.
- Add a coverage ledger mapping each current requirement to documented, implemented, wired, and independently verified states.

**Exit criteria:** A later ingestion change can be compared against a known baseline without relying on stale prose.

### 0.2 Define the inventory source contract

**Files:** `SPEC.md`, `ARCHITECTURE.md`, new `docs/adr/0001-source-inventory-contract.md`, likely `src/graph/` or a new shared graph module

Define records for:

- `Source`: host, path or URL, source type, enabled/read-only state, scan timestamp, revision/branch where applicable.
- `Project`: stable identity, title, repository/path links, lifecycle state, technology summary, activity timestamps.
- `Capability`: reusable output or operational ability, with supporting projects and evidence.
- `Evidence`: source reference, claim text limited to privacy-safe metadata, provenance path/URL, observed timestamp, confidence, and extraction method.
- `Edge`: relationship kind, evidence IDs, confidence, review state, and freshness.
- `ScanRun`: started/completed state, source-level errors, counts, and resumable cursor/checkpoint.

**Exit criteria:** Every future node or edge can answer “where did this come from?” without storing private note bodies.

### 0.3 Add deterministic privacy and identity tests

**Files:** `test/*.test.mjs`, likely `src/graph/` and `src/ingestion/`

- Reject dangling edges and invalid source references.
- Prove private note bodies are not emitted by inventory adapters.
- Normalize paths without exposing credentials or environment values.
- Make stable project IDs from canonical repository URL or approved host/path identity.
- Verify stale evidence is marked stale rather than silently overwritten.

**Verification:** `npm run check`; `npm test -- --run`.

---

## Phase 1 — Build a read-only project inventory

### 1.1 Inventory host `192.168.5.215`

**Likely implementation:** `src/ingestion/git-inventory.mjs`, `src/ingestion/inventory-policy.mjs`

- Scan only approved roots, initially `~/projects` and explicitly named backup roots.
- Collect repository path, branch, HEAD, remote names/URLs, dirty count, last commit date/message, package manifests, and selected documentation filenames.
- Do not read arbitrary note bodies, logs, `.env` files, credential stores, generated caches, virtual environments, or unbounded source trees.
- Start with a high-signal allowlist of projects: `AI-AB-tester`, `ai-agent-teamwork`, `agent-communication-mcp`, `happymonkey-dev-ecosystem`, `glass-vibes-dashboard`, `browserosNeoBridge`, `AuditScan`, `EchoesOfAion`, `Inkstead`, and `voice-page-builder`; expand only after review.

**Exit criteria:** Atlas can show a host inventory with scan errors and dirty-state markers without mutating the host.

### 1.2 Inventory host `192.168.5.80`

- Scan `~/projects` with the same contract.
- Treat dirty checkouts as evidence requiring review, not as clean release tips. In the observed estate, `MRPGRealms` had substantial local changes; preserve them and report them separately.
- Record the relationship between duplicate/release checkouts without merging them automatically.

**Exit criteria:** Atlas distinguishes committed project facts, uncommitted local work, and duplicate checkouts.

### 1.3 Inventory current GitHub sources

**Files:** `data/source-manifest.json`, GitHub adapter, tests

- Replace hard-coded offline snapshots with a manifest that records repository URL, selected branch policy, include rules, and last successful refresh.
- Compare default branch and relevant feature branches without assuming `main` is the product tip.
- Initially include VueJS-Todo, vibes-dashboard, AgentsProtocol, and any additional repositories selected from the host inventory.
- Keep GitHub access read-only and support deterministic offline fixtures when outbound access is unavailable.

**Exit criteria:** A refresh produces repository metadata, selected README/package/docs evidence, branch/revision information, and explicit live/offline/error status.

### 1.4 Add an inventory review screen

**Files:** `app.js`, `index.html`, `styles.css`, `frontend/atlas-spatial/src/pages/index.astro`, `frontend/atlas-spatial/src/styles/atlas.css`

- Add a source/inventory panel showing host, path/URL, branch, revision, freshness, dirty state, and scan outcome.
- Allow enabling/disabling a source without deleting its record.
- Provide a “review before graph import” state for newly discovered projects.
- Keep the evidence inspector calm and provenance-oriented; do not expose private note contents.

**Exit criteria:** The user can approve which discovered projects become graph nodes.

---

## Phase 2 — Investigate and selectively reuse `llm-notes`

### 2.1 Audit the previous project before any reuse

**Source:** `192.168.5.215:/mnt/sda5/devserver_backup/www/llm-notes/personal-rd-hub`

- Verify its Git HEAD, branches, remote, tracked files, dependency manifests, and test status read-only.
- Review only architecture, schema, API, and implementation documentation first.
- Inspect source files for actual behavior after the documentation review; do not treat “production ready” or “complete” claims as evidence.
- Identify whether the automation features are implemented, runnable, and covered by tests.

**Deliverable:** A bounded audit note containing reusable concepts, incompatible assumptions, security concerns, and exact source references. Do not copy private job-note data, logs, environment files, database dumps, or credentials.

### 2.2 Extract concepts, not application structure

Candidate concepts for Atlas adaptation:

- recurring-theme detection from explicit tags and metadata;
- clustering as a suggestion, not truth;
- reusable solution/template records;
- insight records with supporting evidence and review status;
- scheduled/resumable scans with partial failures;
- local model assistance behind a bounded provider-neutral adapter.

Do not import the Streamlit/FastAPI/Postgres application boundary merely because it exists there. Atlas currently has a smaller local graph contract and should add persistence or a database only when the inventory scale requires it.

### 2.3 Make the cherry-pick decision explicit

Possible outcomes:

- **No cherry-pick:** port only a documented algorithm after reimplementation and tests.
- **Selective source transplant:** copy one self-contained, reviewed module into a temporary comparison area, then adapt it to Atlas types.
- **Cherry-pick:** only if the prior repo has usable Git history, a clean isolated commit, compatible licensing, no secrets/private data, and a change that fits Atlas's boundaries.

**Gate:** No code reuse is accepted until license, dependency, security, privacy, tests, and graph-contract compatibility are independently checked.

---

## Phase 3 — Turn inventory into a useful graph

### 3.1 Normalize project metadata into graph nodes

**Files:** `graph.js`, `src/graph/`, Git/Vault/GitHub adapters, tests

- Map repository and host records to stable `project` nodes.
- Map repeated tools, frameworks, workflows, and operational patterns to `capability` candidates.
- Keep raw observations as evidence; do not convert every keyword into a capability.
- Add lifecycle and activity fields that distinguish active, maintained, dormant, archived, experimental, and dirty-local states.

### 3.2 Add evidence-backed edge generation

- Generate only explainable `enables`, `depends_on`, `related_to`, and `derived_from` suggestions.
- Include evidence IDs and extraction method on every suggestion.
- Avoid duplicate edges created by host path, GitHub URL, and backup path aliases.
- Keep suggested edges visibly separate from accepted edges and require human review before acceptance.

### 3.3 Add freshness and conflict handling

- Show when evidence was observed and when it becomes stale.
- Keep conflicting branch/repository claims side by side until reviewed.
- Represent deleted/unreachable sources as unavailable, not silently removed.
- Make partial scans resumable and preserve source-level errors.

**Exit criteria:** The map is larger because it contains real projects, not because heuristics manufactured unsupported edges.

---

## Phase 4 — Generate and review potential ideas

### 4.1 Define idea signals

Use a transparent score made from:

- repeated capability combinations;
- multiple projects solving adjacent problems;
- active work with reusable infrastructure;
- user-selected interests or vault metadata;
- evidence quality and freshness;
- estimated effort and missing prerequisites.

Keep “interesting signal” separate from “recommended next build.”

### 4.2 Add candidate idea records

**Files:** `src/intelligence/`, `graph.js`, `app.js`, `test/*.test.mjs`

Each candidate idea should contain:

- title and one-sentence opportunity;
- supporting projects/capabilities;
- evidence IDs and confidence;
- known prerequisites and missing capabilities;
- expected leverage, effort, readiness, and uncertainty;
- proposed first experiment;
- review state: suggested, accepted, deferred, rejected.

### 4.3 Add recommendation explanations

- Show the score breakdown and the evidence behind each component.
- Show “why now,” “what is missing,” and “what would falsify this idea.”
- Never present a local-model output as accepted truth.
- Offer a lowest-risk first slice rather than only a large product concept.

**Exit criteria:** Every idea can be challenged by the user and traced back to source evidence.

---

## Phase 5 — Make the 2D product shell support real planning

### 5.1 Keep one shared graph projection layer

- Constellation: relationship overview and evidence-aware selection.
- Radial: attention, activity, and capability concentration from the same nodes.
- Tree: prerequisites and build paths from accepted/supported edges.
- Hex: reviewed candidate ideas and next experiments.

No view-local seed data once the inventory graph is available. Use a list/table fallback for dense graphs.

### 5.2 Improve the inspector around decisions

Show, in order:

1. what the selected item is;
2. status and activity freshness;
3. evidence sources and confidence;
4. accepted versus suggested relationships;
5. prerequisites and unlocks;
6. recommended next action;
7. review controls.

### 5.3 Add a focus queue tied to evidence

- Queue a candidate idea or a build-path step.
- Persist the queue locally.
- Display why the item is queued, its next review date, and the evidence snapshot used.
- Preserve queue state across refresh and import/export.

**Exit criteria:** Atlas supports one complete planning session from source discovery to reviewed next action.

---

## Phase 6 — Verification and acceptance gates

### V0 — Deterministic

- `npm run check`
- `npm test -- --run`
- `cd frontend/atlas-spatial && npm run check && npm run build`
- Manifest and graph schema validation
- No secrets, note bodies, logs, or generated private content in artifacts

### V1 — Contract and ripple

- Host/GitHub/Vault adapters produce the same normalized source/evidence shape.
- All four views consume the same graph snapshot.
- Stable IDs deduplicate repository aliases and backup checkouts.
- Partial scan errors and stale evidence are preserved.

### V2 — Adversarial

- Unreachable host, unavailable repository, dirty checkout, detached HEAD, missing manifest, malformed package file, and duplicate source.
- Empty inventory and a graph with more nodes than the visual stage can display.
- Unsupported or unavailable local model.
- Suggested edge with no evidence, rejected edge, stale evidence, and conflicting branch tips.
- Private vault path and note-body exclusion.

### V3 — Live browser

- Run the API and Astro frontend against the local graph endpoint.
- Verify source enable/disable, refresh, partial failure display, view switching, node selection, provenance, idea review, build-path queueing, export/import, and reload persistence.
- Test 390px, 768px, and desktop widths.
- Check browser console after navigation and each mutation; verify visible state readback after every action.

### V4 — User acceptance

- Review the generated project map against the user's actual work.
- Accept, reject, or correct a representative sample of discovered relationships and ideas.
- Decide whether the resulting graph is useful enough to ratchet and commit.
- Decide separately whether any `llm-notes` code is worth selective reuse.

---

## Suggested execution order

1. Phase 0 baseline and source contract.
2. Read-only `.215` and `.80` inventory adapters.
3. GitHub branch-aware refresh and manifest expansion.
4. `llm-notes/personal-rd-hub` audit and reuse decision.
5. Graph normalization, deduplication, freshness, and evidence edges.
6. Inventory review UI.
7. Idea signals, explainable scoring, and first-experiment recommendations.
8. Shared four-view hydration and decision-oriented inspector.
9. Focus queue integration and end-to-end browser acceptance.

Each numbered boundary should be one independently verified slice. Do not combine host inventory, model integration, UI redesign, and code reuse in one change.

## Open decisions for the user

- Should Atlas inventory all repositories under both hosts, or begin with a reviewed allowlist and expand incrementally?
- Should dirty local checkouts appear as first-class project variants, or only as freshness warnings on a canonical project?
- Should `llm-notes` contribute only its idea-generation concepts, or should we consider a separate migration spike for its automation tables and services?
- Which GitHub repositories should be authoritative for the first real map beyond the current three?
- Should the local vault be included in the first evidence refresh, metadata-only and explicitly scoped, or deferred until the repository inventory is useful?

## Definition of done for the next milestone

The next milestone is not “more nodes.” It is a read-only inventory slice that produces a privacy-safe, provenance-bearing graph from a reviewed set of projects on `.215`, `.80`, and GitHub, with visible freshness/errors and an independently verified browser review flow.
