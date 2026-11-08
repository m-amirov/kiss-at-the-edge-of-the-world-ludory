# M4B Studio-managed rebuild evidence — 2026-11-08

## Decision and scope

The owner authorized a fresh Studio-managed project and a Draft PR, without modifying the legacy game or `main`. Created `game-studio/` next to the legacy `game/`, not in place of it, so all earlier authored game files and Studio diagnostics remain independently inspectable. No image, OST, CDN link, economy or platform SDK was admitted.

- Source Ludory native M4A: Draft PR #91 remote commit `9a570b17891de0570220da096378cf187a3a3577`, tree `d0fb1175acd662526b3b4a45188341d18a7737aa`.
- Local M4A Studio source tree verified equal to the remote tree; local HEAD differs because Git commit metadata differs.
- Studio command `create --project .../game-studio --id kiss-at-the-edge-of-the-world --title 'Поцелуй на краю света' --lang ru --profile narrative-game --template narrative-interactive --targets yandex-games,vk-games --json` returned `READY`, no conflicts.
- The same command with `--apply` returned `APPLIED`, template `narrative-interactive` `1.2.3`, profile `narrative-game` `1.2.0`.
- `src/story.js`, all `src/scenes/`, authored visual maps and generated `src/presentation.js` and `narrative-assets.json` were copied from the verified M4 pilot. Template-supplied demo SVG images were removed after confirming they were no longer referenced.

## Explicit gates

| Gate | Result | What it proves |
|---|---|---|
| Fresh Studio owner registration | **PASS** | Studio created the project with real host provenance, not edited ownership JSON |
| Studio component status | **IN_SYNC** | `components status --project .../game-studio --json`: no conflicts or writes |
| Studio preview builder | **STARTED** | `preview --project .../game-studio --json` on `127.0.0.1:4173` with source/build digest `9ddbdb91ec856334adf7abe331e17d96db5ffbf602efb881a406907646159dbe` |
| Native presentation contract | **PASS (static)** | Studio v1.2.3 `src/main.js` imports `defineNarrativePresentation` and uses optional `story.presentationData` |
| Author artifact matching | **PASS** | `tests/m4-fresh-studio.test.mjs` compares authored files with legacy game; exact SHA of story matches author proof |
| Manual browser screenshot 390×844 / 1000×720 | **BLOCKED_BROWSER** | System Chromium attempts fail `chrome/browser/process_singleton_posix.cc:297`, `socket() failed: Operation not permitted (1)`; cloud browser localhost failed `ERR_CONNECTION_REFUSED` |
| Visual artwork/admission | **BLOCKED_ASSET** | Old inventory: 63 candidate, 60 blocked, zero accepted; nine illustrated source cue placements remain neutral |
| All S01–S66 visual timeline and OS audio | **NOT_DONE** | Only S01–S03 mapped, OST hash/provenance is incomplete |
| Yandex/VK local exports + actual platform tests | **NOT_RUN** | No release or real-platform claims |

## No changes made

- Legacy `game/` and all its tracked files: unchanged during this rebuild.
- Existing Studio-owned files of `game/`: not copied into or manually merged with the new project's managed files.
- `graphData`, 606 technical scenes, 2633 dialogue beats, 164 choice nodes, 7 ending IDs: unchanged.
- `main` branch, deployed game versions, old repository and original authorship/provenance manifests: unchanged.

## Remaining acceptance

1. Review native S01–S03 rendered screenshots in a browser-capable executor on mobile and desktop (including three seat states, Back, Save→Restore, Reload, fallback and accessibility).
2. Resolve actual rights and SHA mismatches before any art admission. Music has eight absent rights hashes; CDN URLs and gameplay audio are deliberately deferred.
3. After pilot acceptance, expand source cue mapping for S04–S66 in chronological scene batches with visual reviews.
4. Keep PR Draft until full visual/asset/test gates. Do not merge or publish on the basis of this static preflight.
