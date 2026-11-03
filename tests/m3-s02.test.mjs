import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { graphData, catalogData } from '../game/src/story.js';
import { defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate } from '../game/assets/ludory-narrative.js';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => scene(id)?.beats
  .filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru) ?? [];

// Independently pinned to source repo 1e775f1: content/season-1-vertical-slice-episodes-01-02.md.
const s02LiteraryProof = {
  's02-road': [62, '65134c56b86ede674eaed7d53eec90bc9fdb1bec7577a88b8d27f0179475614e'],
  's02-people': [2, '62e16aa7d06bd809a1121bc748cd98e0108a9e8eb08fcb7be8a0ef97934d515c'],
  's02-place': [4, '8df2279443792e40d7149923dcb3c97b77dac3515dac92d642bd9c02654ec3a3'],
  's02-own-choice': [7, '70ed71e36eb3799db3f7a2a42b27403c8006849a498a3f0af26c5f11cab5e723'],
  's02-common': [1, '3be9ce22d278e4c221e9a2ff8bcda892e21eb4eb60135f81716ed1b45825686a'],
};

test('full S02 road and café copy is byte-identical to the pinned literary manuscript', () => {
  for (const [id, [count, expectedHash]] of Object.entries(s02LiteraryProof)) {
    const copy = paragraphs(id);
    assert.equal(copy.length, count, id);
    assert.equal(hash(copy.join('\n\n')), expectedHash, id);
  }
  assert.match(paragraphs('s02-road').join(' '), /Марина купила у них место для тебя/);
  assert.match(paragraphs('s02-common').join(' '), /Ник отдал Алисе половину булочки/);
});

test('every S01 seat rejoins the same S02 choice with three convergent alternatives', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  const s01 = scene('s01-common');
  assert.equal(s01.nextSceneId, 's02-road');
  assert.equal(s01.beats.some((beat) => beat.type === 'ending'), false);
  const next = scene('s02-road');
  const decision = next.beats.at(-1);
  assert.equal(decision.type, 'choice');
  assert.equal(decision.id, 's02-career-choice');
  assert.deepEqual(decision.choices.map(({id}) => id), ['people', 'place', 'own-choice']);
  assert.deepEqual(decision.choices.map(({targetSceneId}) => targetSceneId),
    ['s02-people', 's02-place', 's02-own-choice']);
  for (const id of ['s02-people', 's02-place', 's02-own-choice']) {
    assert.equal(scene(id).nextSceneId, 's02-common');
  }
  assert.equal(scene('s02-common').beats.at(-1).type, 'ending');
});

function startAtS02Choice(seat = 'front-eric') {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const act = (action) => update({
    deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
    state, setState(next) { state = next; },
  });
  const advance = (id) => {
    assert.equal(state.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((item) => item.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  advance('s01-airport');
  act(`narrative:choose:s01-seat-choice:${seat}`);
  advance({ 'front-eric': 's01-eric', 'back-nick': 's01-nick', 'back-damir': 's01-damir' }[seat]);
  advance('s01-common');
  advance('s02-road');
  assert.equal(state.narrative.sceneId, 's02-road');
  return { act, advance, getState: () => state.narrative, graph, catalog };
}

function resumeFromJson(runtime, snapshot, action) {
  const update = createNarrativeRuntimeUpdate({ graph: runtime.graph, catalog: runtime.catalog });
  let state = { narrative: JSON.parse(JSON.stringify(snapshot)) };
  update({
    deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
    state, setState(next) { state = next; },
  });
  return state.narrative;
}

test('S02 career choice sets exactly one career thesis, without route lock', () => {
  for (const [option, target] of [
    ['people', 's02-people'], ['place', 's02-place'], ['own-choice', 's02-own-choice'],
  ]) {
    const runtime = startAtS02Choice();
    runtime.act(`narrative:choose:s02-career-choice:${option}`);
    const current = runtime.getState();
    assert.equal(current.sceneId, target);
    assert.deepEqual(Object.keys(current.flags).filter((flag) => flag.startsWith('career-thesis-')),
      [`career-thesis-${option}`]);
    assert.equal(current.flags['career-thesis-' + option], true);
    assert.equal(current.flags['damir-direct'], option === 'own-choice' ? true : undefined);
    assert.equal(current.routeLock, null);
    const afterChoice = JSON.stringify(current);
    runtime.act(`narrative:choose:s02-career-choice:${option}`);
    assert.equal(JSON.stringify(runtime.getState()), afterChoice,
      'replayed choice action must not change the accepted branch state');
    const first = scene(target).beats.find((beat) => beat.type === 'dialogue');
    const restored = resumeFromJson(runtime, current, `narrative:next:${first.id}`);
    assert.deepEqual(restored.flags, current.flags);
    assert.equal(restored.beatIndex, 1, 'serialized choice state must resume into authored dialogue');
    runtime.advance(target);
    assert.equal(runtime.getState().sceneId, 's02-common');
    runtime.advance('s02-common');
    assert.equal(runtime.getState().sceneId, 's02-common');
    assert.equal(scene('s02-common').beats[runtime.getState().beatIndex]?.type, 'ending');
  }
});

test('S02 tampered career flags are rejected when restoring saved state', () => {
  const runtime = startAtS02Choice('back-damir');
  runtime.act('narrative:choose:s02-career-choice:people');
  const altered = JSON.parse(JSON.stringify(runtime.getState()));
  altered.flags['career-thesis-own-choice'] = true;
  const first = scene('s02-people').beats.find((beat) => beat.type === 'dialogue');
  assert.throws(() => resumeFromJson(runtime, altered, `narrative:next:${first.id}`),
    /inconsistent actionLog provenance or position/);
});

test('S02 Back removes the old career decision and permits a different answer', () => {
  const runtime = startAtS02Choice('back-nick');
  runtime.act('narrative:choose:s02-career-choice:own-choice');
  assert.equal(runtime.getState().flags['career-thesis-own-choice'], true);
  runtime.act('narrative:back');
  assert.equal(runtime.getState().sceneId, 's02-road');
  assert.equal(runtime.getState().flags['damir-direct'], undefined);
  runtime.act('narrative:choose:s02-career-choice:place');
  assert.equal(runtime.getState().flags['career-thesis-own-choice'], undefined);
  assert.equal(runtime.getState().flags['career-thesis-place'], true);
  assert.equal(runtime.getState().routeLock, null);
});
