# M3 — S21 «Письмо, которое не просили писать» → S61 «Вещь без назначения»

**Pinned canonical source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-05.md`, S21 and S61 before the episode's technical-state section.

## Exact prose

Together S21/S61 display **21 original authorial blocks and 56 paragraphs**, of which S21 has **11 blocks/22 paragraphs** and S61 has **10 blocks/34 paragraphs**. Exact per-block SHA-256 was independently derived from the pinned manuscript by joining displayed paragraphs with `\n\n`.

| Ludory block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s21-intro` | 7 | `95ceab405aeca833ca7a0c99279117c63a192742fe13ce865c9be05887d3a31e` |
| `s21-choice-note` | 1 | `3bf2eb7da426371f27cb0316cec857f905b61615568a7b3854ffe3c77a452e8c` |
| `s21-people` | 2 | `1d50e9a0c1c6c99278c6d6c6627746c4480c82a235bab1b06463c241de32c422` |
| `s21-place` | 2 | `607f90bec2dcbeb5530f7e389eeb4d9aa6181d89a58af6cc61f00add815259f5` |
| `s21-own` | 2 | `1a4f97ed734b6cdfabb219b15e5882489de575c71b478ec2fe6f420e5ec1de8a` |
| `s21-common` | 3 | `96527bb1606634a1b75007f2a7320cf193c5f08a00f28107a7d561727a866131` |
| `s21-m-a` | 1 | `adbb1de2f55cfb681ae4c0701f9321ede76ec57a194662e503064e680ecf33a6` |
| `s21-m-b` | 1 | `0a7a5bfbd70051b14224d55a7fb1db06f49780430268e2730831ad267dada303` |
| `s21-m-c` | 1 | `579260ed9d1675506b63cc41ff011055d03cd5f942ec9b4c40d8f9c1e8ee44d9` |
| `s21-friend` | 1 | `36e329b5ce53f8cf2a8cfa386b4916d76dce30498fdffa85c15454ca9d8a795f` |
| `s21-bookstore` | 1 | `c847dd40fb4bb9a660eb872170d80848fab9948e7365c315cbb5a02bf6f2ca4b` |
| `s61-intro` | 12 | `182c62d6e1408e64975cfbe9f2f976216ce62d73bf88dd3cc6dfa2645c78268d` |
| `s61-r-a` | 3 | `ecd0d644a8b6c29f6052c1bdaab090826ab16bdefc7d3e1c08aa477240063b7f` |
| `s61-r-b` | 3 | `3110efaee49def0791b08f2e7180be796035f41dd496ec7653118a458725c2eb` |
| `s61-r-c` | 3 | `8429dd08ea62838ac30095035cc42ad62a27b389f6bab3b2956ad2a149c3618d` |
| `s61-common-a` | 2 | `0d592659e615710a395040910dcfd925ffa3f91f2fadc6cbee651f501eb87fc1` |
| `s61-stay-alone` | 2 | `2298f45a17c17997f42b004db8552098cf92a81f92dde7dce64656c75aad284c` |
| `s61-rejoin` | 6 | `6287d641287cb6caa82d47aeff25c435b9aa5927458ec6b216269a1e9736d556` |
| `s61-common-b` | 1 | `4c97b4f454b3b39f994d0482c24c9b69b30f23fffd30bbb8ad87ecaaff126dbc` |
| `s61-friend` | 1 | `49441a907470c78a1f3ffcfbb7a0a7cf010154d11d1e78573781c13412652a54` |
| `s61-bookstore` | 1 | `1f50576df27cd447b8741a200d4ccc4c5d7609c11e89d153ef251509d82eca3c` |

No metadata, headings or technical stage routing is presented as dialogue. The source's one-line authorial instruction immediately before S21-C1 — “Каждый вариант отправляется, а не остаётся бесконечным черновиком.” — is **kept as its own one-paragraph displayed block**. The inline `Утром дня 11 — S22.` suffix in S61's final shared paragraph is classified as technical transition text and omitted only from that block, preserving every preceding authorial word. Its SHA documents the resulting player-facing text.

## Scene logic and source anomalies

