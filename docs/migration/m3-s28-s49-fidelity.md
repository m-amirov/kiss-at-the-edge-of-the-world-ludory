# M3 — S28 «Не туда, куда указал палец» → S49 «Танец, для которого не нужен повод»

**Pinned authorial source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-07.md`, lines 85–183, full original SHA-256 `1d314cdf3ab937ed527f3cca476bf2a5190ff8c7d77d856986b519585af060a1`. Source manuscript and Ludory framework untouched.

## Original prose fidelity

All **12 authorial prose blocks / 30 original paragraphs** are transferred verbatim, excluding metadata and editorial headings. Each hash is SHA-256 of paragraphs joined with exactly `\n\n`, independently pinned from the original manuscript, not computed from current game code.

| Graph block | Paragraphs | Source SHA-256 |
| --- | ---: | --- |
| `s28-intro` | 11 | `e98cdd4d11aae39cc4eb628870ead43f75fa9f73728b533bf5d59435c3606f08` |
| `s28-c1-a` | 2 | `54e2d7a53fdbcaa6b84a48d18e17e1d66eb83d6ada068727e8190c8a1d0ae032` |
| `s28-c1-b` | 1 | `3a801e46ce6d51e18b930dde067eb9dd6a8d4addf1b281206c3a4f4de9d8e298` |
| `s28-common` | 1 | `2862bb0162997160193e79324ae5fb3d89255bb2a9321157116d69b9829439eb` |
| `s28-c2-a` | 1 | `2b436d2ef29eed1474b8872903bf01513cac4fa62283d69678cde7b15f414963` |
| `s28-c2-b` | 1 | `c241f53e9f129fa0d393f72f2e54687766e84f732be10433917d03b702951dbc` |
| `s49-intro` | 7 | `207ac0997768d69fef5384b499352b7e208bc8561841eb578cbc34419ac9cc01` |
| `s49-c1-a` | 2 | `ce9e4f4768e016d9d44e43116a4d2e9d1c4e8fe750a403f30bd8b499d652963e` |
| `s49-c1-b` | 1 | `4adb04e25aa6a65879a6332d799966ed98a80f781829696fcea9e760534d8659` |
| `s49-common` | 1 | `ffeb2926b98a90c362290aa21bc5c05de29cd405facb760e5a5731328369cc68` |
| `s49-callback-a` | 1 | `e7a6a5ad3cf58b39d9b8705e612e2c3dc6f3baba41ce1f22f65af7f029235988` |
| `s49-callback-b` | 1 | `c7433828cd17413c90378296ed05faa4b763e224f1fbcbcffac68c445a8f27a7` |

## Locked narrative route

- The mandatory S59 scene remains common to all four locks. `s59-route-dispatch` displays only the one native N1 `routeId` choice that matches the S26 `routeLock`, even after Back or validated JSON restore. This technical `Продолжить` is **not** a second romance route decision; no flag/effect changes at the gate.
- Only `eric` enters S28. `nick`, `damir`, `alice` safely reach a technical, non-release boundary after S59 until their distinct authorial day-14 route chapters are migrated.
- S28-C1 has two free decisions about the return path; both rejoin the authored shared scene. S28-C2 has two free decisions about the evening. The only state additions are exclusive flags `s28-evening-dance` and `s28-evening-quiet`, necessary for the explicit S49 source callbacks.
- S49-C1 has two free romantic outcomes and then the shared authorial paragraph. One guarded callback replays the authorial payoff for the earlier S28-C2 choice; exactly one is reachable. `s49-after-m3-end` is a **technical stop, not a story ending**.
- No premium choices, reward ads, IAP, affection scores, media-upload permissions, inferred consent or extra invented scenes. First-game Economy OFF. The manuscript's S49 conditional payoff appears **after** its shared paragraph and is preserved in that order.

## Save and release boundary

Historical unpublished saves at the former direct S59 technical stop may need explicit Restart because that direct transition was replaced with a guarded dispatch. Native Back history is in-memory; a JSON restored state still verifies route/choice provenance but does not restore Back history.

Studio export remains blocked due to component state/trust mismatch. New Yandex/VK packages and receipts, EN localization, mobile browser UX, real-device Save/Reload/Back, image/media rights, GitHub CI, real marketplace moderation and game publication are **BLOCKED or NOT_RUN**, not PASS. No `main` merge.

## Verification

- Test-first focused static RED: absent `s28-intro` (0 vs 11 paragraphs). After code transfer, exact-text and branch-structure GREEN **2/2**.
- Focused real N1 `node --test tests/m3-s28-s49.test.mjs tests/m3-s59.test.mjs`: **9/9 PASS, exit 0, 171.68 s**. This exercises the four locks and rejects the three unauthorized dispatch actions on each route without state writes, all eight Eric S28-C1×S28-C2×S49-C1 combinations, both exclusive callbacks, in-memory Back, JSON restore, and tampered route/flag/actionLog provenance with zero writes. Existing S59 three-song/route tests remain green. Test result does **not** prove real browser/mobile UX.
- Independent read-only source/graph review: **0 Critical / 0 Important / 2 Minor**. Reviewer manually compared all 12 blocks/30 paragraphs with the manuscript (without using test hashes); native `routeId`/actionLog replay, three free choices, callback exclusivity and manifest parity accepted. The documentation's earlier focused-test `PENDING` has already been resolved above; the remaining Minor is optional sequential Back→replace S28-C2 callback coverage (not a functional failure). Previously existing Studio checksum/trust mismatch is explicitly not bypassed.
- Full repository `npm test`: **158/158 PASS, 0 failures, exit 0, 788.52 s**. The runner completed after all previous S01–S59 regressions and the five new tests; this is evidence for local N1 code, not release acceptance. `node --check` for story, S28/S49 modules and focused tests PASS; source SHA and manifest match; `git diff --check` exit 0. Npm reported a pre-existing environment `http-proxy` config warning, unrelated to scenario assertions.
- **10/10 GitHub blobs** uploaded with byte-identical Git SHA-1. Full-suite-tested local commit `1972cfcb825fefa2fbe98d8dea7e1f2e4f4783f5` and remote GitHub commit `0a9a79daee39d614f2fc181cc0b936454ea826c6` share exact tree `ce5bdfdbd76e9f9011dc7320a3c05d7ba028f180`, created from previous remote tree `7cae3676053dfa2695f1bfb1d1f4bf4db0532c00`. Non-force CAS advanced `feat/m2-canonical-s01` from its expected `6a75f59e308a866087df2e4c6178158b5c8ecd20`. Independent read-only `git fetch` confirmed both remote HEAD and tree match the local tested tree. Draft [PR #2](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/pull/2) remained open and not merged; `main` base remained `57296cdc0132e007342ed04644025a40b2f5f16b`.
- GitHub combined commit status `statuses: []` means **CI NOT_RUN**; it is not a passing check. A documentation-only evidence closure commit follows the tested code commit and does not change N1 gameplay or tests. No force push, main merge, export, release or publication.
