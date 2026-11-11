# S35/S63 Independent Day-16 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add canonical S35/S63 independent follow-up without admitting continuing romances or inventing economic, consent, or external actions.

**Architecture:** Store only original authored text in two short `game/src/scenes` modules. Wire a common S35→S63 path in the existing N1 graph, extending the existing S32/S33/S34 guarded status transitions and S62 callback transitions. Real N1 replay retains route/status provenance.

**Tech Stack:** Node.js ESM, `node:test`, Ludory vendored N1 runtime, `npm test`.

**Spec:** `docs/superpowers/specs/2026-11-06-m3-s35-s63-independent-design.md`

## Global Constraints

- Read-only source is `../source/content/season-1-literary-episode-08.md`, pinned `1e775f1`, SHA `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`.
- Work in the existing Draft PR #2 branch only; do not change `main` or Ludory framework.
- No Economy for this first game, no server, no actual media, real messaging, consent, publishing or platform release.
- EN is a RU fallback until translated; current Studio export remains BLOCKED by framework schema/trust mismatch.

## Review Focus

1. Eric and Nick active/paused must never reach S35 when closed routes become available; Task 2 guarded choice/static and N1 tests.
2. A forged `closed` flag or altered actionLog cannot bypass a romance status; Task 2 zero-write N1 tests.
3. `Back` over S63-C2 must discard the other S63-C2 provenance flag; Task 2 N1 tests.
4. S35 mentioning a photograph or message must not produce a publication/media grant or external action; Task 1/2 forbidden effects and state tests.
5. Old technical boundaries must not claim an actual story ending; Task 2 terminal structure and Task 3 gates documentation.

---

### Task 1: Source fidelity and local graph connections

**Files:** Create `tests/m3-s35-s63.test.mjs`, `game/src/scenes/s35.js`, `game/src/scenes/s63.js`; modify `game/src/story.js`, `game/narrative-assets.json`.

**Interfaces:** Consumes existing `beats(prefix, prose)`, `graphData.scenes`, N1 `choice.when`/`flag_set`; produces `s35-intro`, `s35-c1-a|b`, `s35-common`, `s63-intro`, `s63-c1-a|b`, `s63-common`, `s63-c2-a|b`, `s63-after-m3-end` and flags `s63-next-ticket|venue`.

- [x] Write tests using independently derived manuscript hashes for ten nodes, six free option labels across three decisions, no forbidden effects, S35→S63 and S63-C2 termination.
- [x] Run `node --test tests/m3-s35-s63.test.mjs`; observe RED due to missing S35 nodes.
- [x] Implement source-verbatim `s35.js`/`s63.js`, graph nodes and graph SHA manifest.
- [x] Run `node --test tests/m3-s35-s63.test.mjs`; observe GREEN.

### Task 2: All guarded entrances and full N1 replay

**Files:** Modify `game/src/story.js`, `tests/m3-s31-s62.test.mjs`, `tests/m3-s32.test.mjs`, `tests/m3-s33.test.mjs`, `tests/m3-s30-s55.test.mjs`, `tests/m3-s56.test.mjs`; extend `tests/m3-s35-s63.test.mjs` and update older boundary references.

**Interfaces:** Consumes Task 1 S35 entry and S63-C2 flags; produces guarded S32/S33 continuation, S34 closed→S35, S62 callbacks→S35.

- [x] Add failing static and real N1 assertions for independent S62 both callbacks and all romance closed statuses, while active/paused retain their draft stops; add S63-C1/C2 real choice, Back/JSON and forged-state/invalid-option zero-write checks.
- [x] Run focused `node --test tests/m3-s35-s63.test.mjs tests/m3-s31-s62.test.mjs tests/m3-s32.test.mjs tests/m3-s33.test.mjs tests/m3-s34.test.mjs tests/m3-s56.test.mjs tests/m3-s30-s55.test.mjs`; record RED.
- [x] Wire guarded entries, remove obsolete technical closed/S62 stops, preserve route lock. Recalculate graph SHA.
- [x] Run focused tests, then `npm test` to verify entire historic suite. Run `git diff --check`, Node syntax, SHA manifest checks.

### Task 3: Evidence, review and Draft PR sync

**Files:** Create `docs/migration/m3-s35-s63-fidelity.md`; update `README.md` and obsolete current-boundary notes in `docs/migration`.

**Interfaces:** Consumes completed test outputs and Task 2 graph; produces auditable evidence only, not a release.

- [x] Record source SHA/paragraphs, verified routes, counts and explicit NOT_RUN/BLOCKED gates, update stage references.
- [x] Run final full suite after code and test edits, request independent read-only whole-stage review, triage findings with regression coverage for any corrections.
- [x] Commit in existing feature branch; sync exact Git blobs/tree to existing Draft PR #2 using `force:false` CAS; independently fetch and compare tree; keep `main` untouched.
- [x] Close evidence document with actual code/remote SHAs, PR state and CI status. No merge or publish.
