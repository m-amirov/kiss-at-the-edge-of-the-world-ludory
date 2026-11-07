# M3 — S64 «День 19. Своя короткая дорога» (independent/closed)

## Pinned authorial source

- Read-only original `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md` lines 359–392; whole EP09 SHA-256 `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.
- Six independent original prose blocks, **eight paragraphs**. Independently extracted from the manuscript, normalized by stripping section headings and outer whitespace, paragraphs joined by two LF:

| Native scene | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s64-intro` | 3 | `90a47c0d698a3051b20953c5199a2cb5948df29c6096f8c1836d398a22a1d3c8` |
| `s64-c1-a` | 1 | `8efce3a544dc40ac6685e4e85412dedfe6f4d7dbeb942a05a445286e789a4479` |
| `s64-c1-b` | 1 | `fc277ec30227b2920c303a0f1eda979a5072bfb13fba575526ff9628ebd3f891` |
| `s64-common` | 1 | `54f4cb451a770c5585cd3699ac2d478594a9c992cd8f9fed2e4b71ae290236c9` |
| `s64-s40-a` | 1 | `9366a573bed2183b5dc961a377d1225544e89b36c4a0628cab27e9cf15d5a7a3` |
| `s64-s40-b` | 1 | `43cf406c1806abfc8a2da5303b2aca1c9c13e5ed2204da73cd227357d966d889` |

## Native routing and editorial decisions

- Three S40 exits (S63-C2 A/B callback and late-breakup `none` fallback) now converge on `s64-intro`. Previously unpublished `s40-after-m3-end` is removed; no romance is silently restored and the S26 route lock remains Alice/Eric/Nick/Damir as chosen.
- The only S64 authored choice is free **C1=A** «Подать заявку на самостоятельный журналистский проект» versus **C1=B** «Оставить себе свободный месяц после поездки». Distinct local narrative memory `s64-career-project|s64-career-break` records the choice for later canon, while the manuscript paragraph describes any editor action. The game sends **no actual email**, performs **no external request**, and records no real voice memo.
- After the shared authored paragraph the guarded callback from prior **S40-C2=A** (`s40-evening-music`) or **S40-C2=B** (`s40-evening-friend`) shows exactly its original prose. Both now enter shared `s60-intro` in a [later S60 Draft step](m3-s60-fidelity.md), replacing unpublished `s64-after-m3-end`. There is no fabricated fallback when neither S40 choice exists; N1 replay/provenance must reject malformed saves.
- Earlier unpublished Draft snapshots at `s40-after-m3-end`, including saved actionLog positions, can fail restoration. Use explicit Restart if necessary; no silent save migration, deletion or prior-game save import. Browser Back history is runtime-local and does not persist across reload.
- Original manuscript is the source of character and location facts, not a grant to collect location, publish material, send messages or access device recordings. **Economy & Monetization OFF**; no premium/payments/ads. EN still falls back to RU.

## Tests and release gates

- New S64 TDD static checks: **RED 0/3** when absent, **GREEN 3/3** after implementation. Updated S40+S64 static regression **6/6 PASS** with hashes, authored choices and old endpoint removal.
- Historical real N1 Alice test correctly failed before updated expected path (`unmapped choice s64-c1-choice`, exit 1, 0/1 PASS), because the previous Draft endpoint was removed. The focused authentic N1 Alice/Eric/Nick/Damir regression, with both S64-C1 outcomes, both S40-A/B callbacks, Back/JSON and forged-state zero-write, passed **4/4**, 0 fail/skipped, exit 0 (`duration_ms=116975.304111`).
- Independent read-only code review: **0 Critical / 0 Important / 1 Minor**. The Minor is that permanent S64-specific negative tests check a forged additional S40 flag but not every forged S64 career flag or modified S64-C1 actionLog. Reviewer separately ran an authentic S01→S64 N1 probe and observed fail-closed with zero writes for six forged snapshots (missing S40 callback, both career flags, disabled selected career flag, changed/deleted S64-C1 actionLog, modified route lock). This is extra read-only evidence, **not persisted regression coverage**; Minor deferred for a later hardening pass.
- Full `npm test`: **215/215 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo, exit 0, `duration_ms=1498384.554413`. Local evidence only; not GitHub CI or platform approval.
- Manifest story SHA-256: `ea5764e75b5ef57a5662c3ecdb79264a0a28572203c38eda337d1eb2e58e7b52` (reverify before commit).
- Studio schema/trust compatibility **BLOCKED**; current Yandex/VK exports and receipts, device/browser Save/Reload, media-rights clearance, complete EN translation, GitHub CI, moderation and publishing **NOT_RUN**. PR #2 remains open **Draft**, no merge/release.
