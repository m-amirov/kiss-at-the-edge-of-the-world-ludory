# M3 — S19 «Бассейн. Ник без удачного кадра»

**Pinned canonical source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-05.md`, S19 before S20.

## Canonical prose proof

The migrated scene contains **18 exact authorial blocks, 96 individual paragraphs**. All blocks have been independently located as contiguous text in the pinned source; SHA-256 is computed on the exact paragraphs joined with `\n\n`. Metadata, authorial section headers and technical transition notes are not dialogue.

| Ludory block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s19-intro` | 42 | `07b2961de698a183d54974adee829e1c36abdb10663117bc9f554de79e4cb6c4` |
| `s19-private-photo` | 6 | `88475f43597182aabc32a669fe9e65529ea95e132b40302c703b608dc734ee4a` |
| `s19-no-photo` | 6 | `5f0f437e1596b27d3f5c4de34f63ba8df2ba435ced227e9f7068b0b8179b471d` |
| `s19-ask-tomorrow` | 6 | `d4328ffc8aa551549ddbb2729056b2ec7d4170b83a3db91410267bd6d77e944b` |
| `s19-common-a` | 8 | `df521c92a46f7b4cac3aba5c234da26c6e5324f6c1ac04de66df41098c8d9bc3` |
| `s19-kiss` | 6 | `12308edc9c3a3a48aefa8136346f40e57968f9cb88fcd1daaaf19e95acc4b78e` |
| `s19-hug` | 5 | `09cae1e118fbf91c93087358dfc6f60b7448be3c65cd7e30ec7da722c5dedbfe` |
| `s19-distance` | 6 | `96cbd1fb525e6675b152faf8440874433374dfc0cf6967d4729b6c3c64d50576` |
| `s19-common-b` | 1 | `b16eb83b2a43263941d0e23ad18a0abe027c747180ec81e917e26d50f8a1dbc9` |
| `s19-p-a` | 1 | `5db4a151c6c97229326dad8f7a1502d61c19fe8dadb16d7266051dca57e9486c` |
| `s19-p-b` | 1 | `3188cd2ed2f585b4afaef02c3f0e3329e22bccc1c5bcba90e41432114ec9ca45` |
| `s19-p-c` | 1 | `4b93f16ed6579aebde37d13f516bc4008c0e186cf580c043f37dbc0836aa2fc2` |
| `s19-day10` | 2 | `5898f98fc2f686b0904b90eebc6d6640107dde4e345f13dfaffe5e03a91b801f` |
| `s19-k` | 1 | `35e658e86703ed28d5b1da531b9c51133521b5dfc54f2efe5f0d2d83c9e9e48b` |
| `s19-h` | 1 | `98e2a56e26de6f58d0aefc0a16989bc96c92e92fa7f1ff9d5a5ebc4f05414ab2` |
| `s19-d` | 1 | `f15deab50400c907e1c575164a10172d4f0a1784e692b6ce77612869837823dd` |
| `s19-camera-free` | 1 | `fdd49db81379f6ef2d90c7419e987105980972fc4b6a45d27869723fdd97f9d0` |
| `s19-breakfast` | 1 | `bb3de3a7dec1c0a2332fa98a08733e3cb718ba164956de1bd23733c2bd730d9f` |

## Decisions, consent and chronological source anomaly

- Only `S17-C2=Nick` enters `s19-intro`; Eric S18, Damir S20 and self S21 entrances remain as before. The temporary `s19-m3-end` was removed, and the *new* `s19-after-m3-end` explicitly stops the unpublished Draft before S22. Old Draft saves on the removed scene ID may need explicit Restart, never a silent skip of S19.
- **S19-C1**: one photo of anonymous shadows on Alice's phone, remaining in Alice's gallery (`nick-photo-alice-private`); no photo (`nick-photo-none`); or ask again tomorrow (`nick-photo-ask-tomorrow`). The authored next-day response to a renewed request is **no**. Neither variant consents to a new recording, a copy for Nick, joint-file transmission or teaser publication. The prior `private-text-pending` from S15 remains untouched.
- **S19-C2**: Alice explicitly offers a kiss / requests a brief hug without kiss / asks to walk alone. `nick-contact-kiss|hug|distance` remains independent of photo choice. No answer creates continuing physical consent, a route lock, romance score or paid entitlement.
- The day-10 photo and contact callbacks are gated only by their prior exclusive flags; guard options have no effects. Alice's removal request for the unapproved montage shot is included in shared day-10 prose on every path, so it cannot be bypassed by a photo/physical choice.
- **S19-C3**: two authored responses (visit the city without cameras / find breakfast without following reviews) are located *after* the source's technical note `Утром дня 11 — S22` and are missing from the source's initial “Доступ” header and final technical state list, which mention only C1/C2. This is an **authorial chronological inconsistency**. Preserve C3 after day-10 callbacks and before technical Draft boundary; do not silently remove, rewrite, or invent another day.
- This first game still has no currency, rewarded ad, IAP, premium choice or economy config. Only S26 may lock a romantic route.

