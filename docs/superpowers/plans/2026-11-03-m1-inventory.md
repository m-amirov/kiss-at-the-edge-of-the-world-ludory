# M1 Inventory and Canonical-Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reproducible, read-only evidence baseline for migrating the existing visual novel onto Ludory.

**Architecture:** A small Node 22+ CLI reads pinned Git object trees without checking out blobs or changing either source repository. Its deterministic JSON file list and grouped counts drive a manually cross-checked canonical/parity report. Original media are never copied.

**Tech Stack:** Node.js 22+ ESM, built-in `node:test`, `git` CLI, Markdown/JSON.

**Spec:** `docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md`

## Global Constraints

- Source commit: `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`.
- Ludory commit: `0d034f1ab7e559b07080c00f6386a453e0e398b2`.
- No changes to either original repository, no CEOS/Starter Kit import.
- Preserve distinction: canonical 10-episode literary edition vs legacy 12-episode playable prototype.
- No runtime implementation, asset copy, publication, or release claims during M1.
- Keep inventory paths POSIX-relative; evidence may not contain private machine absolute paths.

## Review Focus

1. Filenames with spaces/Unicode/newlines must survive null-delimited git-tree parsing.
2. Incomplete/shallow/partial clone must not silently substitute working-tree state for pinned commit.
3. Missing or wrong source SHA must fail, never output a partial `PASS` inventory.
4. Repeated runs over identical trees must produce byte-identical JSON in stable byte order.
5. A script error or interrupted write must not leave a seemingly complete inventory file.

---

### Task 1: Deterministic read-only tree inventory

**Files:**
- Create: `tools/m1-inventory.mjs`
- Create: `tests/m1-inventory.test.mjs`
- Create: `package.json` (minimal `test:m1` script)

**Interfaces:**
- CLI `node tools/m1-inventory.mjs --source <checkout> --ludory <checkout> --output <abs-or-rel-file>`.
- Module exports `parseLsTree(buffer): Array<{path,mode,type,objectId}>` and `collectInventory({sourceDir,ludoryDir}): Promise<object>`; resolve refs only against the two literal pinned SHA strings.
- Output schema: `schemaVersion:1`, `repositories:[{role,repository,commit,files:[{path,mode,type,objectId}],groupCounts:{...}}]`; no timestamps or local paths.

- [ ] **Step 1: Write failing tests** for null-delimited paths including Unicode and whitespace; exact pinned commits; stable repeat bytes; wrong/missing commit; atomic output on error. Use isolated temporary Git fixture repositories and injected pinned commits for unit tests where necessary; production CLI pins the two constants.
- [ ] **Step 2: Run `node --test tests/m1-inventory.test.mjs`**. Expected: FAIL because module is missing.
- [ ] **Step 3: Implement minimal CLI** using `git -C <dir> cat-file -t <sha>` and `git -C <dir> ls-tree -r -z <sha>` (no checkout, fetch or mutation), validate object types, sort paths by UTF-8 bytes, write temp sibling and rename atomically only on success.
- [ ] **Step 4: Run `npm run test:m1`**. Expected: all tests PASS and process exit 0.
- [ ] **Step 5: Commit** `feat(m1): add deterministic pinned Git tree inventory`.

### Task 2: Evidence snapshot and canon/parity mapping

**Files:**
- Create: `docs/migration/m1-inventory.json`
- Create: `docs/migration/m1-canon-parity.md`
- Create: `docs/migration/m1-evidence.md`

**Interfaces:**
- Consumes Task 1 CLI and the approved pinned Git checkouts.
- Produces stable file list JSON plus a table with: canonical source, authored manuscript availability, current playable integration, Ludory target/adapter, missing verification, owner decision needed.

- [ ] **Step 1: Run inventory on the pinned source + Ludory checkouts**, save `docs/migration/m1-inventory.json`, and independently compare per-group counts with `git ls-tree -r --name-only <sha>`.
- [ ] **Step 2: Cross-check** `PROJECT_RULES.md`, `docs/CONCEPT_CANON.md`, `docs/SEASON_1_SCENE_MATRIX.md`, `docs/SEASON_1_CHOICE_ARCHITECTURE.md`, episode Markdown files, the separate `src/season-data.js` prototype and `src/literary-*.js` player.
- [ ] **Step 3: Write the parity report** without presuming 10 episodes run today; explicitly name conflict-prone canon revisions, S18–S21 evening, S26 lock, three romantic routes plus independent ending, source assets/provenance and legacy save incompatibility.
- [ ] **Step 4: Verify counts and references**: both commits match spec; every inventoried path unique and sorted; all mapped canonical file paths present; evidence records command, exit and limitations. Expected: no missing canonical source links; unverified functionality labeled `UNVERIFIED`, not `PASS`.
- [ ] **Step 5: Commit** `docs(m1): capture source tree and canon parity evidence`.

### Task 3: Reviewable M2 entrance gate

**Files:**
- Create: `docs/migration/m2-readiness.md`
- Modify: `README.md`

**Interfaces:**
- Consumes Task 2 parity gaps.
- Produces M2 kickoff checklist: native Studio template, one complete true-canon scene, interactive branching, Back/save/reload, mobile orientation, first Yandex/VK local candidate shape, no imported legacy code.

- [ ] **Step 1: Write measurable M2 acceptance criteria** and list owner-blocking decisions separately from engineering blockers; no implied publication authorization.
- [ ] **Step 2: Link M1 artifact and M2 checklist from README** while keeping repository status clearly pre-runtime.
- [ ] **Step 3: Run `npm run test:m1`, `node --check tools/m1-inventory.mjs`, and an independent pinned-tree count comparison**. Expected: exit 0, all tests PASS, same JSON across repeated runs.
- [ ] **Step 4: Commit** `docs(m1): record M2 entrance criteria`.

## Self-review and handoff

- Ensure the M1 report distinguishes confirmed file presence, actual playable integration and runtime verification.
- Open one PR from `docs/m1-migration-inventory` to `main`, attach command evidence and limitations; leave merging to user-authorized review.
- M1 is not a game build or release candidate. A future M2 implementation requires separate tests and PR.
