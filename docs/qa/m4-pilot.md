# M4B pilot — S01–S03 (7 November 2026)

> Historical initial pilot evidence from 7 November. Ludory PR #91 was subsequently merged; a fresh Studio host-transfer verification is recorded in [`m4-studio-recovery.md`](m4-studio-recovery.md#host-transfer-revalidation--2026-11-08). The original trust blocker below concerns legacy `game/`, not the newly created `game-studio/`.

## Scope and immutable baseline

- Game M4 branch: `feat/m4-visual-migration` (isolated game worktree, not `main`).
- Source art/cues: `kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`.
- Ludory M4A: Draft PR #91, remote HEAD `9a570b17891de0570220da096378cf187a3a3577`, verified tree `d0fb1175acd662526b3b4a45188341d18a7737aa`; **not merged into Ludory `main`**.
- Native authored pilot: 9 cues, 3 opening stages, 3 neutral reset beats; 12 unique mapped beats.
- Literary graph: 606 technical scenes / 2633 dialogue beats / 164 choice beats / 7 endings; no edits to narrative prose or choice transitions.
- Economy: OFF. No asset binaries copied/admitted; `presentation.media` remains empty.

## Checks actually executed

| Gate | Result | Evidence |
|---|---|---|
| Source asset inventory | PASS structural / BLOCKED admission | 123 objects, 63 provenance-matched candidates, 60 blocked, 0 accepted; `docs/migration/m4-assets-inventory.json` |
| S01–S03 cue identity | PASS | `node --test tests/m4-source-map.test.mjs` (2 tests) |
| Author presentation compiler + proof | PASS | `node tools/m4-build-presentation.mjs --check`; SHA-256 of authored `story.js` matches `narrative-assets.json` |
| Native M4A data validation | PASS contract | `defineNarrativeGraph` + `defineNarrativePresentation` accepted 606 scenes / 12 neutral beats / zero media |
| Game M2 narrative regression | PASS | `node --test tests/m2-s01.test.mjs` (9 tests) |
| Managed Studio update | **BLOCKED** | `components update --project .../game --json` → `BLOCKED`, `Studio host trust: no registered Studio ownership for this game`; no writes |
| Studio trust bootstrap | **CONFLICT** | `components trust --project .../game --json` → `Component ownership has no verified creation/upgrade provenance`; no writes |
| Studio preview build | **BLOCKED** | `preview --project .../game --json` → `STUDIO_ORIGIN_TRUST_MISSING`; no writes |
| Pilot in real browser (390×844, 1000×720) | **BLOCKED_BROWSER** | No trusted Studio preview available, no screenshots claimed |
| Actual art crop, position and semantic fidelity | **BLOCKED_ASSET** | No admitted image, cannot assert pixels or pass artistic QA |

## Scenarios still awaiting runnable native Studio build

1. S01: airport arrival → Nick introduction → exit into rain → Damir encounter.
2. S01: Eric/front, Nick/back and Damir/back seat, followed by common road; Back to alternate choice and subsequent save/restore.
3. S02: road → roadside café at `s02-road-32`.
4. S03: guesthouse call → Damir enters at `s03-coffee-01`.
5. Both viewport layouts, no horizontal overflow, content accessibility, keyboard focus and reload/Back/journal behavior.
6. Fallback upon unavailable or invalid image; without approved files every mapped pilot stage stays deliberately neutral.

## Trust blocker / next decision

This copied game worktree has a schema-2 component manifest but **no verifiable Studio owner creation/upgrade provenance** in this host environment. Ludory refuses `components update`, `components trust` and `preview` as designed. The author-owned `story.js`, `src/presentation.js`, `visuals/presentation.json` and matching proof are ready, but the **managed** `src/main.js` and `assets/ludory-narrative.js` remain the previous native version and do not consume the new data.

Do not edit ownership metadata or trusted registry manually, apply `--force`, fake a Studio provenance receipt, or claim native visual integration is complete. Continue after the owner chooses an approved route: recover genuine original Studio provenance through supported tooling, or authorize initialization of a fresh Studio-managed project and migration of *only* verified author files. Actual asset admission needs a separate explicit command/destination approval.
