# Original Game UI Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original full-screen visual-novel presentation in game Draft PR #3, initially through S01–S03, while retaining the native Ludory narrative engine.

**Architecture:** Use an author-owned shell, theme and interaction adapter around the supported Ludory renderer. Do not copy the old literary engine or edit Studio-managed code. Keep all presentation media gated by the current admission inventory, and use browser screenshots of the pinned original as the visual reference.

**Tech Stack:** Vanilla HTML/CSS/ES modules, Ludory `narrative-interactive` 1.2.4 (upgrade gated), Node 22+ test runner, Playwright Chromium in GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-09-restore-original-game-ui-design.md`

## Global Constraints

- Pinned source UI: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c` (`index.html`, `src/literary.css`, `src/literary-player.js`, `src/literary-stage.js`).
- Preserve 606 graph nodes, 2633 dialogue lines, 164 choices, 7 endings, and all corresponding story SHA proofs.
- Only the three accepted S02/S03 PNGs may render. No additional sprite, photo or soundtrack admission without independent approval and provenance evidence.
- Economy and premium choices remain OFF. No publication, main merge or platform-release claims.
- `game-studio/src/main.js`, `game-studio/assets/ludory-narrative.js`, `game-studio/ludory.components.json` are managed: no direct edits.
- PR #3 remains Draft stacked over Draft PR #2; Studio 1.2.5 upgrade remains blocked without authentic ownership receipts or authorized recovery.

## Review Focus

1. Choice beat: tapping the stage must **not** select a choice or advance twice. Cover in Task 3 browser test.
2. Keyboard navigation: Space/Enter advances dialogue once, without stealing focus from controls. Cover in Task 3 browser test.
3. Save/restore: the menu overlay must not restart or overwrite a real save. Cover in Task 3 browser test.
4. Mobile safe area: no clipped buttons or inaccessible text under bottom inset at 390×844 and narrow widths. Cover in Task 4 geometry test.
5. Absent/unapproved art: the neutral S01 stage must not fetch undeclared media or show stale S02/S03 art. Cover in Task 4 browser test.

---

### Task 1: Baseline reference and failing UI contract

**Files:**
- Create: `docs/qa/m4-original-ui-reference.md`
- Create: `tests/m4-original-ui-parity.test.mjs`
- Test: `tests/m4-original-ui-parity.test.mjs`

**Interfaces:**
- Consumes: pinned original `src/literary.css` and current `game-studio/index.html`.
- Produces: source-to-target layout/control mapping and executable failing assertions for the original UI's full-screen shell, bottom overlay, separate menu, and source-identified theme.

- [ ] **Step 1: Record baseline original CSS selectors and current Ludory DOM classes** in the QA reference, including screenshot viewports and all unavailable art. No acceptance claim yet.
- [ ] **Step 2: Write the failing test** that checks `game-studio/index.html` loads the author-owned theme and entry adapter, does not expose the generic Ludory header, and that the CSS defines a viewport-filling stage with bottom dialogue overlay.
- [ ] **Step 3: Run `node --test tests/m4-original-ui-parity.test.mjs`**. Expected: FAIL because the current `game-studio/index.html` contains the generic header and has no original game theme.
- [ ] **Step 4: Commit test and reference only.** Expected: RED is recorded honestly for Task 2.

### Task 2: Full-screen author-owned styling

**Files:**
- Create: `game-studio/src/ui/original-game.css`
- Modify: `game-studio/index.html`
- Test: `tests/m4-original-ui-parity.test.mjs`

**Interfaces:**
- Consumes: stable Ludory DOM hooks `.ludory-narrative`, `__stage`, `__background`, `__cg`, `__portrait`, `__panel`, `__actions`, `__toolbar` and the approved media maps.
- Produces: source-like full-bleed composition, bottom transparent gradient dialogue, serif text, original warm button style and portrait/desktop media queries. Keep all existing `data-action` and `data-beat-id` semantics.

