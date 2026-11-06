import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Derived from the pinned original episode-08 manuscript, lines 9–53,
// NOT from scene module source. Hash input: displayed paragraphs joined with \n\n.
const authored = {
  's32-intro': [11, '62b7bce565005ed0d87e7e53c0115d8b51786a62cb787c937defa2ff1bd480e6'],
  's32-c1-a': [2, 'e3a98b7127fd0999654d9ced34fde1622e23c7c80ab3e89020d1bb9707196c66'],
  's32-c1-b': [2, '7d7f0ef2af83a51c6f785cf3a385b22d9f74ee81759df3df62d3612c076b745a'],
  's32-c1-c': [2, '801c01e5d9b5b1a4966b8c28610179095b8556169019480f024fcaa7432a1e05'],
  's32-common': [1, 'c4459bf241b77cb666b5e928f37c920393e8e791508f729fb963d95f0c710022'],
};
const statusFlags = {
  a: 's32-status-active', b: 's32-status-paused', c: 's32-status-closed',
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S32 renders all five original authorial blocks and 18 paragraphs verbatim', () => {
  assert.equal(Object.keys(authored).length, 5);
  assert.equal(Object.values(authored).reduce((total, [count]) => total + count, 0), 18);
  for (const [id, [count, sha]] of Object.entries(authored)) {
    const rendered = prose(id);
    assert.equal(rendered.length, count, `${id} authorial paragraph count`);
    assert.equal(createHash('sha256').update(rendered.join('\n\n')).digest('hex'), sha,
      `${id} pinned original text hash`);
  }
});

test('S49 enters Eric-only S32; three free authored relationship statuses remain distinct', () => {
  for (const id of ['a', 'b']) assert.equal(scene(`s49-callback-${id}`).nextSceneId, 's32-intro');
  assert.equal(scene('s49-after-m3-end'), undefined);
  const decision = choice('s32-intro', 's32-c1-choice');
  assert.deepEqual(decision.choices.map(({ id, label, targetSceneId, effects }) =>
    [id, label.ru, targetSceneId, effects]), [
    ['a', 'Продолжить отношения, не решая зиму немедленно', 's32-c1-a',
      [{ op: 'flag_set', id: 's32-status-active', value: true }]],
    ['b', 'Попросить паузу без обещания свиданий', 's32-c1-b',
      [{ op: 'flag_set', id: 's32-status-paused', value: true }]],
    ['c', 'Закончить романтическую историю сейчас', 's32-c1-c',
      [{ op: 'flag_set', id: 's32-status-closed', value: true }]],
  ]);
  for (const option of decision.choices) {
    for (const forbidden of ['premium', 'cost', 'routeId', 'romancePoints',
      'requiredEntitlement', 'mediaPermission', 'publishPermission',
      'quoteRelease', 'workSacrifice', 'externalMessaging']) {
      assert.equal(option[forbidden], undefined, `S32 ${option.id}: ${forbidden}`);
    }
  }
  for (const id of ['a', 'b', 'c'])
    assert.equal(scene(`s32-c1-${id}`).nextSceneId, 's32-common');
  assert.equal(scene('s32-common').nextSceneId, 's32-status-dispatch');
  assert.deepEqual(choice('s32-status-dispatch', 's32-status-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's50-active', { flag: 's32-status-active' }, undefined],
    ['b', 'Продолжить', 's50-paused', { flag: 's32-status-paused' }, undefined],
    ['c', 'Продолжить', 's35-intro', { flag: 's32-status-closed' }, undefined],
  ]);
  assert.equal(scene('s32-after-m3-end'), undefined);
  assert.ok(scene('s50-active'));
  assert.ok(scene('s50-paused'));
  assert.deepEqual(catalogData.interactions, []);
});

