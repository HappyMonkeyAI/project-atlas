# Project Atlas verification checklist

## V0 deterministic checks

- Run `npm run check`.
- Run `npm test`.
- Parse `data/source-manifest.json`.
- Confirm the graph fixture validates without console errors.
- Confirm no `.env` or private vault content is tracked.

## V1 contract checks

- Confirm every graph edge references existing node IDs.
- Confirm every node has a kind, status, sources, and confidence.
- Confirm snapshot import rejects invalid graph data.
- Confirm source refresh returns provenance-bearing evidence.

## V2 browser checks

- Open the local preview.
- Switch through Constellation, Radial, Tree, and Hex.
- Select a project and a future idea.
- Open Evidence and review relationship confidence.
- Accept, reject, and defer a suggested relationship.
- Prioritize an idea and reload the page.
- Export a graph snapshot.
- Test source refresh in live and offline-snapshot modes.

## V3 adversarial checks

- Confirm the nonexistent vault path fails safely.
- Confirm note bodies are not returned by the vault adapter.
- Confirm GitHub refresh is read-only.
- Confirm local model availability is detected without assuming vision support.
- Confirm missing network access produces an explicit offline mode.
- Run `npm test` to validate metadata adapters and the 1,200-node graph fixture path/validation benchmark.

## Latest evidence review — 2026-09-09