- [ ] **Step 1: Run the Task 1 RED test at the current HEAD.** Expected: the exact original shell/theme assertions fail.
- [ ] **Step 2: Implement CSS and static shell changes** without modifying managed source or adding media. Retain a status region for accessibility but visually integrate it without a persistent top chrome.
- [ ] **Step 3: Run `node --test tests/m4-original-ui-parity.test.mjs tests/m4-admitted-visuals.test.mjs`.** Expected: PASS, including admitted PNG hash proof and no asset additions.
- [ ] **Step 4: Commit the scoped CSS/shell and tests.**

### Task 3: Menu and navigation adapter

**Files:**
- Create: `game-studio/src/ui/original-game-ui.js`
- Modify: `game-studio/src/entry.js`
- Modify: `tests/m4-browser-qa.mjs`
- Test: `tests/m4-original-ui-parity.test.mjs`, `tests/m4-browser-qa.mjs`

**Interfaces:**
- Consumes: `startNarrative()` from managed `src/main.js`, native button actions exposed by the renderer, `#language`, `#save`, `#restart` and the author-owned DOM shell.
- Produces: `installOriginalGameUi({ document, start })` as author-owned startup orchestration. The UI may proxy user clicks to current native actions but must never parse or write narrative save data, invent an alternate game state, or dispatch synthetic choice actions. Main menu and reading preferences are UI-only.

- [ ] **Step 1: Extend actual-game Chromium tests first** to require an original-style menu/continue action, stage tap exactly once on dialogue, no stage advance on choices, keyboard handling, Back and Save→Reload, and consistent native `data-beat-id` progression.
- [ ] **Step 2: Run `npm run qa:m4:browser`** on a Chromium-capable host or GitHub Actions. Expected: new parity cases FAIL against the generic shell; record the run, do not call the pilot accepted.
- [ ] **Step 3: Implement the smallest author-owned adapter** and connect it from `entry.js`. Preserve native lifecycle and focus. Do not auto-clear saves, require permission for extra media, or let a menu consume platform SDK errors.
- [ ] **Step 4: Re-run the browser suite.** Expected: new cases PASS with no regression in Eric/Nick/Damir choices, Back, Save/Reload, and S01→S03.
- [ ] **Step 5: Commit adapter and tests.**

### Task 4: Visual regression evidence and acceptance

**Files:**
- Modify: `tests/m4-browser-qa.mjs`
- Modify: `docs/qa/m4-original-ui-reference.md`
- Modify: `.github/workflows/m4-browser-qa.yml` only if extra artifact paths or runner dependencies are necessary.

**Interfaces:**
- Consumes: Task 2 theme and Task 3 adapter; original viewport references; admitted PNGs.
- Produces: screenshots of original and migrated entry/menu, neutral S01, S02 café and S03 guesthouse/Damir at 390×844 and 1000×720; geometry and interaction logs with actual HEAD SHA.

- [ ] **Step 1: Add failing geometry checks** for full-viewport stage, bottom text layer, safe areas, font-size/tap-target bounds and absence of generic page header/raw scene IDs; check neutral media behavior.
- [ ] **Step 2: Run Chromium RED**, then make minimal author-owned CSS/adapter corrections, preserving proofs and Runtime event contracts.
- [ ] **Step 3: Run focused static suites, `m4-build-presentation --check`, and actual Chromium UI tests.** Expected: PASS, fresh per-viewport artifacts from the changed HEAD.
- [ ] **Step 4: Run full `npm test`** (scenario matrix may take ~30 min) and `git diff --check`. Expected: exit 0; if time/host prevents it, report NOT_RUN rather than PASS.
- [ ] **Step 5: Manually compare paired screenshots** of the exact same original vs migrated beat. Document any difference, crop or pending art as an open item; neither automated tests nor approved media hashes alone imply visual acceptance.
- [ ] **Step 6: Commit only verified authored UI, tests and QA documentation** to PR #3; keep Draft until visual signoff, Studio provenance, PR #2 and release gates are independently resolved.

## Self-review notes

- Covers original presentation, UI-only navigation/preferences, mobile geometry, approved media, negative interaction cases and save isolation.
- Native Ludory runtime remains the owner of narrative actions/state. A separate framework PR is conditional on discovering a true missing public extension point, not a default refactor.
- Full 66-scene visual acceptance and non-admitted art/audio are outside this S01–S03 pilot and remain visibly OPEN.
