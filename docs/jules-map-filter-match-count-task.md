# Jules task: Honest Filter match counts on the map control

## Context
Project Atlas (local-first Node static app + `server.mjs`, shared `graph.js`) already cycles Filter kinds via `src/planning/map-controls.mjs` and applies `map-filter-hidden` across Constellation/Radial/Hex/Tree. The `#mapFilter` button label is only `Filter: Candidate` (etc.) with no match count, so operators cannot tell whether a filter is empty vs populated without inspecting the DOM. This task adds an honest match count to the Filter button label when the filter is not `all`.

## Exact files/paths
- Touch: `src/planning/map-controls.mjs` — add a pure helper, e.g. `countNodesMatchingMapFilter(nodes, kind)` and extend labeling (either extend `mapFilterLabel` with an optional count, or add `mapFilterButtonLabel(kind, matchCount)` that returns `Filter: All` unchanged and `Filter: Candidate (24)` / `Filter: Idea (0)` when kind ≠ `all`)
- Touch: `app.js` — in `applyMapFilter` (and any initial sync that sets the button text), compute match count from `atlasState.graph.nodes` (or the same `data`/graph source already used for filtering) and set `#mapFilter` text + `aria-label` from the helper
- Touch: `test/map-controls.test.mjs` — cover count helper + button label strings (including zero matches and `all`)
- Optional: `roadmap-ui.css` only if the longer label overflows the toolbar (minimal tweak; do not restyle the app)

Do **not** change `graph.js` seed data, dispositions, TaskMaster import, inventory APIs, or view layout algorithms.

## Required behavior
1. When filter kind is `all`, button text remains `Filter: All` (no count).
2. When filter kind is a specific kind, button text includes the number of graph nodes with `node.kind === kind`, e.g. `Filter: Candidate (24)`.
3. Zero matches must show `(0)` — do not hide the control or invent placeholder nodes.
4. `aria-label` stays honest (include kind + count).
5. Existing Filter cycle order and Zoom behavior remain unchanged.

## Hard constraints
- Smallest complete PR; no drive-by refactors, renames, or new dependencies.
- No secrets; do not commit `.env` or private vault paths.
- Do not promote any `candidate` to `adopt`; do not touch M12 TaskMaster acceptance flows.
- Do not rewrite Constellation/Radial/Hex/Tree rendering beyond wiring the label.
- Keep changes local-first and privacy-safe (no vault body reads).

## Acceptance criteria
- [ ] `npm test` exits 0 (includes new map-controls cases)
- [ ] `npm run check` exits 0
- [ ] Manual: start `npm start`, open `http://127.0.0.1:4173`, cycle Filter — `All` has no count; `Candidate` shows `(N)` matching `graph` candidate count; a kind with no nodes shows `(0)`
- [ ] PR description lists files changed and how to test

## Deliverable
Smallest complete PR; list files changed + how to test.
