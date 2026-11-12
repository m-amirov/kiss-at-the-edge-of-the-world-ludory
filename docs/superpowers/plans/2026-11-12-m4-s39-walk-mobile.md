# M4 S39 walk mobile background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admit a new source-bound S39 walk portrait background and use it only on mobile while preserving the original desktop bytes.

**Architecture:** Keep the native presentation manifest desktop-only and make the author-owned UI adapter resolve the explicit portrait source at `<=680px`, switching back on resize without reload. Validate the portrait through a separate mobile provenance manifest and include its bytes in the generated proof, without editing the native renderer or story graph.

**Tech Stack:** Node.js 22, Node test runner, Playwright Chromium, PNG byte-header checks, SHA-256, existing M4 presentation builder.

**Spec:** `docs/superpowers/specs/2026-11-12-m4-s39-walk-mobile-design.md`

## Global Constraints

- Preserve desktop `assets/vis-s39-alice-damir-cafe-walk.png` byte-identical.
- Use portrait source only at viewport width `<=680px`; desktop uses the original `src`.
- Keep narrative graph, dialogue, save/reload engine, fonts, S39 café CG, managed Studio files and economy unchanged.
- No merge, publication, game upload or PR state change.
- Keep `artStatus` separate from mechanical admission and do not fabricate independent art approval.

## Review Focus

- Missing/tampered portrait: mobile provenance validation fails closed — Task 1.
- Desktop fallback accidentally replaced: source mapping returns original desktop and browser asserts desktop URL — Task 2.
- Resize without reload leaves stale source: UI sync derives desktop identity from the current/remembered file — Task 2.
- Mobile safe-area/panel regression: real Chromium checks 320×700, 390×844 and 430×932 — Task 3.
- Desktop visual regression or changed original bytes: SHA/hash and 1440×900 capture remain original — Task 3.

### Task 1: Provenance and asset admission

**Files:**
- Create: `game-studio/assets/vis-s39-alice-damir-cafe-walk-portrait.png`
- Create: `docs/migration/m4-mobile-assets.json`
- Modify: `tools/m4-build-presentation.mjs`
- Create: `tests/m4-mobile-assets.test.mjs`

**Interfaces:** `validateMobileAssets({ projectRoot, presentation })` returns admitted mobile ids, proof and raster paths; the manifest records the generated PNG SHA-256, `1024x1536`, approved desktop reference hash and `pending-independent-review` art status.

- [ ] Add the failing provenance/mapping test and run it RED.
- [ ] Add fail-closed PNG/SHA/dimensions validation and include mobile paths/proof in the presentation builder.
- [ ] Regenerate `game-studio/src/presentation.js` and `game-studio/narrative-assets.json` through the existing builder.
- [ ] Run the focused provenance and builder checks GREEN.

### Task 2: Responsive source switch

**Files:**
- Modify: `game-studio/src/ui/original-game-ui.js`
- Modify: `tests/m4-visual-parity-regression.test.mjs`

**Interfaces:** `originalCgSource(mediaFile, viewportWidth)`, `originalCgMobileMode(mediaFile, viewportWidth)`, `originalCgDesktopMediaForSource(hint, sourceFile)` and `originalCgComposition(mediaFile)` preserve existing compositions and expose S39 walk portrait switching.

- [ ] Add RED assertions for S39 desktop/portrait mapping and stale-source recovery.
- [ ] Implement the explicit S39 mapping, resize resync and load handling in the author-owned adapter.
- [ ] Run focused UI/mapping tests GREEN.

### Task 3: Browser evidence and release-boundary report

**Files:**
- Modify: `tests/m4-browser-qa.mjs`
- Create: `docs/qa/m4-s39-walk-mobile-2026-11-12.md`
- Create: `artifacts/issue-5-before/*` and `artifacts/issue-5-after/*`

- [ ] Extend the actual Chromium QA to assert S39 walk source URLs at mobile and 1440×900 desktop, including resize without reload.
- [ ] Run `npm run qa:m4:browser` with an isolated evidence directory and inspect before/after screenshots plus the raw PNG.
- [ ] Record mechanical/runtime/visual observations separately; leave independent art signoff open if no separate reviewer receipt exists.
- [ ] Run `git diff --check`, focused/full Node tests and both presentation checks; report exact results and remaining gates.
