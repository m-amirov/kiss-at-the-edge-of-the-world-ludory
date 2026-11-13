# M4 title cover and source typography admission — 2026-11-09

## Authorized scope

The owner first approved a direct transfer of the original title-menu WebP
after the local `game-dev` admission CLI proved unavailable. Subsequent screenshot
review exposed severe source WebP compression (46 KB at 1920×900), so the owner
approved replacing the menu artwork with the **higher-quality original key visual
PNG** and restoring the original bundled Cormorant/Manrope typefaces. The PNG
depicts the same heroine in a different, coastal composition; this is an explicit
artwork replacement, not lossless recovery of the low-quality WebP picture.
Approval does not extend to game-stage portraits, S01 backgrounds, music,
platform publication, or other assets.

- Source repo: `m-amirov/kiss-at-the-edge-of-the-world`
- Source pinned commit: `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`
- Current source path: `assets/branding/kiss-at-the-edge-cover.png`
- Current source Git blob: `a0da5d576eeb97156897876e3088d56b6c8686fd`
- Current destination: `game-studio/assets/branding/kiss-at-the-edge-cover.png`
- Current SHA-256: `8f38b9516533fa0cdc760cd44e7dfd21f05d87e7a3589f5229b90a9d5b9fa6a5`
- Previous WebP retained as unused `game-studio/assets/branding/menu-hero.webp`
  with Git blob `345b55a861af17433b4a20da9cc374bdeb5c3192` and SHA-256
  `5667bec6163ef908f42ea4f0fbd291307f4c9cf91eae04019c6ba82d7c97f07b`.
- Source rights record: `assets/provenance/rights-manifest.json`
- Source license: `generated for this project`; generated with Codex imagegen on 2026-10-01.
- Current format: original 1920×900 PNG, byte-for-byte with source and no re-encoding.

Bundled fonts are the source TTF variable faces, with corresponding original SIL
Open Font License 1.1 texts in `game-studio/assets/fonts/`:

| Font | Source Git blob | SHA-256 |
| --- | --- | --- |
| `CormorantGaramond[wght].ttf` | `d992a83ce525c330fad3a19087746bcb2dc038ee` | `b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0` |
| `Manrope[wght].ttf` | `75274da58537d6123b14f2cd0c355ad4681fc2b3` | `3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6` |

## Integration

The author-owned `game-studio/src/ui/original-game.css` references the local PNG
from the title-menu `background-image`, under the original source-style
desktop horizontal gradient and mobile vertical gradient. The active admission
record is `kiss-at-the-edge-cover` in `docs/migration/m4-assets-inventory.json`.
The follow-up mobile screenshot review found that the source's `62% center`
crop excluded Alice completely at 390×844. The mobile-only position is now
`28% center` to keep the PNG heroine's face in the frame at 390×844 and 320×700; desktop
composition remains unchanged. This is a deliberate responsive framing fix.
The image is **branding only**: it does not become an authorized story beat or
change `narrative-assets.json`, the scene graph, saves, economy or any
Studio-managed file.

## Proof and remaining gates

`tests/m4-menu-cover.test.mjs` checks PNG binary signature, source SHA-256,
Git blob SHA-1, rights evidence, admitted destination, and CSS reference.
`tests/m4-original-ui-parity.test.mjs` validates original font files and
license texts; the Chromium QA must additionally verify actual font loading,
menu rendering and readable text before considering this gate accepted.
Draft PR #3 remains unmerged and unreleased pending its other gates.
