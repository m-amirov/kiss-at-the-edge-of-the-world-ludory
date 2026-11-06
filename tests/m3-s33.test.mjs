import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Literal SHA-256 values derived from the pinned read-only EP08 original,
// lines 101–139; paragraphs separated by exactly two newline characters.
const original = {
  's33-intro': [8, '9f78774b15de1ad2b124903e18c77af12ee282623460f74bd6ada73d1bb01ea9'],
  's33-c1-a': [2, 'a9f4f13f4ff4dd0db0f573cacafdb45464c428dff23fdd0c46a3c26a7bb4300a'],
  's33-c1-b': [2, '00583a0f2c2df40bd1a9211880581aebdc69733b6143bd51f9c4be1b8ab4843f'],
  's33-c1-c': [2, 'b798ddea1f3c8f99a4c54ac95c2cd9c14329cf10e5f94af924c02d33dd364e18'],
  's33-common': [1, '17858ac46e1281d670d0284428e1988fbafbe30b8800354dab2c94708662701f'],
};
const statusFlags = {
  a: 's33-status-active', b: 's33-status-paused', c: 's33-status-closed',
};
const scene = (id) => graphData.scenes.find((entry) => entry.id === id);
const choice = (sceneId, beatId) => scene(sceneId)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (item) => JSON.parse(JSON.stringify(item));

test('S33 shows all five verbatim authorial blocks and 15 original paragraphs', () => {
  assert.equal(Object.keys(original).length, 5);
  assert.equal(Object.values(original).reduce((total, [count]) => total + count, 0), 15);
  for (const [id, [count, digest]] of Object.entries(original)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, id + ' source paragraph count');
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      digest, id + ' original source checksum');
  }
});

test('only both Nick S52 callbacks enter free S33 and status branches converge', () => {
  for (const id of ['a', 'b'])
    assert.equal(scene('s52-callback-' + id).nextSceneId, 's33-intro');
  assert.equal(scene('s52-after-m3-end'), undefined);
  const decision = choice('s33-intro', 's33-c1-choice');
  assert.deepEqual(decision.choices.map(({ id, label, targetSceneId, effects }) =>
    [id, label.ru, targetSceneId, effects]), [
    ['a', 'Попросить увидеть исправленный тизер до новой отправки', 's33-c1-a',
      [{ op: 'flag_set', id: 's33-status-active', value: true }]],
    ['b', 'Взять паузу и отказаться обсуждать фильм сегодня', 's33-c1-b',
      [{ op: 'flag_set', id: 's33-status-paused', value: true }]],
    ['c', 'Закончить романтическую историю', 's33-c1-c',
      [{ op: 'flag_set', id: 's33-status-closed', value: true }]],
  ]);
  for (const option of decision.choices)
    for (const forbidden of ['premium', 'cost', 'routeId', 'romancePoints',
      'requiredEntitlement', 'publishPermission', 'mediaPermission',
      'quoteRelease', 'consentToPublish', 'upload', 'message', 'externalAction'])
      assert.equal(option[forbidden], undefined, option.id + ' ' + forbidden);
  for (const id of ['a', 'b', 'c'])
    assert.equal(scene('s33-c1-' + id).nextSceneId, 's33-common');
  assert.equal(scene('s33-common').nextSceneId, 's33-status-dispatch');
  assert.deepEqual(choice('s33-status-dispatch', 's33-status-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's53-active', { flag: 's33-status-active' }, undefined],
    ['b', 'Продолжить', 's53-paused', { flag: 's33-status-paused' }, undefined],
    ['c', 'Продолжить', 's35-intro', { flag: 's33-status-closed' }, undefined],
  ]);
  assert.equal(scene('s33-after-m3-end'), undefined);
  assert.ok(scene('s53-active'));
  assert.ok(scene('s53-paused'));
  assert.deepEqual(catalogData.interactions, []);
});

