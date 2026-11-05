# M3 — S27 «День 13. Берег, который не попал в кадр»

**Pinned source:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-07.md`, original source SHA-256 `1d314cdf3ab937ed527f3cca476bf2a5190ff8c7d77d856986b519585af060a1`, S27 lines 5–47. Neither the manuscript nor the Ludory framework was edited.

## Authorial fidelity

All **5 unique prose blocks / 15 paragraphs** of this shared episode 7 scene are transferred verbatim. Hashes cover the exact player-facing paragraphs joined by `\n\n`, excluding the scene header, metadata and editorial choice headings. A single playthrough sees the intro, exactly one outcome and the common continuation.

| Graph block | Paragraphs | SHA-256 |
| --- | ---: | --- |
| `s27-intro` | 10 | `b6364b84ceeaa3bcc87237772bffd172ff44f632da7a9d29500d97b7136694cd` |
| `s27-work-inga` | 1 | `4afbe6408997871873962d872b676d177b09fd876c1f7ac7979377939a9f0e0f` |
| `s27-work-nick` | 1 | `9c04add1c39d36b7bfaf75347bcd4f50952754189058f4dbfeb29da5c66dd15b` |
| `s27-work-bags` | 1 | `670b169c2809bd7aaa90d05b591f03762e95f4b579fa2d92b2d6435cd0cd4f15` |
| `s27-common` | 2 | `d9603d574b0488a8f87bbddd2d0534bc306d07774f750b5966dd777e9e66d4d8` |

## Choice and persistent route

- All four S26 common outcomes lead to one mandatory `s27-intro`. The former non-release `s26-after-m3-end` was deleted; the S27-only snapshot had a temporary `s27-after-m3-end`. [S59](m3-s59-fidelity.md) subsequently replaced it with `s59-after-m3-end`; exclusive day-14 route chapters remain unported.
- S27-C1 offers precisely three free work choices: finish the walkway with Inga, assist Nick's camera without impeding work, or carry the bags and bring water. The branches are effect-free, converge on `s27-common`, and leave native `routeIntent`/`routeLock` set in S26 untouched. This shared scene is available even on Alice's independence route; no early romance-only gating.
- Inga authorizes a single filmed view of the trail but specifically limits people/portrayal. Alice asks permission for technical wording in the article. Neither action grants publication, model releases, additional rights, editorial ownership or a global consent flag. There is no upload or media artifact produced by this local narrative choice.
- The choice does not add first-game economy, premium content, rewarded ads, IAP, affection stats or a new S27 plot flag. The N1 actionLog records the selection for replay; a future scene may consume the choice only if separately supported by its authorial source.

## Non-release boundaries

- Old unpublished Draft saves at the removed S26 technical ending may require explicit **Restart**. Do not silently skip S27 or rewrite old state. The Back stack remains in-memory and is not restored across JSON reload, while route commitment is checked on replay.
- Studio schema/trust incompatibility blocks current export; fresh Yandex/VK ZIP receipts, EN localization, browser/device visual Save/Reload/Back, artwork/media rights, release moderation, CI and publication are **BLOCKED or NOT_RUN**. The project's first game remains Economy OFF.

## Verification

- Test-first RED: S27 intro absent (0 of 10 paragraphs) and S26 routes still pointing to removed boundary; after implementation S27 exact text and static graph tests **2/2 PASS**.
- Focused N1 result: **4/4 PASS, exit 0, 98.37 s** (`node --test tests/m3-s27.test.mjs`), including the four S26 locks × three work choices (**12 cases**), Back→different work choice, fresh JSON replay, forged intent/lock/actionLog rejection with zero `setState` calls and first-game economy/consent invariants. Independent read-only reviewer separately observed **4/4 PASS, 149.06 s** and independently verified all 5/15 source blocks and SHA-256.
- Independent review found a stale S26 regression asserting nonexistent `s27-intro`; reproduced RED in `tests/m3-s26.test.mjs` and removed that obsolete check, with focused **1/1 PASS** after the fix. No other Critical/Important defects were found.
- Full `npm test`: **149/149 PASS, 0 failures, exit 0, 714.30 s**. Syntax checks on S27, story and boundary tests, `git diff --cached --check`: exit 0. Current GitHub CI, Studio export and browser/device release gates remain **NOT_RUN**.
- **18/18 Git blobs** uploaded to the existing open Draft PR #2 branch and verified against local Git blob SHA-1. Remote code commit `d31e870c52fd00234dd20a0da5baf09306f51f51` has tree `122cd32d584baecc0f60ee1177ad86b612865555`, independently verified after `git fetch` against local tested HEAD tree. Non-force compare-and-swap advanced the branch from exact expected head `da3ae85a83041e9c0dd8c4806f9bef52675491bb`; base `main` remains `57296cdc0132e007342ed04644025a40b2f5f16b` at upload. GitHub combined status API returned `statuses: []` (**CI NOT_RUN**, not PASS). Separate documentation-only evidence closure follows; no merge/release/publication.
- `game/src/story.js` SHA-256 `363fca22efb86caa6343b4962fa37176696707a1d9b122fb4feb994f0f6efeb4` is pinned in `game/narrative-assets.json`.