## Verification

- TDD RED: before implementation, S19 was absent (0 vs 42 opening paragraphs) and S17 Nick still led to `s19-m3-end`; both deliberate RED assertions observed. Static source+graph tests now PASS.
- Focused real N1: `node --test tests/m3-s19.test.mjs` **5/5 PASS**, exit 0, 78.25 seconds. The complete 3×3×2 matrix tests invalid option rejection, Back undo (including undo of follow-up flags), JSON restore into a fresh N1 runtime, both conditional effect-free payoffs, unchanged S15 joint-file pending status, no route lock and economy-off. Forged/missing flags and manipulated actionLog were rejected with **zero `setState` writes** and unchanged supplied JSON.
- Independent **READ-ONLY** source/code review: **0 Critical, 0 Important, 0 Minor**. Reviewer independently stripped only the source's headings/metadata/technical transitions and compared the rendered S19 paragraphs in authorial order: **96/96 byte-identical**, aggregate SHA-256 `7abe6930e5f085124756ca545a3930887d73524a01cb456c257c2dff610e2f1e`. Independent graph walk: **one external incoming edge** from S17 Nick, no external outgoing edge, 22 S19 nodes, 14 variant edges and six effect-free guarded callbacks; all eight new effect flags limited to photo/contact/follow-up provenance. The only dropped full line `К вечеру вещи высохли... Утром дня 11 — S22` is a non-player technical transition, consistent with earlier S18 policy.
- Full local regression: first `npm test` ran **102/103 PASS** and exposed one stale S17 static expectation for the removed `s19-m3-end` node. The existing regression assertion was corrected to expect `s19-intro` and the explicit new `s19-after-m3-end` boundary (Damir/Self stubs remain). Targeted S17 test **1/1 PASS**; repeat full `npm test` then **103/103 PASS**, exit 0, **322.87 seconds**. This was a test expectation mismatch, not an N1 runtime failure.
- Syntax, graph, asset digest and Git whitespace: `node --check` on story, S19 module and new tests, `defineNarrativeGraph(graphData)`, `game/narrative-assets.json` SHA-256 match, `git diff --cached --check`: **PASS**.
- GitHub code verification: the existing PR #2 remained **open/Draft**, with `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. Expected previous head `8f3dff2da9c357c0e90d233f68553a1c7e8ad8a5`; all **11/11** uploaded blob SHA-1 matched local committed blob SHA-1. The remote tree `e61cc1ff0a95a37b954a4b66b548d1747ca84772` matched local tested commit tree exactly; remote commit `05f103433280789c3b7b52af925acef74a2805a8` was installed via expected-head **fast-forward CAS, no force**. Independent `git fetch` confirmed matching remote SHA and tree. GitHub combined statuses returned `statuses: []`, meaning **CI NOT_RUN**, not PASS. PR remained Draft/open and was retitled S01→S19; no main merge or publication.

Subsequent **documentation-only closure** records the evidence above and changes neither `game/` nor `tests/`. Its remote tree/HEAD are verified after uploading the closure.
- Current manifest `storySha256`: `cd2faf6981f4ad882f199949af73ace24033dcda384ed4277df6eb9acfdb1f24`.

**Open release gates:** Studio schema/trust, current Yandex/VK ZIP and receipts, real browser/mobile Back/Save/Reload, English localization, image/media rights, GitHub CI, moderation and publication. All NOT_RUN/BLOCKED; no release or main merge.
