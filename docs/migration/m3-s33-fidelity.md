# M3 — S33 «День 15. Тизер» (Ник)

**Pinned source:** original repo `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-08.md`, lines 97–139. Full EP08 SHA-256: `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`. Original and Ludory framework remain read-only.

## Source-faithful prose

Five original blocks / **15 Russian paragraphs**. Source checksums were independently calculated from the pinned manuscript, joining paragraphs with `\n\n`, before the new scene module existed.

| Native graph node | Paragraphs | Original SHA-256 |
| --- | ---: | --- |
| `s33-intro` | 8 | `9f78774b15de1ad2b124903e18c77af12ee282623460f74bd6ada73d1bb01ea9` |
| `s33-c1-a` | 2 | `a9f4f13f4ff4dd0db0f573cacafdb45464c428dff23fdd0c46a3c26a7bb4300a` |
| `s33-c1-b` | 2 | `00583a0f2c2df40bd1a9211880581aebdc69733b6143bd51f9c4be1b8ab4843f` |
| `s33-c1-c` | 2 | `b798ddea1f3c8f99a4c54ac95c2cd9c14329cf10e5f94af924c02d33dd364e18` |
| `s33-common` | 1 | `17858ac46e1281d670d0284428e1988fbafbe30b8800354dab2c94708662701f` |

## Route and consent semantics

- Only locked Nick's two authorial S52 callback paths enter S33. Eric (S28/S49/S32), Damir (S30/S55), and independent Alice (S31/S62) remain on their own branches. No general day-15 shared scene is invented.
- The three **free** S33-C1 decisions record mutually exclusive local flags `s33-status-active|paused|closed` for later manuscript S53. Native N1 Back, actionLog and JSON replay govern them. S33 never grants implicit rights to expose personal footage, private quotes, files or recordings.
- The deletion, edit and delivery of a teaser are **events narrated in the original manuscript**, not application side effects: no real file access, external message, consent, uploader or publisher is invoked. The pre-existing S29 footage choice and privacy state remain unchanged.
- All three paths converge through the same verbatim common text. As of [S35/S63](m3-s35-s63-fidelity.md), guarded status continuation sends **closed** to S35/S63, and only `active/paused` to Draft-only `s33-after-m3-end` while S53 remains unimplemented. Closed can never enter future romantic S53. An old *unpublished* save on the removed S52 Draft stop may require Restart; no save rewrite is claimed.
- The first game's Economy remains OFF: no crystal currency, paid choices, rewarded ads or IAP.

## Verification and blockers

- TDD RED was observed before implementation: `s33-intro` rendered 0 paragraphs, expected 8. Static source hashes and choice contract subsequently **2/2 PASS**.
- Native N1 S33 focused run: source/graph and isolation and all **36 Nick choice combinations** (3 S29 footage decisions × 2 hour decisions × 2 S52 responses × 3 S33 statuses), Back→alternate and JSON **4/5 initially PASS**; the fifth test revealed a too-narrow expected TypeError regex (the real runtime correctly rejected a forged action as `action beat mismatch`). Updated only that test expectation to match the documented existing N1 rejection branch; the focused forged-state rerun **1/1 PASS**, zero writes. The full suite then exercised the same five tests successfully.
- Historical S29/S52 regression included in the full suite: all **5/5 PASS**, including earlier route lock, callback, privacy, Back, JSON and forged-state cases. Complete repository `npm test`: **183/183 PASS**, 0 failed/skipped/cancelled, exit 0, 895382.955 ms (~14m55s). New S33 tests **5/5 PASS** inside that same run. Independent read-only review: **0 Critical / 0 Important / 0 Minor**; independently checked all five manuscript blocks, 15 paragraphs, both S52 incoming edges, closed/unmigrated S53, flags and native test scope.
- `node --check` on S33 module, story and new tests; `git diff --check`; `game/narrative-assets.json` SHA-256 versus `game/src/story.js`: **PASS**, story digest `18076dff7184ec7cdb23322aa0757692d7f42db5473021702c907c8217d9e3a8`.
- Tested local code commit `e5f0652c404275c7fb386b6620beb037aaf594dd` and published GitHub code commit `411868dc3fb6279a56953ee6e1b3444cfb545fa1` share exact Git tree `8023baa822477ec71d4f28fd708f0d4a93f9776c`. All **10/10 Git blobs** matched local SHA-1, remote tree matched, non-force CAS advanced existing `feat/m2-canonical-s01` from `01acb94d4bbcf1cc759545a03d0a67085bcd01df`. Independent fresh `git fetch` confirmed head and tree parity. PR #2 remained **open Draft**, unmerged; base `main@57296cdc0132e007342ed04644025a40b2f5f16b` unchanged. Title/body updated to S33. GitHub commit `statuses: []` = **CI NOT_RUN**. This evidence-only docs closure changes no game/test code.
- Remain **NOT_RUN / BLOCKED**: Studio export by component schema/trust mismatch, current Yandex/VK ZIP and receipts, live browser/mobile Save/Reload, EN localization, media rights and real store moderation. PR #2 stays Draft; `main` remains unmodified, with no release or publication.