const preS17 = {
  's01-seat-choice':'front-eric','s02-career-choice':'people',
  's03-career-dispatch':'people','s03-seat-dispatch':'other',
  's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
  's04-s03-dispatch':'silence','s05-weather-choice':'damir',
  's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
  's06-eric-choice':'music','s07-weather-dispatch':'other',
  's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
  's07-archive-choice':'private','s07-s06-dispatch':'music',
  's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
  's66-damir-dispatch':'warm','s66-career-dispatch':'people',
  's09-voice-choice':'damir','s09-career-dispatch':'people',
  's10-seat-dispatch':'eric','s10-tone-choice':'quiet',
  's11-consent-dispatch':'declined','s11-safety-choice':'a',
  's12-care-dispatch':'warm','s12-voice-dispatch':'damir',
  's12-past-choice':'listen','s12-draft-choice':'private',
  's12-return-choice':'chocolate','s13-voice-dispatch':'damir',
  's13-work-choice':'shared','s13-return-dispatch':'chocolate',
  's14-tone-dispatch':'quiet','s14-pace-choice':'slow',
  's14-gesture-choice':'walk','s15-voice-dispatch':'damir',
  's15-privacy-choice':'c','s15-gesture-dispatch':'walk',
  's16-care-choice':'a','s17-n-dispatch':'c','s17-e-dispatch':'b',
  's17-d-dispatch':'a','s17-group-choice':'d',
};
const afterS17 = {
  's21-letter-choice':'own','s21-reply-choice':'c',
  's21-followup-choice':'friend','s61-editor-choice':'c',
  's61-day-choice':'alone-longer','s61-followup-payoff-choice':'friend',
  's22-weather-choice':'damir','s22-repair-choice':'roles',
  's22-stop-choice':'group','s23-repair-choice':'roles',
  's23-stop-choice':'group','s23-open-choice':'read-page',
  's23-evening-choice':'alice','s23-contact-choice':'skip',
  's23-followup-choice':'skip','s24-evening-choice':'alice',
  's24-contact-choice':'skip','s24-nick-choice':'no-review',
  's24-followup-choice':'skip','s25-evening-choice':'alice',
  's25-contact-choice':'skip','s25-damir-choice':'scheduled-talk',
  's25-eric-choice':'page','s25-followup-choice':'skip',
};
function runtime(snapshot) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: clone(snapshot ?? createNarrativeState(graph)) };
  let writes = 0;
  return {
    graph, catalog,
    act(action) {
      update({ deltaMs: 16, state, inputs: [{ schemaVersion: 1, type: 'pointer',
        action, phase: 'up', timestamp: 207, source: 'renderer' }],
      setState(next) { writes += 1; state = next; } });
    },
    get: () => state.narrative,
    writes: () => writes,
  };
}
function walkUntil(run, stop, actions = {}, max = 7500) {
  for (let i = 0; i < max; i++) {
    const { sceneId, beatIndex } = run.get();
    const beat = scene(sceneId)?.beats[beatIndex];
    assert.ok(beat, 'missing beat ' + sceneId + ':' + beatIndex);
    if (stop(beat, sceneId)) return;
    const before = sceneId + ':' + beatIndex;
    if (beat.type === 'dialogue') run.act('narrative:next:' + beat.id);
    else if (beat.type === 'choice') {
      assert.ok(actions[beat.id], 'unmapped choice ' + beat.id);
      run.act('narrative:choose:' + beat.id + ':' + actions[beat.id]);
    } else assert.fail('premature ending ' + sceneId);
    assert.notEqual(run.get().sceneId + ':' + run.get().beatIndex, before,
      'stalled ' + before);
  }
  assert.fail('narrative traversal limit exceeded');
}
function checkpointS26() {
  const run = runtime();
  walkUntil(run, (beat) => beat.id === 's17-evening-choice', preS17);
  run.act('narrative:choose:s17-evening-choice:self');
  walkUntil(run, (_beat, id) => id === 's58-intro', afterS17);
  walkUntil(run, (beat) => beat.id === 's58-shop-choice');
  run.act('narrative:choose:s58-shop-choice:alone');
  walkUntil(run, (beat) => beat.id === 's58-payoff-choice');
  run.act('narrative:choose:s58-payoff-choice:other');
  walkUntil(run, (beat) => beat.id === 's26-route-choice');
  return clone(run.get());
}
function checkpointS29() {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:nick');
  walkUntil(run, (beat) => beat.id === 's26-nick-evening-choice');
  run.act('narrative:choose:s26-nick-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:inga');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:nick');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:nick');
  walkUntil(run, (beat) => beat.id === 's29-c1-choice');
  return clone(run.get());
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, action + ' changed state');
  assert.equal(run.writes(), writes, action + ' wrote state');
}

