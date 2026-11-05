# M3 — S17 «Höfn, день 9. Четыре куртки на одной вешалке»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-05.md`, S17 through the S17-C2 list and before S18. No original source files are changed.

## Authorial text

S17 has **14 independent prose blocks, 74 unique paragraphs**. All technical headings, metadata, route instructions and options not selected are excluded from displayed dialogue. Each hash below covers the displayed `dialogue` text joined with two LF characters (`\n\n`), derived separately from the pinned manuscript.

| Block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s17-intro` | 27 | `42cb79c2e4c44c788316101e72dbdf8fba9b9dbe0b748d041cf87af2bad0eb6e` |
| `s17-n-a` | 5 | `edde411b13c8fb98451b1e4e9e79971918a54a44e39b8decf61e61f86db0bc90` |
| `s17-n-b` | 3 | `9044dc327d339724830917f28c4d20828f16f573266231a834a904a903d1e40e` |
| `s17-n-c` | 4 | `cf550b94b5a028aae017f3c1ffaef07a70b6cda02d87de81387999183962d8c8` |
| `s17-common-a` | 1 | `69ca44131871e552893ea217a2d32dca631e20c904155b855c8a479c6b016c13` |
| `s17-e-a` | 2 | `03a8b23c626f0c26cd95ae68793a4720748a5587151c21273c1df3a421100705` |
| `s17-e-b` | 2 | `e84a8469cab7acc20f088dcf6e25d5535a56075afeeb8a56bb0d77ee42a8f6b8` |
| `s17-d-a` | 4 | `7e0a2f0fa9cac07676e1c4f193d939b5061b51086e170221c1f898b338c1a9a9` |
| `s17-d-b` | 4 | `3135b66f3c2e78c250c835c5efca18b8949e2ae84013a4bc342b3646e58ce71a` |
| `s17-group-a` | 5 | `823ae6c980e13b8738172e537217158bcec1ce3ba0238c5f9bedace23cb47013` |
| `s17-group-b` | 6 | `b78b86ad23108a4f2f78f674a58d311fbd428b95f0539bfb2168b21e4847c5a8` |
| `s17-group-c` | 5 | `b7b5a2910d756c4efed85319c728a6b58b9f8eb77f6b9fc7d5e5a34ae5f74e32` |
| `s17-group-d` | 2 | `254c86fe881aeb4efe425bd75d76c7def5c8f869a5c7076a406d6536a8e92687` |
| `s17-common-b` | 4 | `389e020eed3caa10095b8fa21acef07da478202ba71600ad8fa3a8be7af2c9d4` |

## Branching and permissions

- Both S16 outcomes now lead into S17, replacing the earlier `s16-m3-end` boundary.
- Three exclusive Nick callbacks derive from S15-C1 A/B/C. Under C, `private-text-pending` remains true; Nick only permits review at this point and no file is attached to Marina's email.
- Two exclusive editorial callbacks derive from S13-C1, and two Damir callbacks from S16-C1, independently. Guarded `Продолжить` buttons set **no** flags or permissions.
- S17-C1 selects one of four tasks: plan, laundry, kitchen or rest. S17-C2 independently selects Eric (S18), Nick (S19), Damir (S20) or self (S21→S61). Each answer sets one provenance flag, but **never** a relationship score, route lock or paid entitlement. The real route lock remains S26.
- The tourist's medical encounter and Damir's private café story are not approved for reproduction. Nick's joint media file is not approved for sending; individual recognisable text edits do not grant blanket publication rights.
- After [S18](m3-s18-fidelity.md), [S19](m3-s19-fidelity.md), [S20](m3-s20-fidelity.md), [S21→S61](m3-s21-s61-fidelity.md), [S22](m3-s22-fidelity.md), [S23](m3-s23-fidelity.md), [S24](m3-s24-fidelity.md) and [S25](m3-s25-fidelity.md) migrations, S17-C2 Eric enters `s18-intro`, Nick `s19-intro`, Damir `s20-intro`, and self `s21-intro` before mandatory S61; all four lines converge into `s22-intro`, `s23-intro`, `s24-intro` and `s25-intro`. The former `s61-after-m3-end`, `s22-after-m3-end`, `s23-after-m3-end` and `s24-after-m3-end` boundaries were removed; the current technical boundary is `s25-after-m3-end` pending S58. Earlier S17 test results below are historical; updated regressions verify all entrances.

## Verification and release state

TDD RED evidence: before code changes the targeted test found no `s17-intro` (0 vs 27 expected paragraphs), while the runtime stopped at the old `s16-m3-end`. Tests include fixed independent source hashes, 3×2×2 callbacks with prohibited guard actions, all 4×4 task/evening outcomes, N1 Back, fresh JSON continuation, previous flags, and economy-off.

**Local complete suite:** `npm test` **93/93 PASS**, exit 0, **607.64 s**. S17 target file contributes 6 tests: three text/graph/economy checks, full real N1 **3×2×2** callback combinations (491.72 s), all **4×4** group/evening outcomes (43.97 s), Back/JSON restore and tamper rejection. The first targeted N1 attempt had a **test-only** expectation error: `unavailable choice` is a valid rejection of forged provenance, not exclusively `inconsistent actionLog provenance or position`. The matcher was corrected, then the full 93/93 suite passed with no production logic change for that defect.

**Independent READ-ONLY review:** zero Critical, no remaining Important. Reviewer independently extracted all 74 paragraphs from pinned EP05 and verified all 14 SHA-256, compared prior graph/catalog with base, checked S15/S13/S16 effects, C1/C2 and permissions, and passed four fast S17 tests, syntax and whitespace. One Important test-fixture problem (mutation of a `next` record rather than the relevant Nick `choose`) was fixed before the final suite. Deferred **Minor coverage**: test of *both* forbidden Nick siblings in each case, Back→choose-opposite for every C1 option, and completely absent `actionLog` (shortening is already covered). No such runtime defect was observed.

**Local syntax/whitespace:** `node --check game/src/story.js`, `node --check game/src/scenes/s17.js`, `git diff --cached --check` exit 0. `game/narrative-assets.json` SHA-256 matches `game/src/story.js`: `16c9e56cada1163b13ea99a7fc0f971ed4f78c22cff36b54a7d872cabad8b72b`.

**GitHub code proof:** existing Draft PR #2 was open/Draft at the expected initial head `6c57ad1492f0b4d68ef8a2604d28d31dd0b6d73d`; main base `57296cdc0132e007342ed04644025a40b2f5f16b` remained unchanged. **9/9** uploaded blob SHA-1 matched the local committed Git blobs. Remote code commit `813b975f2da78374efb75f5a08aacd948fb81391` is a CAS fast-forward child of that head; no force. An independent Git fetch verified that its exact tree `af5f5795e22197f01bdc3bf1b4c24f9620b6f4c8` equals the locally tested code+docs tree of `e1177f7f7dd4c48a252e9fe03d3bf1f00824c6fc`. PR remained open/Draft, base main unchanged. Combined GitHub status returned `statuses: []` — **CI NOT_RUN**, not PASS.

The subsequent documentation-only evidence closure does not change `game/` or `tests/`; its own remote tree and SHA are checked separately.

**Not release-verified:** Studio component schema/trust, current Yandex/VK ZIP exports and receipts, browser/mobile and actual Save/Reload behavior, EN localization, art/media rights, platform moderation, GitHub CI and publication. Older Draft saves at deleted `s16-m3-end` may need an explicit Restart; no silent save clearing.

**KEEP DRAFT. No main merge, no game publication, no release claim.**