- V0 passed: `npm run check`, `npm test` (3 tests), manifest JSON parsing, and no `.env` file.
- V1 passed: graph runtime validation, provenance-bearing source records, and invalid-path handling.
- V2 passed in the local browser on port 49160: all four views switched, AgentsProtocol source/provenance displayed, evidence review controls worked, a suggested edge was deferred, a build path was added to focus, and export completed.
- V2 responsive check passed through BrowserOS Neo on port 49162 at 390x844: the app reported a collapsed `64px 311px` shell, wrapped toolbar, hidden inspector, and all four view tabs remained available.
- Astro Spatial frontend spike verified: `frontend/atlas-spatial` passed `astro check` and `astro build`; BrowserOS Neo observed a real spatial canvas, seven accessible node buttons, the inspector, and the DOM fallback text at `http://127.0.0.1:49200/`.
- Astro graph/view integration verified: `http://localhost:49163/api/graph` returned API version 1 with 8 nodes, 7 edges, and 5 sources; the prototype build contains enabled Constellation, Radial, Tree, and Hex controls plus the shared DOM node vocabulary.
- Graph-derived spatial slice verified: the prototype computes node positions by graph kind, renders accepted/suggested edge lines into the constellation SVG layer, and updates the inspector with source count, confidence, and connected relationship count.
- Live 3D graph hydration verified: the Astro Spatial procedural factory starts with a deterministic fallback and synchronizes its Three.js nodes/edges from the live graph response; BrowserOS Neo observed the resulting canvas and accessible DOM graph.
- Visual correction applied after review: the 2D graph labels and SVG relationships remain primary; the live Three.js scene is reduced to low-opacity depth and atmosphere so it no longer competes with the readable map.
- V3 passed for available fixtures: missing vault path returned a safe error, vault tests excluded note bodies, GitHub adapters remained read-only/offline-capable, and model capability remains explicitly `vision: unverified`.
- V3 remaining environment checks: confirmed real vault path and narrow-viewport visual rendering.
- Browser-backed source audit: live GitHub pages for VueJS-Todo, vibes-dashboard, and AgentsProtocol were reachable and reviewed read-only. This does not replace the local Node transport check required by M3.7; the local adapter remains offline-snapshot mode when `api.github.com` is unreachable.
- Runtime checks: `/api/github/inspect?source=agents-protocol-repo` returned `mode=offline-snapshot` with 4 evidence items; `/api/model/health` reported the configured Gemma model reachable and `vision=unverified`.
- Network-enabled adapter check: all three configured repositories returned `mode=live`, 4 evidence items, and the expected default branches (`master`, `main`, `main`).
- Confirmed-vault adapter check: `C:\Users\steph\Documents\development\kb_vault` returned 283 metadata-only notes and 13 candidates; `bodyContentIncluded=false`. The absolute path is intentionally not written to the repository manifest.
- Project inventory slice verified on the LAN: `/api/inventory` returned 10 reviewed targets, 9 repository records with status `ok`, and 1 explicit repository inspection error; successful records included revision, branch/detached state, remote, dirty count, and last commit metadata. The inventory policy was read-only and excluded note bodies, logs, environment files, and credentials.
- Inventory review panel verified in the live 2D app: it rendered all 10 inventory records, displayed the explicit inspection error, and toggled a record's reviewed state with browser-local persistence. A request-order guard prevented slower refreshes from overwriting the latest review state.
- Reviewed inventory projection verified in the live 2D app: explicitly reviewing `AI Agent Teamwork` persisted an `inventory-*` project node and dedicated source with host provenance and metadata-only description; withdrawing review removed the generated node/source, and the errored Agent Communication MCP record was never projected.
- Repository evidence enrichment verified in the live inspector: the reviewed `AI Agent Teamwork` node displayed its host, branch, short revision, clean-tree state, and bounded last-commit subject; the persisted source retained the short revision and no repository contents or source path was displayed.
- Freshness-state contract verified: live `/api/inventory` returned explicit state labels for all 10 records, including `inspection-error`, `stale`, `stale-detached`, `clean`, `dirty`, and `detached`; the browser rendered those labels and the projected node displayed `stale` consistently.
- Per-record refresh verified: the live browser rendered 10 refresh controls, displayed the stale explanation, refreshed `host215-ai-agent-teamwork` through the single-source endpoint, and preserved the row count, state, and review controls.
- Inventory summary verified in the live browser: the summary was visible while the source panel was closed, reported all 10 records and state counts, and updated the reviewed count from 0 to 1 after a review action.
- Reviewed-project discovery verified in the live browser: after one explicit review, Tree view showed exactly one reviewed project, displayed its stale state and branch, and selecting the list item updated the inspector to `AI Agent Teamwork`.
- Conservative relationship verification passed in the live browser: reviewing the two MonkeySwarm checkouts created exactly one accepted `same_repository_checkout` edge at 98% confidence with both inventory remote evidence identifiers; the inspector displayed the relationship and provenance, while no content-based relationships were created.
- Inventory allowlist review passed in the live browser: 9 of 10 records were reviewed, matching the 9 successful inspections; the inspection-error record stayed excluded. Tree view contained exactly 9 reviewed projects, selection updated the inspector, and Evidence showed source host, branch, revision, clean-tree state, bounded last-commit metadata, confidence, and the accepted same-repository relationship.
- Inventory-aware scoring passed in the live browser: a stale MonkeySwarm checkout displayed `Inventory 11/15`, freshness `7/10`, hygiene `3/3`, and one canonical repository; its Evidence panel showed the normalized `happymonkeyai/monkeyswarm` identity and the accepted 98% checkout relationship after the second checkout was reviewed. Clean and dirty records were also projected with distinct state labels.
- Idea-level inventory coverage passed its negative-path check in the live browser: after reviewing the Vibes checkout, Knowledge Graph showed `Path coverage 0` and `Inventory path: 0/4 prerequisites`, because its `SPhillips1337/vibes-dashboard` identity did not match the existing `HappyMonkeyAI/vibes-dashboard` source. No name-only relationship was invented.
- Explicit source mapping passed in the live browser: selecting `HappyMonkeyAI/vibes-dashboard` for the reviewed Vibes checkout persisted `project-atlas.inventory-mappings.v1`; Knowledge Graph changed to `Path coverage 4` and `Inventory path: 1/4 prerequisites · health 7/10`, while the checkout inspector showed both `sphillips1337/vibes-dashboard` and `Human-reviewed mapping: HappyMonkeyAI/vibes-dashboard`.
- Build-path health passed in the live browser: the mapped Knowledge Graph path displayed `Build path coverage: 3/8 checkpoints · health 2/10` and named `Vibes Dashboard`, `Dev tooling`, and `Knowledge graph intelligence` as attention points based on current stale/dirty inventory state; the path topology remained unchanged.
- Path-health correction passed in the live browser after a read-only Vibes refresh: the Knowledge Graph path displayed `Build path coverage: 2/8 checkpoints · health 5/10` and named only `Vibes Dashboard` and `Dev tooling`; the idea node was no longer misclassified as a repository checkpoint.
- Focus-queue prioritization passed in a fresh live browser tab: activating `Add path to focus queue` produced the toast `8 build path steps added to your focus queue.` and local storage readback contained the ordered path `vault`, `taskmaster`, `vibes`, `agents-protocol`, `atlas`, `cli`, `mentor`, `graph`.
- Actionable path-warning verification passed in the live browser with a browser-local dirty-state fixture: the inspector rendered warning targets `Vibes Dashboard` and `Dev tooling`; clicking the Vibes warning selected `Vibes Dashboard` and updated the inspector metadata without mutating any repository source.
- Live warning recheck passed through `/api/inventory`: `host215-vibes` reported state `stale`, revision `81e399a`, and 13 local changes. The user confirmed these are intentional dev-server changes; the mapped `Dev tooling` warning remains visible, and no checkout mutation was attempted.
- Dev-server acknowledgment passed in the live browser: `host215-vibes` displayed `Dev-server changes acknowledged`, retained 13 local changes plus explicit source mapping in Evidence, and the mapped Knowledge Graph path reported `2/8` direct checkpoints with health `7/10`; no repository mutation occurred.
- Focus Queue rendering passed in a fresh live browser tab: the sidebar rendered exactly 8 ordered queue buttons (`Knowledge vault` through `Knowledge graph intelligence`), and selecting step 8 updated the inspector to `Knowledge graph intelligence` while preserving the queue count.
- Focus Queue removal passed in the live browser: removing Vibes via `Remove Vibes Dashboard from focus queue` reduced the queue from 8 to 7, persisted the order without Vibes, renumbered later steps, and left Project Atlas selected.