// Construct genuine route and status via native N1 from S01, never inject flags.
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
        action, phase: 'up', timestamp: 205, source: 'renderer' }],
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
    assert.ok(beat, `missing beat ${sceneId}:${beatIndex}`);
    if (stop(beat, sceneId)) return;
    const before = `${sceneId}:${beatIndex}`;
    if (beat.type === 'dialogue') run.act(`narrative:next:${beat.id}`);
    else if (beat.type === 'choice') {
      assert.ok(actions[beat.id], `unmapped choice ${beat.id}`);
      run.act(`narrative:choose:${beat.id}:${actions[beat.id]}`);
    } else assert.fail(`premature ending ${sceneId}`);
    assert.notEqual(`${run.get().sceneId}:${run.get().beatIndex}`, before, `stalled ${before}`);
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
function checkpointS28() {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:eric');
  walkUntil(run, (beat) => beat.id === 's26-eric-evening-choice');
  run.act('narrative:choose:s26-eric-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:inga');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:eric');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:eric');
  walkUntil(run, (beat) => beat.id === 's28-c1-choice');
  return clone(run.get());
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `rejected ${action} changed state`);
  assert.equal(run.writes(), writes, `rejected ${action} wrote state`);
}

test('real N1 S26/S59 locks keep all non-Eric routes out of S32', () => {
  const checkpoint = checkpointS26();
  for (const route of ['nick', 'damir', 'alice']) {
    const run = runtime(checkpoint);
    run.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(run, (beat) => beat.id === `s26-${route}-evening-choice`);
    run.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(run, (beat) => beat.id === 's27-work-choice');
    run.act('narrative:choose:s27-work-choice:inga');
    walkUntil(run, (beat) => beat.id === 's59-song-choice');
    run.act('narrative:choose:s59-song-choice:eric');
    walkUntil(run, (beat) => beat.id === 's59-route-choice');
    rejectWithoutWrite(run, 'narrative:choose:s59-route-choice:eric');
    run.act(`narrative:choose:s59-route-choice:${route}`);
    assert.notEqual(run.get().sceneId, 's32-intro');
    assert.equal(run.get().routeLock, route);
  }
});

