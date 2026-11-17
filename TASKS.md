# Project Atlas MVP task board

Tasks are ordered by dependency. IDs are stable for commits, evidence notes, and agent handoffs.

## M0 — Foundation

- [x] M0.1 Confirm the local vault path and indexing boundary.
- [x] M0.2 Confirm selected GitHub repositories for the first source manifest.
- [x] M0.3 Add a npm run check command for V0 syntax and fixture checks.
- [x] M0.7 Add deterministic adapter tests for V1 ingestion checks.
- [x] M0.4 Add a browser verification checklist.
- [x] M0.5 Decide initial branch and remote workflow without committing or pushing automatically.
- [x] M0.6 Add local-model configuration through environment variables only.

Acceptance: the app runs from a clean checkout and no private source is required for verification.

## M1 — Graph contract

- [x] M1.1 Define typed node and edge schemas.
- [x] M1.2 Add runtime validation for graph snapshots.
- [x] M1.3 Add provenance and confidence fields.
- [x] M1.4 Add review states for suggested edges.
- [x] M1.5 Replace view-local seed data with one shared fixture.

Acceptance: all four views render from the same validated graph object.

## M2 — Persistence and source manifest

- [x] M2.1 Define source manifest schema.
- [x] M2.2 Add local persistence for graph state.
- [x] M2.3 Persist the focus queue.
- [x] M2.4 Add graph snapshot export/import.
- [x] M2.5 Add source enable/disable state.
- [x] M2.6 Add refresh metadata and partial-failure state.

Acceptance: reload, export, and import preserve graph and focus state.

## M3 — GitHub adapter

- [x] M3.1 Read repository metadata and default branch.
- [x] M3.2 Read README and package manifest evidence.
- [x] M3.3 Read selected docs and recent commit activity.
- [x] M3.4 Normalize repository evidence into graph nodes.
- [x] M3.5 Record source URLs and file paths on every claim.
- [x] M3.6 Add ingestion progress, errors, and retry state.
- [x] M3.7 Verify live GitHub refresh in an environment with outbound GitHub access.

Acceptance: TaskMaster and Vibes Dashboard can be refreshed read-only and inspected through the graph.

## M4 — Vault adapter

- [x] M4.1 Confirm and validate the vault path before reading it.
- [x] M4.2 Index filenames, folders, headings, dates, and explicit tags.
- [x] M4.3 Add folder and note inclusion controls.
- [x] M4.4 Keep note bodies out of logs, exports, and generated artifacts.
- [x] M4.5 Normalize metadata themes into candidate capabilities and ideas.
- [x] M4.6 Show vault provenance in the inspector.
- [x] M4.7 Verify metadata-only scan against the confirmed vault path.

Acceptance: a user can trace an idea to local metadata without exposing note bodies.

## M5 — Recommendations and planning

- [x] M5.1 Generate explicit heuristic edge suggestions.
- [x] M5.2 Add accept, reject, and defer actions.
- [x] M5.3 Define readiness, leverage, effort, and evidence scoring.
- [x] M5.4 Generate a build path from current capability to target idea.
- [x] M5.5 Explain recommendation scores in the inspector.
- [x] M5.6 Connect selected build-path steps to the focus queue.
- [x] M5.7 Add bounded local model adapter for text/image evidence suggestions.
- [x] M5.8 Add capability detection and a no-model fallback path.
- [x] M5.9 Add human review before model suggestions become accepted edges.

Acceptance: every recommendation is explainable and reviewable.

## M6 — Hardening

- [x] M6.1 Add loading, empty, partial, and error states.
- [x] M6.2 Add keyboard focus and accessible labels for map actions.
- [x] M6.3 Add list fallback for dense graphs.
- [x] M6.4 Test narrow viewport behavior.
- [x] M6.5 Test larger graph fixture performance.
- [x] M6.6 Complete V0–V3 evidence review.
- [x] M6.7 Run Owner-as-Adversary acceptance walkthrough.
- [x] M6.8 Decide standalone versus Vibes Dashboard module integration.

Acceptance: the MVP supports one real planning session end-to-end.

