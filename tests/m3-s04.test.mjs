import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => scene(id)?.beats.filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru) ?? [];
const s04Prose = {
  's04-intro': [15, '323a0fa492880140761e409dd21b6207345f10d37dba5a5e0e88a0ddb1c11b2d'],
  's04-accepted': [4, '98179de6bb6899dbab276030b9f15793c16094e73aa52f92d3599684d0b0000c'],
  's04-declined': [4, 'd65907c38b1cd32df49cd9d910db0e7ca601f11d979dd783aa817e657344c812'],
  's04-negotiated': [3, '12c3b829770f8acb43f7d9b2f535db28f2bfcb88e11f3c197c31ece81c6a8a56'],
  's04-common': [108, 'dda4de76f39cd4242e55491296d2f5c02faff0b71abc8c05f107b43082aa3630'],
  's04-after-message': [1, '1db4172d1b54836f4a7604dcd8e06867d1b019eea5672b3e4190f032c72584af'],
  's04-after-silence': [1, '25fd9fa7818645c1fc25a205cd6156e5ae76e33810f891e90f19a07169fa63d5'],
};

test('S04 7-block literary source is byte-identical to pinned manuscript', () => {
  for (const [id, [count, digest]] of Object.entries(s04Prose)) {
    assert.equal(paragraphs(id).length, count, id);
    assert.equal(hash(paragraphs(id).join('\n\n')), digest, id);
  }
  assert.match(paragraphs('s04-intro')[0], /^На смотровой площадке ветер/);
  assert.match(paragraphs('s04-common').at(-1), /Первые два дня ещё не заслужили вывода\.$/);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S03 message and silence rejoin S04 without old technical ending', () => {
  assert.equal(scene('s03-message').nextSceneId, 's04-intro');
  assert.equal(scene('s03-silence').nextSceneId, 's04-intro');
  assert.equal(scene('s03-m3-end'), undefined);
  const choices = scene('s04-intro').beats.at(-1);
  assert.equal(choices.id, 's04-camera-consent-choice');
  assert.deepEqual(choices.choices.map(({ id }) => id), ['accepted', 'declined', 'negotiated']);
  assert.deepEqual(choices.choices.map(({ targetSceneId }) => targetSceneId),
    ['s04-accepted', 's04-declined', 's04-negotiated']);
  for (const item of choices.choices) {
    assert.deepEqual(item.effects, [{ op: 'flag_set', id: 'consent-camera-' + (
      item.id === 'declined' ? 'declined-respected' : item.id), value: true }]);
  }
  for (const id of ['s04-accepted', 's04-declined', 's04-negotiated']) {
    assert.equal(scene(id).nextSceneId, 's04-common');
  }
  const payoffGate = scene('s04-common').beats.at(-1);
  assert.equal(payoffGate.id, 's04-s03-dispatch');
  assert.deepEqual(payoffGate.choices.map(({ id }) => id), ['message', 'silence']);
  assert.ok(payoffGate.choices.every((option) => option.label.ru === 'Продолжить' &&
    option.when && option.effects === undefined));
  for (const id of ['s04-after-message', 's04-after-silence']) {
    assert.equal(scene(id).nextSceneId, 's05-intro');
  }
  assert.equal(scene('s04-m3-end'), undefined);
});

function startAtS04(messageOption = 'message') {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const act = (action) => update({
    deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 24, source: 'renderer' }],
    setState(next) { state = next; },
  });
  const advance = (id) => {
    assert.equal(state.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((b) => b.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  advance('s01-airport');
  act('narrative:choose:s01-seat-choice:front-eric');
  advance('s01-eric');
  advance('s01-common');
  advance('s02-road');
  act('narrative:choose:s02-career-choice:people');
  advance('s02-people');
  advance('s02-common');
  advance('s65-guesthouse');
  advance('s03-editorial');
  act('narrative:choose:s03-career-dispatch:people');
  advance('s03-career-people');
  advance('s03-coffee');
  act('narrative:choose:s03-seat-dispatch:other');
  advance('s03-seat-other');
  advance('s03-waterfront');
  act(`narrative:choose:s03-after-pharmacy-choice:${messageOption}`);
  advance(`s03-${messageOption}`);
  assert.equal(state.narrative.sceneId, 's04-intro');
  return { act, advance, getState: () => state.narrative, graph, catalog };
}

test('S04 A/B/C consent is exclusive, reversible and JSON-restorable', () => {
  const run = startAtS04();
  run.advance('s04-intro');
  for (const option of ['accepted', 'declined', 'negotiated']) {
    run.act(`narrative:choose:s04-camera-consent-choice:${option}`);
    assert.equal(run.getState().sceneId, 's04-' + option);
    assert.equal(run.getState().routeLock, null);
    assert.deepEqual(Object.keys(run.getState().flags).filter((k) => k.startsWith('consent-camera-')),
      ['consent-camera-' + (option === 'declined' ? 'declined-respected' : option)]);
    const snapshot = JSON.parse(JSON.stringify(run.getState()));
    const first = scene('s04-' + option).beats[0];
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    let restored = { narrative: snapshot };
    update({ deltaMs: 16, state: restored,
      inputs: [{ schemaVersion: 1, type: 'pointer', action: `narrative:next:${first.id}`,
        phase: 'up', timestamp: 25, source: 'renderer' }],
      setState(next) { restored = next; } });
    assert.equal(restored.narrative.sceneId, 's04-' + option);
    assert.equal(restored.narrative.beatIndex, 1);
    assert.equal(restored.narrative.routeLock, null);
    assert.deepEqual(Object.entries(restored.narrative.flags).sort(), Object.entries(snapshot.flags).sort());
    run.act('narrative:back');
    assert.equal(run.getState().sceneId, 's04-intro');
    assert.equal(run.getState().flags['consent-camera-' + (option === 'declined' ? 'declined-respected' : option)], undefined);
  }
  run.act('narrative:choose:s04-camera-consent-choice:negotiated');
  run.advance('s04-negotiated');
  run.advance('s04-common');
  const before = JSON.stringify(run.getState());
  run.act('narrative:choose:s04-s03-dispatch:silence');
  assert.equal(JSON.stringify(run.getState()), before, 'S03 message path must reject silence payoff');
  run.act('narrative:choose:s04-s03-dispatch:message');
  run.advance('s04-after-message');
  assert.equal(run.getState().sceneId, 's05-intro');
  assert.equal(run.getState().routeLock, null);
  assert.equal(scene('s05-intro').beats[run.getState().beatIndex].type, 'dialogue');
});

test('S04 selects the silence payoff when S03 chose no message', () => {
  const run = startAtS04('silence');
  run.advance('s04-intro');
  run.act('narrative:choose:s04-camera-consent-choice:declined');
  run.advance('s04-declined');
  run.advance('s04-common');
  const before = JSON.stringify(run.getState());
  run.act('narrative:choose:s04-s03-dispatch:message');
  assert.equal(JSON.stringify(run.getState()), before, 'S03 silence path must reject message payoff');
  run.act('narrative:choose:s04-s03-dispatch:silence');
  run.advance('s04-after-silence');
  assert.equal(run.getState().sceneId, 's05-intro');
  assert.equal(run.getState().flags['consent-camera-declined-respected'], true);
  assert.equal(run.getState().routeLock, null);
});
