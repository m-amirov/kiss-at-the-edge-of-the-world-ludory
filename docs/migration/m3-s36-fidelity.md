# M3 — shared S36 «Место для остановки» (day 17)

**Current continuation:** S36 hands off through a guarded `s36-route-dispatch`: Eric active/paused → S37; Nick active/paused → S38; Damir active/paused → S39. Independent Alice and already-closed romances still stop at `s36-after-m3-end` in Draft. The earlier direct `s36-common` → stop edge below documents the previous accepted snapshot. See [S37](m3-s37-fidelity.md), [S38](m3-s38-fidelity.md), [S39](m3-s39-fidelity.md).

## Source fidelity

- Original read-only repository: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`.
- `content/season-1-literary-episode-09.md`, S36 lines 5–29, full original EP09 SHA-256 `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Seven unchanged authorial paragraphs, grouped in four graph nodes. Digests were calculated from the pinned original independently of the runtime, joining consecutive paragraphs by two LF:

| Scene node | Paragraphs | Authorial SHA-256 |
| --- | ---: | --- |
| `s36-intro` | 4 | `cb55419be0402944582c43aade9a263d1f6d8dd1b271efdb917ee3997b6a35fe` |
| `s36-c1-a` | 1 | `b1ca0c4eca686bec9548066347cf0e0c6c6bbf04a62afb8702f3dc5f3c654e80` |
| `s36-c1-b` | 1 | `46a28f4be1e05aa0f47615359efe5cf8d90232bc49bce375d1e8a6a33624e2b5` |
| `s36-common` | 1 | `5ac0eff2b3c29bfefe0723e838ee63f84bce51b894d485b8f322d54670e92604` |

## Native narrative graph

- **Four authentic entrance families:** S50-C2 Eric, S53-C2 Nick, S56-C2 Damir, S63-C2 independent Alice or any romance marked closed. Both A/B variants of all four now point to `s36-intro`; no old M3 technical end remains on these paths.
- S36-C1-A: «Предложить всем короткую прогулку до возвращения в машину»; B: «Остаться в кафе и поговорить с теми, кто хочет». Both free, no effects, both converge into the source-authored shared end-of-day paragraph.
- Route locks remain what S26 originally selected, including `eric`, `nick`, `damir` when a relationship has been **closed**. No invented `routeLock=alice` conversion; the previous relationship flags and S56/S63 future callback flags remain intact.
- `s36-after-m3-end` is an unpublished technical Draft stop only, pending actual route-specific S37/S38/S39/S40 and shared S60. It is NOT a literary or release ending.
- All photos, repairs, radio, conversations, etc. are narration: no external calls, uploading, permissions, paid choices or economy. EN remains RU fallback.

## Verification evidence

- TDD RED: new S36 tests failed `0 !== 4` for missing authorial paragraphs and wrong S50 inbound edge; expected fail `2/2`, exit 1.
- TDD GREEN: `node --test tests/m3-s36.test.mjs` **2/2 PASS**, exit 0; all seven authorial text paragraphs and four doubled inbound edges checked.
- Nine-file targeted regression before the three closed-route additions: **32/32 PASS**, no failures/skips, exit 0, 362031.231405 ms. Real N1 continued all previously active/paused paths through S36, with JSON/Back/invalid-choice protection.
- Independent reviewer: 0 Critical. One **Important** originally found: closed Eric/Nick/Damir path tests stopped at S35; fixed with three actual N1 traces through S35/S63/S36 to the Draft stop, with original locked route, closed-only status, future callback, invalid purchase choice no-write, Back, JSON and matching flags. All three passed in the full suite.
- Reviewer **Minor deferred**: active/paused tests assert some previous flags on the live object just after S36 choice rather than again at technical end; after-end routeLock assertions and closed-route after-end flag equivalence exist. No observed production bug.
- `game/src/story.js` manifest SHA-256 `9377bfd11e1c534974e7d1475f9780ef4eb5b1eab27b9492f0ea8d8730ae4a67`; `game/narrative-assets.json` synchronized.
- Full `npm test`: **197/197 PASS**, no failed/skipped/cancelled tests, exit 0, 915187.809677 ms (~15m15s); includes all preceding M1/M2/M3 regressions and the new three closed-route continuations.
- `node --check` for `game/src/story.js`, new S36 module, three extended N1 test files and `git diff --check`: **PASS**, exit 0; story SHA matches the pinned local manifest.
- GitHub Draft PR #2 exact-tree parity and branch CAS: **PENDING**.
- Studio export currently **BLOCKED** by previously verified component-state trust mismatch. Browser/mobile, actual platform packages, hardware saves, media rights, GitHub CI, Yandex/VK moderation and publication **NOT_RUN**; not release-ready.
