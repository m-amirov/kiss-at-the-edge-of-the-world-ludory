import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent hashes of the pinned episode-07 manuscript's player-facing
// paragraphs (original lines 9–47, headings and editorial metadata excluded).
const authorialProof = {
  's27-intro': [10, 'b6364b84ceeaa3bcc87237772bffd172ff44f632da7a9d29500d97b7136694cd'],
  's27-work-inga': [1, '4afbe6408997871873962d872b676d177b09fd876c1f7ac7979377939a9f0e0f'],
  's27-work-nick': [1, '9c04add1c39d36b7bfaf75347bcd4f50952754189058f4dbfeb29da5c66dd15b'],
  's27-work-bags': [1, '670b169c2809bd7aaa90d05b591f03762e95f4b579fa2d92b2d6435cd0cd4f15'],
  's27-common': [2, 'd9603d574b0488a8f87bbddd2d0534bc306d07774f750b5966dd777e9e66d4d8'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const scene = (id) => graphData.scenes.find((candidate) => candidate.id === id);
const dialogue = (id) => (scene(id)?.beats ?? [])
  .filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru);
const choice = (sceneId, choiceId) => scene(sceneId)?.beats
  .find((beat) => beat.id === choiceId);

test('S27 contains all five exact authorial blocks / fifteen paragraphs', () => {
  assert.equal(Object.keys(authorialProof).length, 5);
  assert.equal(Object.values(authorialProof).reduce((n, [count]) => n + count, 0), 15);
  for (const [id, [count, expectedHash]] of Object.entries(authorialProof)) {
    const paragraphs = dialogue(id);
    assert.equal(paragraphs.length, count, `${id} paragraphs`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      expectedHash, `${id} manuscript fidelity`);
    assert.ok(paragraphs.every((text) => !text.startsWith('Выбор S27')), id);
  }
  assert.match(dialogue('s27-intro').join(' '), /один общий план тропы/);
  assert.match(dialogue('s27-work-inga').join(' '), /можно ли использовать их в статье/);
  assert.match(dialogue('s27-common').join(' '), /на снимке должны были быть доски/);
});

test('all four locked routes enter shared S27 with three free work choices', () => {
  for (const route of routes) {
    assert.equal(scene(`s26-common-${route}`).nextSceneId, 's27-intro');
  }
  assert.equal(scene('s26-after-m3-end'), undefined);
  const c = choice('s27-intro', 's27-work-choice');
  assert.deepEqual(c.choices.map(({ id, targetSceneId, when, effects }) =>
    [id, targetSceneId, when, effects]), [
    ['inga', 's27-work-inga', undefined, undefined],
    ['nick', 's27-work-nick', undefined, undefined],
    ['bags', 's27-work-bags', undefined, undefined],
  ]);
  for (const option of c.choices) {
    for (const forbidden of ['cost', 'premium', 'romancePoints', 'routeId',
      'requiredEntitlement', 'publishPermission', 'mediaPermission',
      'consentToPublish']) {
      assert.equal(option[forbidden], undefined, `S27 option ${option.id}: ${forbidden}`);
    }
    assert.equal(scene(option.targetSceneId).nextSceneId, 's27-common');
  }
  assert.equal(scene('s27-common').nextSceneId, 's59-intro');
  assert.equal(scene('s27-after-m3-end'), undefined);
  assert.deepEqual(catalogData.interactions, []);
});

// A real, signed-by-replay N1 history rather than a fixture injected at S27.
// The shared history intentionally picks the *independent* S17 evening, making
// every one of S26's four route locks available despite the earlier evening.
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
const deepCopy = (value) => JSON.parse(JSON.stringify(value));
function runtime(snapshot) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: deepCopy(snapshot ?? createNarrativeState(graph)) };
  let writes = 0;
  return {
    graph, catalog, update,
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
    } else assert.fail(`premature ending in ${sceneId}`);
    assert.notEqual(`${run.get().sceneId}:${run.get().beatIndex}`, before, `stalled ${before}`);
  }
  assert.fail('narrative traversal limit exceeded');
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get()), writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `state changed by rejected ${action}`);
  assert.equal(run.writes(), writes, `setState called for rejected ${action}`);
}
function beforeS26() {
  const run = runtime();
  walkUntil(run, (beat) => beat.id === 's17-evening-choice', preS17);
  run.act('narrative:choose:s17-evening-choice:self');
  walkUntil(run, (_beat, id) => id === 's58-intro', afterS17);
  walkUntil(run, (beat) => beat.id === 's58-shop-choice');
  run.act('narrative:choose:s58-shop-choice:alone');
  walkUntil(run, (beat) => beat.id === 's58-payoff-choice');
  run.act('narrative:choose:s58-payoff-choice:other');
  walkUntil(run, (beat) => beat.id === 's26-route-choice');
  assert.equal(run.get().routeIntent, null);
  assert.equal(run.get().routeLock, null);
  return deepCopy(run.get());
}

