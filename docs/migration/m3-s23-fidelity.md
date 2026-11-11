# M3 — S23 «День 11. Гавань и чужой план»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, from S23 to the S24 heading. The pinned manuscript and Ludory framework were not modified.

## Authorial prose fidelity

All **18 distinct authorial text blocks / 65 paragraphs** are copied verbatim into `game/src/scenes/s23.js`. In `tests/m3-s23.test.mjs`, independent SHA-256 assertions hash the displayed paragraph text joined by two newlines (`\n\n`), excluding markdown metadata, routing markers and choice headings. These include exclusive alternatives, not 65 paragraphs in a single run.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s23-intro` | 11 | `b079ab537ed8c87c0c49e569181d10d2581307450179d080e50adeb7b2f37a6a` |
| `s23-evening-eric` | 3 | `a1b7b2fac8f411db0f3ed4606dfa9b8db7640a43432ea441555769b5ee234ce7` |
| `s23-evening-nick` | 4 | `f81f8af5a261e5a1901faa4979a3f3e4ab10342348ffee46a23c77e07536cff4` |
| `s23-evening-damir` | 4 | `109905676ff6cb6dc98185ba14e9829867e0a0f393aea1efcb85657daed34754` |
| `s23-evening-alice` | 4 | `5078bb697f0288857bbb05a2b1ff9f485ae202450e5579fd9d4f8063cb83df23` |
| `s23-contact-kiss` | 5 | `50bc644c667fbed02b256c50658b6786e9fc475ac09090f9fa60ed1049e6a9cf` |
| `s23-contact-stay` | 2 | `2b8e01cb7f290c58ec1847520b05fcb97322edab85579c270bb2d3c32c516581` |
| `s23-contact-leave` | 3 | `8f5558285a5f0a7b89a96d614b96d081afbb07cfb8c094fd53d68d7ee1efc1b4` |
| `s23-common-a` | 11 | `c850c5d2b204045ec327501409b68cf4019bf11b6722dbc226e9726dae7253af` |
| `s23-choice-read` | 5 | `f0f1e0f6f1d56a9074efe9b8e750a51724d984d1efaf02a177c6997762ed07ac` |
| `s23-choice-trial` | 4 | `0f4ce3b1596d9bd37484a8d1e0a1a05b34140d85d1cfb20527425e73cb280963` |
| `s23-common-b` | 3 | `6121710ef7c2ffe929fe1d85ee89a6d2fcada048527718164be8a091cc046e7d` |
| `s23-repair-roles` | 1 | `23d16b2b64ee773eee817f61fc900c3d783ad0cb1335c44a3a18cabf5cf2e6f0` |
| `s23-repair-anger` | 1 | `eae3929bdeaeea4e7cfad9ce9d5176aa21edeb89fe77b2ffa21372ae33aace86` |
| `s23-stop-group` | 1 | `1b63977e8d42db2f6c473cc5175240768d37221d305e550ab1ff903c20ee6526` |
| `s23-stop-notes` | 1 | `50e3f1d4a7618e6ac9ce810d1544b4c2b516be00b66ac5b1b106b8b2d27777c4` |
| `s23-followup-postcards` | 1 | `4827f675aa5c9a90d7b86c99665776b8d93a9115c34f44df418012a635139af1` |
| `s23-followup-song` | 1 | `8c65a3f0f6d032df12f51a4feb0b4f068ce0bc75eb1dc7a503044733bd798ba3` |

## Branch and state contract

- Both S22-C2 exits enter `s23-intro`, removing Draft-only `s22-after-m3-end`.
- Exactly one effect-free S17 evening callback uses existing `s17-evening-eric|nick|damir|self` flags. Eric's evening additionally selects exactly one effect-free S18-C1 callback (`eric-contact-kiss|stay-without-kiss|leave`), while other evenings skip it; other routes cannot select Eric's branch via a forged action.
- S23-C1 is **free**: `read-page` sets `eric-open-read-page` (Alice checks one page over breakfast) or `trial-readers` sets `eric-open-trial-readers` (suggest a trial with future students instead of taking ownership of Eric's school). Neither choice is a relationship score, promise to run his program, paywall or photo/publication consent.
- Source S22-C1 (`s22-repair-roles|anger`) and S22-C2 (`s22-stop-group|notes`) each select one delayed, effect-free S23 authored callback. Eric-only S18-C2 (`eric-followup-postcards|song`) selects one further delayed callback; other evenings have a guarded skip.
- Former terminal `s23-after-m3-end` was a **technical, non-release Draft** marker, not an authored ending. The [S24 migration](m3-s24-fidelity.md) removed it and now enters `s24-intro`. Obsolete unpublished saves at removed endings may require explicit Restart; automatic remapping was not implemented.

## Editorial items before release

- The source heading describes **S23 Seyðisfjörður, evening day 11**, while the previous S22 ends at a guesthouse/kitchen and S23 common text again describes the hostess opening the kitchen, followed by evening and nighttime writing. The appended S22-C1/C2 and S18-C2 replies after that shared ending refer back to the harbor. This **authorial chronology/order ambiguity** was intentionally left verbatim; do not insert an invented journey/day or move lines without editorial approval.
- A guesthouse/camera/private-notes boundary is **not** permission to publish. Existing privacy flags and unapproved footage/text stay unchanged. No new economy, premium choice, wallet, rewarded advertisement or IAP is enabled for this first game.
- EN fallback still mirrors RU; this is not approved English localization. Actual Studio schema/trust, Yandex/VK SDK ZIP receipts, browser/mobile Save/Reload/Back, assets/rights, CI and moderation remain release gates.

## Verification evidence

- TDD RED: missing 11 S23 intro paragraphs and S22-C2 still pointing to `s22-after-m3-end`. Static prose/graph tests turned **2/2 GREEN** after scene migration.
- Independent **read-only** reviewer checked all 18 source text exports against exact substrings in pinned EP06, the complete S17/S18/S22 guarded branch structure and S23-C1 flag names: **0 Critical / 0 Important code defects**. The one **Important editorial release blocker** is the backwards harbor/night chronology described above, not a newly introduced code defect. `node --check` on story, S23 module and S23 test, `git diff --check`: PASS.
- Focused real N1 `node --test tests/m3-s23.test.mjs` **6/6 PASS, exit 0 (413.72 s while running the full suite concurrently)**. This includes **4 evening routes × 2 S22-C1 × 2 S22-C2 × 2 S23-C1 = 32 complete combinations**, six independent Eric S18-C1 × S18-C2 callback combinations, negative guards on all effect-free continuations, Back on S23-C1, JSON fresh runtime **after S22-C2** and **after S23-C1**, and forged flags/actionLog rejected with zero writes. The prior deferred S22 post-C2 JSON seam now has persistent regression coverage; this remains a local narrative-runtime test, not device Save/Reload acceptance.
- Full local `npm test`: **125/125 PASS, exit 0 (533.28 s)**, no skipped/cancelled tests, including the historical S01–S22 regressions. Story SHA-256 `28d582985a482e5c84e049bed666ef053fbe59e4d8ad43af267658dfed90d29d` matches `game/narrative-assets.json`. Actual SDK ZIPs, browser/mobile Save/Reload, Studio schema/trust and GitHub CI are **not attested** by these tests or the independent reviewer; those release gates remain NOT_RUN/BLOCKED.
- The tested local commit `4c58e1b35da1309e93e1401bd17f39fd916c36dd` has Git tree `be218a1e8f5ca441b18aba822ee58b604d6021ac`. **12/12 GitHub blob SHA-1 hashes** matched this local commit. A new GitHub commit `11c92535fcd3772fe7adf123d8e1f95aa3780ff4` was built on the previous verified Draft branch HEAD `3c0783e2ea164318ddb482041be0895b343239e1` and advanced by **non-force expected-head CAS**. Independent `git fetch` confirmed remote code commit and **identical tree** `be218a1e8f5ca441b18aba822ee58b604d6021ac`. PR #2 remains **OPEN/Draft**, base `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. GitHub combined statuses are `[]`: **CI NOT_RUN**, not CI PASS.
- No merge, platform publication, moderation request, current ZIP export or destructive cleanup was performed. This is a partial M3 story migration with an S24 technical boundary; **`releaseReady=false`**.
