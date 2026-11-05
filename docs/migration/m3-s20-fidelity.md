# M3 — S20 «День 10. Дамир покупает незнакомое»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-05.md`, S20 until S21.

## Verbatim authorial proof

All **10 original prose blocks, 55 paragraphs** are preserved without paraphrasing. Independent SHA-256 proof uses each block's paragraphs joined with `\n\n`; metadata, headings and technical transition text do not render.

| Ludory block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s20-intro` | 35 | `29919083b876aa85b506415a5e567de3975d464758616e201f49f30ba63e00fb` |
| `s20-kiss` | 5 | `7e211abe9001fbf0212d559e699e0f155a81b0efd240a0682c88fd9106cd6f11` |
| `s20-tea` | 3 | `28970eede9120d901e29ab48e0acaeb444db33564f30bec797357edc6c556a27` |
| `s20-leave` | 5 | `cb303cbc880421b35417d781362dbfe722bd3f9809085b109f3bb278505914d4` |
| `s20-common` | 2 | `ea2a07c34d9ec97637e5c0ca8adec2a1678ed69ffb4fb109a2a07b3d6f9954a7` |
| `s20-k` | 1 | `d753813531e98e7e77d3f5978551ca2b49509f2c6b65207c754ae23e28dab42e` |
| `s20-t` | 1 | `962a8fd772cb61f51d1bbfb00636aed9efc2d8e6fa6a4b05b2dec81c34b757fd` |
| `s20-l` | 1 | `7e2878b6fab1d568df5275291aa3843e382e622fe4181c0050d493b717b0990c` |
| `s20-breakfast` | 1 | `5d2631b97b9bfcfc872338ec630a16039a52c2879e2a9ab1c9b2549c79dc727e` |
| `s20-waterfront` | 1 | `d2024cb4b66a74814df52afb7985d2ee42bd9ab12422e8b7031fe64e84b02633` |

## Routing, consent, editorial anomaly

- Only S17-C2 Damir enters `s20-intro`, replacing the former `s20-m3-end` placeholder. Eric S18 / Nick S19 remain unchanged; after the separate [S21→S61 migration](m3-s21-s61-fidelity.md), self enters `s21-intro` then mandatory S61. After the full S20 text, a **new `s20-after-m3-end` technical Draft boundary** stops before unfinished S22. Older Draft saves pointing at removed placeholders may need explicit Restart and cannot silently bypass content.
- **S20-C1** is a three-way free choice: consensual *new* kiss (`damir-dinner-new-kiss`), tea without physical contact (`damir-dinner-tea-without-touch`), or leaving the conversation (`damir-dinner-leave`). A later day-11 callback depends on exactly one of these flags; guard-only options have no new side effects. The kiss is neither an automatic reconciliation nor standing consent, and non-contact never blocks Damir's future route.
- **S20-C2**: shop together for the group's next breakfast with group preferences (`damir-followup-shopping`) or walk by the water without discussing their previous relationship (`damir-followup-waterfront`). The authored S20-C2 appears **after** the technical “Утром дня 11 — S22” note and is omitted from the scene's metadata “Доступ” and the episode's final technical-state table. This source-level chronological inconsistency is documented; we preserve both authorial answers after the day-11 C1 callback, before the Draft ending, without inventing connective prose.
- S20 does not set `routeIntent`, `routeLock`, romantic points or reconciliation state. No new media publication rights, premium currency, paid scenes, rewarded ads or IAP. First-game Economy OFF; route lock remains at S26.
- Combined technical guarded navigation remains Ludory N1's existing `Продолжить` requirement, not an added authorial decision.

## Verification

- **TDD RED** recorded before integration: absent `s20-intro` (0 vs 35 paragraphs) and S17 Damir still targeting old `s20-m3-end`. Static source+graph tests now PASS.
- Focused real N1: `node --test tests/m3-s20.test.mjs` **5/5 PASS**, exit 0, 50.98 s. Covers all 3×2 dinner/follow-up paths, real S17 Damir provenance, prior Damir care and Nick private-text pending flag, forbidden guard options, Back undo, fresh-runtime JSON restore, invalid choices, forged/missing flags and edited/truncated actionLog. Tampered saves produced **zero state writes**, with the submitted invalid JSON unchanged. `routeLock=null` on all branches and no implicit reconciliation.
- Independent **READ-ONLY** review: **0 Critical, 0 new functional Important, 0 Minor**; **one Important source/editorial blocker**: placement of S20-C2 after S22, with a next-breakfast proposal after a day-11 morning scene. Reviewer compared **55/55 unique paragraphs character-for-character** across all ten blocks, checked the single S17 Damir external entry, three guarded effect-free callbacks, both C2 choices, invariants and manifest digest. Independent focused N1 rerun **5/5 PASS** (about 53.9 s). The source chronology requires an explicit authorial decision before the full-story release gate, but does not justify silently changing the pinned text during migration.
- Full local regression: `npm test` **108/108 PASS**, exit 0, **327.08 s**. Includes all previous S01–S19 tests, S17's four group/evening options, S18 Eric's 3×2 paths and S19 Nick's 3×3×2 paths, all S20 checks and the historical S65/S66 migrations. No stale S20 technical-boundary expectation remained.
- Syntax/whitespace/digest: `node --check` on story, S20 and its tests, `defineNarrativeGraph(graphData)`, `game/narrative-assets.json` SHA-256 and `git diff --cached --check` all PASS.
- GitHub code evidence: existing PR #2 remained **open/Draft** on unchanged `main@57296cdc0132e007342ed04644025a40b2f5f16b`. Previous head `e27181eee6355ea917ff0d4b3ddf8a0bc02d483a`; **13/13** uploaded blob SHA-1 exactly matched local committed Git blobs. The remote code tree `b105babe89107c07dcfc337aba592f5459af7370` was identical to the locally tested tree; remote commit `da93858a8c5ac1203346013262a19a3d3a9e604c` was installed via expected-head **fast-forward CAS, no force**. An independent `git fetch` confirmed exact code HEAD and tree SHA. GitHub combined statuses returned `statuses: []` = **CI NOT_RUN**, not PASS. PR stayed Draft/open and was retitled S01→S20; no main merge or publication.

The subsequent **documentation-only evidence closure** changes no `game/` or `tests/` files. Its tree and Draft head are checked independently after upload.
- Current `game/narrative-assets.json` SHA-256 of `game/src/story.js`: `481945bb61a4de3df50077e83858a44fe148695c82b7594c2f3f30869c08c75d`.

**Unpassed release gates:** resolution of the source's S20-C2 chronology by the author, Studio trust/schema, current Yandex/VK ZIP with receipts, real browser/mobile Back/Save/Reload, EN localization, art/media rights, GitHub CI, platform moderation/publication. No merge to main, release or publication.
