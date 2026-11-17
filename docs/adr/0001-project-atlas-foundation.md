# ADR-0001: Project Atlas foundation

- Status: accepted
- Date: 2026-09-09

## Decision

Adopt a local-first roadmap graph with shared entities and four projections: constellation, radial, dependency tree, and hex research board.

## Rationale

The views answer different questions but must remain synchronized. A single graph contract prevents visual drift and makes future AI recommendations explainable.

## Consequences

The first implementation can remain a lightweight frontend prototype. Ingestion, persistence, and recommendation services can be added behind stable boundaries without redesigning the user-facing model.
