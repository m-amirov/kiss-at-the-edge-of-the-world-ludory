# M3 — S29 «Удалить, оставить, переснять» → S52 «Перчатка с чужими инициалами»

**Pinned original:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-07.md`, lines 184–277; original manuscript SHA-256 `1d314cdf3ab937ed527f3cca476bf2a5190ff8c7d77d856986b519585af060a1`. Source and Ludory framework left read-only.

## Authorial fidelity

All **13 unique source blocks / 27 Russian paragraphs** are transferred verbatim. Counts and SHA-256 were independently pinned from the manuscript; concatenate player-facing paragraphs with `\n\n`, exclude editorial headings and metadata.

| Ludory graph block | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s29-intro` | 6 | `3c2ee5292ce93bfefdf8b51a45d9c4e78ac605c4188412f5baea1598c94adcb9` |
| `s29-c1-a` | 1 | `ebaca876a97c037ec2c69b2f880b27b0194722c8e765d176f5d58d71834d2829` |
| `s29-c1-b` | 1 | `10bc491c80eb224981a9489ad8f2c080bb76ddbac691f6508e0236d89b17b2d2` |
| `s29-c1-c` | 1 | `e155f22b3fea417b45b8ea5d63efb31915951c39da3529fa86173eeff626aff0` |
| `s29-common` | 1 | `29a0477c8caa8215acfd5c0bd44060ce8e337df0dfbe61bae30c8e4903d2f19f` |
| `s29-c2-a` | 1 | `817bda9e3e92f498101773eb6705a7685097b69ddb37085810adda7b1a853a96` |
| `s29-c2-b` | 1 | `ca9120a642e1306e3b1de9abf256aaf6d73455f4219dd8efcded14a71fef7a11` |
| `s52-intro` | 8 | `d8250d345ffbcec86cff9816dd70fc29194e4d127d3fa53c91e40c1559d9ce45` |
| `s52-c1-a` | 2 | `6d7b26d988f5f2b33488c398432e111b5a30e4de85a981a1325290e51b5fdff0` |
| `s52-c1-b` | 2 | `b7f352a9cfc07a0a7fe80ff6a850bcc5cd3b407dfc19801dd57188c48a4e3459` |
| `s52-common` | 1 | `c5c3fd8da3f02e9adbf764eea113307e46041c7e0f7081a81271e91747c98f8a` |
| `s52-callback-a` | 1 | `05d5c250eb2c7353f6d257c068ca769ae4d3e3038bd08c0a553ead73d68731af` |
| `s52-callback-b` | 1 | `920b4acea37371287ddfe9513c7d5a1613ce9078713fa2422c0e3408c7184caf` |

## Route, consent and state

- The mandatory S59 remains common. One native N1 `s59-route-choice` option is available per S26 routeLock; `nick` enters `s29-intro` and `eric` enters S28/S49. **At this historical Nick stage**, Damir and Alice still reached the S59 stop; the subsequent [S30/S55 migration](m3-s30-s55-fidelity.md) now opens Damir's authorial route, while independent Alice still stops after S59. No second route selection or route change.
- S29-C1 is exactly three free, distinct authorial decisions about a **single 40-second clip**: delete, Alice-only private copy, or an agreed replacement shot. These are represented as N1 narrative outcomes, **not actual file editing**. Even the third option is not generalized filming/publication consent. No new permission flags, uploading, sharing, affinity points or releases.
- S29-C2 is two free authorial options for the remaining hour. It sets only exclusive `s29-hour-walk` / `s29-hour-film` flags, used later to show exactly one S52 callback. S52-C1 has two free authored romance responses, both followed by a shared text block and the relevant callback. Conditional callbacks remain after the shared S52 paragraph, preserving the manuscript order.
- Only Nick can reach S29/S52; no dialogue, route or consent leaks to Eric, Damir or independent Alice. `s52-after-m3-end` is a **Draft-only technical stop**, not the novel's ending. No premium, currency, rewarded ads or IAP: first-game Economy OFF.
- The later [S31/S62 Alice migration](m3-s31-s62-fidelity.md) removed the previously direct `s59-after-m3-end` technical stop after completing all four route-specific day-14 branches.

## Saves and release

Old unpublished saves with prior direct route dispatch to `s59-after-m3-end` may require explicit Restart. Native Back history is in-memory only; fresh JSON state still validates choice actionLog and route provenance. No unsafe state rewriting.

Studio component-state/trust schema mismatch still blocks current export; Yandex/VK packages/receipts, browser/mobile UI, real-device Save/Reload, EN localization, image/media rights, GitHub CI and platform moderation are **NOT_RUN/BLOCKED**. This stage neither merges `main` nor publishes the game.

## Verification

- Test-first RED on absent `s29-intro` (0 versus 6 original paragraphs), then static GREEN **2/2**, including exact choice labels, effects, graph edges, source SHA and first-game free-choice invariant.
- Focused real N1 route/choice/Back/JSON/tamper tests: **14/14 PASS** (`node --test tests/m3-s29-s52.test.mjs tests/m3-s28-s49.test.mjs tests/m3-s59.test.mjs`, 244001.05 ms). Includes the previous Eric/S59 regressions, all four locked routes and all 12 Nick choice combinations.
- Independent read-only review: **0 Critical / 0 Important / 1 Minor**. The reviewer manually compared all 13 blocks/27 paragraphs and exact choices against the pinned manuscript, checked native route gates, callback guards, consent boundaries and manifest parity. Deferred test-coverage Minor: exercise an explicit S29-C2 `A → Back → B` swap (and reverse) and an S52-C1 `A → Back → B` swap; current tests cover each option, Back to same option, and fresh JSON state, but not both sequential alternate selections. No functional defect was found.
- Full repository `npm test`: **163/163 PASS**, 0 fail/skip/cancelled, exit 0, **1061797.94 ms (1061.80 s)**. Includes earlier S01–S59 and Eric S28/S49 regressions plus new Nick S29/S52 tests. `node --check` for story, S29, S52, and test file PASS; `git diff --check` exit 0; pinned source SHA and story manifest match. A pre-existing npm `http-proxy` environment warning and npm version notice are unrelated to test assertions.
- **13/13 GitHub blobs** were uploaded and their Git SHA-1 verified against the local committed files. Full-suite-tested local commit `5f9890e8c08126197cfdaa2310f656cc3a858c71` and GitHub code commit `6adac1130d65a1d5ae6058abd179f02a2501a05a` have identical Git tree `0768664a333d0957633bef80c8b932cd3142ad6c`. The remote commit is a new child of the exact expected previous Draft branch HEAD `d946739cbcb31433ff3751f42f00ff8ba873a5ab`; non-force expected-SHA CAS advanced the branch. Independent `git fetch` read back that same remote HEAD/tree. Draft [PR #2](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/pull/2) remains open, unmerged, base `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged.
- GitHub combined commit statuses: `statuses: []` → **CI NOT_RUN**, not PASS. The subsequent evidence-only documentation closure has no N1 code/test changes; verify its remote SHA/tree separately. No force push, `main` merge, export, release or publication.
