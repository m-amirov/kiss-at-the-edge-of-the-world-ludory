# M3 S34 Damir day-16 implementation plan

**Goal:** Transfer author's S34 exactly after both S55 callbacks in existing Draft PR #2.

**Architecture:** `game/src/scenes/s34.js` exports five verbatim text blocks; `story.js` wires three native status flag paths and a temporary technical end. No runtime changes.

**Spec:** [S34 design](../specs/2026-11-06-m3-s34-damir-route-design.md).

## Task 1 — source-derived regression first

- [x] Write independent source-paragraph SHA-256 and exact three-label tests for S34.
- [x] Extend real N1 S30/S55 routes through S34 with 24 choices, Back/JSON and forged state. Verified expected RED while scene absent (0 vs 9 paragraphs; old S55 stop).

## Task 2 — minimal migration

- [x] Add manuscript-verbatim module, wire both S55 callbacks, append three free statuses, converge at draft technical end.
- [x] Update asset manifest source hash, ensure focused tests and previous S30/S55 regression GREEN (7/7 PASS).

## Task 3 — evidence and publish to Draft only

- [x] Update README and fidelity evidence; syntax, manifest hash, independent read-only review **PASS (0/0/0)**, full npm test **185/185 PASS**.
- [ ] Commit scoped files and CAS sync exact tree to existing Draft PR #2, verify remote base/main untouched and CI status honestly.

**Constraints:** Original `1e775f1` and Ludory read-only; no main merge, no release, no platform publication; no Economy for first game; no consent/relocation inferred.
