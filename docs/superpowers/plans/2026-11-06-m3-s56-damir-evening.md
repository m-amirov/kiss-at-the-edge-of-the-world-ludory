# M3 S56 Damir day-16 implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add canonically faithful S56 to existing Damir path with guarded status routing and two free choices.

**Architecture:** A separate `game/src/scenes/s56.js` exports seven verbatim blocks; `game/src/story.js` adds a native conditional status dispatch after S34 and S56 choice scenes. N1 `flag_set` persists S56-C2 for future S39. Closed status ends at a Draft-only S35-bound stop.

**Tech Stack:** Node ESM, `node:test`, native Ludory N1 1.2.2, existing Draft PR #2.

**Spec:** [S56 design](../specs/2026-11-06-m3-s56-damir-evening-design.md)

## Global Constraints

- Pinned source original `1e775f1`, EP08 lines 231–271; paragraph hashes independently derived before implementation.
- S56 active/paused only; closed never enters romantic content; both S56 author choices free, S56-C2 flags exclusive.
- No original/framework edits, no global routeStatus setter, no synthetic story, no real media/messages/publication, Economy OFF, Draft PR #2 only.

## Review Focus

1. Forged active status after closed cannot enter S56; N1 must reject with zero writes.
2. S34 `active` and `paused` must display different literal paragraphs, then both show both original S56 choices.
3. S56-C1 choice must have no invented effects; S56-C2 two flags must be mutually exclusive under Back and JSON replay, preserved for S39.
4. Closed waits at S35-bound technical stop, not a generic S56 romance end; other locked routes remain intact.
5. All manuscript prose stays verbatim; no accidental real text messages, media rights or monetization.

---

### Task 1 — TDD contract and N1 routes

**Files:** Create `tests/m3-s56.test.mjs`, modify `tests/m3-s34.test.mjs` and `tests/m3-s30-s55.test.mjs`.

**Interfaces:** native `graphData`, `catalogData`, `createNarrativeRuntimeUpdate`, S34 flags and source S56-C1/C2 labels.

- [x] Write literal source SHA-256/count tests, guarded branch and two free choice graph tests; update old S34 Draft-end assertions.
- [x] Extend real N1 Damir scenarios through both S56 introductions, both choices, Back/JSON and forged outcomes. Observed expected static RED (0 vs 3 S56 source paragraphs, old S34 stop); focused run **11/11 PASS**.

### Task 2 — Native authored scenes

**Files:** Create `game/src/scenes/s56.js`, modify `game/src/story.js`, `game/narrative-assets.json`.

**Interfaces:** `s56Active`, `s56Paused`, `s56C1A`, `s56C1B`, `s56Common`, `s56C2A`, `s56C2B`; `s34-status-dispatch`, `s56-c1-choice`, `s56-c2-choice`.

- [x] Add source-verbatim 7 blocks, native status guard, two authored free choices, C2 payoff flags, closed and open Draft-only stops; no S35/S39 early entry.
- [x] Recompute story manifest and run focused N1 RED→GREEN and previous S34 regressions (static 5/5, full focus 11/11 PASS).

### Task 3 — Evidence and existing Draft PR

**Files:** Create `docs/migration/m3-s56-fidelity.md`, update README, historical S34 fidelity and this plan.

- [x] Document source/economy/consent boundaries; syntax/manifest PASS, `npm test` **189/189 PASS**, independent read-only review **0 Critical / 0 Important / 0 Minor**.
- [ ] Commit only scoped files; upload exact Git blobs, CAS-update the existing Draft PR #2 without force; fresh-fetch verify tree/main/Draft and report CI honestly.
