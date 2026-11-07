# M3 S34 — Damir day-16 «Отменённый вечер»

## Boundary and canonical contract

Transfer only canonical S34 from read-only `source/content/season-1-literary-episode-08.md` at pinned original `1e775f1`, lines 183–229. The title is explicitly **day 16**, not day 15. Five verbatim prose blocks (9 + 2 + 3 + 2 + 1 = 17 paragraphs) live in a new isolated scene module. Both guarded S55 callbacks enter S34. Other routes remain isolated.

S34-C1 is a three-way free decision with manuscript labels: later dinner without a promise (active), pause to the end of the next day (paused), or end the romance (closed). Record exactly one mutually exclusive `s34-status-active|paused|closed` flag with the existing N1 `flag_set` operation and actionLog replay. The published manuscript S56 is not within scope; all three paths converge on an explicitly technical, non-release end. No invented global `routeStatus` setter or future route scene is allowed.

## Safety and acceptance

- Original and Ludory framework repositories are read-only; only the game's existing Draft PR #2 changes. No main merge, release, publication, upload, or external messages.
- Career interview, separate job decisions, dinner and romance are fictional scene facts, never relocation or contractual consent. All choices free; Economy OFF for first game.
- RED→GREEN on independent paragraph hashes and graph/status choices. Real N1 route-lock excludes non-Damir routes; 2×2×2×3 Damir trajectories, Back, JSON replay and forged-state zero-write rejection are tested.
- Existing S30/S55 behavior preserved; manifest digest matches actual story. Full repository suite, read-only review and remote tree parity documented, or reported as NOT_RUN if unavailable.
