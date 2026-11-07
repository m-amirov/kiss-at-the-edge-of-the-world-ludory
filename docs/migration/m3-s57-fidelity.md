# M3 — S57 «День 19. Рассвет без прежних слов» (Damir, continued romance)

## Canonical source and fidelity

- Pinned **read-only** source: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md`, S57 lines 279–315.
- Six authorial blocks, **nine Russian paragraphs**. Independently derived source SHA-256 values for trimmed paragraphs joined with two LF; headings excluded. Full pinned EP09 SHA-256: `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.

| Native scene | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s57-intro` | 4 | `3fe44cad0cd98c0d5d94bde097be96a175cba81a9c38fec7f74cc8ae9ad31d72` |
| `s57-c1-a` | 1 | `c744407f7dd4ead020c548a6a8dbf240e42702e9376a54d3b758f43c5077958a` |
| `s57-c1-b` | 1 | `b050a65d38a6353d377080d473f63dc1b99fe6507461a9a2abfcfcc4fc7bac47` |
| `s57-common` | 1 | `3cd7aecc12ea780cf562c692fba2e3b2447329255717e9efbdb862db664b2457` |
| `s57-s39-a` | 1 | `6fd051cd76f047423d7c6afae0e23bf213cfde3b3fa8c667b557421974a6300d` |
| `s57-s39-b` | 1 | `94aebab5da1f5eb5e34f70f536deb4b5e7a430d40b037f52c601a6e4dbc54ab7` |

## Native routing and non-release boundary

- Only authentic Damir S34 active/paused → S39-C1=A continuing relationships reach S39-C2, then the **exclusive** S56-C2 callback and S57. S39-C1=B breakup and earlier S34-closed status remain on S40→S64; neither is re-opened by S57. Eric, Nick and Alice route locks cannot enter S57.
- S57-C1 A «Остаться рядом и договориться о следующей встрече» records `s57-next-meeting`; B «Остановиться и оставить себе время» records `s57-more-time`. Both are **free**, mutually exclusive through N1 action provenance, and rejoin in `s57-common`. B delays a decision; it is **not** a new break-up or S39-status closure.
- Existing authenticated S39-C2 `s39-memory-ordinary-day` selects `s57-s39-a`; `s39-memory-morning-walk` selects `s57-s39-b`. There is no fallback to an invented callback and no mixing across the two paths. The former unpublished `s57-after-m3-end` technical stop was replaced in [M3 S60](m3-s60-fidelity.md): both callbacks now continue to `s60-intro`.
- The written SMS, future meeting and personal wishes are fictional dialogue. The implementation sends **no messages**, makes no booking, purchase or media action. `Economy & Monetization` stays OFF for this first game: no paid choices, currency, rewarded ad or IAP. EN remains RU fallback, not complete localization.
- Older unpublished Draft saves pointing at removed `s39-after-open-end` or holding stale action history may fail N1 provenance replay. No automatic silent migration or save deletion was performed; explicitly Restart such Draft test saves. Back history is in-memory only, not guaranteed after reload.

## Verification and outstanding gates

- TDD RED (pre-implementation) `node --test tests/m3-s57.test.mjs tests/m3-s39.test.mjs`: **2/6 PASS, 4 fail**, specifically missing S57 and the superseded S39 technical stop. GREEN after implementation: **6/6 PASS**, 0 fail, exit 0; all prose hashes, graph order, free labels, exclusive memory callbacks, closed path and absent economy effects.
- Focused real N1 Damir regression: `node --test --test-name-pattern='real N1 S39' tests/m3-s30-s55.test.mjs`: **1/1 PASS**, 0 fail, exit 0, `duration_ms=94701.58401`. Traverses active/paused S34 status × both S56-C2 callbacks × both S39-C2 memories × both S57-C1 replies, checks Back and JSON replay; closed branch S39-C1=B remains S40→S64. Forged `routeLock`, stale/conflicting S39 memory flags and S39-C2 actionLog are rejected without state writes; absence of real messages and premium actions asserted. Adversarial Back/forgery cases are representative checkpoints, not an exhaustive matrix.
- Following independent review, added negative N1 coverage from authentic **post-S57-C1=A/B snapshots**: both S57 reply flags set, the selected reply flag removed, and an altered S57-C1 actionLog entry. All must throw with no state writes or mutation. The revised focused test: **1/1 PASS**, 0 fail/skipped, exit 0, `duration_ms=112672.680073`. This supplements, rather than replaces, the positive matrix above.
- Full `npm test`, before independent review: **224/224 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit 0, `duration_ms=1659010.241516` (~27m39s). **Post-review full re-run against the final S57 regression suite:** **224/224 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit 0, `duration_ms=1534953.821213` (~25m35s). Both are **local test evidence**, not CI, browser/device, release or content-rights checks.
- Story manifest SHA-256: `3419fcd516bc57251da2d1564777bfc4d6380d05be0dc68bed1e00fc3431ad89`; checked against `game/src/story.js` for this implementation.
- Independent read-only S57 review: **0 Critical**, **1 Important test-coverage gap** (forged S57-C1 flags/actionLog were absent), **2 Minor evidence/coverage notes**. The Important gap was fixed by the post-choice regression assertions above and confirmed by the revised focused test and full 224-test re-run; the evidence note was resolved with the completed local test logs. The reviewer did not perform a second sign-off after the test-only fix. This is not a release authorization; representative Back and forged paths are not asserted to be exhaustive.
- Outstanding gates at this historical S57 checkpoint: common S60 (implemented in a [later Draft step](m3-s60-fidelity.md)) and EP10 scenes (still missing); Ludory Studio component-state schema/trust **BLOCKED**; complete EN, image/music rights, VK/Yandex exports, browser/mobile QA, GitHub CI and platform moderation **NOT_RUN**. PR #2 is **Draft**, no merge, game publication or release-ready claim.
