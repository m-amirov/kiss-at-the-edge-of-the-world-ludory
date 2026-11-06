# M3 — S32 «День 15. Не совпасть расписаниями» (Эрик)

**Pinned authorial original:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-08.md`, lines 5–54. Whole manuscript SHA-256 `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`. Source and Ludory framework read-only.

## Exact authored text

Exactly **5 independent authorial blocks / 18 Russian paragraphs** are displayed. The values below were extracted directly from the pinned original (ranges 9–29, 35–37, 41–43, 47–49 and 53) and hashed by joining paragraphs with `\n\n`, not derived from game code.

| Graph block | Paragraphs | Pinned source SHA-256 |
| --- | ---: | --- |
| `s32-intro` | 11 | `62b7bce565005ed0d87e7e53c0115d8b51786a62cb787c937defa2ff1bd480e6` |
| `s32-c1-a` | 2 | `e3a98b7127fd0999654d9ced34fde1622e23c7c80ab3e89020d1bb9707196c66` |
| `s32-c1-b` | 2 | `7d7f0ef2af83a51c6f785cf3a385b22d9f74ee81759df3df62d3612c076b745a` |
| `s32-c1-c` | 2 | `801c01e5d9b5b1a4966b8c28610179095b8556169019480f024fcaa7432a1e05` |
| `s32-common` | 1 | `c4459bf241b77cb666b5e928f37c920393e8e791508f729fb963d95f0c710022` |

## Eric-only route and durable choice semantics

- Contrary to earlier shorthand, S32 is **not a shared day-15 scene**. Only S49's two Eric callbacks now enter S32. Nick, Damir and independent Alice remain at their own technical endpoints while later episode-08 routes are pending. The four-way N1 `routeId`/`routeLock` protection still starts at S59.
- Source S32-C1 has **three completely free** outcomes: continue together (`s32-status-active`), take a pause (`s32-status-paused`) or end romance (`s32-status-closed`). Only one local N1 flag is set; Back and JSON actionLog provenance make a changed choice reversible and reject unauthorized state. No fictional global engine `routeStatus` setter was assumed. These flags are reserved for future S50 or independent continuation; S50 is **not migrated yet**, and no closed relationship can be routed into its romance scene.
- All three paths display the same authored S32 closing paragraph then reach `s32-after-m3-end`: an **unpublished technical stop**, never a romantic finale or release ending. An old, unpublished save exactly at the removed `s49-after-m3-end` stop may require manual Restart; no automatic migration or deletion of user saves is claimed.
- The dialogue explicitly preserves Alice's professional commitments, absence of forced relocation promises and confidentiality of personal conversation. No real message is sent, no private quote or image becomes publishable, and first-game Economy remains OFF (no currency, premium, rewarded ads or IAP).

## Verification and release boundaries

- TDD source test initially **RED**: missing `s32-intro`, 0 vs 11 manuscript paragraphs; independent source-hash and graph-choice static **2/2 PASS** after transfer.
- Native N1 focused `node --test tests/m3-s32.test.mjs`: **5/5 PASS**, 215802.826 ms, covering all 24 original S28×S49×S32 combinations, Back→alternate, fresh JSON and forged route/status/actionLog zero writes. Historical S28/S49 regression: **5/5 PASS**, 205647.906 ms. Full `npm test`: **178/178 PASS**, 0 failures/skips, exit 0, 778060.874 ms.
- Independent read-only whole-change review: **0 Critical / 0 Important / 0 Minor**; direct manuscript hash/label/paragraph and incoming-edge comparisons, no source edits. `node --check` of story, S32 module and test, `git diff --check`, and `storySha256` digest all **PASS**. This does not evaluate browser/device/export/CI.
- Locally tested code commit `f01509b9a056a6735e7b7b2b46132f2169335d08` and GitHub code commit `e859546cefbc83a0317f528a330a839b0c9558e5` have exactly the same Git tree `63765fd4b15afa750a652b061fd83a3d9368cab9`. All **11/11 changed Git blobs** matched their local Git SHA-1; non-force expected-head CAS advanced `feat/m2-canonical-s01` from `e643ec919b64ebee7af3e83460326092d9c657c0`. An independent fresh `git fetch` confirmed both fetched head and tree parity. GitHub PR #2 stayed **open Draft**, unmerged, with base `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. GitHub combined commit status `statuses: []`: **CI NOT_RUN**, never a green CI claim. An evidence-only documentation closure commit follows the tested code; no new gameplay change is made in closure.

`Studio` export continues **BLOCKED** by existing component state/schema trust mismatch. New Yandex/VK ZIPs/receipts, real-browser and device Save/Reload, media rights, verified EN localization, CI, marketplace moderation and game publication are **NOT_RUN/BLOCKED**. Do not merge into `main` or publish.
