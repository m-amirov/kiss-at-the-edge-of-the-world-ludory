# M3 — Eric S50 «Город без карты» (day 15)

## Source and textual fidelity

- Immutable original: `kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-08.md` lines 55–95; original whole-file SHA-256 `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`.
- Native `game/src/scenes/s50.js` contains the exact seven original prose blocks: **3 paragraphs active**, **1 paused**, S50-C1-A/B (1 each), common (1), S50-C2-A/B (1 each): **9 total**. Independent comparison of the original manuscript against game text and the hashes below found 7/7 exact matches.

| Authored scene | Paragraphs | SHA-256 of displayed paragraphs joined by two LF |
| --- | ---: | --- |
| `s50-active` | 3 | `10768b75cc2dfcdab8c9329abc1d441346bfa06b867cb108a593ac8ebca71385` |
| `s50-paused` | 1 | `d41ae1519b40d6312c5e2ae475cf80370e128b4cfebe85c0be5f3d80f371d043` |
| `s50-c1-a` | 1 | `6a9c4dd506b1150377cb082bd7735401e6ba36bae89b0599bbc5310051484908` |
| `s50-c1-b` | 1 | `5e6c8c93c8709c8712d988479f27b167557c33f08d8a4abfef93025dd87bcbdc` |
| `s50-common` | 1 | `abd4f8db8150db63293700518604777b67377bd932789c9f967618a357dd52b2` |
| `s50-c2-a` | 1 | `b56b7ba3ba2f613182b2c175756ef6d011b0a8dcdcd50dc1fd9675b9efaba73c` |
| `s50-c2-b` | 1 | `ea2870f3e096b668bb7b2b30d59ba809102bb52d8f805d5a6806e52cb6c3ea9e` |

## Canonical route and user-facing semantics

- S32-C1's real N1 `s32-status-active` leads only to S50 active; `s32-status-paused` only to paused; `s32-status-closed` goes directly to independent S35. No new global route status setter or forced romance unlock. Route stays `eric` even if paused; ordinary group membership does not vanish.
- Two exact-label, completely free two-way choices S50-C1 and S50-C2 are implemented with no currency, relationship points, purchase, media consent, publishing permission or external message effect. The mention of a group chat is manuscript narration only.
- The two S50-C2 callbacks end at `s50-after-m3-end`, an **unpublished technical Draft stop**, before the not-yet-migrated day-17 S36. The removed prior `s32-after-m3-end` marker may mean old local Draft saves at that location require manual Restart; no migration, deletion or compatibility promise.
- First-game Economy OFF. No source/original repo changes, server, outside requests, uploads, paid choices, actual publication or merge to `main`.

## Tests and release gates

- TDD **RED** before implementation: source fidelity failed on absent `s50-active` (0 vs 3 paragraphs), routing failed for S32's old marker. After graph/text implementation, **2/2 static source+graph tests PASS**, exit 0.
- Native `node --test tests/m3-s32.test.mjs tests/m3-s50.test.mjs`: **7/7 PASS**, 0 fail/skip, exit 0, 243611.532951 ms. The 24 authentic 2×2×2×3 Eric S28/S49/S32 paths cover active/paused S50 entrances, S50 C1×C2 (all four combinations), true N1 Back, JSON restore, cross-route/status and forged actionLog no-write checks.
- Full `npm test`: **193/193 PASS**, 0 failures/skips/cancellations, exit 0, 932067.115061 ms (~15m32s). All historical episode/route tests and newly added S50 tests passed. This is a local Node suite, **not** a UI/Studio/CI/release gate.
- Independent read-only original-to-graph review: 7/7 prose blocks, 4/4 choice labels, all incoming edges and graph validation of 456 scenes checked; **0 Critical / 0 Important / 0 Minor**, no reviewer code changes. Reviewer independently ran 2/2 static checks PASS; whole suite was not run by reviewer.
- `node --check` on changed game/test JS, `git diff --check`, and locally computed manifest story SHA-256 `ef04512d21fc551439de5ef1564da6b20349c681ac0504ae969c764630f82b91`: **PASS**.
- Studio export, paired platform ZIP/receipts for current graph, actual browser/mobile, Save/Reload devices, media-rights review, GitHub CI, Yandex/VK release moderation: **NOT_RUN / BLOCKED**, not release-ready.
