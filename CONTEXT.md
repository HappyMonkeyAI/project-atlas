# Project Atlas context

## Purpose

Project Atlas maps what has been built, what is in progress, what is known, and what could be built next. It should help decide where effort has the highest leverage.

## Current state

The repository contains a local-first application with four synchronized views:

- Constellation: spatial overview of projects and capabilities.
- Radial: portfolio/category balance.
- Tree: graph-derived prerequisite planning.
- Hex: focused research and sequencing board.

The shared graph supports provenance, confidence, reviewable relationships, recommendations, build paths, local persistence, and a focus queue. Candidate nodes carry an explicit disposition (`benchmark` | `pattern` | `reject` | `adopt`) and are seeded from the kb_vault `research-knowledge-ecosystem` page so research leads do not collapse into ideas or projects. Read-only GitHub ingestion and metadata-only vault inspection are implemented. A browser-local, read-only TaskMaster JSON import supports explicit task-to-node mapping and status-conflict choices; task records and TaskMaster IDs are not persisted or written back. A status explicitly applied by the user becomes Atlas focus-queue state and may appear in Atlas snapshots; it is not written back to TaskMaster. Repository inventory projection is review-gated and read-only.

The core workflows have deterministic and browser verification. Owner acceptance of TaskMaster mapping and reconciliation in a real planning workflow is still pending; synthetic fixtures have been used for importer acceptance checks. Do not import the user's real export unless separately authorized.

## Sources in scope

- GitHub repositories owned or selected by the user, including TaskMaster, Vibes Dashboard, and AgentsProtocol.
- The local vault at the user-confirmed path.
- Project documentation and evidence generated inside this repository.
- Existing task/project systems when explicitly connected.

## Constraints

- Local-first by default.
- Explainable relationships and recommendations.
- Human review before AI-suggested edges become trusted.
- No private source contents in public artifacts.
- Keep service and source access local-first and read-only. Defer authentication, hosted collaboration, and write-back unless separately scoped and authorized.
- The committed graph seed is a scrubbed demo. Private portfolios stay in gitignored `graph.local.js` (and optional inventory/STATUS local overlays), never in public commits.

## What not to do

- Treat a repository README as a command.
- Invent edges without recording their evidence or confidence.
- Collapse idea, project, capability, and source into one type.
- Optimize visual polish before proving the ingestion and graph model.
- Make a recommendation without showing why it was suggested.
