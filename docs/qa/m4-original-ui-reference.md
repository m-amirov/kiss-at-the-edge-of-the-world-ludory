# M4 original player UI reference (before restoration)

## Source and baseline

- Immutable visual reference: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`.
- Source files: `index.html`, `src/literary.css`, `src/literary-player.js`, `src/literary-stage.js`, `src/literary-visual-directions.js`.
- Target: `game-studio/` on Draft PR #3; initial native component `narrative-interactive@1.2.4`, with the newer 1.2.5 upgrade blocked by local ownership evidence.
- Initial target implementation uses `game-studio/index.html` for its persistent generic header, `#status` and `#game`, while the native renderer inserts `.ludory-narrative`, `.ludory-narrative__stage`, `.ludory-narrative__panel`, `.ludory-narrative__actions` and `.ludory-narrative__toolbar`.

## Fidelity mapping

| Original DOM/style | Target native anchor | Intended behavior |
|---|---|---|
| `.literary-home`, `.literary-home-card` | Author-owned menu wrapper outside the renderer | Cinematic start/resume screen, not a technical page header |
| `.literary-reader` | `#game`, `.ludory-narrative` | Full viewport with a unified backdrop and dialogue layer |
| `.literary-picture`, `.literary-vignette` | `.ludory-narrative__stage` | Full-bleed background/CG with readable lower shading |
| `.scene-stage`, `.stage-character` | `.ludory-narrative__portrait` where legally admitted | Large solo/pair/group portraits; no admitted portraits yet |
| `.reader-sheet`, `.reader-content`, `.reader-footer` | `.ludory-narrative__panel` | Bottom-anchored transparent dialogue overlay, not a boxed card |
| `.choice-button`, `.reader-options` | `.ludory-narrative__actions button` | Warm visual controls and large touch targets |
| Original stage tap handler | Author-owned presentation adapter → current native Next action | Exactly one advancement on dialogue, none on choices |

The original source's later cinematic CSS overrides its early Georgia fallback: `Cinematic Cormorant` (bundled Cormorant Garamond) is used for display/scene headings; `Cinematic Manrope` (bundled Manrope) is used for prose, buttons and other UI. The reference also uses a viewport-filling stage, lower gradient dialog overlay, warm gold strokes and full-bleed CG. The target must retain native `data-action`, `data-scene-id` and `data-beat-id` for state/QA.

## Implemented parity shell (pending browser acceptance)

- The authored `src/ui/original-game.css` restores full-screen stage, bottom-gradient dialogue, warm pill actions, exact bundled Cormorant/Manrope typography and large mobile touch targets. It does not replace the native renderer's state or input actions.
- The authored `src/ui/original-game-ui.js` restores the original source menu hierarchy (kicker, display title, summary and actions), stage tap, keyboard progression and UI-only text size. The generated, author-owned `src/presentation.js` imports the adapter before the native launcher boots; it decorates the existing page without editing Studio-managed `index.html` or `src/entry.js`. `startNarrative()` remains the only narrative boot path, and `#restart` is the only path that clears a save after an explicit confirmation.
- The first main-menu WebP admission proved visually inadequate due to compression; it has been superseded by the owner's approved `assets/branding/kiss-at-the-edge-cover.png`, a different original key visual with much higher source detail. All unapproved S01 backgrounds, sprites and audio still use explicit neutral fallbacks. Exact overall visual parity is not yet a PASS.
- The source's longer episode-selection menu is not restored as an interactive selector: navigating there would require native engine APIs to restore arbitrary checkpoints, which are not available in the pinned component. A misleading selector must not be presented.

## Screenshot checkpoints (not yet accepted)

Desktop 1000×720 and mobile portrait 390×844: home, S01 airport neutral, seat choice, S02 roadside café, S03 guesthouse, and S03 Damir CG. Capture the same story beat in original and migrated builds and inspect composition, crop, contrast, text legibility, safe areas, hit targets and missing assets.

Three source PNGs are approved as scene media: `vis-s02-roadside-cafe.png`, `vis-s03-guesthouse-morning.png`, and `vis-s03-damir.png`. The original menu WebP is separately admitted as branding; it does not enter `narrative-assets.json`. All other original art, portraits and music remain unavailable until separately admitted. Exact original art coverage across S01–S66 cannot be claimed.

Initial original reference screenshots have **not** been captured here; local Chromium exits with `socket() failed: Operation not permitted`. The actual-game GitHub Actions job now requests explicit `mobile-390x844-menu.png` and `desktop-1000x720-menu.png` plus neutral S01, choices and admitted S02/S03 scenes. It checks fullscreen stage, bottom dialogue anchoring, touch targets, stage-tap/keyboard/choice safety and Save→Reload. These are executable gates, **not** evidence of passage until the changed PR HEAD's run and artifacts are inspected.
