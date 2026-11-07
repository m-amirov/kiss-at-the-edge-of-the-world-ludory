# M3 — S38 «День 18. Скучный день, который удался» (Nick route)

## Pinned manuscript and fidelity

- Original read-only repository `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md`, section S38. Full pinned EP09 SHA-256: `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Nine exact original blocks / 14 paragraphs, each compared with its own **source-derived SHA-256** in `tests/m3-s38.test.mjs`: paused (1), active (4), C1-A (2), C1-B (2), shared (1), C2-A (1), C2-B (1), S53-C2-A callback (1), S53-C2-B callback (1).
- Free original labels for both `S38-C1` and `S38-C2`. English is still a Russian-text fallback, not a reviewed translation.

## Ludory narrative and boundaries

- Shared day-17 S36 remains on all paths. Nick `s33-status-active|paused` enter `s38-active|paused`; Nick already closed at S33 now enters independent [S40](m3-s40-fidelity.md), retaining its `routeLock='nick'`.
- `S38-C1-A` locally records `s38-status-continues`; `S38-C1-B` locally records `s38-status-closed`. Both original variants and the common authorial paragraph are preserved. Neither flag grants any paid, privacy or publication permission.
- The authentic `S53-C2` choice now records one exclusive `s53-next-coffee` or `s53-next-books` flag; the corresponding S38 callback appears only after that source choice **and after S38-C2**, preserving its order in the manuscript. This uses a guarded technical **«Продолжить»**, not a fabricated third authorial choice.
- When S38-C1-B closes romance, the flow enters S40 instead of the removed unpublished `s38-after-closed-end`. The original manuscript places romantic S38-C2 and the future-date S53 callback after the common paragraph even when C1-B ended the relationship; the implementation deliberately **does not** offer a new date or future-date callback following a breakup. This is an explicit editorial routing decision, not a claim that the source resolves the inconsistency.
- Continuing romance enters free S38-C2, storing exactly one `s38-memory-date` or `s38-memory-books` flag for the now implemented [S54](m3-s54-fidelity.md); the guarded S53 callback is shown **before** canonical S54. The former `s38-after-open-end` Draft stop is removed. S54 now joins shared [S60](m3-s60-fidelity.md); the technical Draft boundary is after S60, before EP10 S41. Neither is an authorial ending or passed release gate.
- Prior unpublished Draft saves after S53-C2, at the old S36 stop or at removed `s38-after-open-end` may not be replay-compatible because S53 choice effects and S36/S38 transitions changed. Do not silently wipe/migrate player storage: Restart is explicit in a Draft test session. Back is runtime-local and not guaranteed after Reload.
- First-game Economy & Monetization remains **OFF**. Authorial mail, museum tickets, camera, photos, books and meeting plans are prose only: no network messages, media operations, real purchases, consent grants or server.

## Verification and unpassed gates

- TDD RED: `node --test tests/m3-s38.test.mjs` **0/3 PASS**, before S38 scene/dispatch existed. Static GREEN: `tests/m3-s38.test.mjs` **3/3 PASS** and four-file S38/S37/S36/S53 focused static suite **10/10 PASS**; source checks, route locks, exact free choices, callback predicates and closed boundary.
- Independent read-only review initially identified **1 Important** (S53 callback preceding S38-C2 and leaking into closed romance) and **2 Minor** documentation/technical-text inaccuracies. Ordering regression was first verified **RED: 2/3 PASS, 1 fail**, then fixed to **GREEN: 3/3 PASS**; real N1 regression and source-order boundary were updated. Follow-up independent review: **0 Critical / 0 Important / 0 Minor**, ready to update Draft PR, not to merge/release.
- Native N1 test in `tests/m3-s33.test.mjs`: real Nick S01→S38 proof for active/paused status × two S53 callbacks × relationship continue/close, both S38-C2 variants, JSON restoration, Back, invalid choices with zero writes, six forged route/flag/actionLog variants with zero writes, original C2-before-callback ordering, no romantic callback after closure, and no premium/media effects. Focused `node --test --test-name-pattern='real N1 S38' tests/m3-s33.test.mjs`: **1/1 PASS**, exit 0, 86071.677514 ms after ordering fix.
- Full `npm test`: **205/205 PASS**, zero failures/cancellations/skips, exit 0, 1217961.856347 ms (20m18s). Includes previous canonical routes, S37, S38 and N1 forgery regression. Local tests are not GitHub CI or browser/release evidence.
- Story manifest SHA-256: `3721ef560c6c8f9379d6e2bb321e9de174dcdb44d41ada2503b08f154020889f`. Must match `game/src/story.js` after all changes.
- Studio trust/schema compatibility remains **BLOCKED**; current Yandex/VK exports, browser/mobile Save/Reload, EN translation, media rights and actual moderation are **NOT_RUN**. GitHub CI must be evaluated separately from local tests; zero reported statuses does not mean PASS.
- PR #2 stays **Draft**, base `main` unchanged; no merge, release or publication authorized.
