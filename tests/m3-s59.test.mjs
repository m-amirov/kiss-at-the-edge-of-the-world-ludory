import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently pinned original episode-07 S59 prose: lines 53–83.
// These literal checksums do not derive expected prose from the game.
const authorialProof = {
  's59-intro': [7, '4eaf217ddb444e1f79260055b1d8e4fdda9f179a258456c18582f8deae3885fc'],
  's59-song-eric': [1, '177dc86f3dee76fcd379145fdce119cfa89a1ab19ac6ab12d2e38621a08ab800'],
  's59-song-nick': [1, 'b37ded488b66f22fa1ed0781670e4616181f83f8df987300486d5d97eb6d5693'],
  's59-song-damir': [1, '03b7725d6e9c4758ec934a82c310157c6a276d42422894279f03dd0d63b8d706'],
  's59-common': [1, 'e4015d1f17dfce548cb751f099b6e1ca9c9534b866783e2af9b557fa3fd7e886'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const songOptions = ['eric', 'nick', 'damir'];
const scene = (id) => graphData.scenes.find((candidate) => candidate.id === id);
const dialogue = (id) => (scene(id)?.beats ?? [])
  .filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru);
const choice = (sceneId, id) => scene(sceneId)?.beats.find((beat) => beat.id === id);

test('S59 renders five exact original blocks / eleven unique paragraphs', () => {
  assert.equal(Object.keys(authorialProof).length, 5);
  assert.equal(Object.values(authorialProof).reduce((n, [count]) => n + count, 0), 11);
  for (const [id, [count, originalHash]] of Object.entries(authorialProof)) {
    const paragraphs = dialogue(id);
    assert.equal(paragraphs.length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      originalHash, `${id} verbatim authorial text`);
    assert.ok(paragraphs.every((text) => !text.startsWith('Выбор S59')), id);
  }
  assert.match(dialogue('s59-intro').join(' '), /У нас есть демократия/);
  assert.match(dialogue('s59-song-damir').join(' '), /просто остаться воспоминанием/);
  assert.match(dialogue('s59-common').join(' '), /отдельную копию — себе/);
});

test('S59 is mandatory after all S27 outcomes and songs are free route-neutral choices', () => {
  for (const task of ['inga', 'nick', 'bags']) {
    assert.equal(scene(`s27-work-${task}`).nextSceneId, 's27-common');
  }
  assert.equal(scene('s27-common').nextSceneId, 's59-intro');
  assert.equal(scene('s27-after-m3-end'), undefined);
  const c = choice('s59-intro', 's59-song-choice');
  assert.deepEqual(c.choices.map(({ id, targetSceneId, when, effects }) =>
    [id, targetSceneId, when, effects]), [
    ['eric', 's59-song-eric', undefined, undefined],
    ['nick', 's59-song-nick', undefined, undefined],
    ['damir', 's59-song-damir', undefined, undefined],
  ]);
  for (const option of c.choices) {
    for (const forbidden of ['cost', 'premium', 'romancePoints', 'routeId', 'requiredEntitlement',
      'publishPermission', 'mediaPermission', 'consentToPublish']) {
      assert.equal(option[forbidden], undefined, `${option.id}: ${forbidden}`);
    }
    assert.equal(scene(option.targetSceneId).nextSceneId, 's59-common');
  }
  assert.equal(scene('s59-common').nextSceneId, 's59-route-dispatch');
  assert.equal(scene('s59-route-dispatch').beats[0].id, 's59-route-choice');
  assert.equal(scene('s59-after-m3-end').beats[0].endingId, 'm3-s59-only');
  assert.ok(scene('s28-intro'));
  assert.deepEqual(catalogData.interactions, []);
});

// All checkpoints below come from real N1 replay. No mid-story state injection.
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
function checkpointS59() {
  const run = runtime();
  walkUntil(run, (beat) => beat.id === 's17-evening-choice', preS17);
  run.act('narrative:choose:s17-evening-choice:self');
  walkUntil(run, (_beat, id) => id === 's58-intro', afterS17);
  walkUntil(run, (beat) => beat.id === 's58-shop-choice');
  run.act('narrative:choose:s58-shop-choice:alone');
  walkUntil(run, (beat) => beat.id === 's58-payoff-choice');
  run.act('narrative:choose:s58-payoff-choice:other');
  walkUntil(run, (beat) => beat.id === 's26-route-choice');
  return deepCopy(run.get());
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `rejected ${action} must not change state`);
  assert.equal(run.writes(), writes, `rejected ${action} must not write`);
}

