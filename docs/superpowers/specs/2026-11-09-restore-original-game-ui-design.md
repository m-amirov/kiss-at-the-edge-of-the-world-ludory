# Restore the original visual-novel UI in game PR #3

Date: 2026-11-09. Status: design proposal for owner approval.

## Intent

PR #3 migrated the authored narrative to native Ludory Studio but presented it through the generic `narrative-interactive` web shell. The player's visual experience regressed. Restore the existing `kiss-at-the-edge-of-the-world` game's UI **1:1** at the pinned source revision `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c` while keeping Ludory as the narrative engine and platform integration layer.

## Approaches

1. **Chosen: authored Ludory presentation adapter matching the original UI.** Preserve the native graph, choices, state, saves, and platform contracts; implement an author-owned visual shell whose rendered structure and CSS reproduce the source UI. If Ludory has no supported renderer injection point, introduce a narrowly scoped, independently reviewed framework extension before consuming it in the game. No hand-editing generated Studio files.
2. Copy `literary-player.js` unchanged. Rejected: this would bring back the old engine, parallel save/choice execution, and ambiguous ownership.
3. Keep the generic Ludory shell and restyle colors. Rejected: it cannot meet layout and interaction parity.

## Visual and interaction parity contract

Reference: source `index.html`, `src/literary.css`, `src/literary-player.js`, `src/literary-stage.js`, `src/literary-visual-directions.js` and approved source media. Preserve:
- Full-viewport background/CG layer with authored focus/crop behavior and mobile portrait variants where verified.
- Large foreground character cutouts, scene-directed entrances/compositions, solo/pair/group staging, without portraits shrinking to thumbnails.
- Bottom overlaid, legible dialogue layer with translucent gradient; typography, spacing and contrast consistent with the original rather than a separate technical card.
- Original choice-button treatment and large touch targets, screen tap-to-advance (without double advance), Back, main menu, reading settings, save/restore and audio controls where supported.
- Original home/menu visual hierarchy rather than Ludory's exposed page header and `Story · Ludory` chrome.
- Responsive behavior at portrait 390×844, desktop 1000×720, narrow phones, and landscape fallback; respect safe areas and prevent scroll/crop clipping.
- No internal `sceneId` or raw `beatId` in visible player UI, accessibility names or headings. Diagnostics may expose IDs only as data attributes.

## Boundaries

- **No narrative rewrite:** preserve all 606 graph nodes, 2633 lines, 164 choices, 7 endings, route flags and exact author text/proof.
- **Economy OFF:** no IAP, premium choices, rewarded ads or virtual currency in the first game.
- **Provenance:** only the three previously admitted S02–S03 raster files may be used now. Other images, music and sprites require separate source-hash and rights admission. Do not mislabel unavailable art as visually accepted.
- Do not mutate legacy `game/`, fabricate Studio trust/upgrade history, edit managed `game-studio/src/main.js` or bundled renderer by hand, force-merge PR #2/#3 or publish a build.
- Native Studio 1.2.5 update remains gated by authentic ownership receipts or a separately approved official recovery path. The author-owned renderer work can be isolated while that gate is open.

## Implementation sequence after approval

1. Inventory exact source UI screens, controls and relevant CSS/assets; capture reference desktop/mobile screenshots from the source commit.
2. Add a focused presentation-parity test contract (test first). Verify the new UI against original menu, neutral S01, approved S02 café and approved S03 guesthouse/CG at both viewports.
3. Implement only an author-owned visual adapter over Ludory narrative view/actions. Add a minimal Ludory extension via separate PR only if the documented renderer API cannot support the adapter.
4. Run actual Chromium flows for Eric/Nick/Damir, choice/back, save/reload, interactive control hit targets, dialogue progress, portrait/CG crop, visual geometry, accessibility and console exceptions.
5. Review paired screenshots manually. Functional PASS alone is insufficient for visual acceptance. Proceed beyond S01–S03 only after pilot signoff.

## Acceptance

The original and migrated game are recognizable as the **same UI** at the same story beat and viewport. No new header/cards/technical labels are exposed. Visual differences are documented and approved, not silently accepted. Game state, choice results and saves remain Ludory-native. Targeted tests and actual browser screenshots pass; asset rights, Studio provenance, parent PR and release remain explicit independent gates.

PR #3 stays Draft until all required gates pass.
