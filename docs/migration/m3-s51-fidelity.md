# M3 — S51 «День 19. Обычный ужин» (Eric, continued romance)

## Canonical original

- Pinned read-only `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-09.md` lines 87–123 (next scene S38 at line 125).
- Six exact blocks, ten authorial paragraphs. Hash input: original paragraphs stripped of headings and outer whitespace, joined by two LF. Full EP09 SHA-256: `a188855c03e5ba0e8a8f2c203af17ae01bca208e55b6e93b6b7a66b25e8a686f`.

| Native scene | Paragraphs | Source SHA-256 |
| --- | ---: | --- |
| `s51-intro` | 4 | `30bf752adaae0a2051b0d44e34d16368854bb258b006b5f187188ef8567e7d1b` |
| `s51-c1-a` | 1 | `0f7e8118c7271ad804f99db14c106a1b05dc9f70f70517251b891473026376cc` |
| `s51-c1-b` | 2 | `3e8ccc5ca75fc208ffbfd3237e9e6d963dce4de5962ac9bee8cba0f4627b7b44` |
| `s51-common` | 1 | `c06cbc5f7823f84d089cbac86eb7f1eb1fc01156074aa5e9d7152ab2015df8d4` |
| `s51-s37-a` | 1 | `b7365ca8e4d1b57b32da9aaaee681e338445da4fb133b4266063dbd28899ce92` |
| `s51-s37-b` | 1 | `4621cd798161a6eaef688c72998ca7dc085e8b2228abe089dd6b1ebeb088c9c5` |

## Route and decisions

- Only Eric S37-C1=A (`s37-status-continues`) can reach S37-C2. Its two authored morning continuations now enter S51 instead of `s37-after-open-end`; that unpublished temporary ending is removed. The S37-C1=B separation still proceeds to independent S40→S64, with no reconnection to S51.
- S51-C1=A «Остаться ещё на час вдвоём» stores local `s51-evening-together`; S51-C1=B «Пожелать спокойной ночи и закончить день отдельно» stores `s51-evening-apart`. Both are free and converge on the authored shared paragraph; an evening alone does **not** close the romance.
- Guarded `S37-C2=A` callback requires `s37-morning-sunrise`; `S37-C2=B` requires `s37-morning-breakfast`. No default callback exists when provenance is invalid. Both finish on the explicit **unpublished** `s51-after-m3-end` awaiting shared S60.
- In-story references to recipes, the phone and the sister are text only. No platform purchase, device message, or external operation. `Economy & Monetization` stays **OFF** for this first game, and EN continues to fall back to RU.
- Existing Draft snapshot positions at removed `s37-after-open-end` can fail replay; do not silently migrate, discard or fabricate action history. Use explicit Restart if necessary.

## Evidence and boundaries

- TDD structural tests: original S51 absent/old S37 boundary **RED 0/3 S51 + S37 expectation**, then S51 and S37 structural suite **GREEN 6/6**.
- Native N1 from S01 covers active/paused Eric, ending/continuing romance, genuine S37-C2 A/B, S51-C1 A/B, Back, JSON restoration, opposite callback rejection and forged provenance with zero writes: **6/6 PASS**, 0 fail/skipped, exit 0 (`node --test tests/m3-s32.test.mjs`; `duration_ms=420969.943906`).
- Full `npm test`: **218/218 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo, exit 0, `duration_ms=1564793.179656` (~26 minutes). Local test evidence, **not** CI or platform approval.
- Self-review of the branch delta: no Critical/Important findings. **Minor deferred:** S51-specific negative replay probes cover an authentic active/S37-C2=A checkpoint, while the paused/S37-C2=B path has positive JSON/callback coverage but not its own forged-S51-actionLog sample. Both use the same N1 provenance validator; this is a coverage depth tradeoff, not proven equivalence. No independent reviewer was dispatched for this migration.
- Story manifest hash: `e2e3fa513755c3e6cae15f5fb514dfa96db80166bb2f9e33c5faa8c36e92cde6`.
- Outstanding gates: common S60, Nick S54 and Damir S57 day-19 route completion; Studio trust/schema **BLOCKED**; platform exports, browser/mobile, rights, complete EN, CI and moderation **NOT_RUN**. PR #2 **Draft**, no merge/publication.
