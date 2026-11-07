# M3 — canonical S33 day-15 Nick choice design

## Goal and source

Extend the existing open Draft PR #2 by moving **only Nick's** route from the two day-14 S52 callbacks to authorial episode-08 S33 («Тизер»). Pinned original: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c:content/season-1-literary-episode-08.md`, lines 97–139; whole EP08 SHA-256 `181f05d7d838aeaf3b21b6b18ad8b01395aff3dc0534a51f01281c678309f900`.

The user opted out of per-scene design questions and previously chose a sequential, test-first native Ludory migration. Original game and Ludory framework remain read-only. This work is restricted to the existing game's Draft branch; do not merge, publish or add new product mechanics.

## Approaches

1. **Chosen — append a source-verbatim Nick-only scene**, using the existing graph and three mutually exclusive `flag_set` markers. It retains real N1 Back/JSON provenance without introducing new runtime APIs.
2. Add a new `routeStatus` primitive to the Ludory framework. Rejected: unnecessary scope expansion and no verified native API contract for it.
3. Reinterpret the teaser as a real media/upload flow. Rejected: would make privacy-sensitive external side effects the manuscript does not authorize.

## Boundaries and behavior

- Transfer exactly five authorial blocks / **15 paragraphs**: S33 intro 8; C1 A/B/C 2 each; common 1, verbatim. Source choices are completely free: A `Попросить увидеть исправленный тизер до новой отправки` → `s33-status-active`; B `Взять паузу и отказаться обсуждать фильм сегодня` → `s33-status-paused`; C `Закончить романтическую историю` → `s33-status-closed`.
- The three flags represent authorial story `routeStatus=active|paused|closed` without modifying the N1 engine. Selection of one flag does not set either other flag. Native Back and serialized actionLog must faithfully restore the one selected outcome.
- Both S52's guarded callbacks must enter `s33-intro`. No Eric, Damir or independent Alice path may enter the scene. The S33 common block converges to a clearly labeled **unpublished technical stop** `s33-after-m3-end`; the later S53 day-16 route must distinguish active/paused from closed and is **not** part of this step.
- Retain the already-authorized S29 camera/consent choices exactly. A fictional shared-folder deletion and new teaser in authored prose must **not** cause a real upload, message, production asset deletion, publication, quote release, or consent flag. User's first game Economy stays OFF (no premium, currency, ads or IAP).
- A save at removed, unpublished `s52-after-m3-end` might require manual Restart; do not silently rewrite other save records.

## Verification gates

- Independent source-derived SHA-256 values and paragraph counts, exact choice labels, graph entry/exit and no premium/consent effects.
- Real native N1 traversal through locked Nick route, both S52 callbacks and all three S33 statuses; Back-to-other, fresh JSON restore, invalid choice and tampered route/flags/actionLog with **zero writes**; ensure all other routes stay isolated.
- Previous S29/S52 boundary regression updated without weakening its test; full `npm test`, syntax, SHA-256 manifest, git whitespace, and one independent read-only review.
- GitHub upload only after checks: same Draft PR #2, expected-head CAS/non-force, fetch and compare remote tree, verify `main` unchanged. Record CI as NOT_RUN unless a status actually runs. Yandex/VK export, browser/device QA, English localization and media rights remain unverified.
