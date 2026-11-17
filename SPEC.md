# Project Atlas specification

## Core entities

- Source: an origin such as a GitHub repository, local vault, document, or task list.
- Project: a coherent body of work, usually backed by one or more sources.
- Capability: a reusable thing that has been built, learned, or made available.
- Idea: a possible future project or capability.
- Candidate: an external or research lead with an explicit disposition (not yet a project or idea to build as-is).
- Evidence: a source-backed observation with provenance and confidence.
- Edge: a typed relationship between two entities.
- Build path: an ordered set of prerequisites from current capability to target idea.

## Minimum node shape

    {
      "id": "stable-slug",
      "kind": "project | capability | idea | source | candidate",
      "title": "Human-readable title",
      "status": "idea | planned | active | built | archived",
      "progress": 0,
      "tags": ["ai", "knowledge"],
      "summary": "Short explanation",
      "sources": ["source-id"],
      "confidence": 0.0
    }

## Candidate nodes

Candidates represent research or portfolio leads that must not collapse into `idea` or `project` until disposition changes.

Required when `kind` is `candidate`:

- `disposition`: `benchmark` | `pattern` | `reject` | `adopt`
- Prefer linking provenance to the wiki ecosystem page source (`research-ecosystem-wiki`) via `sources` and/or `derived_from` edges.

Disposition meanings:

- `benchmark` — measure against an owned system before adopting anything
- `pattern` — mine invariants/tests; do not import the whole stack
- `reject` — keep as negative evidence; do not prioritize
- `adopt` — promote toward project/capability work under an owned home

## Minimum edge shape

    {
      "from": "source-or-capability-id",
      "to": "target-id",
      "kind": "enables | depends_on | related_to | derived_from",
      "confidence": 0.0,
      "evidence": ["evidence-id"],
      "review": "suggested | accepted | rejected"
    }

## Functional requirements

- All four views consume the same graph.
- Selecting a node updates the inspector.
- The inspector shows status, progress, evidence, and next unlocks.
- A user can prioritize an idea into a focus queue.
- AI suggestions must be reviewable before becoming accepted edges.
- A source can be excluded from indexing without deleting the source record.
- Indexing runs must be resumable and report partial failures.
- Local model assistance must be optional, bounded, and replaceable by a human-review path.
- Image understanding must be capability-detected rather than assumed from the model name.

## Non-functional requirements

- Local-first and privacy-preserving.
- Deterministic exports for debugging.
- Clear provenance for recommendations.
- Responsive enough for a large graph with progressive loading.
- No secrets in source control or generated artifacts.
- Private vault content must remain on the local machine unless the user explicitly authorizes another destination.
