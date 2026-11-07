# M3 EP10 S44–S48 — Canonical Farewells and Seven Ending IDs

## Source and established authority

Continue the previously approved native N1 manuscript migration on the existing Draft PR #2. Pinned read-only original: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-10.md`, lines 136–269, full document SHA-256 `236d94f728b78f019158e337217e259dde78157e55b959d116895056b7059ee0`. Preserve authorial prose verbatim, with no real email, photo, booking, message or upload action.

## Order and branch contract

The manuscript presents the personal epilogues S44–S47 before the shared S48, but S48 explicitly depicts the **last morning before individual goodbyes**. Accordingly the playable chronological graph is **S42 or S43 day 20 → S48 last group breakfast → S44/S45/S46/S47 individual day-21 finale**. Within S48 show exactly one `routeIntent` paragraph after the group introduction, its shared continuation, then exactly one callback for genuine S41-C2 choice. The S26 locked route and S41 flags have authoritative actionLog provenance. No rewrite of `routeLock` or `routeIntent` for players who chose S42 pause/close.

Finale routing is based on the **new S42 decision**, not merely the earlier locked romance:

- Eric + `s42-decision-continue` → S44.
- Nick + `s42-decision-continue` → S45.
- Damir + `s42-decision-continue` → S46.
- Any S42 pause or close, S43 independent Alice route, or any previously closed romance routed through S43 → S47. All genuine states reach exactly one finale.

Each finale renders the exact original opening, one free C1 (A/B), its authorial alternative, then the one common month-later epilogue. The independently chosen S47 A/B options have **one shared independent ending ID**; the two epilogue variants for each romantic route have distinct ending IDs. Thus the game has seven ending IDs (`eric-a`, `eric-b`, `nick-a`, `nick-b`, `damir-a`, `damir-b`, `alice`) over eight possible C1 combinations, not seven invented prose endings.

## Safety and tests

- No new engine functionality, currency, premium gates, outbound service calls, media permission or source edits. EN is still an explicitly unverified RU fallback. These endings are narrative/technical milestones **not a release sign-off**.
- Verify all 24 canonical prose blocks using hashes generated independently from pinned source; ensure scene, route guard, branch and terminal ending IDs are exact. S48 must be reached before every finale.
- Exercise complete genuine S01→N1 pathways for all four locks, early/late closures, S42 continue/pause/close, S43 A/B, finale C1 A/B, both S41 callbacks, Back, JSON resume, unavailable option and forged provenance zero-write rejection.
- Full `npm test`, independent read-only review and final Git tree proof before updating only the existing Draft PR #2 by non-force CAS. Do not merge to `main`, mark Ready, publish or suggest QA gates passed without evidence.

## Non-chosen options

Adding S48 after the month-later ending would break its explicit morning-before-departure chronology. Dropping S48 would leave the author's final group farewell unimplemented. Implementing a new runtime condition or route switch for closed romances would add risk and change authorial intent; existing route locks and flags suffice.
