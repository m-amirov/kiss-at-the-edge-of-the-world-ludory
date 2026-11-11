import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent original Episode-07 S29/S52 SHA-256, source lines 188–277.
// Hash expectations were pinned from the read-only manuscript, not game code.
const original = {
  's29-intro': [6, '3c2ee5292ce93bfefdf8b51a45d9c4e78ac605c4188412f5baea1598c94adcb9'],
  's29-c1-a': [1, 'ebaca876a97c037ec2c69b2f880b27b0194722c8e765d176f5d58d71834d2829'],
  's29-c1-b': [1, '10bc491c80eb224981a9489ad8f2c080bb76ddbac691f6508e0236d89b17b2d2'],
  's29-c1-c': [1, 'e155f22b3fea417b45b8ea5d63efb31915951c39da3529fa86173eeff626aff0'],
  's29-common': [1, '29a0477c8caa8215acfd5c0bd44060ce8e337df0dfbe61bae30c8e4903d2f19f'],
  's29-c2-a': [1, '817bda9e3e92f498101773eb6705a7685097b69ddb37085810adda7b1a853a96'],
  's29-c2-b': [1, 'ca9120a642e1306e3b1de9abf256aaf6d73455f4219dd8efcded14a71fef7a11'],
  's52-intro': [8, 'd8250d345ffbcec86cff9816dd70fc29194e4d127d3fa53c91e40c1559d9ce45'],
  's52-c1-a': [2, '6d7b26d988f5f2b33488c398432e111b5a30e4de85a981a1325290e51b5fdff0'],
  's52-c1-b': [2, 'b7f352a9cfc07a0a7fe80ff6a850bcc5cd3b407dfc19801dd57188c48a4e3459'],
  's52-common': [1, 'c5c3fd8da3f02e9adbf764eea113307e46041c7e0f7081a81271e91747c98f8a'],
  's52-callback-a': [1, '05d5c250eb2c7353f6d257c068ca769ae4d3e3038bd08c0a553ead73d68731af'],
  's52-callback-b': [1, '920b4acea37371287ddfe9513c7d5a1613ce9078713fa2422c0e3408c7184caf'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S29/S52 retain all 13 canonical authorial blocks and 27 original paragraphs', () => {
  assert.equal(Object.keys(original).length, 13);
  assert.equal(Object.values(original).reduce((sum, [n]) => sum + n, 0), 27);
  for (const [id, [count, hash]] of Object.entries(original)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      hash, `${id} verbatim source text`);
  }
});

test('S29/S52 have three free decisions and one exact guarded C2 payoff', () => {
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
    ['s29-intro', 's29-c1-choice', [
      ['a', 'Удалить его из фильма и исходников', 's29-c1-a'],
      ['b', 'Оставить фрагмент только в личном архиве Алисы', 's29-c1-b'],
      ['c', 'Переснять начало поездки сейчас, с её участием', 's29-c1-c'],
    ]],
    ['s29-common', 's29-c2-choice', [
      ['a', 'Выйти без камеры и просто погулять', 's29-c2-a'],
      ['b', 'Попросить его научить её снимать короткий немой фильм', 's29-c2-b'],
    ]],
    ['s52-intro', 's52-c1-choice', [
      ['a', 'Назвать прогулку свиданием', 's52-c1-a'],
      ['b', 'Предложить обычную прогулку завтра', 's52-c1-b'],
    ]],
  ];
  for (const [id, beatId, expected] of authored) {
    const options = choice(id, beatId).choices;
    assert.deepEqual(options.map(({ id: optionId, label, targetSceneId }) =>
      [optionId, label.ru, targetSceneId]), expected);
    for (const option of options) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'romancePoints', 'publishPermission', 'mediaPermission', 'consentToPublish']) {
        assert.equal(option[forbidden], undefined, `${beatId}.${option.id}: ${forbidden}`);
      }
      if (beatId !== 's29-c2-choice') assert.equal(option.effects, undefined);
      else assert.ok(option.effects.every(({ op }) => op === 'flag_set'));
    }
  }
  assert.deepEqual(choice('s29-common', 's29-c2-choice').choices.map(({ effects }) => effects), [
    [{ op: 'flag_set', id: 's29-hour-walk', value: true }],
    [{ op: 'flag_set', id: 's29-hour-film', value: true }],
  ]);
  for (const id of ['a', 'b', 'c']) {
    assert.equal(scene(`s29-c1-${id}`).nextSceneId, 's29-common');
  }
  for (const id of ['a', 'b']) {
    assert.equal(scene(`s29-c2-${id}`).nextSceneId, 's52-intro');
    assert.equal(scene(`s52-c1-${id}`).nextSceneId, 's52-common');
    assert.equal(scene(`s52-callback-${id}`).nextSceneId, 's33-intro');
  }
  assert.equal(scene('s52-common').nextSceneId, 's52-callback-dispatch');
  assert.deepEqual(choice('s52-callback-dispatch', 's52-callback-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's52-callback-a', { flag: 's29-hour-walk' }, undefined],
    ['b', 'Продолжить', 's52-callback-b', { flag: 's29-hour-film' }, undefined],
  ]);
  assert.equal(scene('s52-after-m3-end'), undefined, 'S52 Draft stop replaced by S33');
  assert.deepEqual(catalogData.interactions, []);
});

// Genuine replay from S01 through every previous scenario, no state injection.
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
        action, phase: 'up', timestamp: 203, source: 'renderer' }],
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
  assert.equal(JSON.stringify(run.get()), before, `${action}: changed rejected state`);
  assert.equal(run.writes(), writes, `${action}: rejected action wrote state`);
}

