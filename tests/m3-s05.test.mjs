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

// Pinned by independently extracting S05 from original repository commit 1e775f1.
const s05LiteraryProof = {
  's05-intro': [31, '8795da2c59517e2c77610ca77d4ff8433e3ac72ab9137ed9fce75fd24b8dec61'],
  's05-nick': [4, 'fe41da083536db33eb315c5f5ee862f28909117b1b0259a794bfac0f355f3650'],
  's05-erik': [4, '87b75e2a837f7e49d28aacf4a6e00237efe9b2da6120e8e08df687ceec8c0e7d'],
  's05-damir': [4, '6b3e45b24725b053fc36f6896fb8551def42185d16d14d8910de2b904f47f0bb'],
  's05-common': [60, 'd64262fe404533084273a58e345467cd18e36f2ff2a66b8a01663b670a3a7f37'],
};

test('S05 five displayed prose blocks are byte-identical to pinned canonical manuscript', () => {
  for (const [id, [count, expectedHash]] of Object.entries(s05LiteraryProof)) {
    assert.equal(paragraphs(id).length, count, id);
    assert.equal(hash(paragraphs(id).join('\n\n')), expectedHash, id);
  }
  assert.match(paragraphs('s05-intro')[0], /^На третье утро они выехали/);
  assert.match(paragraphs('s05-common').at(-1), /не пытаясь истолковать этот жест\.$/);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S05 replaces S04 placeholder, offers canonical 3-way weather choice and rejoins S06 boundary', () => {
  assert.equal(scene('s04-after-message').nextSceneId, 's05-intro');
  assert.equal(scene('s04-after-silence').nextSceneId, 's05-intro');
  assert.equal(scene('s04-m3-end'), undefined);
  const decision = scene('s05-intro').beats.at(-1);
  assert.equal(decision.id, 's05-weather-choice');
  assert.deepEqual(decision.choices.map(({ id }) => id), ['nick', 'erik', 'damir']);
  for (const option of decision.choices) {
    assert.equal(option.targetSceneId, `s05-${option.id}`);
    assert.deepEqual(option.effects,
      [{ op: 'flag_set', id: `weather-choice-${option.id}`, value: true }]);
    assert.equal(option.when, undefined);
    assert.equal(scene(option.targetSceneId).nextSceneId, 's05-common');
  }
  assert.equal(scene('s05-common').nextSceneId, 's06-intro');
  assert.equal(scene('s05-m3-end'), undefined);
  assert.equal(scene('s05-common').beats.some((beat) => beat.type === 'choice'), false);
});

function startAtS05(messageOption = 'message', consent = 'accepted') {
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
    for (const beat of scene(id).beats.filter((item) => item.type === 'dialogue')) {
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
  advance('s04-intro');
  act(`narrative:choose:s04-camera-consent-choice:${consent}`);
  advance(`s04-${consent}`);
  advance('s04-common');
  act(`narrative:choose:s04-s03-dispatch:${messageOption}`);
  advance(`s04-after-${messageOption}`);
  assert.equal(state.narrative.sceneId, 's05-intro');
  return { act, advance, getState: () => state.narrative, graph, catalog };
}

function resumeFromJson(run, snapshot, action) {
  const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
  let state = { narrative: JSON.parse(JSON.stringify(snapshot)) };
  update({
    deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 25, source: 'renderer' }],
    setState(next) { state = next; },
  });
  return state.narrative;
}

test('S05 Nick/Erik/Damir weather decisions are exclusive, Back-reversible and JSON-restorable', () => {
  const run = startAtS05('message', 'negotiated');
  run.advance('s05-intro');
  for (const option of ['nick', 'erik', 'damir']) {
    run.act(`narrative:choose:s05-weather-choice:${option}`);
    const current = run.getState();
    assert.equal(current.sceneId, `s05-${option}`);
    assert.deepEqual(Object.keys(current.flags).filter((name) => name.startsWith('weather-choice-')),
      [`weather-choice-${option}`]);
    assert.equal(current.flags['consent-camera-negotiated'], true);
    assert.equal(current.flags.repairDebt, undefined);
    assert.equal(current.routeLock, null);
    const first = scene(`s05-${option}`).beats[0];
    const restored = resumeFromJson(run, current, `narrative:next:${first.id}`);
    assert.equal(restored.sceneId, `s05-${option}`);
    assert.equal(restored.beatIndex, 1);
    assert.deepEqual(restored.flags, current.flags);
    assert.equal(restored.routeLock, null);
    run.act('narrative:back');
    assert.equal(run.getState().sceneId, 's05-intro');
    assert.equal(run.getState().flags[`weather-choice-${option}`], undefined);
    assert.equal(run.getState().flags['consent-camera-negotiated'], true);
  }
  run.act('narrative:choose:s05-weather-choice:damir');
  run.advance('s05-damir');
  run.advance('s05-common');
  assert.equal(run.getState().sceneId, 's06-intro');
  assert.equal(run.getState().routeLock, null);
});

test('S05 is reached after S03 silence and S04 refusal, and tampered weather flags are rejected', () => {
  const run = startAtS05('silence', 'declined');
  run.advance('s05-intro');
  run.act('narrative:choose:s05-weather-choice:erik');
  assert.equal(run.getState().flags['s03-damir-silence'], true);
  assert.equal(run.getState().flags['consent-camera-declined-respected'], true);
  assert.equal(run.getState().flags['weather-choice-erik'], true);
  const tampered = JSON.parse(JSON.stringify(run.getState()));
  tampered.flags['weather-choice-nick'] = true;
  assert.throws(() => resumeFromJson(run, tampered, 'narrative:next:s05-erik-01'),
    /inconsistent actionLog provenance or position/);
  run.advance('s05-erik');
  run.advance('s05-common');
  assert.equal(run.getState().sceneId, 's06-intro');
  assert.equal(run.getState().routeLock, null);
});
