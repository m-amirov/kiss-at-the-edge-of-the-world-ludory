# M3 S06 Canonical Prose and Economy-Off Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox tracking.

**Goal:** Continue the canonical Ludory novel with full S06 prose, conditional S01/S05 reactions and authored S06-C2 choice while preserving a fully free first game despite the new optional Economy & Monetization E5 module.

**Architecture:** Nine exact story prose blocks live in a new author-owned `game/src/scenes/s06.js`, with guarded one-option technical continuation gates for two conditional checkpoints. The two final authored branches converge at a clearly technical boundary before S07. Existing `narrative-interactive` stays unchanged; no `narrative-economy` adoption.

**Tech Stack:** Node.js ESM, `node:test`, Ludory N1 graph v1 and runtime 1.2.2. Optional Economy E5 exists on Ludory main `2c18b2d`, separate `narrative-economy` template default-off; no economy dependency in this first game.

**Spec:** Approved `docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md`; pinned original manuscript `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, S06 through preceding S07 heading. Owner's explicit policy: no virtual currency, premium choices, purchase, rewarded-ad requirement in first game.

## Global Constraints

- Preserve S01→S02→S65→S03→S04→S05; both S03/S04 outcomes and all three S05 weather choices must reach S06.
- Exactly nine original literary blocks: S06 intro (9), weather Erik (3) / other (1), common A (1), seat Erik (1) / other (1), common B (83), S06-C2 option A/B (1/1).
- `weather-choice-erik` chooses a distinct authored response. `s01-seat-eric` selects another authored response. Technical `Продолжить` gates are conditional navigation only, not choices.
- S06-C2 author labels are 'Попросить показать его любимое место' and 'Предложить выбрать музыку'; effects remain two exclusive neutral `eric-map-*` flags, never route lock/affinity.
- Current Ludory game stays under `narrative-interactive` with no economy sidecar, no SDK ports, no costs, no premium beats. Do not update Ludory framework or start payments.
- Draft PR #2 only, no merge to main, no live platform QA/publication.

## Review Focus

- All 3×3 combinations of S01 seat and S05 weather reach the authored S06 conditional text, no graph dead end.
- `Back` and JSON restore preserve previous consent/weather choices and undo only S06-C2 choice.
- Source hashes compare actual graph dialogue, not merely imported JS string constants.
- Free path invariant: every visible narrative choice remains playable without economy state; no economy config or premium sidecar registered.
- Known old-save incompatibility at removed `s05-m3-end` is disclosed before any release.

---

### Task 1: S06 conditional prose, free choice and test evidence

**Files:** Create `game/src/scenes/s06.js`, `tests/m3-s06.test.mjs`, `docs/migration/m3-s06-fidelity.md`; modify `game/src/story.js`, `game/narrative-assets.json`, `tests/m3-s05.test.mjs`, `README.md`, previous S05 report.

- [x] **Step 1 RED:** Four new S06 cases failed against the old S05 technical boundary, while the economy-off invariant already passed.
- [x] **Step 2 GREEN:** Nine literal blocks and two conditional gates + free authored choice, original S05 tests updated; complete runtime cases pass.
- [ ] **Step 3 Full checks:** `npm test` 41/41 PASS; syntax and staged diff checks PASS. **Studio host-trust BLOCKED** because current absolute path has no host trust registration; F5b2 ZIP verification **NOT_RUN**. Never auto-adopt ownership to satisfy the checklist.
- [x] **Step 4 Evidence/review:** Evidence written to `docs/migration/m3-s06-fidelity.md`; independent read-only review approved Draft-only, and follow-up test improvements cover exact labels and all 3×3 paths through S06 ending. Explicitly recorded blocked ZIP gate instead of inventing digests.
- [ ] **Step 5 Draft only:** Commit, SHA-verify blobs/tree, update existing Draft PR #2 with expected remote HEAD lease; verify PR remains Draft/unmerged. No main merge/release.
