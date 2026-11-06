# M3 — S35/S63 independent day-16 migration design

## Intent and source

Continue the already approved serialized Ludory-native migration of «Поцелуй на краю света» in **Draft PR #2**, without changing `main`, publishing, or enabling the first game's Economy. The canonical text is the read-only original repository `m-amirov/kiss-at-the-edge-of-the-world@1e775f1`, `content/season-1-literary-episode-08.md`, S35 lines 273–295 and S63 lines 297–328 (EP08 SHA-256 `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`).

S35 (day 16 editorial consent/privacy) is available to independent Alice **or** an ended romance. S63 is the continuation of both paths, with a solo concert and two independent, free authorial decisions. S63-C2 A/B carry exclusive evidence flags for the existing S40 callbacks in EP09 lines 352–358. Neither scene performs real uploads, communications, or consent grants.

## Approaches and decision

1. **One shared pair of S35/S63 scenes reached from existing guarded status callbacks (chosen).** Canonical text appears once; current N1 route/state provenance remains authoritative. At Eric S32 and Nick S33, new guarded continuation dispatches send only `closed` to S35, retaining existing technical ends for `active`/`paused`; Damir S34 already has a guarded continuation and sends `closed` to S35; both independent S62 callbacks send Alice to S35. This fits the existing graph and avoids duplicating content.
2. Duplicate S35/S63 per romance status: larger graph and possible text drift, no added story value.
3. Route-switch to `alice` on closure: rejected because it would falsify the historical route lock and N1 save provenance.

The user has repeatedly authorized continuing this migration without per-scene design questions. This is a bounded migration stage, not a change to the overall architecture.

## Required behavior

- Show all **10 exact authored blocks / 13 paragraphs** with original punctuation and paragraph ordering; keep the authored option labels. S35-C1 two alternatives both lead to common paragraph and then S63. S63-C1 two alternatives both lead to common paragraph; S63-C2 two alternatives each lead to a draft-only technical end pending S40.
- S63-C2 A sets only `s63-next-ticket=true`; B sets only `s63-next-venue=true`, for future EP09 S40 guarded callbacks. No effect on relationship, publication permission, external messaging, or media rights. S35-C1 and S63-C1 have no invented state effects.
- Keep S32/S33 `active` and `paused` on their existing technical stops until S50/S53 migrate. Closed S32/S33/S34 and independent S62 continue S35→S63, preserving existing routeIntent and routeLock. Never invent an authorial route switch.
- Native N1 replay, `Back`, and JSON save/load must accept valid paths and reject unavailable options or forged status, flag, route, or actionLog provenance with **zero state writes**.
- Preserve prior scene regressions; `game/narrative-assets.json` SHA must match `game/src/story.js`.
- No paid choices, premium gates, real messaging/upload/publishing, localization claims, real-platform moderation, `main` merge, or release.

## Acceptance gates

1. Pre-implementation RED tests from manuscript-derived SHA-256/paragraph counts plus route connectivity and negative guards; GREEN for focused and full repository suite.
2. Static and N1 real traversal tests cover S62 both callbacks, Eric/Nick/Damir close, active/paused safety, both S35 and both S63 decisions, Back/JSON, and anti-forgery.
3. Independent code review, exact manifest verification and no `git diff --check` errors.
4. Push only to the existing feature branch in Draft PR #2 with non-force expected-head update, exact Git tree/blob parity and a recorded NOT_RUN/BLOCKED gate assessment. No release-ready claim without real release checks.