## M7 — Astro Spatial frontend spike`r`n`r`n- [x] M7.1 Create an isolated Astro Spatial Constellation prototype with semantic DOM fallback and inspector.`r`n- [x] M7.2 Reuse Atlas node vocabulary and state colors in the spatial adapter.`r`n- [x] M7.3 Verify Astro production build and BrowserOS Neo canvas rendering.`r`n- [x] M7.4 Expose the validated Atlas graph through a read-only API and consume it from the prototype.`r`n- [x] M7.5 Add functional Radial, Tree, and Hex projections over the shared node vocabulary.`r`n- [x] M7.6 Derive spatial positions and SVG relationship lines from live graph edges.`r`n- [x] M7.7 Show source, confidence, and relationship evidence in the spatial inspector.`r`n- [x] M7.8 Rebuild the Three.js network from live graph nodes and edges after API hydration.`r`n- [x] M7.9 Make the 2D constellation authoritative and reduce 3D to a restrained atmospheric enhancement.`r`n`r`nAcceptance: the spatial frontend improves the Constellation view without replacing the validated MVP shell.`r`n`r`n## Deferred

- [ ] Three.js large-graph renderer.
- [ ] TaskMaster write-back integration.
- [ ] Vibes Dashboard module packaging.
- [ ] Multi-user accounts and hosted collaboration.
- [ ] Automatic GitHub commits or pull requests.

## M8 — Graph-driven roadmap UI

- [x] M8.1 Define prerequisite semantics for graph edges; only `depends_on` and `enables` edges in accepted or suggested review state contribute to prerequisite chains and build paths; deferred/rejected edges and other relationship kinds are excluded.
- [x] M8.2 Replace the hand-authored Tree lists and path sentence with a graph-derived directed dependency view; preserve selection through the shared inspector.
- [x] M8.3 Show selected-node prerequisites and unlocks in the inspector with status, review state, and evidence-backed relationship context.
- [x] M8.4 Add consistent compact node cards and accessible selected/direct-neighbor/unrelated states in the map; do not rely on color alone.
- [x] M8.5 Audit Next Best Build metrics; label estimates and show only values derived from the shared graph or clearly qualified as estimates.
- [x] M8.6 Compared the landing roles: Constellation keeps the whole portfolio visible for orientation; Tree narrows to causal prerequisites for planning. Retain Constellation as default unless a real planning session shows Tree-first is clearer without losing useful context.

Acceptance: the Tree and inspector reflect the same validated graph, ambiguous or rejected edges do not appear as prerequisites, relationships remain selectable and accessible, and recommendation metrics are not presented as unsupported facts.

## M9 — MVP acceptance closeout

- [x] M9.1 Reconciled task, status, progress, and verification records against current evidence; remaining blockers are explicit below.
- [x] M9.2 Reverified read-only live GitHub refresh through `/api/github/inspect` for all 3 enabled repositories (HTTP 200, `mode=live`, 4 provenance-bearing evidence items, 5 activity items each); deterministic tests cover explicit network failure and offline fallback.
- [x] M9.3 Confirmed vault paths are absent from exported snapshots and failure messages; manifest path remains null, metadata stays body-free, and invalid paths fail safely.
- [x] M9.4 Completed V3 adversarial checks: live/offline GitHub behavior, vault privacy, model capability honesty, and Vibes read-only inventory; the 13 dirty changes remain untouched.
- [x] M9.5 BrowserOS responsive readback passes at 390×844 with no horizontal overflow. Constellation switches to a compact two-column card list on narrow screens and Focus Queue becomes a bounded floating panel; visual review used isolated Chrome headless screenshots after BrowserOS capture timed out. Next Best Build wraps responsively, and the main column scrolls instead of clipping below-fold content.

## M10 — Focus queue planning loop

- [x] M10.1 Added per-step status and next-review date; legacy queues migrate in order and normalized values persist across reload and snapshot data.
- [x] M10.2 Added accessible bounded edit controls and empty/invalid handling; deterministic queue tests and live browser state readback pass.

## M11 — Read-only task linkage

