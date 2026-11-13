# Reader Tap and Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace visible Next and whole-paragraph reading with short fragments advanced by tap/click while retaining Ludory graph, saves and choices.

**Architecture:** A new author-owned pagination helper splits full native prose by sentence/word against a measured five-line DOM predicate. `original-game-ui.js` observes native panel replacements and orchestrates page indices, tap/keyboard advancement, and Back; `original-game.css` conceals only native Next controls. Story data, managed files and actions remain untouched.

**Tech Stack:** Browser JavaScript ES modules, native Ludory Studio DOM, CSS, Node test runner, Playwright browser QA.

**Spec:** `docs/superpowers/specs/2026-11-11-reader-tap-pagination-design.md`

## Global Constraints

- Only author-owned presentation UI, CSS, tests and docs can change. Do not edit `game-studio/src/main.js`, `game-studio/index.html`, authored graph/prose, fonts/assets, or economy.
- No external runtime dependency or service. Choices, journal, settings, save and images must stay native.
- Do not merge, release, or mark artistic approval as passed.

## Review Focus

- A paragraph with a long unbroken word still paginates, every Unicode character retained (Task 1).
- A sentence with dialogue punctuation and leading/trailing spaces remains byte-equivalent when pages concatenate (Task 1).
- A new native panel after journal/locale/Back does not accidentally show an incomplete or skipped fragment (Task 2).
- Tapping buttons, dragging to select text, scrolling, or visiting a choice does not dispatch `next` (Task 2 and Task 3).
- 320×700 large-font reading and viewport changes do not create a six-plus-line fragment or hidden action (Task 3).

---

### Task 1: Deterministic prose pagination

**Files:** Create `game-studio/src/ui/reader-pagination.js`; create `tests/m4-reader-pagination.test.mjs`.

**Interfaces:** `paginateReaderText(text, fits, locale='ru'): string[]`; for empty input return `['']`; concatenating pages must equal original text. `fits` is a layout predicate; it may be called on each candidate.

- [x] Write tests using actual S38/S39 source prose for exact reconstruction, punctuation, whitespace and bounded long sentences/words.
- [x] Run `node --test tests/m4-reader-pagination.test.mjs` and confirm the required export is absent (RED).
- [x] Implement greedy sentence grouping with fallback to words and graphemes on oversize segments, respecting `fits` and preserving exact characters.
- [x] Re-run the focused tests (GREEN) and commit Task 1.

### Task 2: Native panel page lifecycle and tap/Back

**Files:** Modify `game-studio/src/ui/original-game-ui.js`; modify `game-studio/src/ui/original-game.css`; modify `tests/m4-original-ui-parity.test.mjs`; extend `tests/m4-reader-pagination.test.mjs`.

**Interfaces:** `installReaderPagination({root, document, isMenuOpen})` returns `{advance, previous, prepareNativeBack, sync, repaginate}`. Keep native `button[data-action^='narrative:next:']` DOM for dispatch; visually and accessibly conceal it. Rebuild pages on native panel identity and resize, tracking same-beat offset and Back intent.

- [x] Add failing tests that require prose-panel taps, hidden Next, intact control guards, local paging and Back synchronization.
- [x] Run focused tests and confirm RED from missing UI behavior.
- [x] Implement panel observer, measured `fits` (5 text lines), hidden button, tap/keyboard guard, native Back capture, menu/journal/choice exclusions and safe resize/locale behavior.
- [x] Re-run focused tests, inspect no stale UI observers or double dispatch, then commit Task 2.

### Task 3: Browser parity QA, documentation, final verification

**Files:** Modify `tests/m4-browser-qa.mjs`; modify `tests/m4-visual-parity-regression.test.mjs`; update `docs/qa/m4-visual-parity-comparison-2026-11-10.md`.

**Interfaces:** Browser QA may invoke internal native Next programmatically for long-route setup but must validate all user-facing progression via tap/keyboard; it must not call Playwright `.click()` on hidden Next.

- [x] Add browser assertions for S38/S39 short pages, text tap, Back, choice safety, 320×700/390×844/430×932, desktop, Save→Reload and no visible Next; ensure old visible-Next expectation is removed.
- [ ] Run browser suite: blocked before application start by Chromium sandbox socket EPERM on this executor.
- [x] Align route setup and viewport assertions with tap-only UX; browser runtime result remains unverified here.
- [x] Run available gates: targeted tests on final source (54 PASS, 1 SKIP),
  presentation checks and `git diff --check`; an `npm test` run started before
  final adapter changes ended with 281 PASS, 1 SKIP, so it is not a clean
  full-suite attestation of the final HEAD. Browser QA is environment-blocked,
  not a completed release/art acceptance gate.
- [ ] Commit and provide a Draft PR-ready outcome; do not merge or publish.