test('real N1 route-lock keeps non-Nick routes out of S33', () => {
  const checkpoint = checkpointS26();
  for (const route of ['eric', 'damir', 'alice']) {
    const run = runtime(checkpoint);
    run.act('narrative:choose:s26-route-choice:' + route);
    walkUntil(run, (beat) => beat.id === 's26-' + route + '-evening-choice');
    run.act('narrative:choose:s26-' + route + '-evening-choice:self');
    walkUntil(run, (beat) => beat.id === 's27-work-choice');
    run.act('narrative:choose:s27-work-choice:inga');
    walkUntil(run, (beat) => beat.id === 's59-song-choice');
    run.act('narrative:choose:s59-song-choice:nick');
    walkUntil(run, (beat) => beat.id === 's59-route-choice');
    rejectWithoutWrite(run, 'narrative:choose:s59-route-choice:nick');
    run.act('narrative:choose:s59-route-choice:' + route);
    assert.notEqual(run.get().sceneId, 's33-intro');
    assert.equal(run.get().routeLock, route);
  }
});

test('real N1 all 3×2×2×3 Nick outcomes preserve Back, JSON and status through S53', () => {
  const checkpoint = checkpointS29();
  for (const clip of ['a', 'b', 'c']) for (const hour of ['a', 'b'])
    for (const reply of ['a', 'b']) for (const status of ['a', 'b', 'c']) {
      const run = runtime(checkpoint);
      run.act('narrative:choose:s29-c1-choice:' + clip);
      walkUntil(run, (beat) => beat.id === 's29-c2-choice');
      run.act('narrative:choose:s29-c2-choice:' + hour);
      walkUntil(run, (beat) => beat.id === 's52-c1-choice');
      run.act('narrative:choose:s52-c1-choice:' + reply);
      walkUntil(run, (beat) => beat.id === 's52-callback-choice');
      rejectWithoutWrite(run,
        'narrative:choose:s52-callback-choice:' + (hour === 'a' ? 'b' : 'a'));
      run.act('narrative:choose:s52-callback-choice:' + hour);
      walkUntil(run, (beat) => beat.id === 's33-c1-choice');
      const before = JSON.stringify(run.get());
      rejectWithoutWrite(run, 'narrative:choose:s33-c1-choice:premium');
      run.act('narrative:choose:s33-c1-choice:' + (status === 'a' ? 'c' : 'a'));
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before, 'Back discarded alternate status');
      run.act('narrative:choose:s33-c1-choice:' + status);
      for (const [key, flag] of Object.entries(statusFlags))
        assert.equal(run.get().flags[flag], key === status ? true : undefined, flag);
      const fresh = runtime(clone(run.get()));
      walkUntil(fresh, (beat) => beat.id === 's33-status-choice');
      for (const other of ['a', 'b', 'c'].filter((id) => id !== status))
        rejectWithoutWrite(fresh, `narrative:choose:s33-status-choice:${other}`);
      fresh.act(`narrative:choose:s33-status-choice:${status}`);
      assert.equal(fresh.get().sceneId, status === 'c' ? 's35-intro'
        : status === 'a' ? 's53-active' : 's53-paused');
      assert.equal(fresh.get().routeIntent, 'nick');
      assert.equal(fresh.get().routeLock, 'nick');
      assert.equal(fresh.get().flags[statusFlags[status]], true);
      assert.equal(fresh.get().flags[hour === 'a' ? 's29-hour-walk' : 's29-hour-film'], true);
      assert.equal(fresh.get().flags[hour === 'a' ? 's29-hour-film' : 's29-hour-walk'], undefined);
      assert.equal(fresh.get().flags['beach-footage-safe-only'], true);
      for (const forbidden of ['nick-quote-released', 's33-publish-approved',
        's33-premium', 'teaser-uploaded', 'personal-recordings-deleted'])
        assert.equal(fresh.get().flags[forbidden], undefined);
      if (status === 'c' && clip === 'a' && hour === 'a' && reply === 'a') {
        walkUntil(fresh, (beat) => beat.id === 's35-c1-choice');
        fresh.act('narrative:choose:s35-c1-choice:b');
        walkUntil(fresh, (beat) => beat.id === 's63-c1-choice');
        fresh.act('narrative:choose:s63-c1-choice:a');
        walkUntil(fresh, (beat) => beat.id === 's63-c2-choice');
        fresh.act('narrative:choose:s63-c2-choice:b');
        const closed = runtime(clone(fresh.get()));
        walkUntil(closed, (beat) => beat.id === 's36-c1-choice');
        rejectWithoutWrite(closed, 'narrative:choose:s36-c1-choice:premium');
        const before = JSON.stringify(closed.get());
        closed.act('narrative:choose:s36-c1-choice:a');
        closed.act('narrative:back');
        assert.equal(JSON.stringify(closed.get()), before, 'Nick-closed S36 Back');
        closed.act('narrative:choose:s36-c1-choice:b');
        const atEnd = runtime(clone(closed.get()));
        walkUntil(atEnd, (beat) => beat.id === 's36-route-choice');
        atEnd.act('narrative:choose:s36-route-choice:nick');
        walkUntil(atEnd, (beat) => beat.id === 's36-after-m3-end-beat');
        assert.equal(atEnd.get().routeLock, 'nick');
        assert.equal(atEnd.get().flags['s33-status-closed'], true);
        assert.equal(atEnd.get().flags['s33-status-active'], undefined);
        assert.equal(atEnd.get().flags['s33-status-paused'], undefined);
        assert.equal(atEnd.get().flags['s63-next-venue'], true);
        assert.equal(atEnd.get().flags['s63-next-ticket'], undefined);
        assert.deepEqual(atEnd.get().flags, closed.get().flags);
      }
      if (status !== 'c') {
        walkUntil(fresh, (beat) => beat.id === 's53-c1-choice');
        rejectWithoutWrite(fresh, 'narrative:choose:s53-c1-choice:premium');
        const beforeC1 = JSON.stringify(fresh.get());
        fresh.act('narrative:choose:s53-c1-choice:' + (hour === 'a' ? 'b' : 'a'));
        fresh.act('narrative:back');
        assert.equal(JSON.stringify(fresh.get()), beforeC1, 'Back restores S53-C1');
        fresh.act('narrative:choose:s53-c1-choice:' + hour);
        walkUntil(fresh, (beat) => beat.id === 's53-c2-choice');
        rejectWithoutWrite(fresh, 'narrative:choose:s53-c2-choice:purchase');
        const restored = runtime(clone(fresh.get()));
        restored.act('narrative:choose:s53-c2-choice:' + reply);
        walkUntil(restored, (beat) => beat.id === 's36-c1-choice');
        rejectWithoutWrite(restored, 'narrative:choose:s36-c1-choice:premium');
        const beforeS36 = JSON.stringify(restored.get());
        restored.act('narrative:choose:s36-c1-choice:' + (hour === 'a' ? 'b' : 'a'));
        restored.act('narrative:back');
        assert.equal(JSON.stringify(restored.get()), beforeS36, 'S36-C1 Back on Nick route');
        restored.act('narrative:choose:s36-c1-choice:' + hour);
        const throughS36 = runtime(clone(restored.get()));
        walkUntil(throughS36, (beat) => beat.id === 's36-route-choice');
        throughS36.act('narrative:choose:s36-route-choice:nick');
        walkUntil(throughS36, (beat) => beat.id === 's36-after-m3-end-beat');
        assert.equal(restored.get().routeLock, 'nick');
        assert.equal(throughS36.get().routeLock, 'nick');
        assert.equal(restored.get().flags[statusFlags[status]], true);
        for (const forbidden of ['s53-premium', 's53-purchase',
          's53-share-approved', 'nick-date-booked', 's53-photo-uploaded',
          's53-external-message-sent'])
          assert.equal(restored.get().flags[forbidden], undefined);
      }
    }
});

