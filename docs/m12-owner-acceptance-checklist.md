# M12 — Owner TaskMaster acceptance checklist

**Status:** accepted 2026-10-29 via owner-authorized synthetic fixture walkthrough (BrowserOS neo). Real private export still optional and requires a pasted path.

## What M12 proves

Read-only TaskMaster export → explicit task→node mapping → status conflict choice → focus queue persistence — without writing back to TaskMaster or storing task bodies/IDs in snapshots.

## Synthetic rehearsal (safe anytime)

1. Start Atlas: `npm start` → `http://127.0.0.1:4173`
2. Open **Sources** → TaskMaster export section
3. Load `fixtures/taskmaster-synthetic-export.json`
4. Confirm message shows normalized task count; private description/notes strings do not appear in the detail panel as raw body dump beyond title/status
5. Map `synth-atlas-plan` → graph node `atlas` (or `taskmaster`); **Add to focus queue** / confirm
6. Status conflict: put `atlas` on the queue as `in_progress`, map a task with export status `pending`/`queued` → UI shows **Use export** / **Keep queue**. Verified 2026-10-27: Use export → `queued`; Keep queue → `in_progress`; no `PRIVATE_*` / task-id leaks in graph/queue storage
7. Reload the page: queue status/order persist; snapshot export must not contain synthetic task IDs (`synth-atlas-plan`, etc.) or `PRIVATE_*` strings
8. Restore prior localStorage if this was a throwaway session

## Real export (owner only)

Do **not** point agents at Downloads or vault backups until the owner says so in-session.

Owner provides: path or paste authorization + intended node mappings. Then repeat steps 3–7 with that file and record acceptance or gaps in `PROGRESS.md` / M13.

**2026-10-27 note:** No obvious TaskMaster-named `.json` in top-level Downloads; please paste the export path when authorizing.

## Related

- TASKS.md M11 (done) · M12 (open) · M13 (depends on M12)
- Adapter: `src/planning/taskmaster-export.mjs`
- Tests: `test/taskmaster-export.test.mjs`
