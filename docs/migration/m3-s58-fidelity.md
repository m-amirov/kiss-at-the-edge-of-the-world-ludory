# M3 — S58 «День 12. Кухня на четверых»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, S58 (lines 637–754), before S26. Neither the source manuscript nor Ludory framework was modified.

## Authorial fidelity

All **9 prose blocks / 47 unique paragraphs** (counting mutually exclusive alternatives) are transferred verbatim. The SHA-256 for each block is computed over the exact in-game `dialogue` paragraphs, joined by two LF characters (`\n\n`); headings, navigation metadata and unchosen alternatives are not displayed. The tests pin these independent source hashes.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s58-intro` | 7 | `48159bcf6df8c8bc3b578c4d26e8dc10cdc7d5218eead1dfc7e64542b464de3a` |
| `s58-choice-eric` | 7 | `de7ce8a664277a65e023d22ee0fee445ece7df5550e8672f0acc3b1e165aa398` |
| `s58-choice-nick` | 7 | `f3dfc5585a519d4309b8b5f3eb1c9c780abd84c991202ad3d28634cde5ea805a` |
| `s58-choice-damir` | 8 | `4c30da5ca9789208258def18fcf96b8433cc496013318b8b8d310b5b07c8665b` |
| `s58-choice-alone` | 2 | `1db37c57751b11a8625af75a69377e0f11aab765c8644ad73f4c1f7e71fe7995` |
| `s58-common-a` | 2 | `c82cd6e0219c45023cea33a2ce967d91580ac4f4a9725419301a6fe79ae3f88c` |
| `s58-payoff-damir` | 1 | `5de1c77d2048b27e43e73e97ac4f564240b48fc8e5f83678c2d8a7b55591df95` |
| `s58-payoff-other` | 1 | `c3f48cb43ee5f1377675a2a4f4005b6098eb3e6fbf8c575b963df71c0a0b3f6a` |
| `s58-common-b` | 12 | `64179b45185cac1a1429397c3243dc2c85d3f988c87695253db2e57dbbeadf8f` |

## Choices and boundaries

- Every S25 outcome now enters mandatory `s58-intro`; old `s25-after-m3-end` is removed. S58 occurs **before** the eventual S26 romance route lock.
- S58-C1 is an independent **free** four-way shopping choice: go with Eric for bread, Nick for greens, Damir for potatoes, or choose groceries alone. Each sets exactly one `s58-shop-eric|nick|damir|alone` provenance flag. It does not set relationship scores, `routeLock`, `routeIntent` or a premium entitlement.
- All four shopping branches converge at `s58-common-a`. A guarded, effect-free technical Continue shows the potato callback **only** for `s58-shop-damir`; all other branches see `s58-payoff-other`. The shared kitchen/dinner passage `s58-common-b` follows all outcomes, ending at temporary non-release `s58-after-m3-end` **pending S26**.
- S58 does not grant permission to publish Nick's recorded footage or the smokehouse owner's quotes. Previous boundaries and `private-text-pending` persist. No crystals, paid choices, rewarded ads or IAP are added to the first game; the Ludory economy opt-in remains disabled.

## Editorial and release gates

- The new technical ending is temporary; unpublished saves referencing `s25-after-m3-end` may need an explicit Restart. No automatic save rewrite or unreviewed inference about missing scenes.
- Studio component schema/trust, pair of Yandex/VK ZIP receipts for the **current** graph, EN localization, mobile UI, browser/device Save/Reload/Back, artwork and media rights, GitHub CI, platform moderation and publication are still **BLOCKED or NOT_RUN**. Local N1 tests alone cannot satisfy release gates.

## Verification

- Static TDD RED recorded before implementation: two focused tests failed for missing S58 intro and the obsolete S25 technical ending; both passed after implementation (`2/2`, exit 0).
- The five-test S58 suite checks 9 pinned text blocks; mandatory S25 → S58 connections; **16** real N1 path combinations (4 earlier evenings × 4 grocery choices), invalid options, Back and JSON restore; forged provenance rejection; disabled economy and S26 lock. Focused `node --test tests/m3-s58.test.mjs`: **5/5 PASS, exit 0, 171.89 s** (real route matrix 103.39 s; forged-state test 68.34 s). An initial harness-only `ReferenceError` from an absent test-fixture constant was corrected, with the full five-test rerun producing the observed PASS.
- Independent read-only reviewer compared the production scene directly with pinned original text: **9/9 exact blocks, 47/47 paragraphs**, independently confirmed SHA-256, graph routing, free choices, lack of route lock/monetization and JSON/Back test coverage. Reviewer found one Important stale *S24 test* reference to the removed S25 ending and one Minor stale *S24 documentation* statement; both were corrected. The reviewer reproduced the former single-test failure; after the fix, `node --test --test-name-pattern='S24 never enables economy' tests/m3-s24.test.mjs` yielded **1/1 PASS, exit 0**. No known unresolved Important or Critical issues remain from that review.
- `node --check` for story, S58 scene module and S58 test: **PASS**; `git diff --check`: **PASS** (before final staging). The `storySha256` manifest digest was independently checked against `sha256sum game/src/story.js`.
- `game/narrative-assets.json` pins SHA-256 for `game/src/story.js`: `f91c249f2d58366b63db6a02c215b4bbe4e5bb6cdf3bd7366a01a44ad4220e2d`.
- Full **`npm test` 140/140 PASS, exit 0, 520.02 s**, including all prior S01–S25 tests and the five new S58 tests (real 16-way S58 matrix 109.69 s; forged-state rejection 70.64 s). This combined result includes the corrected S24 historical-boundary test. No browser/device or platform release result is implied.
- Remote Draft PR/tree and GitHub CI evidence: **PENDING** until explicitly verified.
