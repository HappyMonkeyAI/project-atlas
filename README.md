# Project Atlas

Local-first roadmap intelligence for mapping repositories, knowledge, current work, capabilities, and future ideas — with provenance, reviewable relationships, and candidate dispositions.

**Copyright © 2026 Stephen Phillips and Happy Monkey AI.** Released under the [MIT License](./LICENSE).

## Run locally

```bash
npm start
```

Open http://localhost:4173. If that port is occupied, set `PORT=49152` (or another free port).

```bash
npm run check
npm test
```

## Public demo vs your private graph

The committed seed in `graph.js` is a **scrubbed demo** so the concepts are shareable.

To keep a private portfolio on your machine (without publishing it):

1. Copy `graph.local.js.example` → `graph.local.js` (gitignored), or keep the generated local seed if you already have one.
2. Optionally copy `data/project-inventory.json` → `data/project-inventory.local.json` and add reviewed hosts/paths.
3. Point the vault inspector at your own notes path in the browser — note bodies stay local.

`kb_vault` and other personal wikis are **not** part of this repository. Atlas only needs a user-confirmed local path for metadata-only indexing.

## What you get

- Synchronized Constellation, Radial, Tree, and Hex views on one shared graph
- Candidate dispositions: `benchmark` | `pattern` | `reject` | `adopt`
- Read-only GitHub inspection and metadata-only vault scanning
- Focus queue, snapshot export/import, and explainable recommendations

## Documentation spine

- `CONTEXT.md` — purpose, sources, constraints
- `SPEC.md` — graph entities and requirements
- `ARCHITECTURE.md` — system boundaries
- `AGENTS.md` — agent operating rules
- `STATUS.md` / `PROGRESS.md` — public implementation status

## Attribution

Built by **Stephen Phillips** / **Happy Monkey AI**. Example linked projects in the demo seed (TaskMaster, Vibes Dashboard, Agents Protocol) are HappyMonkeyAI repositories used to illustrate the model — replace them with your own sources.

## Public release note

The committed tip is scrubbed for open source (demo seed, no private inventory, agent session journals gitignored). If you publish this project, prefer the `public/v1-clean` branch (single orphan commit) or a new empty repository seeded from that tree — older commits on `master` may still contain pre-scrub private seed data in history.
