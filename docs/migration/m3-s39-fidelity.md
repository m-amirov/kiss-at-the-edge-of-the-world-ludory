# M3 — S39 «День 18. Не повторять старую пару» (Damir route)

## Pinned authorial source

- Read-only manuscript: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md`, S39. Full EP09 SHA-256 `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Nine original blocks / **13 Russian paragraphs**, separately hashed from the pinned source, joining consecutive paragraphs with two LF:

| Native node | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s39-paused` | 1 | `393b5327a99b3a35dc7f4dc8c6708725e2350d8bbb4938be571956775ba6e5b7` |
| `s39-active` | 3 | `ca9d8b85c19b0b9ad566f1d1cc6c0c0e35793598a61fdb4e00d8669f2e8d7a66` |
| `s39-c1-a` | 2 | `80fe257c88c2e3beab7d8978e842ad7f47c114698d802216e8eaa09f8a5ee0a6` |
| `s39-c1-b` | 2 | `992886039ebeb38e33875a8605925658933f5d251a28c065c57abfbe85e9445a` |
| `s39-common` | 1 | `486c9ad312d83f7805fc7aaf9387b65724a976e98d69175aa61f91ae512f9b63` |
| `s39-c2-a` | 1 | `42569e7d614759391e75bb50b8b4f930a979ce2ea9ea59e55146eb69fb5080ea` |
| `s39-c2-b` | 1 | `72808908f8ea56633d794729d204c3d31b7d3ea42c1ac2e8755384f67d425a9a` |
| `s39-s56-a` | 1 | `9e6e2d24f6ecea2f9a3826d24417311c084153580ba46ade20771affd6eb5a08` |
| `s39-s56-b` | 1 | `1d68d983353795af02d4b51c0a13cd326cdca80e129bdb112e06821e3ee9197d` |

## Native Ludory graph and editorial boundary

- S36 common day-17 scene remains shared. Technical S36 `Продолжить` routes only Damir `s34-status-active|paused` into S39; `s34-status-closed` now enters independent [S40](m3-s40-fidelity.md) while preserving `routeLock='damir'`. Eric, Nick and independent Alice remain guarded.
- S39-C1 preserves both exact authorial labels and prose. A continues romance (`s39-status-continues`), B closes it (`s39-status-closed`). Both preserve the common authored bread-for-group paragraph.
- The pinned manuscript places S39-C2 and both S56-C2 callback texts **after** the common paragraph even when C1-B ends romance. To respect the explicit breakup, S39-C1-B bypasses later romantic invitations/callbacks and now enters S40; old `s39-after-closed-end` is removed. This is a deliberate documented branch-order editorial ruling, not a claim that the manuscript resolves the tension.
- The continuing path uses free S39-C2 (`s39-memory-ordinary-day` or `s39-memory-morning-walk`), then the original matching S56-C2 payoff (existing mutually exclusive `s56-next-dish|s56-next-chorus` flags). The callback is shown **after** S39-C2, not earlier. Both callbacks now enter [S57](m3-s57-fidelity.md), where the existing S39 memory flag selects exactly one final paragraph. The former `s39-after-open-end` Draft stop is removed; S57 now flows to shared [S60](m3-s60-fidelity.md).
- First-game Economy & Monetization OFF. Music cards, food, calls and future meetings are prose: no actual network call/message, photo upload, purchases, permissions, clinic/relationship commitment or server. EN still uses RU fallback, not a validated translation.
- Older unpublished Draft snapshots after S56-C2, S36 and previous technical stops may fail N1 actionLog replay after guard changes; no silent deletion/migration. Explicit Restart may be required in Draft testing. Back history is runtime-local.

## Verification and outstanding release gates

- Source/static TDD **RED** for missing S39 prose and S36 dispatch; subsequently `node --test tests/m3-s39.test.mjs`: **3/3 PASS**, exit 0. Source SHA-256, exact free labels, guarded status, authored order, closure boundary, and Economy disabled verified.
- Real N1 S39 test: two S34 statuses × two S56-C2 callbacks × two S39-C1 outcomes, two C2 memory choices, Back, JSON, route/status/callback/premium zero-write, forged flags/actionLog. Focused `node --test --test-name-pattern='real N1 S39' tests/m3-s30-s55.test.mjs`: **1/1 PASS**, exit 0, 97852.586772 ms. Entire Damir suite `node --test tests/m3-s30-s55.test.mjs`: **7/7 PASS**, no failures/skips, exit 0, 435148.143828 ms.
- Independent read-only review: **0 Critical**, **1 Important test gap** (no direct negative Damir-S39 entry from authentic Eric/Nick/Alice or Damir-closed S36 checkpoints), and **1 Minor** outdated historical wording. Added zero-write guard assertions to those existing real N1 paths and clarified S37 history. All extra assertions passed in the full suite; no separate reviewer re-approval is inferred.
- Full `npm test` with all cross-route regression coverage: **209/209 PASS**, no failures/skips, exit 0, duration 1792183.512111 ms (29m 52s).
- Manifest story SHA-256: `6188763a8a0eb30e88f0f74b8445f854195282608b74f92fa326447c4d4c366c`; compare with actual `game/src/story.js` before publication.
- Studio component-state schema/trust compatibility remains **BLOCKED**. Current Yandex/VK ZIP + receipts, browser/mobile Save/Reload, EN localization, asset rights, GitHub CI, platform moderation **NOT_RUN**. No release-ready claim.
- PR #2 must stay **open Draft** with base `main` unchanged. No merge, game publication, release or storage reset.
