# M3 — S40 «День 18. Абзац, который не надо согласовывать» (independent/closed)

## Pinned authorial text

- Read-only manuscript: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md` S40 lines 315–358; full EP09 SHA-256 `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Eight original blocks / **nine authorial paragraphs**, hashed independently from the source (paragraphs joined by two LF):

| Native node | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s40-intro` | 2 | `30d8eed2c49d5c24ddc526e7eb696ded265b503d434324f05b7354f833b5de60` |
| `s40-c1-a` | 1 | `63602686bf018a63045cc9d25c3684ee1bb021417dbd822675ba7452f95e1dc6` |
| `s40-c1-b` | 1 | `158091f8be6aacefedbd67fb1382f83186bce53716a033ae56c691413a11a4e9` |
| `s40-common` | 1 | `1295f20b900e8a6bc24f74063dae092c7b880845b620440e4837109d710ff7c1` |
| `s40-c2-a` | 1 | `f88855f8d44d1a3a05964b3948bd59617fb1247dc5488265c650f2a808759042` |
| `s40-c2-b` | 1 | `b8ca61cb1c8afb75da3bdb22f91be66ff7a43240a133166a87f78f242315a279` |
| `s40-s63-a` | 1 | `7791a5a5ffe823af7effb098f9554063a933bc4d198e1c7cfb20152e53466553` |
| `s40-s63-b` | 1 | `cef44c6675e9da7b997ac940bbddf8c43dd6123bbdf24212ac4169846805bafc` |

## Native routing and editorial decisions

- **Entrance:** S36 sends independent Alice and Eric/Nick/Damir previously closed at S32/33/34 directly to S40; later breakups at S37/38/39-C1-B enter S40 after their authored common text, skipping the romantic C2. All routes retain their S26 lock, even after breakup; none silently changes to `alice`.
- S40-C1 preserves the two authorial labels and alternative paragraphs; it creates no fabricated editor approval. S40-C2 preserves the two free labels, writing only one of `s40-evening-music|s40-evening-friend` for the future S64 callback, not a real ticket purchase or friend message.
- The original S40 appends callback prose for earlier `S63-C2=A/B` choices. Alice and romances already closed before S63 have exactly one real flag; later C1-breakups at S37/38/39 **never visited S63**. N1 `not(any(flag))` admits a technical no-prose fallback in that case, avoiding a fabricated concert memory. **Follow-up S64 migration (2026-11-07):** all three paths now enter the authored `s64-intro`, replacing unpublished Draft `s40-after-m3-end` with a real day-19 continuation.
- Removed unpublished technical IDs `s36-after-m3-end`, `s37-after-closed-end`, `s38-after-closed-end`, `s39-after-closed-end`. Previous Draft snapshots on them or with prior actionLog may fail replay; an explicit Restart may be necessary. There is no automatic save migration/deletion and Back history is runtime-local.
- Source mentions editorial notes, tickets, photo and a friend message only in prose: no actual network request, publication approval, upload, real purchase or permission. Economy & Monetization is **OFF**; EN still falls back to RU.

## Verification and release gates

- S40 static tests observed **RED 0/3** before implementation, then **GREEN 3/3**; five-file S36–S40 regression **14/14 PASS**, exit 0, with independently hashed exact source text and routing guards.
- Actual N1 focused `node --test --test-name-pattern='real N1 Alice: all|real N1 Eric day-18|real N1 S38 preserves|real N1 S39:' tests/m3-s31-s62.test.mjs tests/m3-s32.test.mjs tests/m3-s33.test.mjs tests/m3-s30-s55.test.mjs`: **4/4 PASS**, 0 fail/skipped, exit 0, 201652.930022 ms. Authentic Alice and early/late closed Eric/Nick/Damir traversals now cover both S40 C2 outcomes, proper S63 callback or no-callback fallback, Back, JSON and forgery/no-write paths.
- Independent read-only reviewer: **0 Critical / 1 Important test gap / 0 Minor**; the gap was missing terminal coverage on several closed routes, S40-C2-A outcome and S40 forged snapshots. Added permanent native regression assertions covering those cases, then reran the four focused paths successfully. This is a documented fix and fresh test evidence, **not a separate reviewer re-approval**.
- The first full run exposed an obsolete S35/S63 static assertion that expected S40 to be absent. Reproduced that failure in `tests/m3-s35-s63.test.mjs` (1/2 PASS), updated its expected continuation to S40, and observed the focused file **2/2 PASS**, exit 0. The old assertion was a test expectation, not a production route error.
- Full `npm test` rerun after the S35/S63 regression fix: **212/212 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo, exit 0, `duration_ms=1859059.635242`. This is local test evidence, not GitHub CI or release approval.
- Manifest story SHA-256: `f2adb74f6b54975d5b3227dd4306d1d5e3456597d0aaf196068993c492bdc7fb` (reverify with final code).
- Studio schema/trust compatibility **BLOCKED**; current Yandex/VK exports, browser/mobile Save/Reload, asset rights, EN localization, GitHub CI and moderation **NOT_RUN**. PR #2 remains open Draft; no merge or release.

S40's original 212/212 test and story SHA evidence above refers to the completed **S40-only** Git tree. For S64's current tree and new independent test evidence, see [`m3-s64-fidelity.md`](m3-s64-fidelity.md). Earlier unpublished `s40-after-m3-end` snapshots may require explicit Restart; no automatic save migration was implemented.
