import assert from 'node:assert/strict';

// Integration-only traversal: the supplied run has already come from genuine S01
// choices through S41. No flags, route IDs or history are fabricated here.
export function finishDay20(run, walkUntil, rejectWithoutWrite, runtime,
  { romanceChoice = 'a', independentChoice = 'a' } = {}) {
  const originalRoute = run.get().routeLock;
  assert.ok(['eric', 'nick', 'damir', 'alice'].includes(originalRoute));
  walkUntil(run, (beat) => beat.id === 's42-s43-route-choice');
  const flags = run.get().flags;
  const status = {
    eric: ['s32-status-closed', 's37-status-closed', 's37-status-continues'],
    nick: ['s33-status-closed', 's38-status-closed', 's38-status-continues'],
    damir: ['s34-status-closed', 's39-status-closed', 's39-status-continues'],
  };
  let gate;
  if (originalRoute === 'alice') gate = 'alice';
  else {
    const [earlyClosed, lateClosed, continued] = status[originalRoute];
    const outcomes = [earlyClosed, lateClosed, continued].filter((id) => flags[id] === true);
    assert.equal(outcomes.length, 1, `${originalRoute}: exactly one canonical relationship outcome`);
    if (outcomes[0] === continued) gate = originalRoute;
    else gate = `${originalRoute}-${outcomes[0] === earlyClosed ? 'early' : 'late'}-closed`;
  }
  const expectedIntro = gate === originalRoute && originalRoute !== 'alice'
    ? `s42-${originalRoute}` : 's43-intro';
  const wrongRoute = originalRoute === 'eric' ? 'nick' : 'eric';
  rejectWithoutWrite(run, `narrative:choose:s42-s43-route-choice:${wrongRoute}`);
  const invalidStatusChoice = originalRoute === 'alice' ? 'nick-early-closed'
    : gate === originalRoute ? `${originalRoute}-early-closed` : originalRoute;
  rejectWithoutWrite(run, `narrative:choose:s42-s43-route-choice:${invalidStatusChoice}`);
  const beforeGate = JSON.stringify(run.get());
  const contradictory = JSON.parse(beforeGate);
  if (originalRoute === 'alice') contradictory.routeLock = 'nick';
  else {
    const [earlyClosed, , continued] = status[originalRoute];
    contradictory.flags[gate === originalRoute ? earlyClosed : continued] = true;
  }
  const forgedLog = JSON.parse(beforeGate);
  const lastC2 = forgedLog.actionLog.findLastIndex((entry) => entry.beatId === 's41-c2-choice');
  assert.ok(lastC2 >= 0, 'S41 choice provenance must exist in real S01 replay');
  const oldOption = forgedLog.actionLog[lastC2].optionId;
  forgedLog.actionLog[lastC2].optionId = oldOption === 'a' ? 'b' : 'a';
  for (const tampered of [contradictory, forgedLog]) {
    const probe = runtime(tampered);
    const original = JSON.stringify(probe.get());
    assert.throws(() => probe.act(`narrative:choose:s42-s43-route-choice:${gate}`),
      /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/,
      'forged S42/S43 route/status/history must not be accepted');
    assert.equal(probe.writes(), 0, 'forged state cannot cause writes');
    assert.equal(JSON.stringify(probe.get()), original, 'forged state remains unchanged');
  }
  run.act(`narrative:choose:s42-s43-route-choice:${gate}`);
  assert.equal(run.get().sceneId, expectedIntro, 'relationship choice routes to the correct S42 or S43');
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()), beforeGate, 'route gate Back returns exact original state');
  run.act(`narrative:choose:s42-s43-route-choice:${gate}`);

  const decisionBeat = expectedIntro === 's43-intro' ? 's43-c1-choice' : 's42-c1-choice';
  const chosen = expectedIntro === 's43-intro' ? independentChoice : romanceChoice;
  walkUntil(run, (beat) => beat.id === decisionBeat);
  const beforeDecision = JSON.stringify(run.get());
  const alternative = chosen === 'a' ? 'b' : 'a';
  run.act(`narrative:choose:${decisionBeat}:${alternative}`);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()), beforeDecision, 'final day-20 decision Back is reversible');
  run.act(`narrative:choose:${decisionBeat}:${chosen}`);
  const snapshot = JSON.parse(JSON.stringify(run.get()));
  const resumed = runtime(snapshot);
  walkUntil(resumed, (beat) => beat.id === 's42-s43-after-m3-end-beat');
  assert.equal(resumed.get().routeLock, originalRoute);
  assert.equal(resumed.get().routeIntent, run.get().routeIntent);
  const finalFlags = resumed.get().flags;
  const expectedFlag = expectedIntro === 's43-intro'
    ? { a: 's43-next-project', b: 's43-next-rest' }[chosen]
    : { a: 's42-decision-continue', b: 's42-decision-pause', c: 's42-decision-close' }[chosen];
  assert.equal(finalFlags[expectedFlag], true);
  for (const id of [
    's42-decision-continue', 's42-decision-pause', 's42-decision-close',
    's43-next-project', 's43-next-rest',
  ]) assert.equal(finalFlags[id], id === expectedFlag ? true : undefined, `${id}: no false branch leakage`);
  assert.equal(run.get().routeLock, originalRoute);
  assert.ok(resumed.get().visitedScenes.includes(expectedIntro), 'canonical branch intro actually visited');
  return { gate, expectedIntro, snapshot, result: resumed.get() };
}