## Acceptance closeout — 2026-09-28

- V0 passed: `npm run check && npm test && git diff --check`; 18 tests passed.
- Live GitHub refresh passed through `/api/github/inspect` for `taskmaster-repo`, `vibes-repo`, and `agents-protocol-repo`: HTTP 200, `mode=live`, four evidence records and five activity records per source, all evidence with provenance. Adapter tests inject network failure to verify explicit failure when no snapshot exists and `offline-snapshot` fallback when configured.
- Vault privacy passed: `data/source-manifest.json` keeps `vault-source.path` null; filesystem failures report generic codes/messages without echoing a synthetic confirmed-path marker; metadata tests contain no note body. The browser export action was exercised with a synthetic vault path in both source location and node provenance; the serialized export Blob omitted the marker, retained focus-queue status/date, and left local state unchanged. Browser localStorage fixtures were restored after acceptance.
- Model discovery returned `reachable=true` for `google/gemma-4-e2b`; vision remains explicitly `unverified`.
- Read-only inventory recheck returned Vibes state `stale`, branch `development`, revision `81e399a`, and 13 local changes. No write or cleanup command was issued against that checkout.
- Focus Queue browser check migrated a legacy ordered string queue, displayed defaults, updated `taskmaster` to `in_progress` with next-review date `2026-10-05`, and retained both fields after reload; prior browser-local state was restored.
- Responsive check at 390×844 found document width 375px, collapsed 64px sidebar, hidden inspector, and all four view tabs. `responsive.css` was already imported by `evidence.css`; added mobile top-action wrapping and verified no horizontal overflow.
- BrowserOS screenshot calls failed with `CDP request timed out: Page.captureScreenshot`; an isolated Chrome headless screenshot was later used for visual signoff, as recorded below.
- Follow-up discovery: the user-specified backup Downloads contains TaskMaster JSON exports. Structural inspection confirmed the top-level task array and stable task ID/title/status/update/subtask fields; descriptions, notes, and task text were not printed or copied into the repository.
- M11: 5 adapter tests pass for schema normalization, status mapping, privacy exclusions, malformed/duplicate IDs, explicit-only mappings, queue order preservation, and conflict reporting. BrowserOS loaded a synthetic JSON file, displayed its task metadata, mapped it to an existing Atlas node, and required a separate explicit action to add that node to the focus queue. Readback confirmed the queue action and that localStorage contained none of the synthetic task ID, title, or description. The test queue change was removed immediately afterward. The synthetic conflict overlay was DOM-verified but not screenshot-captured.
- Follow-up adversarial browser check exercised both conflict choices: “Keep queue” retained `done`; “Use export” explicitly changed the queue status to imported `queued`. Visual inspection of an earlier screenshot showed horizontal source-panel overflow; after CSS correction, DOM geometry at 1200×769 reports panel `scrollWidth=clientWidth=233`, `overflow-x:hidden`, and no document-width overflow.
- Visual signoff completed via isolated Chrome headless after BrowserOS capture timed out: reviewed a 1200×1100 screenshot with the Next Best Build title, explanation, metrics, and action fully visible. The screenshot exposed that lower main-column content was clipped at typical viewport height; the main column now scrolls independently and the Next Best Build metrics wrap into readable columns. BrowserOS DOM readback at 1200×769 confirmed main content height 930px in a 769px viewport, scrollability, no document-width overflow, and no console errors.
- At 390×844, BrowserOS DOM readback found all 8 Constellation nodes within the 289px stage width; the final card is visible after a 75px internal scroll, and the 270px Focus Queue panel fits within x=72..342. A fresh isolated Chrome screenshot shows the compact two-column node list, scroll affordance, and queue panel. Document width remains 375px with no horizontal overflow.
- The user export itself was not uploaded or imported into the browser; its schema was checked without exposing task content. TaskMaster task IDs/titles and raw task payload are excluded from snapshots; an explicitly applied status is saved/exported as Atlas focus-queue state. No server upload/write-back path was added.
- Independent adapter audit found no concrete contract gap. A copy mismatch was corrected: TaskMaster records/IDs remain transient and excluded from snapshots, while an explicitly applied status is saved/exported as Atlas focus-queue state. BrowserOS synthetic acceptance mapped a task to an existing node, rendered the status conflict, explicitly selected imported `queued`, and read back `queued` in both local queue storage and the exported snapshot; the synthetic task ID and title were absent from the snapshot. Original queue/selection state was restored. This was synthetic V2 evidence, not owner acceptance of a real planning workflow; the real export was not loaded. Dev server on port 4183 was stopped and health returned `ECONNREFUSED`.
- M15 live check: `/api/health` and `/api/source-manifest` returned HTTP 200; `/api/github/inspect?source=taskmaster-repo` returned `mode=live`, five activity records, and GitHub commit URLs. BrowserOS Activity rendered five entries for the selected TaskMaster node; switching to Knowledge vault rendered the empty/no-public-GitHub-source explanation with no activity items; Open source context selected the visible Evidence provenance panel. A synthetic partial failure retained one successful commit and visibly reported one unavailable source. `test/activity-feed.test.mjs` covers linked/enabled GitHub source selection, sorting and bounding, safe public commit URLs, failed source suppression, empty/malformed rows; 3/3 passed. No new API route was introduced.
- M16.1 live BrowserOS check on port 4186: top-bar Search and Ctrl+K opened the modal; filling `TaskMaster` yielded the matching project, and selecting it closed the dialog and updated the inspector heading. Sidebar Search opened the same modal. Unit tests also verify tag/status/multi-term matching, title-first ranking, a 20-result cap, and that description-only text does not match. No backend route was added.
- M16.2 live BrowserOS check on port 4187: Repositories displayed six graph nodes and a matching live badge; Knowledge displayed three provenance-linked nodes; Ideas displayed two idea-kind nodes. Current work showed an empty-state at count 0; adding the selected idea to the queue changed the badge to 1 and rendered the item, and removing it restored 0. Selecting an idea updated the inspector. Map restored the active Hex projection and Overview crumb. The reviewed inventory source currently contributed to the live repository count. `test/graph-sections.test.mjs` passed 3/3 provenance, queue-order, and empty/map cases; no new endpoint was added.
