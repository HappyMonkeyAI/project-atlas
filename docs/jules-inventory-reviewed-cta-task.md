# Jules task: Honest inventory CTA when 0/N reviewed

## Context
Project Atlas inventory panel (`#inventoryReview`) and toolbar summary (`#inventorySummary`) already show live allowlist health and `0/N reviewed` counts. When nothing is reviewed, the Tree “Reviewed projects” list only says “No reviewed inventory projects yet.” Operators get no clear next action from the inventory panel itself (e.g. that Review is required before projects appear on Tree/scoring). This task adds a small, honest empty-state CTA in the inventory panel when `reviewed === 0` and `results.length > 0`.

## Exact files/paths
- Touch: `app.js` — in `renderInventoryResults`, when `reviewed === 0` and there is at least one inventory result, render one short CTA under the inventory heading (e.g. “No projects reviewed yet. Use Review on a successful record to project it into the graph / Tree.”). Hide the CTA when `reviewed > 0`.
- Optional: `roadmap-ui.css` — minimal spacing for the CTA only if needed
- Optional: add a tiny pure helper under `src/planning/` **only if** you extract CTA copy for a unit test; otherwise keep copy inline in `app.js`

Do **not** change inventory allowlist APIs, auto-review anything, invent reviewed state, touch TaskMaster, dispositions, or map Filter/Zoom.

## Required behavior
1. With inventory results loaded and zero reviewed: CTA visible under the PROJECT INVENTORY heading.
2. After at least one record is marked Reviewed (existing button): CTA disappears on re-render.
3. Copy must not claim auto-import or vault scanning; Review remains explicit and local.
4. Inspection-error rows stay unreviewed-capable as today (no forced Review).

## Hard constraints
- Smallest complete PR; no drive-by refactors or new dependencies.
- No secrets; do not commit `.env` or vault paths.
- Do not promote candidates to `adopt`.
- Do not change scoring formulas beyond whatever already reacts to reviewed inventory nodes.

## Acceptance criteria
- [ ] `npm test` and `npm run check` exit 0
- [ ] Manual: `npm start` → inventory shows CTA at 0 reviewed; after Review on one OK record, CTA gone and Tree can list that project
- [ ] PR lists files changed and how to test

## Deliverable
Smallest complete PR; list files changed + how to test.
