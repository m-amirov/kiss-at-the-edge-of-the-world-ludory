# M3 — S26 «День 12. Назвать своё направление»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-06.md`, S26 lines 755–947, followed by the technical-state appendix. Neither the source manuscript nor the Ludory framework was modified.

## Authorial fidelity

All **25 prose blocks / 66 unique paragraphs** (including mutually exclusive choices and callbacks) are transferred verbatim. Each SHA-256 covers the exact player-facing `dialogue` paragraphs joined with `\n\n`; headings, branch metadata and technical transition notes are not dialogue. A single route displays only its chosen subset.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s26-intro` | 3 | `33d6c4045543d0b4c07fb788aebc33dbcdc8127a3fe26fc74bfea3482b8bd296` |
| `s26-choice-eric` | 6 | `9390d5030e110f9c56fb89188382a7031175efdc9157e7edde565de554de27e9` |
| `s26-callback-eric-nick` | 5 | `65ff114ec3bea788393811ce5727db6e48b054e471664d86a9a89dba78c78d5c` |
| `s26-callback-eric-damir` | 3 | `6dddf0c6f7a3e0a08a5bb10f2b612ba2f156d0a4e0fa7e068768ce1d19daf97a` |
| `s26-callback-eric-eric` | 1 | `035abeedba68d2031c8d748e622dbcc306ad3b9d3f0978c905e2e77412074f7b` |
| `s26-callback-eric-self` | 1 | `dea08d300f6539f712cad3d166cee8df11d3cb9c4c5e69b5ae91b5ba728834d3` |
| `s26-common-eric` | 1 | `366d34931f9508c455f9e5a60d61e039feb0cedb664707849ffca567af59275f` |
| `s26-choice-nick` | 6 | `f08f065b90632b9fa60a62cbed6e24224fb56dbd465bb108bd84cd00d1a9b21e` |
| `s26-callback-nick-eric` | 4 | `8287d960b11b349c2c70293c1191a7e74d691a23829d52b8e0a6f0af201c6a9a` |
| `s26-callback-nick-damir` | 3 | `09bbda192df1d0b52e7df6e13d9023a97d634802cae762be09c26840fa5fd9ff` |
| `s26-callback-nick-nick` | 1 | `67648d0cb5c5becf6eabf3998a3ec25bbf28363ddc7886eaaabf9787e12c6ba9` |
| `s26-callback-nick-self` | 1 | `04f4bbe604e363f28133a0661b3c540fe05effa35a055626733c5c9b392ef707` |
| `s26-common-nick` | 1 | `268c6bf2e7c19843fba17281f0973ce41aed5fde131572d376ba4c5bd4b5ada5` |
| `s26-choice-damir` | 5 | `b8e3f6c52c11eb1c876a8a9267d0a374cd76392961fe4f6c41eff7aac6ffeff4` |
| `s26-callback-damir-eric` | 4 | `39452a9a17394a545c8f5d97e78e3e88096bf221e8e95bf258950fad5e4fcec1` |
| `s26-callback-damir-nick` | 4 | `afa8af860422c3fe66c1f3cda0886dfdc1bbdc63940ce20e042bd8781cc35740` |
| `s26-callback-damir-damir` | 1 | `af900a7869c2337fd63a5a7d5530ae539e66f860a15d3bd55b8e205f00d0ebbb` |
| `s26-callback-damir-self` | 1 | `aa50e674f5a230f07f9d7ffe915a6773e6b77f2d3c011469b5fff51897b22bd0` |
| `s26-common-damir` | 1 | `61f91ee061a2934c7fb426edc4d4827e522a968e0ae8c3c79d211488a6494384` |
| `s26-choice-alice` | 3 | `d6a91ff64e01420f2e7c3b44e6b626d3bc157149cb9107b78e9bd10d2d820d24` |
| `s26-callback-alice-eric` | 3 | `172e3fe1d4bc24a21418438add530f64d0f472342c99710d55f185884e475322` |
| `s26-callback-alice-nick` | 3 | `7f44a0893ea194177289b26f270f81bbc640b5dda38e80507dd709e63f5a28bc` |
| `s26-callback-alice-damir` | 1 | `b81bbe668f5bf3a1c895a8d2da5bf04e399b36c781a0cfd6f308e6c7b0945f20` |
| `s26-callback-alice-self` | 1 | `fcd31a13281818869a3f6e833ffbe28b4f79df17c7c4d046e5d1624a949794b0` |
| `s26-common-alice` | 3 | `fed4e0f9886084ae6a406e31d083fbd8ca6a12b08fb94bcdeb37cde2bd2df200` |

## Route choice and authorial boundaries

- Every S58 outcome now flows into mandatory `s26-intro`; the former `s58-after-m3-end` Draft-only marker is removed.
- The free, unconditional S26-C1 establishes exactly one of four route intents: **Eric, Nick, Damir or Alice (independence)**. Each option has paired native N1 `route_intent` and `route_lock` effects with the same identifier. This is the first genuine route lock; no prior evening, shopping choice, contact or numerical score controls availability.
- After one route's main prose, a route-specific guarded, effect-free N1 Continue selects one of **four** callbacks reflecting the authentic S17 evening: Eric, Nick, Damir or Alice alone. Exactly one callback displays before the chosen route's common continuation. [S27 migration](m3-s27-fidelity.md) removed the temporary `s26-after-m3-end`: all four routes now reach shared `s27-intro`, then mandatory [S59](m3-s59-fidelity.md), before the current non-release `s59-after-m3-end` pending the day-14 route chapters.
- The source explicitly separates willingness to try a relationship from permission for physical touch: Eric asks before and receives a present-tense yes; Damir accepts a present-tense refusal; Nick does not record the tender moment. Alice's own route remains a legitimate outcome. No existing video, private text, smokehouse audio or quote gains permission to publish.
- Earlier S25 interview news is an invitation to **interview**, not job acceptance or relocation. No first-game currency, premium content, rewarded ads or IAP, even on the four S26 routes.
- Native N1 `route_lock` records the chosen route but does not infer route ownership from future scene IDs: episode 7+ route branches must explicitly gate by their route identifier. The current paired effects and replay checks keep `routeIntent` and `routeLock` consistent for S26. Back history is in-memory and is intentionally not restored by loading a JSON save; saved route commitment itself is replayed and checked.

## Editorial and release gates

- Unpublished Draft saves stopped at deleted `s58-after-m3-end` may require explicit Restart. We do not rewrite old save state or skip S26.
- S26 and the shared [S27](m3-s27-fidelity.md) and [S59](m3-s59-fidelity.md) are migrated; the exclusive route paths from day 14 through episodes 7–10 remain to migrate. Current Studio component schema/trust is incompatible; current Yandex/VK ZIP receipts, EN translation, portrait UI, real device Save/Reload/Back, artwork/media rights, GitHub CI, platform moderation and publication remain **BLOCKED or NOT_RUN**.

## Verification

- Test-first RED from missing `s26-intro` (0 of 3 expected paragraphs) and obsolete `s58-after-m3-end`; after implementation static exact-text/graph/guard tests **2/2 PASS**.
- Focused N1 result: **5/5 PASS, exit 0, 319.08 s** (`node --test tests/m3-s26.test.mjs`). The matrix exercised all four earlier evenings × four S58 grocery choices × four independent S26 routes (**64 cases**), Back, JSON resume, rejection of unavailable callbacks and forged route state/actionLog. The forged-state tests explicitly check zero calls to `setState`; ordinary rejected action tests check serialized state equality.
- Independent read-only reviewer verified all 25 prose blocks/66 paragraphs against the pinned manuscript and 23 selected fast static regressions (**23/23 PASS**), with no Critical or Important finding. Minor future coverage improvements: count `setState` for ordinary unavailable actions and explicitly test choosing a different route after Back.
- `game/src/story.js` SHA-256 `a2af3b4471f8e821c9168a0fb40ba03a071fcab23a5e65552a37d1bca27e3b56` is pinned in `game/narrative-assets.json`.
- Full `npm test`: **145/145 PASS, 0 failures, exit 0, 683.86 s**. `node --check` for `story.js`, S26 scene and S26 tests: exit 0. `git diff --cached --check`: exit 0. Independent static review: **PASS**.
- **16/16 code-and-document blobs** uploaded to the existing open Draft PR #2 branch with local Git blob SHA-1 parity. Remote commit `905efc556a0880b8940a16bd0613653b9f6a5b3f` has code tree `9b899318ebf325f6b07c6068429fe613d4ab09d7`, independently verified after `git fetch` against local tested HEAD tree. Branch was moved without force from exact expected head `74f24af7c22539e10d50396bd03ea19d43ac731d`; base `main` remained `57296cdc0132e007342ed04644025a40b2f5f16b` at upload. GitHub combined status API returned `statuses: []` (**CI NOT_RUN**, not PASS). Separate documentation-only evidence closure follows. No merge, publication or release.
