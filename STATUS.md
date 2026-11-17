# Project Atlas implementation status

Updated: 2026-11-17

## Verified complete

- Four synchronized map views with shared graph data.
- Collapsible navigation, inspector, focus queue, source toggles, and snapshot export/import.
- Graph validation, provenance, confidence, review states, heuristic suggestions, scoring, and build-path derivation.
- Read-only GitHub adapter with live mode and deterministic offline snapshots.
- Inspector Activity tab and Open source context use existing read-only GitHub inspection and graph provenance; vault content is not searched for activity.
- Global search matches shared-graph titles, tags, kinds, statuses, and metadata. Vault note bodies and node descriptions are excluded from search.
- Map, Repositories, Knowledge, Current work, Ideas, and Candidates sidebar destinations derive from the shared graph.
- Filter cycles shared-graph node kinds; Zoom cycles 75–150% via `--map-zoom`.
- AgentsProtocol included as a read-only example source with offline evidence.
- Metadata-only vault adapter with bounded reads and body-exclusion tests.
- Vault paths stay browser-local; exports and filesystem errors scrub confirmed vault roots.
- Focus Queue persists status and next-review date.
- Candidate nodes require disposition (`benchmark` | `pattern` | `reject` | `adopt`).
- Read-only project inventory for an explicit host/path allowlist (default: `local` only). Private allowlists live in gitignored `data/project-inventory.local.json`.
- V0/V1 checks: `npm run check` and `npm test` pass.

## Public vs private seed

- Committed `graph.js` ships a scrubbed **demo** seed so clones are safe to open.
- Optional gitignored `graph.local.js` sets `globalThis.__atlasLocalSeed` for a private portfolio on this machine.
- Spatial demo lives in `frontend/atlas-spatial/src/data/atlas.ts`; private layout can sit in gitignored `atlas.local.ts`.

## Current privacy boundary

Vault inspection requires an explicitly confirmed path and reads bounded metadata (such as headings and tags), never note bodies. The absolute path remains browser-local, is omitted from the manifest and exported snapshots, and is not echoed by filesystem errors.

## License

MIT — Copyright (c) 2026 Stephen Phillips and Happy Monkey AI. See `LICENSE`.

## Public export

Agent session journals under `.agent/memories/history/` are local-only (gitignored). For a history-clean public clone, use branch `public/v1-clean` rather than flipping visibility on a long private history.
