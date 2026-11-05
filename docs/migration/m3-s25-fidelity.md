# M3 — S25 «День 12. Разговор до решения»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, S25 until S58. Source and Ludory framework remain unchanged.

## Authorial fidelity

**16 source prose blocks / 56 paragraphs** (counting all mutually exclusive alternatives). Hash each displayed `dialogue` block's paragraphs joined with `\n\n`, excluding headings, access metadata, and technical transition notes. No player sees all 56 in one route.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s25-intro` | 9 | `92ca7fad83c910fda82555f8ea7fb456aba7a201fd778ecad68b8eb301e889b4` |
| `s25-evening-eric` | 3 | `524afbc03ab2945df4ca7fb621d9b34bbac7b8a75b8bb416355cbabaf20db8ad` |
| `s25-evening-nick` | 5 | `e017c747948f038d50ce866d0247dc2a55170b3d9cdc8a8a54dfea852f14f2cf` |
| `s25-evening-damir` | 4 | `abd5d7ee0182e0d50bb125035a14aa4879b6a6487d2d6edf87c1a74d77ea786c` |
| `s25-evening-alice` | 3 | `96910227390b2d17a951769118924432e5ef0af394aabea9504a4aff09aad1e8` |
| `s25-contact-kiss` | 3 | `eacf264bcfc59166278ab2c5c9049e207c9101b1d7d9ce4796d43478288cac31` |
| `s25-contact-tea` | 5 | `2cf7955a241deb71b4a6ebd2330414a879abaeed839bc06409e647af7e95c303` |
| `s25-contact-leave` | 3 | `613d741b04a186314cf58c98aaf56cea2a8a051e0478d5f3d0d4c93f063bc74c` |
| `s25-common-a` | 6 | `6b92ce400ec7a639a8ad80960784957c51a5bc60d3706e25f17d4a650655248b` |
| `s25-choice-scheduled` | 3 | `26b9bb890ccb0c76cc34260b8a2260fa713bc8eed8bfe263799e8868f5c1b98c` |
| `s25-choice-wait` | 3 | `e683669080593ae95ede2999ea581ee42c4e4e42f5d2cfdf2b597af777e861d1` |
| `s25-common-b` | 5 | `5c29c7219a5a5eb6123c864f12cb61d5b7ec76ea62e4894ec2d0362e35626799` |
| `s25-eric-page` | 1 | `b369283a028bc06ea7eaf407ab54014e4b9db5b2dd566173d0ae39485c9a4185` |
| `s25-eric-readers` | 1 | `a6a627d3fe6d0cb254fc6f329871de44a8aa621835f09abcab18a0ee8732f720` |
| `s25-followup-shopping` | 1 | `37db8ece42a812c959c31be1055e789689ee9f70a9474e7ea27dcaebdd4695cd` |
| `s25-followup-waterfront` | 1 | `130c83718eea8dbd377b9f2c38cba23b4739de936541658c8a0a24c12eb57a3c` |

## Choices and boundaries

- All S24 outcomes enter mandatory S25. One guarded S17 evening callback is displayed for Eric, Nick, Damir or Alice's solo evening; no new relationship score is assigned.
- Only Damir's S17 evening sees one delayed S20-C1 dinner callback: `damir-dinner-new-kiss|tea-without-touch|leave`. All other evenings have an effect-free guarded skip. The original consent to one past kiss or shared dinner does not authorize a future relationship.
- Free S25-C1 sets exactly one of `damir-choice-scheduled-talk|wait-with-boundary`: a scheduled conversation after the interview or time without promising to wait. The clinic offered a **job interview, not employment**. Damir's notice to Alice before deciding is mandatory shared prose.
- The independent S23-C1 choice of Eric's program yields exactly one guarded callback `eric-open-read-page|trial-readers`. Only the Damir route sees one delayed S20-C2 `damir-followup-shopping|waterfront`; other routes take an effect-free skip. All routes reach the technical non-release `s25-after-m3-end` pending S58.
- The smokehouse owner allows an **audio recording for transcription** and requests approval of her quotes before publication. This is not permission to publish quotes/recording or to distribute Nick's footage. The earlier `private-text-pending` and S24 teaser limits remain intact. Economy OFF: no crystals, premium options, rewarded ads or IAP.

## Editorial and release gates

- The S20-C2 callbacks following the return from the smokehouse refer to an event **before the guesthouse conversation**. Original order is retained verbatim. This and earlier chronology ambiguities require editorial resolution before a release; no extra travel/time was invented.
- Unpublished Draft saves at removed `s24-after-m3-end` may need explicit Restart. No automatic save rewrite.
- Current Studio component schema/trust, Yandex/VK ZIP receipts, EN translation, portrait UI, real browser/device Save/Reload/Back, artwork/media rights, GitHub CI, platform moderation and publication are **BLOCKED or NOT_RUN**. Local N1 coverage cannot be claimed as platform release verification.

## Verification

- TDD RED: missing `s25-intro` (0 vs 9 paragraphs), obsolete `s24-after-m3-end`. Static source and transition tests turned **2/2 GREEN** after implementation.
- Real N1 route combinations (test run prior to repairing its validation-harness expectation): **36/36 routes passed** in 274.80 s (3 non-Damir evenings × 2 S23-C1 × 2 S25-C1; 3 Damir S20-C1 × 2 S20-C2 × 2 S23-C1 × 2 S25-C1), including effect-free negative guards, Back and new-runtime JSON. A separate forged-state test initially failed because the harness expected an ordinary return rather than N1's documented thrown validation error. Corrected to `assert.throws`, then **targeted forgery test 1/1 PASS, exit 0, 32.61 s**. The full five-test suite is checked again within `npm test` before any completion claim.
- Independent read-only reviewer compared all 16 / 56 source paragraphs against pinned Git source *directly* and reviewed graph/provenance and consent constraints: **0 Critical / 0 Important / 0 Minor** findings. Reviewer personally observed three focused static tests **3/3 PASS** but did not execute runtime or full-suite tests; those remain recorded separately.
- `node --check` on story, S25 scene module and focused test: PASS; manifest digest for `game/src/story.js` matches `game/narrative-assets.json` (`52a17168f9fce0a5bfbfcc4bafbd0e69659eb2d72f13eba1d0f914b8bd3de923`); `git diff --check`: PASS. Full-suite and remote Git evidence will be added only after verification.
- Full **`npm test` 135/135 PASS, exit 0, 514.25 s**, including every earlier S01–S24 regression and all five new S25 tests. In this clean combined run the real 36-route N1 matrix passed in 280.65 s, forged state/actionLog rejection in 33.11 s, and the three source/graph/consent assertions also passed. No separate device/platform claim is implied.
- Remote Draft PR #2: all **12/12 uploaded Git blobs** matched local Git blob SHA-1. GitHub constructed tree `ec913afef4ce39e9c9111fe176e4cd083272637d` equals local fully tested code commit `2f8c2cd706b820a0ffc8aad673b8cb41012f9108^{tree}`. Independent `git fetch origin feat/m2-canonical-s01` confirmed GitHub code commit `2b8e8324b4dfede740ec505b05ede5ae574f7fe4` and exact same tree. Non-force **expected-head CAS** from earlier S24 Draft `e7b135fe0f51c07149336d7d83d929113091b569`. PR verified **OPEN/Draft**, unchanged main base `57296cdc0132e007342ed04644025a40b2f5f16b`. Commit status API returned no statuses: GitHub CI **NOT_RUN**, never PASS. No merge or release.
