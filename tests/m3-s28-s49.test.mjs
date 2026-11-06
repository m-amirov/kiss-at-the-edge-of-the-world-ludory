import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently pinned player-facing paragraphs of the original episode-07
// manuscript, lines 89–182. Neither hashes nor expectations use game prose.
const authorialProof = {
  's28-intro': [11, 'e98cdd4d11aae39cc4eb628870ead43f75fa9f73728b533bf5d59435c3606f08'],
  's28-c1-a': [2, '54e2d7a53fdbcaa6b84a48d18e17e1d66eb83d6ada068727e8190c8a1d0ae032'],
  's28-c1-b': [1, '3a801e46ce6d51e18b930dde067eb9dd6a8d4addf1b281206c3a4f4de9d8e298'],
  's28-common': [1, '2862bb0162997160193e79324ae5fb3d89255bb2a9321157116d69b9829439eb'],
  's28-c2-a': [1, '2b436d2ef29eed1474b8872903bf01513cac4fa62283d69678cde7b15f414963'],
  's28-c2-b': [1, 'c241f53e9f129fa0d393f72f2e54687766e84f732be10433917d03b702951dbc'],
  's49-intro': [7, '207ac0997768d69fef5384b499352b7e208bc8561841eb578cbc34419ac9cc01'],
  's49-c1-a': [2, 'ce9e4f4768e016d9d44e43116a4d2e9d1c4e8fe750a403f30bd8b499d652963e'],
  's49-c1-b': [1, '4adb04e25aa6a65879a6332d799966ed98a80f781829696fcea9e760534d8659'],
  's49-common': [1, 'ffeb2926b98a90c362290aa21bc5c05de29cd405facb760e5a5731328369cc68'],
  's49-callback-a': [1, 'e7a6a5ad3cf58b39d9b8705e612e2c3dc6f3baba41ce1f22f65af7f029235988'],
  's49-callback-b': [1, 'c7433828cd17413c90378296ed05faa4b763e224f1fbcbcffac68c445a8f27a7'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S28 and S49 reproduce all 12 canonical authorial prose blocks verbatim', () => {
  assert.equal(Object.keys(authorialProof).length, 12);
  assert.equal(Object.values(authorialProof).reduce((sum, [count]) => sum + count, 0), 30);
  for (const [sceneId, [count, originalHash]] of Object.entries(authorialProof)) {
    const paragraphs = prose(sceneId);
    assert.equal(paragraphs.length, count, `${sceneId} paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      originalHash, `${sceneId} original authored text`);
  }
});

test('S59 continues into only the selected locked route; Eric three choices free', () => {
  assert.equal(scene('s59-common').nextSceneId, 's59-route-dispatch');
  const gate = choice('s59-route-dispatch', 's59-route-choice');
  assert.deepEqual(gate.choices.map(({ id, routeId, targetSceneId, label, effects, when }) =>
    [id, routeId, targetSceneId, label.ru, effects, when]), [
    ['eric', 'eric', 's28-intro', 'Продолжить', undefined, undefined],
    ['nick', 'nick', 's29-intro', 'Продолжить', undefined, undefined],
    ['damir', 'damir', 's30-intro', 'Продолжить', undefined, undefined],
    ['alice', 'alice', 's31-intro', 'Продолжить', undefined, undefined],
  ]);
  assert.equal(scene('s62-callback-a').nextSceneId, 's35-intro');
  const checks = [
    ['s28-intro', 's28-c1-choice', [
      ['a', 'Попросить Эрика показать более спокойную дорогу', 's28-c1-a'],
      ['b', 'Предложить ему идти рядом и не выбирать лидера', 's28-c1-b'],
    ]],
    ['s28-common', 's28-c2-choice', [
      ['a', 'Поставить ту самую песню и пригласить его на танец', 's28-c2-a'],
      ['b', 'Провести вместе тихий вечер без планов', 's28-c2-b'],
    ]],
    ['s49-intro', 's49-c1-choice', [
      ['a', 'Пригласить Эрика на второй танец', 's49-c1-a'],
      ['b', 'Предложить выйти к озеру вдвоём', 's49-c1-b'],
    ]],
  ];
  for (const [sceneId, beatId, expected] of checks) {
    const options = choice(sceneId, beatId).choices;
    assert.deepEqual(options.map(({ id, label, targetSceneId }) =>
      [id, label.ru, targetSceneId]), expected);
    for (const option of options) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'romancePoints', 'publishPermission', 'mediaPermission']) {
        assert.equal(option[forbidden], undefined, `${beatId}.${option.id}: ${forbidden}`);
      }
      assert.equal(option.effects?.some(({ op }) => op !== 'flag_set') ?? false, false);
    }
  }
  assert.deepEqual(choice('s28-common', 's28-c2-choice').choices.map(({ effects }) => effects), [
    [{ op: 'flag_set', id: 's28-evening-dance', value: true }],
    [{ op: 'flag_set', id: 's28-evening-quiet', value: true }],
  ]);
  assert.equal(scene('s28-c1-a').nextSceneId, 's28-common');
  assert.equal(scene('s28-c1-b').nextSceneId, 's28-common');
  assert.equal(scene('s28-c2-a').nextSceneId, 's49-intro');
  assert.equal(scene('s28-c2-b').nextSceneId, 's49-intro');
  assert.equal(scene('s49-c1-a').nextSceneId, 's49-common');
  assert.equal(scene('s49-c1-b').nextSceneId, 's49-common');
  const callback = choice('s49-callback-dispatch', 's49-callback-choice');
  assert.deepEqual(callback.choices.map(({ id, targetSceneId, when }) =>
    [id, targetSceneId, when]), [
    ['a', 's49-callback-a', { flag: 's28-evening-dance' }],
    ['b', 's49-callback-b', { flag: 's28-evening-quiet' }],
  ]);
  for (const option of callback.choices) {
    assert.equal(option.label.ru, 'Продолжить');
    assert.equal(option.effects, undefined);
  }
  assert.equal(scene('s49-common').nextSceneId, 's49-callback-dispatch');
  assert.equal(scene('s49-callback-a').nextSceneId, 's32-intro');
  assert.equal(scene('s49-callback-b').nextSceneId, 's32-intro');
  assert.equal(scene('s49-after-m3-end'), undefined);
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
        action, phase: 'up', timestamp: 201, source: 'renderer' }],
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
    } else assert.fail(`premature ending at ${sceneId}`);
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
  const count = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `rejection changed state: ${action}`);
  assert.equal(run.writes(), count, `rejection wrote state: ${action}`);
}

test('real N1 routeLock blocks Eric chapter on all other routes, with zero writes', () => {
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
    assert.equal(run.get().routeIntent, route);
    for (const forbidden of routes.filter((other) => other !== route)) {
      rejectWithoutWrite(run, `narrative:choose:s59-route-choice:${forbidden}`);
    }
    const before = JSON.stringify(run.get());
    run.act(`narrative:choose:s59-route-choice:${route}`);
    assert.equal(run.get().sceneId, route === 'eric' ? 's28-intro'
      : route === 'nick' ? 's29-intro' : route === 'damir' ? 's30-intro' : 's31-intro');
    run.act('narrative:back');
    assert.equal(JSON.stringify(run.get()), before, `Back route dispatcher ${route}`);
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const restored = runtime(clone(run.get()));
    assert.equal(restored.get().routeLock, route, `JSON route lock ${route}`);
    assert.equal(restored.get().sceneId, route === 'eric' ? 's28-intro'
      : route === 'nick' ? 's29-intro' : route === 'damir' ? 's30-intro' : 's31-intro');
  }
});

test('real N1 Eric: S28-C1 × S28-C2 × S49-C1, callbacks, Back and JSON provenance', () => {
  const checkpoint = checkpointS26();
  const base = runtime(checkpoint);
  base.act('narrative:choose:s26-route-choice:eric');
  walkUntil(base, (beat) => beat.id === 's26-eric-evening-choice');
  base.act('narrative:choose:s26-eric-evening-choice:self');
  walkUntil(base, (beat) => beat.id === 's27-work-choice');
  base.act('narrative:choose:s27-work-choice:bags');
  walkUntil(base, (beat) => beat.id === 's59-song-choice');
  base.act('narrative:choose:s59-song-choice:damir');
  walkUntil(base, (beat) => beat.id === 's59-route-choice');
  base.act('narrative:choose:s59-route-choice:eric');
  walkUntil(base, (beat) => beat.id === 's28-c1-choice');
  const start = clone(base.get());
  for (const first of ['a', 'b']) for (const evening of ['a', 'b']) {
    const mid = runtime(start);
    mid.act(`narrative:choose:s28-c1-choice:${first}`);
    walkUntil(mid, (beat) => beat.id === 's28-c2-choice');
    mid.act(`narrative:choose:s28-c2-choice:${evening}`);
    walkUntil(mid, (beat) => beat.id === 's49-c1-choice');
    const beforeDance = JSON.stringify(mid.get());
    for (const closing of ['a', 'b']) {
      const run = runtime(clone(mid.get()));
      rejectWithoutWrite(run, 'narrative:choose:s49-c1-choice:premium');
      run.act(`narrative:choose:s49-c1-choice:${closing}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), beforeDance);
      run.act(`narrative:choose:s49-c1-choice:${closing}`);
      walkUntil(run, (beat) => beat.id === 's49-callback-choice');
      rejectWithoutWrite(run, `narrative:choose:s49-callback-choice:${evening === 'a' ? 'b' : 'a'}`);
      run.act(`narrative:choose:s49-callback-choice:${evening}`);
      assert.equal(run.get().sceneId, `s49-callback-${evening}`);
      const reloaded = runtime(clone(run.get()));
      walkUntil(reloaded, (_beat, id) => id === 's32-intro');
      assert.equal(reloaded.get().routeLock, 'eric');
      assert.equal(reloaded.get().routeIntent, 'eric');
      assert.equal(reloaded.get().flags[`s28-evening-${evening === 'a' ? 'dance' : 'quiet'}`], true);
      assert.equal(reloaded.get().flags[`s28-evening-${evening === 'a' ? 'quiet' : 'dance'}`], undefined);
      for (const flag of ['s28-paid', 's49-premium', 'media-release-approved']) {
        assert.equal(reloaded.get().flags[flag], undefined);
      }
    }
  }
});