- [x] M11.1 Added a pure adapter for the inspected TaskMaster JSON contract; normalize stable task IDs, title/status/update time and subtask counts while excluding descriptions, notes, file paths, and raw payload retention.
- [x] M11.2 Added explicit task-ID → existing graph-node mapping and a read-only reconciliation proposal; preserve queue order and surface status conflicts for explicit user choice, with no automatic write-back.
- [x] M11.3 Added browser-local file import and verified synthetic-file loading, explicit mapping, focus-queue action, and browser-storage privacy; clarified that transient TaskMaster records/IDs are excluded from storage/snapshots while an explicitly applied status becomes Atlas queue state. The schema was checked against the local export without reading/copying private task text.

Acceptance: imported task records and TaskMaster IDs stay in memory only; mappings are explicit rather than title-fuzzy; snapshots contain no TaskMaster task text/IDs. A status explicitly chosen or applied by the user becomes Atlas focus-queue state and is saved/exported with that queue. The local focus queue remains the fallback; there is no TaskMaster write-back.

## M12 — Owner acceptance of read-only task linkage

Owner-authorized synthetic path (2026-10-29): `fixtures/taskmaster-synthetic-export.json` + `docs/m12-owner-acceptance-checklist.md`. Real private TaskMaster export was not provided; no Downloads probing.

- [x] M12.1 Walk through task mapping and reconciliation using owner-provided synthetic fixture (BrowserOS neo on :4173); did not import a private real export.
- [x] M12.2 Verified explicit mapping, both status-conflict choices (Use export → `queued`; Keep queue → `in_progress`), queue edit/persist, and storage privacy (no `PRIVATE_*` / synthetic task IDs in localStorage graph/queue).
- [x] M12.3 Recorded acceptance: workflow fits planning with Constellation as starting view; gap = optional later session with a real export path if desired (not blocking).

Acceptance: the owner confirms the read-only workflow fits a real planning session, or the specific failure points are recorded for follow-up.

## M13 — Evidence-backed follow-up

- [x] M13.1 No M12 product gaps requiring code; leave importer unchanged (2026-10-29).
- [x] M13.2 Re-ran `npm test` (39/39) and BrowserOS privacy/conflict readback during M12 acceptance.

Acceptance: each change traces to an observed planning-session need and passes its relevant verification.

## M14 — V4 acceptance closeout

- [x] M14.1 Reconcile current-state documentation with implemented and verified behavior; retain the real-workflow acceptance as an explicit open item.
- [x] M14.2 Owner acceptance recorded for synthetic M12 path (2026-10-29); ratchet = keep read-only linkage; optional real-export session later. Acceptance does not authorize a commit or release by itself.

Acceptance: remaining gaps and the user's acceptance/ratchet decision are explicit; no unapproved repository or external-state mutation occurs.

## M15 — Activate inspector source actions

- [x] M15.1 Make the Activity tab retrieve recent activity only from enabled GitHub sources already linked to the selected graph node, using the existing read-only source APIs; never inspect vault bodies or local files for activity.
- [x] M15.2 Show honest loading, partial/error, and empty states; render bounded commit messages with public source links and refresh when node selection changes.
- [x] M15.3 Wire Open source context to the selected node's existing provenance view and verify both actions in the browser.

Acceptance: Activity and source-context actions produce useful state from existing read-only APIs, remain graph-selection-aware, and disclose unavailable/empty results without exposing vault paths or inventing activity. No redundant backend route is added.

## M16 — Activate graph exploration controls

- [x] M16.1 Implement global search over the current browser graph with node selection and inspector readback; do not search vault note bodies.
- [x] M16.2 Wire Map, Repositories, Knowledge, Current work, and Ideas navigation to existing app surfaces and graph state; replace hard-coded count badges with truthful counts or remove them.
- [x] M16.3 Give Filter and Zoom controls concrete map behavior, or replace them with non-interactive state indicators until supported.
- [x] M16.4 Keep Settings and AI assistant affordances honest; only add model interaction after a bounded local-only request/response contract and privacy review.

Acceptance: every control in scope has observable behavior; search/navigation/filter remain derived from the shared graph, and the app does not imply an AI assistant or setting that is not implemented.
