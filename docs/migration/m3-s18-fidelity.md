# M3 — S18 «Маяк. Эрик и неотправленная открытка»

**Pinned canonical source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-05.md`, S18 before S19.

## Manuscript fidelity

S18 has **ten displayed authorial blocks and 74 unique paragraphs**. Technical headings, route tables, authorial option headers and transition annotations do not become dialogue. The SHA-256 values are independently derived from the pinned original by joining each displayed block's paragraphs with `\n\n`.

| Ludory block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s18-intro` | 47 | `1a8f310d3ec380cf3b8b9f1037c8bdc26e39f74539ec2ac9f0c0e7b1c5b7f74e` |
| `s18-kiss` | 6 | `1f97e5d697c120ff7b6118b0c3cd33c438b978a1ab783a3fc642b9599d73f132` |
| `s18-stay` | 6 | `9c7d14d16b929a07a6996aa3d88d3ffb6c96661957ad59af5116ae6970a8b13d` |
| `s18-leave` | 5 | `a4a8125248fbfab730b1142742a7ad8a92d4dbf90567fb9662bbb560c415f87c` |
| `s18-common` | 5 | `4453fd79a235203c4fb0877b76a7f4992a6df3c5281bd47b6baf4ef95aa1530f` |
| `s18-k` | 1 | `d46249c96219fe6143a62a91403ee0d7d4ccd4e5430c2fb93ce8afc0b7275fec` |
| `s18-s` | 1 | `12929190af9419a45c8aaa189beffeb2652e2b74bcc427072bc8d61a28a78b54` |
| `s18-l` | 1 | `5baeffc1738a3349fde57dcc32fa4d852a50b50c18e8d91af0a7abed44d117ac` |
| `s18-postcards` | 1 | `9dfed869967ae2993666dcc3cc853661fcd6bf757fa6b6e0a6f3d83e6e92aa77` |
| `s18-song` | 1 | `614a412bae9ae6640379e328bf29c4cc5932012dadfbdb51c14cb05068848b3f` |

## Conditions, consent and source anomaly

- Only S17-C2 Eric enters `s18-intro`; the remaining Nick/Damir/self paths remain technically bounded and untouched. Former temporary `s18-m3-end` removed; new `s18-after-m3-end` is an explicit incomplete Draft after the authorial text. Older Draft saves pointing to the removed node may need explicit Restart, never silent deletion.
- **S18-C1** has three fully authored outcomes: kiss after a specific request and affirmative answer; stay together with a declined kiss; or end the walk. None is treated as an automatic promise, partner lock or an entitlement. Exclusive provenance flags `eric-contact-kiss|stay-without-kiss|leave` select exactly one guarded, effect-free callback on day 10.
- **S18-C2** has two free manuscript responses (ask about grandfather's postcards or offer Eric the music selection). The original places this choice *after* the technical instruction “Утром дня 11 — S22” and omits C2 from S18's header and final technical-state table. This is a **source-level chronological/editorial inconsistency**. We preserve the authorial order and all supplied paragraphs after the C1 payoff, before the Draft boundary; no unapproved rewrite or relocation.
- No romance points, S26 route lock, IAP, earned/purchased currency, rewarded advertising or new editorial/media rights. Prior Nick audio permission remains pending.

## Verification

- TDD RED before integration: `s18-intro` absent (0 versus 47 paragraphs) and S17 Eric path still targeted `s18-m3-end`.
- **Focused real N1:** `node --test tests/m3-s18.test.mjs` **5/5 PASS**, exit 0, 53.59 s. Covered all 3×2 contact/follow-up combinations, invalid options, Back undo, fresh-runtime JSON continuation, forbidden guarded callbacks, forged/missing flags and actionLog manipulation. S17 Eric provenance, Nick's pending media consent and `routeLock=null` are preserved.
- **Independent READ-ONLY review:** 0 Critical, 0 Important, 1 Minor. All 10 prose blocks (74 paragraphs) matched pinned source bytes and SHA, old graph/catalog compared equal after the specific S17 Eric relink and old technical stub removal, and exactly one outer incoming edge exists. Minor deferred: the tamper rejection test does not count `setState` calls or compare complete saved-state snapshots; it proves rejection, not full no-mutation semantics. No runtime defect was found.
- **Full local regression:** `npm test` **98/98 PASS**, exit 0, **321.28 s**. All S01–S18 tests remain green, including prior S17 callback matrix/16 group-evening combinations and S18 N1 routes. Syntax and Git whitespace checks are recorded separately; remote tree and CI status require an actual upload.
- **Local syntax and whitespace:** `node --check game/src/story.js`, `node --check game/src/scenes/s18.js`, `node --check tests/m3-s18.test.mjs`, `git diff --cached --check` all exit 0. Manifest digest matched the code source.
- **GitHub code evidence:** PR #2 remained open/Draft with base `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. Initial feature head `cd7e4c66c7d044d7b9718192748e8b8aba8a8324`; **9/9** uploaded blob SHA equal local committed Git blob SHA. Remote code commit `ea472ecf91e3456400af50fba6a9703ec7fc7c0d` was fast-forwarded by expected-head CAS without force. An independent Git fetch confirmed that its tree `a52b587bd2114286d615b705e55ae7d59f733cb0` equals the locally tested tree of `4714883f0389b858c9a5af560fb20de2ca9bda6c`. Combined GitHub statuses returned `[]` = **CI NOT_RUN**. No `main` merge or publication.

Subsequent documentation-only closure records this evidence without changing `game/` or `tests/`; its remote tree is checked separately.
- `game/narrative-assets.json` tracks the SHA-256 of `game/src/story.js` (`7f407a166cce8ce436ec26d127f7c279b13bada135f7a6b9d12944a67314b1bf`).

**Open release gates:** Studio schema/trust, current Yandex/VK ZIP+receipts, real browser/mobile Back/Save/Reload, English localization, art/media rights, GitHub CI, platform moderation and publication. These are NOT_RUN/BLOCKED; no release claim or main merge.