test('real N1 rejects forged route lock, S28 flags and callback action history with no writes', () => {
  const selected = runtime(checkpointS26());
  selected.act('narrative:choose:s26-route-choice:eric');
  walkUntil(selected, (beat) => beat.id === 's26-eric-evening-choice');
  selected.act('narrative:choose:s26-eric-evening-choice:self');
  walkUntil(selected, (beat) => beat.id === 's27-work-choice');
  selected.act('narrative:choose:s27-work-choice:inga');
  walkUntil(selected, (beat) => beat.id === 's59-song-choice');
  selected.act('narrative:choose:s59-song-choice:eric');
  walkUntil(selected, (beat) => beat.id === 's59-route-choice');
  selected.act('narrative:choose:s59-route-choice:eric');
  walkUntil(selected, (beat) => beat.id === 's28-c1-choice');
  selected.act('narrative:choose:s28-c1-choice:a');
  walkUntil(selected, (beat) => beat.id === 's28-c2-choice');
  selected.act('narrative:choose:s28-c2-choice:a');
  walkUntil(selected, (beat) => beat.id === 's49-c1-choice');
  selected.act('narrative:choose:s49-c1-choice:a');
  walkUntil(selected, (beat) => beat.id === 's49-callback-choice');
  selected.act('narrative:choose:s49-callback-choice:a');
  const valid = clone(selected.get());
  const forged = [
    { ...valid, routeLock: 'nick' },
    { ...valid, routeIntent: 'damir' },
    { ...valid, flags: { ...valid.flags, 's28-evening-dance': false } },
    { ...valid, flags: { ...valid.flags, 's28-evening-quiet': true } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'nick' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's49-callback-choice' ? { ...entry, optionId: 'b' } : entry) },
  ];
  for (const invalid of forged) {
    let writes = 0;
    const original = JSON.stringify(invalid);
    const update = createNarrativeRuntimeUpdate({ graph: selected.graph, catalog: selected.catalog });
    assert.throws(() => update({
      deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s49-callback-a-01', phase: 'up',
        timestamp: 201, source: 'renderer' }],
      setState() { writes += 1; },
    }), /inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), original);
  }
});
