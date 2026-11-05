# M3 — S22 «День 11. Дорога, которую нельзя обещать»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, S22 through the S23 header. The original pinned source and framework are read-only.

## Exact authorial prose

The displayed S22 story has **10 authored text blocks, 60 paragraphs**. The independent SHA-256 inputs are original paragraphs in each block, joined by `\n\n`. Metadata, S05 callbacks/choice headings and technical transitions are not displayed as dialogue.

| Ludory block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s22-intro` | 12 | `ef8ea8f4bd8e3a9b8ada9cad206175d7f38e4056949fdb35b69349a52082dc44` |
| `s22-weather-nick` | 5 | `456aff15fdb535bd9d84de36195a1b28193447e660cfd95dd7a60032117cf405` |
| `s22-weather-erik` | 5 | `a42354e30f6ebb41e11f6b45b9e6670bc15ee3302e79171aaf1216277fcfac02` |
| `s22-weather-damir` | 4 | `9826b7e310b3d6f5ad1fa8f1966779b22988e8dc49782b2b63a67e39ff808a97` |
| `s22-common-a` | 21 | `5afe233b322eeb6002b246d46c9182872cedd6f7f707bf9a34f1de7789cb257c` |
| `s22-repair-roles` | 3 | `6c56752741db15872137edef11df041b2dec13296f7e0175dc1d4eb459b0bcb4` |
| `s22-repair-anger` | 4 | `b2939bb12e0dddd2bb60ea893ccfd73a9f9617d015548d09b25642035226ca89` |
| `s22-common-b` | 4 | `b4ccc4dafdfca99b089679abed340a6ebbc2757c719c8f98667dc0193c730629` |
| `s22-stop-group` | 1 | `8c6e735c862ed4113e54c3b34adf2b57edff08553b8c78c1d79714a643d9f914` |
| `s22-stop-notes` | 1 | `116373e081a68be9650de18af3efe1fe2f87993e79a4350235e5fb1cc9a76fab` |

## Choice and state contract

- Four previous exclusive evening/day arcs — Eric S18, Nick S19, Damir S20 and Alice S21→mandatory S61 — enter exactly one `s22-intro` after their full authored endings. Old `s18/s19/s20/s61-after-m3-end` placeholders are removed. All prior evening, consent and professional decisions remain in their own flags; no new route lock.
- S05-C1 `weather-choice-nick|erik|damir` selects exactly one **effect-free** callback, before the shared calls and road detour; an input action cannot select another callback.
- S22-C1 is **free** and exclusive: `s22-repair-roles` means Alice explicitly accepts her own calls/promises without promising for others; `s22-repair-anger` means she names her anger and corrects deadlines. Both retain the original different deadline for Marina, available for the S23 authorial reply. No numerical `repairDebt`, points or penalty for the previous weather decision are introduced.
- S22-C2 is **free** and exclusive: `s22-stop-group` (water stop with the group) or `s22-stop-notes` (a brief private notebook pause). This is not a transfer/publication of private notes or consent to distribute footage. After [S23 migration](m3-s23-fidelity.md), both options now enter `s23-intro`; the former `s22-after-m3-end` Draft boundary was deleted.
- **Source editorial question:** S22-C2 is appended **after** a shared paragraph describing evening arrival and return to the guesthouse, and not enumerated in the initial S22 access heading or end-of-episode state table. The authored text is preserved in original order; a chronology decision is required before release (no invented intermediate day or explanatory line).
- Previous editorial chronology questions for S18-C2, S19-C3, S20-C2 and S21-C2/S61 remain unresolved. Old unpublished Draft saves pointing to removed technical IDs may require explicit Restart, not silent skipping.
- No video/teaser/publication permission, premium choice, wallet, purchase, rewarded ad, IAP, route intent or romantic affection score. The game stays fully free on `narrative-interactive` 1.2.2.

## Verification

- TDD RED: missing S22 text (0 vs 12 intro paragraphs), old S18 technical ending rather than S22. Static source/graph tests then GREEN (2/2).
- Real N1 3 weather callbacks × 4 evening routes × 2 S22-C1 × 2 S22-C2 = **48 combinations**, Back and fresh-runtime JSON, denied action options, forged flags/actionLog with **zero state writes**: focused `node --test tests/m3-s22.test.mjs` **5/5 PASS**, exit 0, **179.90 s**. Original author's textual paragraphs and flags were checked on real displayed scenes.
- Independent **read-only** reviewer: **10/10 blocks, 60/60 paragraphs exact**, all SHA-256 identical; checked every S18/S19/S20/S61 entrance, S05 guard, S22 C1/C2 and privacy/route/economy invariants. **0 Critical and 0 Important implementation defects.** One **Important editorial chronology blocker** (S22-C2 appears after evening arrival and asks to stop by the car/road) cannot be resolved by changing authorial order without approval; the current Draft preserves it exactly. **Historical Minor at S22 time:** Back and new-runtime JSON after C1 were verified, but fresh-runtime JSON after C2 was not separately tested. [S23 regression](m3-s23-fidelity.md) now covers the post-C2 JSON seam (S23 focused 6/6 PASS); real browser/device Save/Reload remains untested. Reviewer independently reran S22 focused **5/5 PASS** (197.97 s).
- First post-S22 full `npm test` **118/119 PASS** (351.48 s) exposed a pre-existing S17 test expectation for the removed `s18/s19/s20-after-m3-end` technical placeholders. This was a stale assertion, not an N1 runtime path fault; reproduced in targeted RED (0/1), updated to expect removal, targeted GREEN **1/1 PASS**. **Final repeated full `npm test`: 119/119 PASS, exit 0 (328.45 s)**. `node --check` for S22, story and new tests: PASS; story SHA-256 matches manifest; staged `git diff --cached --check`: PASS.
- GitHub **17/17 SHA-1 blob parity PASS**; code commit `ec0757bbf1c552885eba828a18269dd0498aa89b`, independently fetched remote code tree `432715edfbacf2451380b3fc12c2c1586ee74aec` exactly equals the locally tested tree. Non-force expected-head CAS moved the existing `feat/m2-canonical-s01` ref; PR #2 remains **OPEN/Draft**, with unchanged `main` base `57296cdc0132e007342ed04644025a40b2f5f16b`. GitHub combined statuses `[]` means **CI NOT_RUN**, not CI PASS. No merge, ZIP export or publication occurred.
- `game/narrative-assets.json` story SHA-256: `afe32f4efbe4d86a9847e02a4c995655e8dd97ed5143b515a5ea8da305780cef`.

**Release gates not run/blocked:** editorial chronology, Studio schema/trust, current Yandex/VK SDK ZIP+receipts, actual browser/phone Back/Save/Reload, EN localization, art/media rights, GitHub CI, moderation and publication. This is an incomplete Draft scene migration, not a release.