test('real N1 Nick route gate rejects Eric/Damir/Alice entry, Back and JSON', () => {
  const checkpoint = checkpointS26();
  for (const route of routes) {
    const run = runtime(checkpoint);
    run.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(run, (beat) => beat.id === `s26-${route}-evening-choice`);
    run.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(run, (beat) => beat.id === 's27-work-choice');
    run.act('narrative:choose:s27-work-choice:nick');
    walkUntil(run, (beat) => beat.id === 's59-song-choice');
    run.act('narrative:choose:s59-song-choice:eric');
    walkUntil(run, (beat) => beat.id === 's59-route-choice');
    assert.equal(run.get().routeLock, route);
    for (const other of routes.filter((id) => id !== route)) {
      rejectWithoutWrite(run, `narrative:choose:s59-route-choice:${other}`);
    }
    const before = JSON.stringify(run.get());
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const expected = route === 'nick' ? 's29-intro'
      : route === 'eric' ? 's28-intro' : route === 'damir' ? 's30-intro' : 's31-intro';
    assert.equal(run.get().sceneId, expected);
    run.act('narrative:back');
    assert.equal(JSON.stringify(run.get()), before);
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const reloaded = runtime(clone(run.get()));
    assert.equal(reloaded.get().sceneId, expected);
    assert.equal(reloaded.get().routeLock, route);
    assert.equal(reloaded.get().routeIntent, route);
  }
});

test('real N1 Nick: 3 clip permissions × 2 hours × 2 S52 responses, Back and JSON', () => {
  const base = runtime(checkpointS26());
  base.act('narrative:choose:s26-route-choice:nick');
  walkUntil(base, (beat) => beat.id === 's26-nick-evening-choice');
  base.act('narrative:choose:s26-nick-evening-choice:self');
  walkUntil(base, (beat) => beat.id === 's27-work-choice');
  base.act('narrative:choose:s27-work-choice:inga');
  walkUntil(base, (beat) => beat.id === 's59-song-choice');
  base.act('narrative:choose:s59-song-choice:damir');
  walkUntil(base, (beat) => beat.id === 's59-route-choice');
  base.act('narrative:choose:s59-route-choice:nick');
  walkUntil(base, (beat) => beat.id === 's29-c1-choice');
  const start = clone(base.get());
  for (const clip of ['a', 'b', 'c']) for (const hour of ['a', 'b']) {
    const run = runtime(start);
    rejectWithoutWrite(run, 'narrative:choose:s29-c1-choice:premium');
    run.act(`narrative:choose:s29-c1-choice:${clip}`);
    walkUntil(run, (beat) => beat.id === 's29-c2-choice');
    const beforeHour = JSON.stringify(run.get());
    run.act(`narrative:choose:s29-c2-choice:${hour}`);
    run.act('narrative:back');
    assert.equal(JSON.stringify(run.get()), beforeHour, 'Back restores S29-C2');
    run.act(`narrative:choose:s29-c2-choice:${hour}`);
    walkUntil(run, (beat) => beat.id === 's52-c1-choice');
    const beforeS52 = clone(run.get());
    for (const reply of ['a', 'b']) {
      const branch = runtime(beforeS52);
      branch.act(`narrative:choose:s52-c1-choice:${reply}`);
      walkUntil(branch, (beat) => beat.id === 's52-callback-choice');
      rejectWithoutWrite(branch,
        `narrative:choose:s52-callback-choice:${hour === 'a' ? 'b' : 'a'}`);
      branch.act(`narrative:choose:s52-callback-choice:${hour}`);
      assert.equal(branch.get().sceneId, `s52-callback-${hour}`);
      const fresh = runtime(clone(branch.get()));
      walkUntil(fresh, (_beat, id) => id === 's33-intro');
      assert.equal(fresh.get().routeIntent, 'nick');
      assert.equal(fresh.get().routeLock, 'nick');
      assert.equal(fresh.get().flags[hour === 'a' ? 's29-hour-walk' : 's29-hour-film'], true);
      assert.equal(fresh.get().flags[hour === 'a' ? 's29-hour-film' : 's29-hour-walk'], undefined);
      assert.equal(fresh.get().flags['beach-footage-safe-only'], true);
      for (const forbidden of ['s29-publish-approved', 'consentToPublish',
        'nick-can-use-clip', 'media-release-approved', 's29-premium']) {
        assert.equal(fresh.get().flags[forbidden], undefined);
      }
      assert.equal(fresh.get().flags['s17-evening-self'], true);
    }
  }
});

test('real N1 rejects forged S29 hour flags, route and actionLog without state writes', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:nick');
  walkUntil(run, (beat) => beat.id === 's26-nick-evening-choice');
  run.act('narrative:choose:s26-nick-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:bags');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:nick');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:nick');
  walkUntil(run, (beat) => beat.id === 's29-c1-choice');
  run.act('narrative:choose:s29-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's29-c2-choice');
  run.act('narrative:choose:s29-c2-choice:b');
  walkUntil(run, (beat) => beat.id === 's52-c1-choice');
  run.act('narrative:choose:s52-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's52-callback-choice');
  run.act('narrative:choose:s52-callback-choice:b');
  const valid = clone(run.get());
  const forged = [
    { ...valid, routeLock: 'eric' },
    { ...valid, routeIntent: 'damir' },
    { ...valid, flags: { ...valid.flags, 's29-hour-film': false } },
    { ...valid, flags: { ...valid.flags, 's29-hour-walk': true } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'eric' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's29-c1-choice' ? { ...entry, optionId: 'premium' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's52-callback-choice' ? { ...entry, optionId: 'a' } : entry) },
  ];
  for (const invalid of forged) {
    const before = JSON.stringify(invalid);
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s52-callback-b-01', phase: 'up',
        timestamp: 203, source: 'renderer' }],
      setState() { writes += 1; },
    }), /inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
