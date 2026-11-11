# M3 — canonical S32 day-15 Eric choice design

## Intent and boundary

Continue the in-progress Ludory-native migration in existing open Draft PR #2 by replacing the **Eric-only** technical stop after S49 with the manuscript's S32. The original episode-08 manuscript is pinned at `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-08.md`, lines 5–54; full file SHA-256 `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`. Original and Ludory framework remain read-only.

S32 is **not a common day-15 scene**. Episode 8 assigns S32 to Eric, S33 to Nick, and later scenes to the other routes. The day-14 independent Alice, Damir and Nick endpoints remain technical stops until their own next narrative segments are migrated. Never send them to S32.

## Approaches considered

1. **Chosen: append S32 verbatim, scoped to the existing Eric chain, with three mutually exclusive native N1 flags** representing manuscript `routeStatus=active|paused|closed`. Minimal engine change, source-faithful, reversible by Back, validated by action-log replay. Future S50 (only active/paused) and independent continuation (closed) may consume these flags.
2. Write directly into a hypothetical global N1 `routeStatus` field. Rejected: no verified native operation or existing project contract; would broaden this one-scene port into a framework migration.
3. Keep S49 at the technical stop until all of episode 8 is ready. Rejected: does not advance the agreed sequential migration.

## Canonical scope

- **Five verbatim authorial blocks / 18 paragraphs**: S32 intro 11; S32-C1 A/B/C two each; common one. No new text inside authored blocks. Choice labels exact:
  - A `Продолжить отношения, не решая зиму немедленно` → `s32-status-active`.
  - B `Попросить паузу без обещания свиданий` → `s32-status-paused`.
  - C `Закончить романтическую историю сейчас` → `s32-status-closed`.
- Preserve Alice's career autonomy; no invented reconciliation, itinerary, public disclosure or publication rights. The common authorial paragraph intentionally records no personal conversation quotes.
- No other scene's route-lock or effects may change. First game's Economy stays OFF; all three decisions free.
- Rejoin at `s32-common`, then a clearly marked unpublished `s32-after-m3-end` technical stop. A `closed` state must be recorded now but not prematurely routed to S50; the next migration stage implements manuscript-specific continuation.
- An old unpublished save exactly at `s49-after-m3-end` may require explicit Restart. Never silently rewrite saved history or claim that an old published save migrates.

## Verification and release gates

- Source-pinned SHA-256 and paragraph counts independent from new scene code; three exact choice labels; only Eric's locked route reaches S32 after both S49 callbacks.
- Native N1 real-runtime coverage: all combinations of S28 choice, S49 choice and S32 three-way status; Back→alternate; fresh JSON replay; tampered route/status/actionLog rejection with zero writes; no other route gets S32.
- Full `npm test` before GitHub sync; syntax, asset-manifest digest, whitespace and independent read-only review; do not claim GitHub CI pass without statuses.
- Keep Draft PR #2 open, no force push, `main` merge, public build, store moderation, release, premium choices or real network messages. Studio export remains BLOCKED by existing schema/trust issue; device UI, EN, media rights and Yandex/VK receipts NOT_RUN.
