# M3 S07 Canonical Kitchen Scene and Free Archive Choice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox tracking.

**Goal:** Extend the approved M3 Ludory-native manuscript migration through S07, preserve S01/S04/S05/S06 callbacks, keep the first game entirely free despite optional Ludory Economy E5.

**Spec:** Approved `docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md`; original manuscript `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-vertical-slice-episodes-01-02.md`, exact S07–before-S08 block.

**Architecture:** Fourteen author-owned prose constants in `game/src/scenes/s07.js`, a new S07 graph segment after both S06 C2 branches, conditional one-option technical Continue gates for optional S05/S01/S04/S06 responses; authored `S07-C1` three-choice archive behavior. End with clearly technical S07 boundary before S08. Reuse existing Ludory N1 runtime and `narrative-interactive` 1.2.2. No Economy template switching or SDK/payment changes.

**Constraints:** S01–S06 intact, old prototype saves not silently migrated, no unrelated refactors, no live platform QA, no merger with `main`, no release. Existing Studio host-trust registration for this absolute local project path is absent; report that F5b2 is BLOCKED unless it becomes legitimately registered, never forge trust.

## Review Focus

- One S05-Nick-only callback, one S01-Nick-only callback: no prose leak to other choices.
- Three camera-consent callbacks use only the exact existing S04 flags, including refusal respected; no implied camera/photo consent.
- S07-C1 A/B/C each sets one neutral `kitchen-archive-*` flag, Back can undo; no actual image transmission, money or currency.
- After common S07 text, the correct existing `eric-map-favorite-place` / `eric-map-music` flag selects the corresponding S06 payoff; no dead ends.
- Fourteen exact original text blocks SHA-256 compared against real graph dialogue; old draft save endpoint replacement documented.

---

### Task 1: S07 text and all narrative branches

**Create:** `game/src/scenes/s07.js`, `tests/m3-s07.test.mjs`, `docs/migration/m3-s07-fidelity.md`.

**Modify:** `game/src/story.js`, `game/narrative-assets.json`, `tests/m3-s06.test.mjs`, `docs/migration/m3-s06-fidelity.md`, `README.md`.

- [x] **Step 1 RED:** Four S07 tests failed for absent scenes/old S06 ending; economy-off invariant passed.
- [x] **Step 2 GREEN:** All 14 exact prose blocks, four guarded continuation points, neutral archive choice, S06 boundary and story hash updated. Targeted S07 tests 5/5 PASS.
- [x] **Step 3 Checks:** Full `npm test` 46/46 PASS; source/test syntax and staged diff PASS. Studio `components status` correctly reports BLOCKED (`trusted record directory does not exist`), so F5b2 NOT_RUN; protected trust not bypassed.
- [x] **Step 4 Evidence:** All source/hash/test evidence and F5b2/Back caveats documented. Independent read-only review reported 0 Critical/Important; three Minors addressed with clearer README and expanded conditional negative/mixed-path checks.
- [ ] **Step 5 Draft:** Commit; GitHub Git Data SHA-check blobs/tree against local commit, atomic branch ref update from expected remote SHA; update and verify existing Draft PR #2 only. No `main` merge or publication.
