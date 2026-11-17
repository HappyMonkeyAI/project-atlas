# ADR-0002: Keep the MVP standalone

- Status: accepted
- Date: 2026-09-09

## Decision

Project Atlas remains a standalone local-first application for the MVP. Vibes Dashboard is an integration target and source of reusable shell/module patterns, but Atlas will not be packaged as a Vibes module until the graph contract, ingestion boundaries, and privacy behavior are proven in daily use.

## Rationale

- Atlas needs an independent local graph and source-indexing lifecycle.
- The current MVP is easier to verify and recover as a standalone app.
- Vibes Dashboard can still be inspected through the read-only GitHub adapter.
- Integration too early would couple the graph model to an existing dashboard shell before the product boundaries are stable.

## Consequences

- The current local server is the MVP runtime.
- Future Vibes integration should use an adapter or module boundary, not a wholesale copy.
- The deferred packaging task remains intentionally outside MVP acceptance.
