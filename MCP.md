# MCP intent map

This file records intended routing, not guaranteed availability. A listed connector is not necessarily mounted or authenticated.

| Intent | Preferred source/tool | Fallback |
|---|---|---|
| Session warm-start / project memory | Spine MCP (`session_brief`, `get_section`, `recall`, `checkpoint`, `record_memory`) | `spine brief` CLI from repo root, else read AGENTS/CONTEXT/TASKS/PROGRESS |
| Running UI inventory / design drift | Spine Design MCP (`design_brief`, `ensure_capture`, `check_design`); Playwright against `http://127.0.0.1:4173` | Manual browser check; BrowserOS neo |
| Repository metadata | GitHub connector or local git | Read-only git CLI |
| Vault metadata | Local filesystem adapter | Manual path selection |
| Source search | Local graph index | Repository and vault scans |
| AI suggestions | Configured model adapter | Human-created edges |
| Local visual/text analysis | OpenAI-compatible local endpoint at 192.168.5.229:1234/v1 | Manual labels and fixtures |
| Browser verification | BrowserOS neo or in-app browser | Deterministic HTTP checks |
| Task sync | User-selected TaskMaster JSON export (read-only, browser-local) | Local focus queue |
| Agent workflow | AgentsProtocol documentation spine and verification patterns | Project Atlas AGENTS.md and verification checklist |
| Hosting | Local preview first | Explicit deployment only |

## Rules

- Discover availability at runtime.
- Never place credentials, tokens, or private note bodies in this file.
- The current local test model is google/gemma-4-e2b with a dummy development key. Treat this as a local-only test adapter, not a production credential.
- Do not send private vault content to any remote model. Local model use must be explicit, bounded, and logged only as metadata.
- Keep MCP.local.md gitignored if machine-specific routing is needed.
- Record source provenance when an MCP result becomes graph evidence.

## Local model test configuration

    OPENAI_BASE_URL=http://192.168.5.229:1234/v1
    OPENAI_API_KEY=dummy-key
    OPENAI_MODEL=google/gemma-4-e2b

The endpoint was verified read-only through GET /v1/models on 2026-09-09. The model inventory includes google/gemma-4-e2b and a local embedding model. Vision capability still needs an explicit image-input smoke test before it is relied on.

## Vault inspection controls

`GET /api/vault/inspect?path=<confirmed-path>` performs a metadata-only scan. Repeatable query parameters provide explicit scope without returning note bodies:

- `includeFolder=projects` limits the scan to a folder and descendants.
- `excludeFolder=archive` excludes a folder and descendants.
- `includeNote=projects/atlas.md` limits the scan to named relative note paths.

The local response includes the applied filters and metadata-only candidates derived from repeated explicit tags and headings. Candidate provenance can point to the confirmed vault root while held in browser-local state; filesystem errors use generic messages. Snapshot export replaces vault-root strings with a redaction marker, and the checked-in manifest never stores the path. Note bodies are never returned or included in exports.
