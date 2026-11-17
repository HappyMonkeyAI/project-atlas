# Project Atlas Spatial Frontend

An experimental Astro Spatial frontend for Project Atlas. It is intentionally separate from the MVP shell so the current implementation remains a comparison baseline.

The prototype implements the Constellation view with semantic DOM node cards, a list fallback, an Astro Spatial procedural Three.js network, and a persistent inspector pattern.

Run from this directory with npm install, then npm run dev.

The temporary graph adapter in src/data/atlas.ts should later be replaced with a typed projection generated from the shared Atlas graph/API.