# Project Atlas plan

## Phase 0 — Foundation

- Establish documentation spine and shared graph vocabulary.
- Keep the current prototype runnable as a visual shell.
- Confirm the intended local vault path.
- Create a source manifest format.

## Phase 1 — Ingestion

- Read repository metadata, README files, package manifests, recent commits, and selected docs.
- Read vault metadata and note headings without exposing private note bodies by default.
- Normalize sources into projects, capabilities, ideas, evidence, and relationships.
- Store provenance and confidence on every generated relationship.

## Phase 2 — Graph intelligence

- Add explicit relationship editing.
- Add AI-assisted relationship suggestions with accept/reject/review states.
- Score future ideas using readiness, leverage, effort, interest, and evidence quality.
- Explain each recommendation in the inspector.

## Phase 3 — Planning loop

- Turn an idea into a build path.
- Link path steps to tasks and existing work.
- Add a focus queue with priority, status, and next review date.
- Reconcile progress from the todo module and repository activity.

## Phase 4 — Integration

- Add GitHub refresh and local index refresh.
- Evaluate reusing TaskMaster's task model and Vibes Dashboard's modular panel loader.
- Add optional MCP intent routing only where a live connector is available.
- Keep all integrations replaceable behind adapters.

## Definition of success

A user can select a future idea, see the evidence behind it, understand its prerequisites, and produce a realistic next build path without leaving Atlas.
