# M3 — S37 «День 18. Эрик без списка» (Eric route)

## Pinned source and exact text

- Read-only original: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md`.
- Full EP09 SHA-256: `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Nine original prose blocks / 13 paragraphs; each displayed block is independently checked against its source text SHA-256 in `tests/m3-s37.test.mjs`.
- Two authorial free choices, `S37-C1` and `S37-C2`, have their original labels and text. The two S50-C2 authorial callbacks are displayed verbatim. RU only; EN currently uses RU fallback.

## State transitions and narrative boundaries

- `S36` stays common to all routes. After its common text, a guarded technical `Продолжить` dispatch sends only Eric `s32-status-active|paused` into `s37-active|paused`.
- Current subsequent S38 stage now also admits Nick with S33 active/paused status, without changing `routeLock`. Damir, independent Alice and closed romances still reach the **Draft-only** `s36-after-m3-end` stop. This supersedes the earlier S37-only dispatch snapshot.
- `S50-C2` now writes exactly one exclusive callback flag, `s50-family-story` or `s50-sister-gift`. No relationship score, permission, premium entitlement or media operation is added.
- `S37-C1-A` stores `s37-status-continues`; `S37-C1-B` stores `s37-status-closed`. The original shared evening paragraph and S50 callback follow both outcomes. A **closed** relationship then bypasses the later romantic-morning choice and stops at `s37-after-closed-end`, waiting for independent S40/S64.
- Continuing the relationship admits free `S37-C2` (sunrise or breakfast) with one exclusive `s37-morning-*` flag for S51. It stops at `s37-after-open-end`, not a release ending. S51, S39 and S40 are not yet integrated; Nick S38 is tracked separately.
- The original S37 manuscript places C2 after the shared evening paragraph, even though C1-B explicitly ends the romance. The implementation intentionally prevents a post-breakup romantic invitation. This is a visible branch-order editorial decision, **not** a claim that the original manuscript resolved that contradiction.
- Preexisting Draft saves after S50-C2 and at the former S36 technical stop may not be replay-compatible because S50 choice effects and S36 transitions changed. No automatic storage wipe or unverified save migration is attempted. Use explicit Restart in a draft test session if needed.
- Economy & Monetization remains **OFF** for this first game. No server, real messages, uploads, permission grants, purchases or publication.

## Acceptance evidence

- TDD RED: initial `tests/m3-s37.test.mjs` **0/3 PASS** (S37 absent / S36 still stopped early / authored C1 absent).
- Static GREEN: `tests/m3-s37.test.mjs` **3/3 PASS**; nine source block checks, route/status guards, exact choice labels, free choices, independent close boundary and S50 payoff flags.
- `node --check` on story/S37/new native test; `git diff --check`; manifest SHA comparison: **PASS**.
- Focused `node --test tests/m3-s32.test.mjs tests/m3-s37.test.mjs tests/m3-s36.test.mjs tests/m3-s50.test.mjs`: **13/13 PASS**, zero failure/skip/cancel, exit 0, 364502.971413 ms. Native N1 covered real S01→S37 action provenance, two S32 statuses × two S50 callbacks × two S37-C1 outcomes, both S37-C2 replies, Back/JSON, wrong route/status/callback/premium rejection with zero writes, and forged flags/actionLog protection.
- Full `npm test`: **201/201 PASS**, zero failures/skips/cancellations, exit 0, 1069299.19976 ms (~17m49s). This includes the unchanged historical routes, all S36 dispatch regressions and S37's real N1 path checks.
- Syntax checks and `git diff --check`: **PASS**; `game/src/story.js` SHA-256 `10b5915ef604e6e86a348ff52c72ee593a4611955919fcff06ee03ae49b69c98` equals `game/narrative-assets.json`.
- Independent external reviewer and GitHub CI: **NOT_RUN**; no independent approval or hosted build is inferred from local tests.
- Studio schema/trust compatibility: **BLOCKED** as previously established; actual browser/mobile Save/Reload, Yandex/VK ZIP/receipts, EN, media rights, GitHub CI and platform moderation: **NOT_RUN**.
- Keep PR #2 **Draft**, leave `main` unchanged. No release, no publication.
