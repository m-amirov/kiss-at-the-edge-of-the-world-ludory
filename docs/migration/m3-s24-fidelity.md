# M3 — S24 «День 12. Причал без кадра»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, S24 to the S25 heading. The original game and Ludory framework remain untouched.

## Exact authorial fidelity

**14 authored blocks / 55 unique paragraphs** (including exclusive alternatives) were transcribed from the pinned original into `game/src/scenes/s24.js`. The independent hashes below are computed from original paragraphs joined by two newlines (`\\n\\n`), excluding access headings, meta-notes and technical transitions. In the actual N1 dialogue graph, each rendered block must produce the same SHA-256. This is not a claim that all 55 paragraphs are read in one run.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s24-intro` | 6 | `2aca4ac3160c9695e30d4ef68dce3013eba389eff7c9d1b237f96d32a18ff427` |
| `s24-evening-eric` | 4 | `a2a9ac34965bcdb0f06745b91f400516827c1481a6eb21bea1c8c29774114bef` |
| `s24-evening-nick` | 3 | `58e1bbaf9c1ee9e8b9557a9f909d082909c5c3cc7dc62d3075b13ef754848d6e` |
| `s24-evening-damir` | 3 | `4b9a90eb5e82e807f1b2d8d5f9b2bbd111d27bd1fb6f785d1536bf3074ea2b69` |
| `s24-evening-alice` | 4 | `67ceca7b96e552b5db17aa73f6a64646edfbc97e88ebfcdbf53c4dfc1bf50f9d` |
| `s24-contact-kiss` | 4 | `8617df3ff8c4ac06ca8a3397d51c4d38aa493c858ec85001a6c31dd763514202` |
| `s24-contact-hug` | 4 | `efff019391701a917e0139993ca625cc07453c5de15b8bc30bb1858f77057c0c` |
| `s24-contact-distance` | 4 | `4d1a8247c9d2bf6630ba837654dbac5fe4d8ab349f72f4a80eebbf565081a972` |
| `s24-common-a` | 8 | `ec729a97ad72eed1f9a33a4676ea3e7ff74788cb2e9bab414b4526584fb054a7` |
| `s24-choice-limited` | 5 | `1b63b956aaf4431a2f88098511abbf49470e98b2b9b79af5d180d465126eee53` |
| `s24-choice-no-review` | 4 | `784683d6f1b91d7bf05e18a3b366426106aa29f2077684748f1576e02fa82cdf` |
| `s24-common-b` | 4 | `c3d98c94420e89df0178ad2884800a53478d67f9669c758459238fb2ab2c6711` |
| `s24-followup-camera-free` | 1 | `08c063071a169eef1f11a5e5a0de108e6bb8549a0149b5b0879af84baae5881a` |
| `s24-followup-breakfast` | 1 | `c239fedc5efd882a8b37cc3d5a8d7b7a656761228e93181ebdfc7e87b3410f18` |

## Authored branches and irreversible boundaries

- S23's Eric S18-C2 callbacks and non-Eric guarded skip now converge on mandatory `s24-intro`. The former `s23-after-m3-end` was **only a temporary Draft marker** and is removed; old unpublished saves at it may require explicit Restart.
- One of four guarded `s17-evening-eric|nick|damir|self` callbacks renders, with no new relationship/lock effects. **Only Nick's evening** displays one of three S19-C2 contact callbacks (`nick-contact-kiss|hug|distance`); other evenings follow guarded effect-free skip and cannot show Nick's romantic variant by forging a button action.
- In shared mandatory S24 prose, Alice sees a clip that was filmed but not cleared for teaser distribution and Nick **deletes the clip from his working and teaser selections in the story**. This is a canonical narrative event, not automatic deletion of a user file/asset; the game never receives or transmits such video and adds no inferred permission.
- Free S24-C1 records exactly one action: `nick-choice-limited-review` for ten minutes checking clips of Alice **without permission to forward**; or `nick-choice-no-review` for staying and drinking coffee instead. In both cases Nick must separately ask Eric and Damir before distributing their images; **neither branch approves any producer teaser or publication**.
- The distinct Nick-only delayed S19-C3 callbacks use `nick-followup-camera-free|breakfast`; other evenings have an effect-free guarded skip. The former `s24-after-m3-end` Draft marker was removed by [S25](m3-s25-fidelity.md), which now follows every S24 outcome; [S58](m3-s58-fidelity.md) subsequently removed `s25-after-m3-end`. After shared [S26](m3-s26-fidelity.md), [S27](m3-s27-fidelity.md) and [S59](m3-s59-fidelity.md), the day-14 branches now reach their canonical routes, most recently [S31/S62 Alice](m3-s31-s62-fidelity.md), instead of the removed `s59-after-m3-end` marker. Earlier evidence in this document remains historical.
- First-game Economy remains OFF; no internal currency, premium choice, rewarded ad, IAP, route-lock or affection point introduced. `private-text-pending` remains pending; no approval to send Nick's earlier sound/text file or publish Alice's story is implied.

## Editorial and release gates

- Source prose first describes Alice going back toward the house after the pier discussion, then **appends S19-C3 callbacks phrased as happening back on the pier**. Source ordering is preserved exactly, with no invented time change. Chronology needs authorial resolution before release, as do earlier S20/S21/S22/S23 anomalies.
- EN remains RU fallback, not accepted localization. Current Studio schema/trust, Yandex/VK ZIPs and SDK receipts, portrait UI, real browser/device Save/Reload/Back, art and media rights, GitHub CI, moderation and publication remain **NOT_RUN or BLOCKED**. Local N1 narrative test evidence does not establish platform acceptance.

## Verification

- TDD RED: S24 intro absent (0 vs 6 paragraphs), the old S23 technical ending still present. Static source and graph assertions became **2/2 GREEN** after the S24 integration.
- Focused real N1: `node --test tests/m3-s24.test.mjs` **5/5 PASS, exit 0, 164.75 s**. Covers 18 complete routes (three non-Nick evenings × two S24-C1 outcomes plus three Nick contact variants × two follow-ups × two S24-C1 outcomes); effect-free guard rejection, S24-C1 Back reversal, fresh JSON save/replay, rejection of forged flags/actionLog with no writes, 14 independently checked source hashes and Economy OFF.
- Full `npm test` **130/130 PASS, exit 0, 508.20 s**, including all existing S01–S23 regressions and S24. `node --check` on story, S24 module and focused test: PASS. `git diff --check`: PASS. `game/src/story.js` SHA-256: `4d88cb5b49f35be8dfa1314f365bc602a15a3c8e9c17954c3cbc457a`, matching `game/narrative-assets.json`. Independent review and remote Git-tree evidence are recorded only after executing their checks; a PASS claim must always include the observed result.
- Remote Draft PR #2: **12/12 Git blobs matched** between local commit and GitHub content APIs; independently constructed remote Git tree `57e146a9f3069bed59b3e5c013baede3e3a1f9a1` equals the locally tested `67a7d6fa750f0238d91c1c9a042e895d4b452426^{tree}`. An independent read-only `git fetch origin feat/m2-canonical-s01` confirmed remote code head `9aecf39a8f9a726a66e65ba3487571dfe59b45aa` and the same Git-tree hash. This commit was added by **non-force expected-head CAS**, preserving the previous Draft head `51babf34b4142689a21cccb4bdc5df039a9a296e`. Verified PR remains **OPEN/Draft**, base main `57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. Commit status API returns **no checks**: GitHub CI **NOT_RUN**, never PASS. No merge or platform publication.