- The **S17-C2 self** choice now enters S21, not the old `s21-m3-end` stub. Other evening routes (Eric S18, Nick S19, Damir S20) remain unchanged. Every valid S21-C2 outcome **must** enter S61; there is no bypass or invented S21 ending.
- **S21-C1**: three explicitly sent letters to editor Marina, starting with people, place, or Alice's own professional decision. The specific flag `alice-letter-people|place|own` determines exactly one guarded day-10 editorial response in S21 and later an effect-free corresponding S61 telephone conversation. Sending an author's own editorial draft does **not** provide publication rights for any private conversations, share a joint draft, or alter prior `private-text-pending`.
- **S21-C2**: a private message to Alice's friend (`alice-self-friend`) or finding a bookshop for herself (`alice-self-bookstore`). Both decisions then converge to S61, and each has a distinct guarded authorial response after S61's shared day.
- **S61-C1**: stay alone for one more hour or rejoin the group now, with exclusive `alice-day-alone-longer|return-to-group` provenance. Neither choice is a romance lock. All twelve S21-C1 × S21-C2 × S61-C1 combinations reach the same technical boundary after their exact callbacks.
- Source editorial anomalies: S21-C2 was appended **after** the technical `Далее — S61` note and is absent from S21's metadata and final state table. Its S61 response blocks were appended **after** the source's `Утром дня 11 — S22` inline marker. They are shown before the technical boundary, in preserved authored order, without inventing a missing day or overwriting prose. A chronological editorial decision is required before full-story release.
- Only S26 can lock a route; S21/S61 remain a genuinely independent path. No romance points, premium choice, earned/purchased currency, IAP, rewarded ads or new publication consent. Technical guarded `Продолжить` buttons are Ludory N1 navigation, not additional authorial choices.
- Former `s21-m3-end` deleted. The subsequent `s61-after-m3-end` was also removed by the [S22 migration](m3-s22-fidelity.md): both S61 endings now enter common `s22-intro`. [S23 migration](m3-s23-fidelity.md) removed `s22-after-m3-end`, [S24 migration](m3-s24-fidelity.md) removed `s23-after-m3-end`, [S25 migration](m3-s25-fidelity.md) removed `s24-after-m3-end`, and [S58 migration](m3-s58-fidelity.md) removed `s25-after-m3-end`. All four paths now pass through [S26](m3-s26-fidelity.md), [S27](m3-s27-fidelity.md), mandatory [S59](m3-s59-fidelity.md) and their own day-14 route chapters, including [S31/S62](m3-s31-s62-fidelity.md) for independent Alice; the direct `s59-after-m3-end` marker is removed. Old unpublished Draft saves pointing at removed IDs may require an explicit Restart; never silently skip content.

## Verification

- TDD RED recorded before implementation: S21 intro absent (0 versus 7 paragraphs), and S17 self still targeted `s21-m3-end`. Static source/graph checks now PASS.
- Initial focused real N1: `node --test tests/m3-s21-s61.test.mjs` **5/5 PASS**, exit 0, **68.74 s** (before additional adversarial day-state regression). Covered all **3×2×2** sent-letter/self-activity/return decisions, each guarded S21 editorial reply and S61 call, each S21-C2 callback after the S61 shared paragraph, invalid/forbidden options, Back reversibility, JSON restoration in a new N1 instance, prior `private-text-pending`, `routeLock=null` and economy OFF. Forged/conflicting/missing sent-letter flags and manipulated/truncated actionLog were rejected with **zero state writes** and unchanged invalid JSON.
- Additional adversarial N1 regression for S61-C1: forged/conflicting/missing `alice-day-alone-longer|return-to-group` flags and manipulated/truncated day choice actionLog all fail closed, with **zero state writes** and no mutations of invalid input. Targeted `node --test --test-name-pattern='forged S61-C1 day' tests/m3-s21-s61.test.mjs`: **1/1 PASS** (24.17 s). Added after independent review identified that specific coverage gap.
- Final focused `node --test tests/m3-s21-s61.test.mjs`: **6/6 PASS**, exit 0, **116.56 s** (run alongside the full regression suite); covers both independent forged-state tests.
- Independent read-only source/graph review: **0 Critical/Important functional issues and 0 manuscript mismatches**. Independently verified **21/21 blocks, 56/56 paragraphs**, mandatory S61, guard/letter correspondence, privacy and route invariants; separate N1 reproduction **5/5 PASS**. Its sole Minor (adversarial S61 day-state coverage) is addressed by the extra regression above. Editorial source anomalies remain open release blockers.
- Full `npm test`: **114/114 PASS**, exit 0, **346.37 s**, including the additional S61-C1 adversarial regression. S17/S18/S19/S20 regressions and S01–S16/S65/S66 all pass on the final code and test tree. `node --check` for S21, S61, story graph and new test: PASS; `git diff --check`: PASS; story SHA-256 matches manifest.
- GitHub **16/16 blob SHA-1 parity PASS**; independently fetched remote code commit `cccf031afa84eccbc318545223dfa4cedb5faec3` matches the exact tested local/remote tree `57149ce89f3a02942044233a591d86fc9a36fa62`. Non-force, expected-head CAS updated the existing `feat/m2-canonical-s01` ref; existing PR #2 remains **OPEN/Draft**, still based on unchanged `main` SHA `57296cdc0132e007342ed04644025a40b2f5f16b`. GitHub combined statuses are `[]`: **CI NOT_RUN**, not passing CI. No merge, production export or publication took place.
- `game/narrative-assets.json` story SHA-256: `85016a5510d6f0370c37e1aafc3127adfbf1b4b184749f9a135b17dc50ca70d4`.

**Unpassed release gates:** editorial resolution of S20-C2 and S21/S61 appended chronology, Studio schema/trust, current Yandex/VK SDK ZIP+receipts, actual browser/mobile Back/Save/Reload, English localization, art/media permissions, GitHub CI, moderation and publication. This is not a release or a main merge.
