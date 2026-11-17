---
kind: decision
title: Public release keeps private graph as local overlay
tags: [release, privacy, seed]
sha: 1adc774
agent: cursor
created: 2026-11-17
updated: 2026-11-17
---
# Public release keeps private graph as local overlay

Public MIT release must not delete the accumulated personal Atlas graph. Prefer: (1) backup current graph.js + browser snapshot to a gitignored path; (2) commit scrubbed demo seed as the public default; (3) load gitignored graph.local.js (or data/graph.local.json) when present so desktop keeps the real portfolio; (4) keep kb_vault and LAN ops docs out of the public tree. Concepts ship as docs/patterns + demo nodes, not the live HappyMonkey diary.
