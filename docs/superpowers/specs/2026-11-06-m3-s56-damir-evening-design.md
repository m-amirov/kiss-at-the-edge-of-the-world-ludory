# M3 S56 — Damir day-16 music evening

## Intent and scope

Transfer only S56 from the pinned read-only EP08 manuscript (lines 231–271): seven verbatim prose blocks (3 active + 1 paused + 1/1 first-choice outcomes + 1 common + 1/1 second-choice outcomes = 9 paragraphs). S34 already stores one of three exclusive relationship flags. S56 is available only when status is `active` or `paused`; `closed` goes toward authorial S35 independent story, which remains outside this stage.

## Approach

- **Chosen:** native N1 guarded `Продолжить` dispatch after S34-common, with two mutually exclusive choices into S56 active/paused and third into a clearly marked *unpublished* S35-bound technical stop for closed. Each S56 entry preserves its original prose and joins the two manuscript choices. Native replay/Back revalidates all flags; no engine or save-schema change.
- Alternative: introduce a synthetic global `routeStatus` setter and generic script branching; not chosen because N1 has no verified global status setter and it would alter core mechanics. Alternative: enter a placeholder S35 scene for closed, which would falsely suggest canonical independent content is implemented; not chosen.

Two authored free choices: S56-C1 (stay for one more song or walk to hotel) has no future manuscript payoff and needs no invented flag. S56-C2 (choose a new dish or sing the chorus) does have future S39 callback, so it records exactly one local `s56-next-dish|s56-next-chorus` flag for later guarded payoff. Both outcomes stop at `s56-after-m3-end` until common day-17 S36/S39 is migrated. Closed stops at `s34-closed-after-m3-end`, not in S56; later S35 integration will replace this marker.

## Boundaries and acceptance

- Original and Ludory framework read-only, only existing Draft PR #2; no `main` merge, release, publication, invented side effects, or economy (first game OFF).
- Independent source paragraph hashes/labels and both status-specific introductions, guarded dispatch, all authored paths, and unsupported choice rejection checked.
- Real N1: verify Damir-only entry, S34 statuses, both S56 choices, Back to alternative, fresh JSON replay, forged status, S56-C2 flags and actionLog rejected with zero state writes. Closed never enters S56; Eric/Nick/self routes unchanged.
- Full repository tests, independent read-only reviewer, manifest digest, exact Git blob/tree CAS and Draft status required before reporting completion. Studio component schema/trust export, device testing, media rights, GitHub CI and real moderation remain separate release gates.
