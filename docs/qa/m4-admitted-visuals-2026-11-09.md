# M4B — three approved S02–S03 raster assets (2026-11-09)

## Scope

The owner explicitly approved admission of **only** the following source PNG
files from the pinned `m-amirov/kiss-at-the-edge-of-the-world` revision
`1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c` into the separately
Studio-managed `game-studio/` project. The existing source inventory records
the source Git blob IDs and rights-manifest evidence; the imported bytes were
compared against that inventory before use.

| Source path | Exact Studio path | SHA-256 |
|---|---|---|
| `assets/backgrounds/s02-roadside-cafe.png` | `game-studio/assets/vis-s02-roadside-cafe.png` | `f6d2adc4a65d2b30e9eb86203e34a848cc79c69a206a9f81a5a6c9b823bb1c13` |
| `assets/backgrounds/s03-reykjavik-guesthouse-morning.png` | `game-studio/assets/vis-s03-guesthouse-morning.png` | `2ca12077112219ffbc9dfd916f504574ee624c2504a3a3c3fad90e741d3ed4bd` |
| `assets/cg/s03-editor-call-damir.png` | `game-studio/assets/vis-s03-damir.png` | `aea38cdcffafe5233e8e6d3d93ad5618e41ab94addae40c0a143325a9b80561a` |

These are unchanged source **PNG** bytes, not newly claimed WebP derivatives;
the legacy inventory `targetPath` fields describing the source's former WebP
names are not used as admission paths. Exactly three inventory entries now
have `accepted` status (60 other candidates and 60 blocked entries remain).

## Native visual mapping

- `s02-road-32` begins the roadside-café background; the same image remains
  across its authored continuation and S02 café decision branches.
- `s03-editorial-01` begins the Reykjavík guesthouse background; it continues
  through the editorial and career branches.
- `s03-coffee-01` begins the Damir CG (`replace-stage`); it continues through
  the coffee beat and its seating branches.
- S01 airport, car, S02 road, and later unapproved art remain neutral.

The authored manifest is `game-studio/visuals/presentation.json`; its generated
runtime projection is `game-studio/src/presentation.js`. The generated proof
`game-studio/narrative-assets.json` records the exact admitted file hashes.
Nothing in the legacy `game/` project or Studio-managed component files was
altered. Economy, virtual currency and premium choices remain disabled.

## Acceptance gates

The regression test `tests/m4-admitted-visuals.test.mjs` validates SHA-256,
the 1:1 proof and media map, absence of unapproved raster assets, and the
intended contiguous beat ranges. `tests/m4-browser-qa.mjs` now verifies that
each admitted image loads in Chromium and stays visible on the next beat,
with screenshots on the S02 and S03 cue entry points at both mobile 390×844
and desktop 1000×720 viewports.

**Browser visual acceptance remains open.** The cloud executor cannot launch
its system Chromium (`socket() failed: Operation not permitted (1)`), and its
Playwright-managed Chromium binary is absent. The new images have not yet
been inspected in rendered desktop/mobile screenshots; the previous CI PASS
applies to a revision **before** these assets. The browser gate requires a
new GitHub Actions run on the updated PR head, screenshots and a review of
crop, contrast, text legibility and panel geometry. The PR must stay Draft,
and no release, platform upload or `main` merge is authorized by admission.
