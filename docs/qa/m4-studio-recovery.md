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

## Host-transfer revalidation — 2026-11-08

The Ludory M4A change has now been **squash-merged** via PR #91 into `main` at `28f5d6445ad06f82c3910474d79fbf465a650567`. The Studio-built `game-studio/` files retain their original `narrative-interactive@1.2.3` hashes; no managed component rewrite was needed or attempted.

Read-only check in the transferred workspace:

- `components status --project game-studio --json` → `BLOCKED`, `Studio host trust: no registered Studio ownership for this game`.
- `components trust --project game-studio --json` → `NEEDS_USER_ACTION`, no writes or conflicts; verified Studio creation receipt, component manifest and managed-path hashes still match.
- `components update --project game-studio --json` → `BLOCKED`, no writes.
- The proposed managed paths are precisely `index.html`, `src/entry.js`, `src/main.js` and `assets/ludory-narrative.js`; each SHA-256 equals the corresponding value in `ludory.components.json`.
- Proposed author paths are `src/story.js`, `narrative-assets.json` and the two template-demo SVG names. Both SVG files were already intentionally removed and are absent; all game artwork remains unadmitted.
- The state digest returned by the **current host's** read-only trust preview is `b9fb34c03df47d34623e310cb7d94fc760c6b801246d2cfe7b1ac7818f6abd80`. This is a host-specific request for an **explicit owner grant**, not permission to run `--apply` automatically.
- `node --test tests/m4-inventory.test.mjs tests/m4-source-map.test.mjs tests/m4-presentation.test.mjs tests/m4-fresh-studio.test.mjs`: **9 PASS, 0 FAIL**; `node tools/m4-build-presentation.mjs --check`: presentation hash `17a6cf4e39da3eec88a90c6a1f588fe523e7cc0d9a16399f84b11d908a96429f`, story hash `1f3201851be79cb48b4c9692ed4fe5858307a1c8597ad0150e60a4a9a89b21d9`, 9 deliberately blocked images.

Next legitimate step is an owner-authorized `components trust --accept-state-sha256 <digest-from-fresh-preview> --apply` on the actual new host, followed by fresh `components status` and Studio preview. No manual trust-registry writes, asset admission, screenshots, merge, or release are included in this revalidation. A future host transfer requires a **new** preview and confirmation; this digest is not a reusable authorization.