test('real N1 rejects forged S33 status, route and actionLog with zero state writes', () => {
  const run = runtime(checkpointS29());
  run.act('narrative:choose:s29-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's29-c2-choice');
  run.act('narrative:choose:s29-c2-choice:b');
  walkUntil(run, (beat) => beat.id === 's52-c1-choice');
  run.act('narrative:choose:s52-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's52-callback-choice');
  run.act('narrative:choose:s52-callback-choice:b');
  walkUntil(run, (beat) => beat.id === 's33-c1-choice');
  run.act('narrative:choose:s33-c1-choice:b');
  const valid = clone(run.get());
  const forged = [
    { ...valid, routeLock: 'eric' },
    { ...valid, routeIntent: 'alice' },
    { ...valid, flags: { ...valid.flags, 's33-status-paused': false } },
    { ...valid, flags: { ...valid.flags, 's33-status-active': true } },
    { ...valid, flags: { ...valid.flags, 's29-hour-film': false } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'eric' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's29-c2-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's52-callback-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's33-c1-choice' ? { ...entry, optionId: 'c' } : entry) },
  ];
  for (const invalid of forged) {
    const before = JSON.stringify(invalid);
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s33-c1-b-01', phase: 'up', timestamp: 207,
        source: 'renderer' }], setState() { writes += 1; } }),
    /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
