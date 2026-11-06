# M3 — S31 «Не их история» → S62 «Книжный, где никто её не ждёт»

**Pinned original:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-07.md`, lines 378–455; entire manuscript SHA-256 `1d314cdf3ab937ed527f3cca476bf2a5190ff8c7d77d856986b519585af060a1`. Original source and Ludory framework stay read-only.

## Exact authored text

All **12 independent authorial blocks / 20 Russian paragraphs** are represented as player-facing N1 dialogue. SHA-256 values were extracted directly from the pinned manuscript headings and paragraphs, excluding location metadata and editorial headings. Hash input joins displayed paragraphs with `\n\n`.

| Graph block | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s31-intro` | 7 | `dd93808bc1c69237932e5fb381d9cb06977bd97ecc59fc71a73ef7cb118f9d35` |
| `s31-c1-a` | 1 | `e5d67d6d93110604569bdb5eb34d40bab8883dba4c55136020332910eb2d7fc1` |
| `s31-c1-b` | 1 | `037779b8f45e5c746d31b344856aeaaa24fa4686382a1a552a3b529a4fcfc1aa` |
| `s31-common` | 1 | `dc5bea1de0403c7444d0d21f0afa678418708704208fc3d50f1f7eb214c1c90f` |
| `s31-c2-a` | 1 | `6d4c02d24274079c677d03472ca204b902f41c98091442117a50aacf887e0206` |
| `s31-c2-b` | 1 | `01fb91bbd9451477e74cf7b513aacbe3121ad14076c7e348c14bbe99d8bf5e19` |
| `s62-intro` | 3 | `1ae48466a2f36e9fa7f4b8d4b5b276007f1e34c4179f1f81daade4b6caaff9b4` |
| `s62-c1-a` | 1 | `7b17d7ad15355590c698c71bef06e2fdda74e020ca8690b5f08ef5e7750a2655` |
| `s62-c1-b` | 1 | `4ba1b25df462327f1b56830f369f192271a0271fdd1f5c4b39b562401fc3d79f` |
| `s62-common` | 1 | `d108a51709d5835c9976a1150c1a8ca53558f4da3321051ad2e55a4f97f666e3` |
| `s62-callback-a` | 1 | `251218d94fba48feb5e0f652674e564dc07fe9bdf8e3de4c06449723fbb25e62` |
| `s62-callback-b` | 1 | `79817810cecb51f5bd2c4c742b5590a998ce826e3014231e932d0a501da639d1` |

## N1 route, callback and privacy boundaries

- Shared mandatory S59 dispatch uses N1 `routeId` and existing S26 lock. Only independent `alice` enters S31; Eric still enters S28/S49, Nick S29/S52, Damir S30/S55. The obsolete `s59-after-m3-end` technical marker has been removed; its previous use was unpublished historical Draft behavior.
- **S31-C1** offers free Inga feature *after separate agreement* or a privacy-safe group account. Inga's authored response describes willingness to talk and review trail-work facts; no story choice grants blanket public release, photo/media consent or publication permission.
- **S31-C2** offers the unsent self-letter or choosing tomorrow's breakfast. The two exclusive flags `s31-self-letter` and `s31-self-breakfast` guard exactly one S62 callback, with native Back and JSON actionLog provenance; no invented scores or authorial choice.
- **S62-C1** offers an authored message to an old friend or no message. The text is narrative only: no actual outgoing messages, server or external SDK actions. Both choices converge at the same dinner paragraph.
- As authored, S62's conditional **morning** recollection blocks follow the common **dinner** paragraph in manuscript order. This source-order time shift is preserved rather than silently editing the author's chronology.
- `s62-after-m3-end` is a Draft-only **technical stop**, not a game ending. This first novel's Economy remains OFF: no currency, premium choices, rewarded advertising or IAP.

## Save and release gates

Old unpublished saves at the removed `s59-after-m3-end` stop may require an explicit Restart; do not delete, backfill or silently migrate them. Native N1 Back is in-memory only; JSON replay checks provenance on fresh runtime. The Studio schema/trust mismatch still blocks supported export: Yandex/VK ZIPs and receipts, browser/mobile/device Save/Reload, media licensing, verified English localization, GitHub CI and store moderation are **NOT_RUN/BLOCKED**, not PASS. No `main` merge or game publication.

## Verification

- TDD RED: `s31-intro` was missing (0 vs 7 canonical paragraphs); then static source SHA and N1 graph **2/2 PASS**. Native N1 `tests/m3-s31-s62.test.mjs`: **5/5 PASS** in 150795.224 ms; historical route regressions across nine existing suites: **45/45 PASS** in 428549.520 ms. Full `npm test`: **173/173 PASS**, exit 0, 707031.338 ms, 0 skipped or failed.
- Independent read-only whole-change review: **0 Critical, 0 Important, 0 Minor**; direct manuscript check 12/12 blocks, 20/20 paragraphs and 6/6 labels; own native N1 5/5 PASS in 167445.731 ms. `node --check` of story, both scenes and tests, `git diff --check`, and asset-manifest SHA-256 all PASS. Reviewer did not evaluate release export, device UI or CI.
- GitHub Draft PR #2 exact tree sync and external CI status: **PENDING**.
