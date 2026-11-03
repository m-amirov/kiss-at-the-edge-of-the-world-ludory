import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

const scene = (id) => graphData.scenes.find((item) => item.id === id);
const digest = (copy) => createHash('sha256').update(copy).digest('hex');
const expectedProseSha = 'e530b76ebd4ef459bbdede20f0273d9cb623ba505e182bf5a8fecdbbc9f0903b';

function runtimeAtS02Choice(seat = 'front-eric') {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let current = { narrative: createNarrativeState(graph) };
  const act = (action) => update({
    deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
    state: current, setState(value) { current = value; },
  });
  const advance = (id) => {
    assert.equal(current.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((item) => item.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  advance('s01-airport');
  act(`narrative:choose:s01-seat-choice:${seat}`);
  advance({ 'front-eric': 's01-eric', 'back-nick': 's01-nick', 'back-damir': 's01-damir' }[seat]);
  advance('s01-common');
  advance('s02-road');
  return { act, advance, getState: () => current.narrative, graph, catalog };
}

test('S65 is complete pinned prose and ends only at an explicit technical M3 boundary', () => {
  const guesthouse = scene('s65-guesthouse');
  assert.ok(guesthouse, 'S65 must be attached');
  const dialogue = guesthouse.beats.filter((beat) => beat.type === 'dialogue');
  assert.equal(dialogue.length, 106);
  assert.equal(digest(dialogue.map((beat) => beat.text.ru).join('\n\n')), expectedProseSha);
  assert.match(dialogue[0].text.ru, /^Гостевой дом оказался старым трёхэтажным зданием/);
  assert.match(dialogue.at(-1).text.ru, /«Эрик попросил бы убрать лебедей из номера»\.$/);
  assert.equal(guesthouse.beats.filter((beat) => beat.type === 'choice').length, 0,
    'no un-authored S65 choices may be invented');
  assert.deepEqual(guesthouse.beats.at(-1), {
    id: 's65-m3-end', type: 'ending', endingId: 'm3-s65-only',
    text: { ru: 'Технический фрагмент завершён. История продолжится в S03.',
      en: 'Технический фрагмент завершён. История продолжится в S03.' },
  });
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S02 common transitions to S65 without an accidental S02 ending', () => {
  const common = scene('s02-common');
  assert.equal(common.nextSceneId, 's65-guesthouse');
  assert.equal(common.beats.some((beat) => beat.type === 'ending'), false);
});

test('all S02 career answers reach the same S65 with no route lock', () => {
  for (const seat of ['front-eric', 'back-nick', 'back-damir']) {
    for (const [option, branch] of [
      ['people', 's02-people'], ['place', 's02-place'], ['own-choice', 's02-own-choice'],
    ]) {
      const runtime = runtimeAtS02Choice(seat);
      runtime.act(`narrative:choose:s02-career-choice:${option}`);
      runtime.advance(branch);
      runtime.advance('s02-common');
      assert.equal(runtime.getState().sceneId, 's65-guesthouse');
      assert.equal(runtime.getState().beatIndex, 0);
      assert.equal(runtime.getState().flags[`career-thesis-${option}`], true);
      assert.deepEqual(Object.keys(runtime.getState().flags)
        .filter((flag) => flag.startsWith('career-thesis-')), [`career-thesis-${option}`]);
      assert.deepEqual(Object.keys(runtime.getState().flags)
        .filter((flag) => flag.startsWith('s01-seat-')),
        [`s01-seat-${{ 'front-eric': 'eric', 'back-nick': 'nick', 'back-damir': 'damir' }[seat]}`]);
      assert.equal(runtime.getState().routeLock, null);
      const snapshot = JSON.parse(JSON.stringify(runtime.getState()));
      const restoredUpdate = createNarrativeRuntimeUpdate({ graph: runtime.graph, catalog: runtime.catalog });
      let restored = { narrative: snapshot };
      const first = scene('s65-guesthouse').beats[0];
      restoredUpdate({
        deltaMs: 16,
        inputs: [{ schemaVersion: 1, type: 'pointer', action: `narrative:next:${first.id}`,
          phase: 'up', timestamp: 11, source: 'renderer' }],
        state: restored, setState(value) { restored = value; },
      });
      assert.equal(restored.narrative.sceneId, 's65-guesthouse');
      assert.equal(restored.narrative.beatIndex, 1);
      assert.deepEqual(Object.entries(restored.narrative.flags).sort(), Object.entries(snapshot.flags).sort());
      assert.equal(restored.narrative.routeLock, null);
      runtime.act('narrative:back');
      assert.equal(runtime.getState().sceneId, 's02-common');
      assert.equal(runtime.getState().beatIndex, 0);
      assert.equal(runtime.getState().flags[`career-thesis-${option}`], true);
      assert.equal(runtime.getState().routeLock, null);
      if (seat === 'front-eric' && option === 'people') {
        runtime.advance('s02-common');
        runtime.advance('s65-guesthouse');
        assert.equal(runtime.getState().sceneId, 's65-guesthouse');
        assert.equal(scene('s65-guesthouse').beats[runtime.getState().beatIndex]?.id, 's65-m3-end');
        assert.equal(runtime.getState().routeLock, null);
      }
    }
  }
});
