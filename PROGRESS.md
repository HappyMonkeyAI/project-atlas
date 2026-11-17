# Project Atlas progress

Updated: 2026-11-17

## Completed and verified

- Local-first roadmap app with Constellation, Radial, Tree, and Hex views on one shared graph.
- Provenance, confidence, reviewable edges, recommendations, build paths, focus queue, and snapshot export/import.
- Read-only GitHub ingestion and metadata-only vault inspection.
- Candidate disposition model (`benchmark` | `pattern` | `reject` | `adopt`).
- Public/private seed split: demo seed in git; optional `graph.local.js` overlay for private portfolios.

## Current baseline

Run from the repository root:

```bash
npm run check
npm test
npm start
```

Open http://localhost:4173. Copy `graph.local.js.example` → `graph.local.js` (gitignored) to keep a private seed.

## Next slice

- Three.js large-graph renderer.
- TaskMaster write-back (only if separately authorized).
- Vibes Dashboard module packaging.
- Multi-user / hosted collaboration (deferred by design for local-first MVP).

## Current privacy invariant

Keep the confirmed vault path only in local browser state; exports, filesystem errors, and the checked-in source manifest omit it. Do not commit `graph.local.js`, `*.local.md`, or `data/private/`.

## Deferred

- Automatic GitHub commits or pull requests from Atlas.
- AI assistant chat UI (adapter exists; product surface gated).