test('real N1: four locked routes × three S59 songs, Back, alternate choice, JSON replay', () => {
  const checkpoint = checkpointS59();
  for (const route of routes) {
    const selected = runtime(checkpoint);
    selected.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(selected, (beat) => beat.id === `s26-${route}-evening-choice`);
    selected.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(selected, (beat) => beat.id === 's27-work-choice');
    selected.act('narrative:choose:s27-work-choice:bags');
    walkUntil(selected, (_beat, id) => id === 's59-intro');
    const beforeSong = deepCopy(selected.get());
    assert.equal(beforeSong.routeLock, route);
    assert.equal(beforeSong.routeIntent, route);
    for (const song of songOptions) {
      const run = runtime(beforeSong);
      walkUntil(run, (beat) => beat.id === 's59-song-choice');
      const before = JSON.stringify(run.get());
      rejectWithoutWrite(run, 'narrative:choose:s59-song-choice:premium');
      run.act(`narrative:choose:s59-song-choice:${song}`);
      assert.equal(run.get().sceneId, `s59-song-${song}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before, `Back must restore song choice on ${route}`);
      const other = songOptions[(songOptions.indexOf(song) + 1) % songOptions.length];
      run.act(`narrative:choose:s59-song-choice:${other}`);
      assert.equal(run.get().sceneId, `s59-song-${other}`);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()), before);
      run.act(`narrative:choose:s59-song-choice:${song}`);
      const restored = runtime(deepCopy(run.get()));
      walkUntil(restored, (beat) => beat.id === 's59-route-choice');
      restored.act(`narrative:choose:s59-route-choice:${route}`);
      assert.equal(restored.get().sceneId,
        route === 'eric' ? 's28-intro'
          : route === 'nick' ? 's29-intro' : route === 'damir' ? 's30-intro' : 's59-after-m3-end');
      assert.equal(restored.get().routeLock, route);
      assert.equal(restored.get().routeIntent, route);
      assert.equal(restored.get().flags['s17-evening-self'], true);
      assert.equal(restored.get().flags['s58-shop-alone'], true);
      for (const invalidFlag of ['s59-romance', 's59-published', 'damir-handheld',
        'media-release-approved']) {
        assert.equal(restored.get().flags[invalidFlag], undefined);
      }
    }
  }
});

test('real N1: forged S59 route lock and actionLog fail with zero writes', () => {
  const selected = runtime(checkpointS59());
  selected.act('narrative:choose:s26-route-choice:alice');
  walkUntil(selected, (beat) => beat.id === 's26-alice-evening-choice');
  selected.act('narrative:choose:s26-alice-evening-choice:self');
  walkUntil(selected, (beat) => beat.id === 's27-work-choice');
  selected.act('narrative:choose:s27-work-choice:inga');
  walkUntil(selected, (beat) => beat.id === 's59-song-choice');
  selected.act('narrative:choose:s59-song-choice:eric');
  const valid = deepCopy(selected.get());
  const forged = [
    { ...valid, routeIntent: 'nick' },
    { ...valid, routeLock: 'eric' },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.type === 'choose' && entry.beatId === 's59-song-choice'
        ? { ...entry, optionId: 'premium' } : entry) },
    { ...valid, actionLog: valid.actionLog.slice(0, -1) },
  ];
  for (const invalid of forged) {
    const before = JSON.stringify(invalid);
    let writes = 0;
    const update = createNarrativeRuntimeUpdate({ graph: selected.graph, catalog: selected.catalog });
    assert.throws(() => update({
      deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s59-song-eric-01', phase: 'up',
        timestamp: 201, source: 'renderer' }],
      setState() { writes += 1; },
    }), /inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
