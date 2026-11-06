# M3 S36 — shared day 17: design

## Intent and source

Continue every authentic Ludory-native day-16 path into the shared day-17 scene **S36 «Место для остановки»**, without losing relationship decisions or inventing day-18 content.

- Pinned read-only source: `kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md`, S36 lines 5–29.
- Seven exact original paragraphs: four opening, one for each S36-C1 option, one common closure. Labels must match the source; choice A and B are both free.
- Entry nodes from Eric S50-C2, Nick S53-C2, Damir S56-C2, and the independent S63-C2 for Alice or any previously closed romance. Existing S26 `routeLock` must never be overwritten.
- Preserve previous flags including S56-C2 future callbacks and S63-C2 independent callback. S36 creates no new flags, currency, premium choices, publication consent, external messages, or media events.
- End only in an explicit Draft-only non-release stop `s36-after-m3-end` until route-specific S37/S38/S39/S40 are migrated. No actual release, moderation, main merge or platform publication.

## Approaches

1. **Selected: shared S36 node** with direct inbound links from all four previously separate Draft stops; one common choice and closure. Fits the original EP09 common-scene contract and native N1 state replay.
2. Copy S36 into each route: simpler superficial linking but duplicates text, loses the explicit all-route merge, and risks drift.
3. Build S37–S40 first: enlarges this delivery and leaves the existing day-16 gap longer.

## Acceptance

1. Exact seven authorial paragraphs and two authorial choice labels; source-independent SHA-256 expectations.
2. No S50/S53/S56/S63 M3 dead ends; all valid status variants (including closed) arrive at S36 via N1 from authentic checkpoints.
3. S36-C1 both choices pass N1 replay, JSON snapshot restore and Back; prior route lock, status and callback flags survive.
4. Invalid/paywall/forged actions are rejected without writes; prior tests for route guards and consent still pass; no new economy.
5. Focused and full test suite, reviewer, GitHub exact-tree parity, same Draft PR #2. CI/browser/release gates unclaimed unless actually run.
