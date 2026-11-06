import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Derived from pinned original EP07 S31/S62 (lines 378–455), not from game code.
// Hash input: displayed paragraphs joined by exactly two newline characters.
const original = {
  's31-intro': [7, 'dd93808bc1c69237932e5fb381d9cb06977bd97ecc59fc71a73ef7cb118f9d35'],
  's31-c1-a': [1, 'e5d67d6d93110604569bdb5eb34d40bab8883dba4c55136020332910eb2d7fc1'],
  's31-c1-b': [1, '037779b8f45e5c746d31b344856aeaaa24fa4686382a1a552a3b529a4fcfc1aa'],
  's31-common': [1, 'dc5bea1de0403c7444d0d21f0afa678418708704208fc3d50f1f7eb214c1c90f'],
  's31-c2-a': [1, '6d4c02d24274079c677d03472ca204b902f41c98091442117a50aacf887e0206'],
  's31-c2-b': [1, '01fb91bbd9451477e74cf7b513aacbe3121ad14076c7e348c14bbe99d8bf5e19'],
  's62-intro': [3, '1ae48466a2f36e9fa7f4b8d4b5b276007f1e34c4179f1f81daade4b6caaff9b4'],
  's62-c1-a': [1, '7b17d7ad15355590c698c71bef06e2fdda74e020ca8690b5f08ef5e7750a2655'],
  's62-c1-b': [1, '4ba1b25df462327f1b56830f369f192271a0271fdd1f5c4b39b562401fc3d79f'],
  's62-common': [1, 'd108a51709d5835c9976a1150c1a8ca53558f4da3321051ad2e55a4f97f666e3'],
  's62-callback-a': [1, '251218d94fba48feb5e0f652674e564dc07fe9bdf8e3de4c06449723fbb25e62'],
  's62-callback-b': [1, '79817810cecb51f5bd2c4c742b5590a998ce826e3014231e932d0a501da639d1'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S31/S62 preserve 12 independent source blocks and 20 paragraphs verbatim', () => {
  assert.equal(Object.keys(original).length, 12);
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 20);
  for (const [id, [count, hash]] of Object.entries(original)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, `${id} source paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      hash, `${id} source SHA-256`);
  }
});

test('S31/S62 attach only Alice route and retain three free privacy-safe decisions', () => {
  const gate = choice('s59-route-dispatch', 's59-route-choice');
  assert.deepEqual(gate.choices.map(({ id, routeId, targetSceneId, effects }) =>
    [id, routeId, targetSceneId, effects]), [
    ['eric', 'eric', 's28-intro', undefined],
    ['nick', 'nick', 's29-intro', undefined],
    ['damir', 'damir', 's30-intro', undefined],
    ['alice', 'alice', 's31-intro', undefined],
  ]);
  for (const option of gate.choices) assert.equal(option.label.ru, 'Продолжить');
  const authored = [
    ['s31-intro', 's31-c1-choice', [
      ['a', 'Сделать героиней Ингу — после отдельного согласования', 's31-c1-a'],
      ['b', 'Рассказать об общей поездке без чужих личных подробностей', 's31-c1-b'],
    ]],
    ['s31-common', 's31-c2-choice', [
      ['a', 'Записать короткое письмо себе домой', 's31-c2-a'],
      ['b', 'Самостоятельно выбрать место для завтрашнего завтрака', 's31-c2-b'],
    ]],
    ['s62-intro', 's62-c1-choice', [
      ['a', 'Подруге, с которой давно не виделась', 's62-c1-a'],
      ['b', 'Никому: оставить этот день без отчёта', 's62-c1-b'],
    ]],
  ];
  for (const [id, beatId, expected] of authored) {
    const options = choice(id, beatId).choices;
    assert.deepEqual(options.map(({ id: optionId, label, targetSceneId }) =>
      [optionId, label.ru, targetSceneId]), expected);
    for (const option of options) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'romancePoints', 'publishPermission', 'mediaPermission', 'consentToPublish',
        'ingaPublishApproved', 'friendMessageSent', 'externalMessaging', 'reportingApproved']) {
        assert.equal(option[forbidden], undefined, `${beatId}.${option.id}: ${forbidden}`);
      }
      if (beatId === 's31-c2-choice') assert.ok(option.effects.every(({ op }) => op === 'flag_set'));
      else assert.equal(option.effects, undefined);
    }
  }
  assert.deepEqual(choice('s31-common', 's31-c2-choice').choices.map(({ effects }) => effects), [
    [{ op: 'flag_set', id: 's31-self-letter', value: true }],
    [{ op: 'flag_set', id: 's31-self-breakfast', value: true }],
  ]);
  for (const id of ['a', 'b']) {
    assert.equal(scene(`s31-c1-${id}`).nextSceneId, 's31-common');
    assert.equal(scene(`s31-c2-${id}`).nextSceneId, 's62-intro');
    assert.equal(scene(`s62-c1-${id}`).nextSceneId, 's62-common');
    assert.equal(scene(`s62-callback-${id}`).nextSceneId, 's35-intro');
  }
  assert.equal(scene('s62-common').nextSceneId, 's62-callback-dispatch');
  assert.deepEqual(choice('s62-callback-dispatch', 's62-callback-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's62-callback-a', { flag: 's31-self-letter' }, undefined],
    ['b', 'Продолжить', 's62-callback-b', { flag: 's31-self-breakfast' }, undefined],
  ]);
  assert.equal(scene('s59-after-m3-end'), undefined, 'obsolete technical S59 ending removed');
  assert.equal(scene('s62-after-m3-end'), undefined, 'obsolete draft end removed');
  assert.deepEqual(catalogData.interactions, []);
});

// Actual N1 from S01: decisions are replayed, never injected as direct flags.
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
        action, phase: 'up', timestamp: 204, source: 'renderer' }],
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
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `${action}: rejected action changed state`);
  assert.equal(run.writes(), writes, `${action}: rejected action wrote state`);
}

test('real N1 S59 gates independent Alice to S31 and preserves the other three locks', () => {
  const checkpoint = checkpointS26();
  for (const route of routes) {
    const run = runtime(checkpoint);
    run.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(run, (beat) => beat.id === `s26-${route}-evening-choice`);
    run.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(run, (beat) => beat.id === 's27-work-choice');
    run.act('narrative:choose:s27-work-choice:inga');
    walkUntil(run, (beat) => beat.id === 's59-song-choice');
    run.act('narrative:choose:s59-song-choice:nick');
    walkUntil(run, (beat) => beat.id === 's59-route-choice');
    assert.equal(run.get().routeLock, route);
    for (const other of routes.filter((id) => id !== route))
      rejectWithoutWrite(run, `narrative:choose:s59-route-choice:${other}`);
    const before = JSON.stringify(run.get());
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const expected = { eric: 's28-intro', nick: 's29-intro', damir: 's30-intro', alice: 's31-intro' }[route];
    assert.equal(run.get().sceneId, expected);
    run.act('narrative:back');
    assert.equal(JSON.stringify(run.get()), before);
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const fresh = runtime(clone(run.get()));
    const opening = scene(expected).beats[0];
    fresh.act(`narrative:next:${opening.id}`);
    assert.equal(fresh.get().sceneId, expected);
    assert.equal(fresh.get().beatIndex, 1, `${route} resumed after JSON`);
    assert.equal(fresh.get().routeLock, route);
    assert.equal(fresh.get().routeIntent, route);
  }
});

test('real N1 Alice: all 2×2×2 paths, sequential Back changes, callback and JSON restore', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:alice');
  walkUntil(run, (beat) => beat.id === 's26-alice-evening-choice');
  run.act('narrative:choose:s26-alice-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:bags');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:eric');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:alice');
  walkUntil(run, (beat) => beat.id === 's31-c1-choice');
  const start = clone(run.get());
  for (const article of ['a', 'b']) for (const day of ['a', 'b']) {
    const branch = runtime(start);
    const otherArticle = article === 'a' ? 'b' : 'a';
    const beforeArticle = JSON.stringify(branch.get());
    branch.act(`narrative:choose:s31-c1-choice:${otherArticle}`);
    branch.act('narrative:back');
    assert.equal(JSON.stringify(branch.get()), beforeArticle, 'S31-C1 Back restores article choice');
    branch.act(`narrative:choose:s31-c1-choice:${article}`);
    walkUntil(branch, (beat) => beat.id === 's31-c2-choice');
    const beforeDay = JSON.stringify(branch.get());
    const alternate = day === 'a' ? 'b' : 'a';
    branch.act(`narrative:choose:s31-c2-choice:${alternate}`);
    branch.act('narrative:back');
    assert.equal(JSON.stringify(branch.get()), beforeDay, 'S31-C2 Back removes alternate flag');
    branch.act(`narrative:choose:s31-c2-choice:${day}`);
    assert.equal(branch.get().flags[day === 'a' ? 's31-self-letter' : 's31-self-breakfast'], true);
    assert.equal(branch.get().flags[day === 'a' ? 's31-self-breakfast' : 's31-self-letter'], undefined);
    walkUntil(branch, (beat) => beat.id === 's62-c1-choice');
    const beforeS62 = JSON.stringify(branch.get());
    for (const reply of ['a', 'b']) {
      const chosen = runtime(clone(branch.get()));
      const other = reply === 'a' ? 'b' : 'a';
      chosen.act(`narrative:choose:s62-c1-choice:${other}`);
      chosen.act('narrative:back');
      assert.equal(JSON.stringify(chosen.get()), beforeS62, 'S62-C1 Back restores choice');
      chosen.act(`narrative:choose:s62-c1-choice:${reply}`);
      walkUntil(chosen, (beat) => beat.id === 's62-callback-choice');
      rejectWithoutWrite(chosen, `narrative:choose:s62-callback-choice:${alternate}`);
      chosen.act(`narrative:choose:s62-callback-choice:${day}`);
      assert.equal(chosen.get().sceneId, `s62-callback-${day}`);
      const fresh = runtime(clone(chosen.get()));
      walkUntil(fresh, (_beat, id) => id === 's35-intro');
      assert.equal(fresh.get().routeIntent, 'alice');
      assert.equal(fresh.get().routeLock, 'alice');
      assert.equal(fresh.get().flags[day === 'a' ? 's31-self-letter' : 's31-self-breakfast'], true);
      assert.equal(fresh.get().flags[day === 'a' ? 's31-self-breakfast' : 's31-self-letter'], undefined);
      for (const forbidden of ['inga-publish-approved', 'friend-message-sent',
        'alice-media-release', 's31-premium', 'article-published']) {
        assert.equal(fresh.get().flags[forbidden], undefined);
      }
      assert.equal(fresh.get().flags['beach-footage-safe-only'], true);
      // One genuine S01→Alice checkpoint exercises all eight S35/S63 authorial
      // combinations; the outer loop above separately verifies all S62 entrances.
      if (article === 'a' && day === 'a' && reply === 'a') {
        const atS35 = clone(fresh.get());
        for (const editorial of ['a', 'b']) for (const concert of ['a', 'b'])
          for (const evening of ['a', 'b']) {
            const solo = runtime(atS35);
            walkUntil(solo, (beat) => beat.id === 's35-c1-choice');
            rejectWithoutWrite(solo, 'narrative:choose:s35-c1-choice:premium');
            const beforeEditorial = JSON.stringify(solo.get());
            solo.act('narrative:choose:s35-c1-choice:' + (editorial === 'a' ? 'b' : 'a'));
            solo.act('narrative:back');
            assert.equal(JSON.stringify(solo.get()), beforeEditorial);
            solo.act('narrative:choose:s35-c1-choice:' + editorial);
            walkUntil(solo, (beat) => beat.id === 's63-c1-choice');
            const beforeConcert = JSON.stringify(solo.get());
            solo.act('narrative:choose:s63-c1-choice:' + (concert === 'a' ? 'b' : 'a'));
            solo.act('narrative:back');
            assert.equal(JSON.stringify(solo.get()), beforeConcert);
            solo.act('narrative:choose:s63-c1-choice:' + concert);
            walkUntil(solo, (beat) => beat.id === 's63-c2-choice');
            const beforeEvening = JSON.stringify(solo.get());
            solo.act('narrative:choose:s63-c2-choice:' + (evening === 'a' ? 'b' : 'a'));
            solo.act('narrative:back');
            assert.equal(JSON.stringify(solo.get()), beforeEvening);
            solo.act('narrative:choose:s63-c2-choice:' + evening);
            const finalState = clone(solo.get());
            const resumed = runtime(finalState);
            walkUntil(resumed, (_beat, id) => id === 's63-after-m3-end');
            assert.equal(resumed.get().routeIntent, 'alice');
            assert.equal(resumed.get().routeLock, 'alice');
            assert.equal(resumed.get().flags[evening === 'a'
              ? 's63-next-ticket' : 's63-next-venue'], true);
            assert.equal(resumed.get().flags[evening === 'a'
              ? 's63-next-venue' : 's63-next-ticket'], undefined);
            for (const forbidden of ['article-published', 'inga-publish-approved',
              'friend-message-sent', 'concert-booked', 's63-premium'])
              assert.equal(resumed.get().flags[forbidden], undefined);
            if (editorial === 'a' && concert === 'a' && evening === 'a') {
              const forged = [
                { ...finalState, routeLock: 'damir' },
                { ...finalState, flags: { ...finalState.flags, 's63-next-ticket': false } },
                { ...finalState, flags: { ...finalState.flags, 's63-next-venue': true } },
                { ...finalState, actionLog: finalState.actionLog.map((entry) =>
                  entry.beatId === 's35-c1-choice' ? { ...entry, optionId: 'b' } : entry) },
                { ...finalState, actionLog: finalState.actionLog.map((entry) =>
                  entry.beatId === 's63-c1-choice' ? { ...entry, optionId: 'b' } : entry) },
                { ...finalState, actionLog: finalState.actionLog.map((entry) =>
                  entry.beatId === 's63-c2-choice' ? { ...entry, optionId: 'b' } : entry) },
              ];
              for (const invalid of forged) {
                const original = JSON.stringify(invalid);
                let writes = 0;
                const update = createNarrativeRuntimeUpdate({ graph: solo.graph, catalog: solo.catalog });
                assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
                  inputs: [{ schemaVersion: 1, type: 'pointer',
                    action: 'narrative:next:s63-c2-a-01', phase: 'up',
                    timestamp: 204, source: 'renderer' }],
                  setState() { writes += 1; },
                }), /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/);
                assert.equal(writes, 0);
                assert.equal(JSON.stringify(invalid), original);
              }
            }
          }
      }
    }
  }
});

test('real N1 rejects forged Alice route, S31 self flags and action provenance without writes', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:alice');
  walkUntil(run, (beat) => beat.id === 's26-alice-evening-choice');
  run.act('narrative:choose:s26-alice-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:nick');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:damir');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:alice');
  walkUntil(run, (beat) => beat.id === 's31-c1-choice');
  run.act('narrative:choose:s31-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's31-c2-choice');
  run.act('narrative:choose:s31-c2-choice:b');
  walkUntil(run, (beat) => beat.id === 's62-c1-choice');
  run.act('narrative:choose:s62-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's62-callback-choice');
  run.act('narrative:choose:s62-callback-choice:b');
  const valid = clone(run.get());
  const forged = [
    { ...valid, routeLock: 'nick' },
    { ...valid, routeIntent: 'damir' },
    { ...valid, flags: { ...valid.flags, 's31-self-breakfast': false } },
    { ...valid, flags: { ...valid.flags, 's31-self-letter': true } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'nick' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's31-c1-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's31-c2-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's62-c1-choice' ? { ...entry, optionId: 'b' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's62-callback-choice' ? { ...entry, optionId: 'a' } : entry) },
  ];
  for (const invalid of forged) {
    let writes = 0;
    const before = JSON.stringify(invalid);
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s62-callback-b-01', phase: 'up',
        timestamp: 204, source: 'renderer' }],
      setState() { writes += 1; },
    }), /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
