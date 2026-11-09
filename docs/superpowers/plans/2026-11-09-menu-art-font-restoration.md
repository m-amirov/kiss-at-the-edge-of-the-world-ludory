# Original menu art and typography restoration — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original game's bundled typefaces and replace the visibly compressed title artwork with the owner's approved, higher-detail source PNG in Draft PR #3.

**Architecture:** The authored `game-studio/src/ui/original-game.css` remains the only presentation override. Vendor binary fonts and title PNG byte-for-byte from pinned source commit `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, track provenance in QA/inventory, and leave Studio-managed code and narrative state unchanged.

**Tech Stack:** Native Ludory narrative renderer, authored CSS, Node test runner, GitHub Actions Chromium.

**Spec:** User's accepted proposal to use the higher-quality original `assets/branding/kiss-at-the-edge-cover.png`, restore Cormorant Garamond for display headings, Manrope for UI/body text.

## Global constraints

- Only title branding and original OFL fonts are admitted; no other blocked story assets, music, economy, or platform publish.
- Preserve original binary SHA, license files, original source commit; never re-encode the replacement PNG.
- Keep Draft PR #3 stacked on game PR #2; no merge and no edits to Studio-managed files.

## Review focus

- Portrait 390×844/320×700: heroine facial focal point remains visible and menu buttons stay inside the viewport.
- Desktop 1000×720: title and buttons remain legible with a full-bleed source image.
- Cyrillic glyphs render in bundled Cormorant/Manrope without network font fetches or fallback.
- CSS font load paths resolve correctly after packaging to the local game-studio root.
- Assets' local SHA-1 Git blob and SHA-256 checks match the source.

## Tasks

### Task 1: Exact binary provenance and art quality

- [x] Update `tests/m4-menu-cover.test.mjs` for original PNG path, magic bytes, source Git blob, SHA-256 and mobile focal point; prove RED.
- [x] Add exact PNG to `game-studio/assets/branding/`, switch CSS background, and update accepted record in `docs/migration/m4-assets-inventory.json`; prove GREEN.
- [x] Keep the old 46-KB WebP as a recorded, unused source asset for recovery.

### Task 2: Restore bundled fonts

- [x] Add failing test in `tests/m4-original-ui-parity.test.mjs` for source OFL fonts, exact hashes, CSS declarations and font roles; prove RED.
- [x] Add the two original TTFs and OFL license files under `game-studio/assets/fonts/`; install @font-face and apply source typography to titles, body, panels and buttons; prove GREEN.
- [x] Extend actual-browser gate to assert local font loaded and effective computed font families.

### Task 3: Evidence and PR

- [ ] Run focused tests, presentation check, and attempt full test suite.
- [ ] Run actual-game Chromium QA and visually inspect mobile/desktop title and scene screenshots; document evidence.
- [ ] Publish new head on Draft PR #3 with exact Git blob IDs and CI link; do not merge or release.
