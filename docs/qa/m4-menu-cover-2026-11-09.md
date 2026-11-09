# M4 menu cover admission — 2026-11-09

## Authorized scope

The owner explicitly approved transferring the **single original title-menu WebP**
directly via GitHub after the local `game-dev` admission CLI proved unavailable.
The exception does not extend to game-stage portraits, S01 backgrounds, music,
platform publication, or other assets.

- Source repo: `m-amirov/kiss-at-the-edge-of-the-world`
- Source pinned commit: `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`
- Source path: `assets/branding/menu-hero.webp`
- Source Git blob: `345b55a861af17433b4a20da9cc374bdeb5c3192`
- Destination: `game-studio/assets/branding/menu-hero.webp`
- SHA-256: `5667bec6163ef908f42ea4f0fbd291307f4c9cf91eae04019c6ba82d7c97f07b`
- Source rights record: `assets/provenance/rights-manifest.json`
- Source license: `generated for this project`; generated with Codex imagegen on 2026-10-01.
- Original format: 1920×900 WebP, no re-encoding.

## Integration

The author-owned `game-studio/src/ui/original-game.css` references this local
asset from the title-menu `background-image`, under the original source-style
desktop horizontal gradient and mobile vertical gradient. The admission record
is the `menu-hero-alice` entry in `docs/migration/m4-assets-inventory.json`.
The image is **branding only**: it does not become an authorized story beat or
change `narrative-assets.json`, the scene graph, saves, economy or any
Studio-managed file.

## Proof and remaining gates

`tests/m4-menu-cover.test.mjs` checks the asset's binary SHA-256, Git blob
SHA-1, rights evidence, accepted destination, and CSS reference. The actual-game
Chromium QA loads and decodes this image on both mobile and desktop before
its menu screenshots. Browser screenshot review is still required to accept
the source-style crop, contrast and touch-target layout. Draft PR #3 must
remain unmerged and unreleased pending its other gates.