test('real N1 all 2×2×2×3 Eric day-15 outcomes restore Back, flags and JSON through S50', () => {
  const checkpoint = checkpointS28();
  for (const path of ['a', 'b']) for (const evening of ['a', 'b']) {
    for (const city of ['a', 'b']) for (const status of ['a', 'b', 'c']) {
      const run = runtime(checkpoint);
      run.act(`narrative:choose:s28-c1-choice:${path}`);
      walkUntil(run, (beat) => beat.id === 's28-c2-choice');
      run.act(`narrative:choose:s28-c2-choice:${evening}`);
      walkUntil(run, (beat) => beat.id === 's49-c1-choice');
      run.act(`narrative:choose:s49-c1-choice:${city}`);
      walkUntil(run, (beat) => beat.id === 's49-callback-choice');
      rejectWithoutWrite(run, `narrative:choose:s49-callback-choice:${evening === 'a' ? 'b' : 'a'}`);
      run.act(`narrative:choose:s49-callback-choice:${evening}`);
      walkUntil(run, (beat) => beat.id === 's32-c1-choice');
      const before = JSON.stringify(run.get());
      const other = status === 'a' ? 'c' : 'a';
      run.act(`narrative:choose:s32-c1-choice:${other}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before, 'Back must discard the alternate status');
      run.act(`narrative:choose:s32-c1-choice:${status}`);
      const flags = run.get().flags;
      for (const [key, flag] of Object.entries(statusFlags))
        assert.equal(flags[flag], key === status ? true : undefined, flag);
      assert.equal(flags[evening === 'a' ? 's28-evening-dance' : 's28-evening-quiet'], true);
      assert.equal(flags[evening === 'a' ? 's28-evening-quiet' : 's28-evening-dance'], undefined);
      const fresh = runtime(clone(run.get()));
      walkUntil(fresh, (beat) => beat.id === 's32-status-choice');
      for (const other of ['a', 'b', 'c'].filter((id) => id !== status))
        rejectWithoutWrite(fresh, `narrative:choose:s32-status-choice:${other}`);
      fresh.act(`narrative:choose:s32-status-choice:${status}`);
      assert.equal(fresh.get().sceneId, status === 'c' ? 's35-intro'
        : status === 'a' ? 's50-active' : 's50-paused');
      assert.equal(fresh.get().routeIntent, 'eric');
      assert.equal(fresh.get().routeLock, 'eric');
      assert.equal(fresh.get().flags[statusFlags[status]], true);
      assert.equal(fresh.get().flags['beach-footage-safe-only'], true);
      for (const forbidden of ['eric-quote-released', 's32-premium', 'eric-trip-planned',
        'alice-work-abandoned', 'article-published'])
        assert.equal(fresh.get().flags[forbidden], undefined);
      if (status === 'c' && path === 'a' && evening === 'a' && city === 'a') {
        walkUntil(fresh, (beat) => beat.id === 's35-c1-choice');
        fresh.act('narrative:choose:s35-c1-choice:a');
        walkUntil(fresh, (beat) => beat.id === 's63-c1-choice');
        fresh.act('narrative:choose:s63-c1-choice:b');
        walkUntil(fresh, (beat) => beat.id === 's63-c2-choice');
        fresh.act('narrative:choose:s63-c2-choice:a');
        const closed = runtime(clone(fresh.get()));
        walkUntil(closed, (beat) => beat.id === 's36-c1-choice');
        rejectWithoutWrite(closed, 'narrative:choose:s36-c1-choice:premium');
        const before = JSON.stringify(closed.get());
        closed.act('narrative:choose:s36-c1-choice:b');
        closed.act('narrative:back');
        assert.equal(JSON.stringify(closed.get()), before, 'Eric-closed S36 Back');
        closed.act('narrative:choose:s36-c1-choice:a');
        const atEnd = runtime(clone(closed.get()));
        walkUntil(atEnd, (beat) => beat.id === 's36-route-choice');
        atEnd.act('narrative:choose:s36-route-choice:eric-closed');
        walkUntil(atEnd, (beat) => beat.id === 's36-after-m3-end-beat');
        assert.equal(atEnd.get().routeLock, 'eric');
        assert.equal(atEnd.get().flags['s32-status-closed'], true);
        assert.equal(atEnd.get().flags['s32-status-active'], undefined);
        assert.equal(atEnd.get().flags['s32-status-paused'], undefined);
        assert.equal(atEnd.get().flags['s63-next-ticket'], true);
        assert.equal(atEnd.get().flags['s63-next-venue'], undefined);
        assert.deepEqual(atEnd.get().flags, closed.get().flags);
      }
      if (status !== 'c') {
        walkUntil(fresh, (beat) => beat.id === 's50-c1-choice');
        rejectWithoutWrite(fresh, 'narrative:choose:s50-c1-choice:invalid');
        const beforeC1 = JSON.stringify(fresh.get());
        fresh.act(`narrative:choose:s50-c1-choice:${path === 'a' ? 'b' : 'a'}`);
        fresh.act('narrative:back');
        assert.equal(JSON.stringify(fresh.get()), beforeC1, 'Back restores S50-C1');
        fresh.act(`narrative:choose:s50-c1-choice:${path}`);
        walkUntil(fresh, (beat) => beat.id === 's50-c2-choice');
        rejectWithoutWrite(fresh, 'narrative:choose:s50-c2-choice:invalid');
        const resumed = runtime(clone(fresh.get()));
        resumed.act(`narrative:choose:s50-c2-choice:${evening}`);
        walkUntil(resumed, (beat) => beat.id === 's36-c1-choice');
        rejectWithoutWrite(resumed, 'narrative:choose:s36-c1-choice:premium');
        const beforeS36 = JSON.stringify(resumed.get());
        resumed.act('narrative:choose:s36-c1-choice:' + (path === 'a' ? 'b' : 'a'));
        resumed.act('narrative:back');
        assert.equal(JSON.stringify(resumed.get()), beforeS36, 'S36-C1 Back on Eric route');
        resumed.act('narrative:choose:s36-c1-choice:' + path);
        const throughS36 = runtime(clone(resumed.get()));
        walkUntil(throughS36, (beat) => beat.id === 's36-route-choice');
        throughS36.act('narrative:choose:s36-route-choice:' +
          (status === 'a' ? 'eric-active' : 'eric-paused'));
        walkUntil(throughS36, (beat) => beat.id === 's37-c1-choice');
        assert.equal(resumed.get().routeLock, 'eric');
        assert.equal(throughS36.get().routeLock, 'eric');
        assert.equal(resumed.get().flags[statusFlags[status]], true);
        for (const forbidden of ['s50-premium', 's50-purchase',
          'eric-family-commitment', 'eric-photo-published'])
          assert.equal(resumed.get().flags[forbidden], undefined);
      }
    }
  }
});

test('real N1 rejects forged S32 status, previous callback, route and action provenance', () => {
  const run = runtime(checkpointS28());
  run.act('narrative:choose:s28-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's28-c2-choice');
  run.act('narrative:choose:s28-c2-choice:a');
  walkUntil(run, (beat) => beat.id === 's49-c1-choice');
  run.act('narrative:choose:s49-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's49-callback-choice');
  run.act('narrative:choose:s49-callback-choice:a');
  walkUntil(run, (beat) => beat.id === 's32-c1-choice');
  rejectWithoutWrite(run, 'narrative:choose:s32-c1-choice:invalid');
  run.act('narrative:choose:s32-c1-choice:b');
  const valid = clone(run.get());
  const forged = [
    { ...valid, routeLock: 'nick' },
    { ...valid, routeIntent: 'damir' },
    { ...valid, flags: { ...valid.flags, 's32-status-paused': false } },
    { ...valid, flags: { ...valid.flags, 's32-status-active': true } },
    { ...valid, flags: { ...valid.flags, 's28-evening-dance': false } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'nick' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's28-c2-choice' ? { ...entry, optionId: 'b' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's49-callback-choice' ? { ...entry, optionId: 'b' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's32-c1-choice' ? { ...entry, optionId: 'c' } : entry) },
  ];
  for (const invalid of forged) {
    const before = JSON.stringify(invalid);
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s32-c1-b-01', phase: 'up', timestamp: 205,
        source: 'renderer' }], setState() { writes += 1; } }),
    /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});

test('real N1 Eric day-18 S37 respects active/paused, S50 callback, close, Back and JSON', () => {
  const origin = runtime(checkpointS28());
  origin.act('narrative:choose:s28-c1-choice:a');
  walkUntil(origin, (beat) => beat.id === 's28-c2-choice');
  origin.act('narrative:choose:s28-c2-choice:b');
  walkUntil(origin, (beat) => beat.id === 's49-c1-choice');
  origin.act('narrative:choose:s49-c1-choice:a');
  walkUntil(origin, (beat) => beat.id === 's49-callback-choice');
  origin.act('narrative:choose:s49-callback-choice:b');
  walkUntil(origin, (beat) => beat.id === 's32-c1-choice');
  const beforeStatus = clone(origin.get());

  for (const status of ['a', 'b']) for (const family of ['a', 'b']) {
    for (const outcome of ['a', 'b']) {
      const run = runtime(beforeStatus);
      run.act(`narrative:choose:s32-c1-choice:${status}`);
      walkUntil(run, (beat) => beat.id === 's32-status-choice');
      run.act(`narrative:choose:s32-status-choice:${status}`);
      walkUntil(run, (beat) => beat.id === 's50-c1-choice');
      run.act('narrative:choose:s50-c1-choice:a');
      walkUntil(run, (beat) => beat.id === 's50-c2-choice');
      run.act(`narrative:choose:s50-c2-choice:${family}`);
      walkUntil(run, (beat) => beat.id === 's36-c1-choice');
      run.act('narrative:choose:s36-c1-choice:b');
      walkUntil(run, (beat) => beat.id === 's36-route-choice');
      rejectWithoutWrite(run, 'narrative:choose:s36-route-choice:eric-closed');
      rejectWithoutWrite(run, 'narrative:choose:s36-route-choice:nick');
      rejectWithoutWrite(run, 'narrative:choose:s36-route-choice:' +
        (status === 'a' ? 'eric-paused' : 'eric-active'));
      run.act('narrative:choose:s36-route-choice:' +
        (status === 'a' ? 'eric-active' : 'eric-paused'));
      walkUntil(run, (beat) => beat.id === 's37-c1-choice');
      assert.equal(run.get().routeLock, 'eric');
      assert.equal(run.get().flags[statusFlags[status]], true);
      assert.ok(run.get().visitedScenes.includes(status === 'a' ? 's37-active' : 's37-paused'));
      const beforeC1 = JSON.stringify(run.get());
      run.act('narrative:choose:s37-c1-choice:' + (outcome === 'a' ? 'b' : 'a'));
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), beforeC1, 'S37-C1 Back restores status choice');
      run.act(`narrative:choose:s37-c1-choice:${outcome}`);
      assert.equal(run.get().flags[outcome === 'a' ? 's37-status-continues' : 's37-status-closed'], true);
      assert.equal(run.get().flags[outcome === 'a' ? 's37-status-closed' : 's37-status-continues'], undefined);
      walkUntil(run, (beat) => beat.id === 's37-s50-choice');
      rejectWithoutWrite(run, 'narrative:choose:s37-s50-choice:' + (family === 'a' ? 'b' : 'a'));
      run.act(`narrative:choose:s37-s50-choice:${family}`);
      assert.equal(run.get().flags[family === 'a' ? 's50-family-story' : 's50-sister-gift'], true);
      assert.equal(run.get().flags[family === 'a' ? 's50-sister-gift' : 's50-family-story'], undefined);
      walkUntil(run, (beat) => beat.id === 's37-status-choice');
      rejectWithoutWrite(run, 'narrative:choose:s37-status-choice:' +
        (outcome === 'a' ? 'closed' : 'continue'));
      const resumed = runtime(clone(run.get())); // fresh N1 validates complete action provenance
      resumed.act('narrative:choose:s37-status-choice:' +
        (outcome === 'a' ? 'continue' : 'closed'));
      if (outcome === 'b') {
        walkUntil(resumed, (beat) => beat.id === 's37-after-closed-end-beat');
        assert.ok(!resumed.get().visitedScenes.includes('s37-c2'),
          'explicit end of romance must skip the later romantic morning');
        assert.equal(resumed.get().flags['s37-status-closed'], true);
      } else {
        walkUntil(resumed, (beat) => beat.id === 's37-c2-choice');
        rejectWithoutWrite(resumed, 'narrative:choose:s37-c2-choice:premium');
        const beforeC2 = JSON.stringify(resumed.get());
        resumed.act('narrative:choose:s37-c2-choice:' + (family === 'a' ? 'b' : 'a'));
        resumed.act('narrative:back');
        assert.equal(JSON.stringify(resumed.get()), beforeC2, 'S37-C2 Back restores the choice');
        resumed.act(`narrative:choose:s37-c2-choice:${family}`);
        const restored = runtime(clone(resumed.get()));
        walkUntil(restored, (beat) => beat.id === 's37-after-open-end-beat');
        assert.equal(restored.get().flags[family === 'a'
          ? 's37-morning-sunrise' : 's37-morning-breakfast'], true);
        assert.equal(restored.get().flags[family === 'a'
          ? 's37-morning-breakfast' : 's37-morning-sunrise'], undefined);
      }
      assert.equal(resumed.get().routeLock, 'eric');
      assert.equal(resumed.get().flags['s28-evening-quiet'], true);
      assert.equal(resumed.get().flags['beach-footage-safe-only'], true);
    }
  }

  // An externally modified status or choice log must not become valid on resume.
  const valid = runtime(beforeStatus);
  valid.act('narrative:choose:s32-c1-choice:a');
  walkUntil(valid, (beat) => beat.id === 's32-status-choice');
  valid.act('narrative:choose:s32-status-choice:a');
  walkUntil(valid, (beat) => beat.id === 's50-c1-choice');
  valid.act('narrative:choose:s50-c1-choice:a');
  walkUntil(valid, (beat) => beat.id === 's50-c2-choice');
  valid.act('narrative:choose:s50-c2-choice:a');
  walkUntil(valid, (beat) => beat.id === 's36-c1-choice');
  valid.act('narrative:choose:s36-c1-choice:a');
  walkUntil(valid, (beat) => beat.id === 's36-route-choice');
  valid.act('narrative:choose:s36-route-choice:eric-active');
  walkUntil(valid, (beat) => beat.id === 's37-c1-choice');
  valid.act('narrative:choose:s37-c1-choice:a');
  const snapshot = clone(valid.get());
  for (const forged of [
    { ...snapshot, flags: { ...snapshot.flags, 's37-status-closed': true } },
    { ...snapshot, flags: { ...snapshot.flags, 's50-sister-gift': true } },
    { ...snapshot, actionLog: snapshot.actionLog.map((entry) =>
      entry.beatId === 's37-c1-choice' ? { ...entry, optionId: 'b' } : entry) },
  ]) {
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: valid.graph, catalog: valid.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: forged },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s37-c1-a-01', phase: 'up', timestamp: 205,
        source: 'renderer' }], setState() { writes += 1; } }), TypeError);
    assert.equal(writes, 0, 'forged S37 state is never written');
  }
});