test('real N1: all four S26 locks retain identity through all three S27 work choices, Back and JSON replay', () => {
  const checkpoint = beforeS26();
  const options = ['inga', 'nick', 'bags'];
  for (const route of routes) {
    const selected = runtime(checkpoint);
    selected.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(selected, (beat) => beat.id === `s26-${route}-evening-choice`);
    selected.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(selected, (_beat, id) => id === 's27-intro');
    const atS27 = deepCopy(selected.get());
    assert.equal(atS27.routeIntent, route);
    assert.equal(atS27.routeLock, route);
    for (const option of options) {
      const run = runtime(atS27);
      walkUntil(run, (beat) => beat.id === 's27-work-choice');
      const before = JSON.stringify(run.get());
      rejectWithoutWrite(run, 'narrative:choose:s27-work-choice:premium');
      run.act(`narrative:choose:s27-work-choice:${option}`);
      assert.equal(run.get().sceneId, `s27-work-${option}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before, `Back must restore S27 C1 on ${route}`);
      // Going back must not lock a specific volunteer task or change the route.
      const alternative = options[(options.indexOf(option) + 1) % options.length];
      run.act(`narrative:choose:s27-work-choice:${alternative}`);
      assert.equal(run.get().sceneId, `s27-work-${alternative}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before);
      run.act(`narrative:choose:s27-work-choice:${option}`);
      const resumed = runtime(deepCopy(run.get()));
      walkUntil(resumed, (_beat, id) => id === 's59-intro');
      assert.equal(resumed.get().routeIntent, route);
      assert.equal(resumed.get().routeLock, route);
      assert.equal(resumed.get().flags['s17-evening-self'], true);
      assert.equal(resumed.get().flags['s58-shop-alone'], true);
      for (const forbidden of ['s27-published', 'inga-release-approved',
        'nick-producer-teaser-approved', 'damir-relocation-approved']) {
        assert.equal(resumed.get().flags[forbidden], undefined);
      }
    }
  }
});

test('real N1: forged S27 route commitment and actionLog are rejected with zero writes', () => {
  const run = runtime(beforeS26());
  run.act('narrative:choose:s26-route-choice:alice');
  walkUntil(run, (beat) => beat.id === 's26-alice-evening-choice');
  run.act('narrative:choose:s26-alice-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:inga');
  const snapshot = deepCopy(run.get());
  const forged = [
    { ...snapshot, routeIntent: 'nick' },
    { ...snapshot, routeLock: 'eric' },
    { ...snapshot, actionLog: snapshot.actionLog.map((entry) =>
      entry.type === 'choose' && entry.beatId === 's27-work-choice'
        ? { ...entry, optionId: 'premium' } : entry) },
    { ...snapshot, actionLog: snapshot.actionLog.slice(0, -1) },
  ];
  for (const invalid of forged) {
    const before = JSON.stringify(invalid);
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({
      deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s27-work-inga-01', phase: 'up',
        timestamp: 201, source: 'renderer' }],
      setState() { writes += 1; },
    }), /inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
