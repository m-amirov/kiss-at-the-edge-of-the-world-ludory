import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData } from '../game-studio/src/story.js';
import { evaluateNarrativePredicate } from '../game-studio/assets/ludory-narrative.js';
import { interactionBeats, interactionEchoes } from '../game-studio/src/original-interactive-beats.js';
import { defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate } from '../game-studio/assets/ludory-narrative.js';

const scene = id => graphData.scenes.find(item => item.id === id);
const prose = id => scene(id).beats.filter(beat => beat.type === 'dialogue').map(beat => beat.text.ru).join('\n\n');
test('the original interaction source retains two S01 C90/C91 decisions and an S02 echo', () => {
  assert.equal(interactionBeats.S01.length, 2);
  assert.equal(interactionEchoes.S02[0][0], 'S01-C90');
  assert.equal(graphData.startSceneId, 's01-airport');
  assert.equal(scene('s01-common').nextSceneId, 's01-c90');
  for (const [index, source] of interactionBeats.S01.entries()) {
    const name = `s01-c${90+index}`;
    const choice = scene(name).beats.at(-1);
    assert.equal(scene(name).beats[0].text.ru, source.question, `${name}: authored question lost`);
    assert.equal(choice.type, 'choice');
    assert.deepEqual(choice.choices.map(x => x.label.ru), source.options.map(x => x.label));
    for (const option of source.options) {
      assert.equal(prose(`${name}-answer-${option.code.toLowerCase()}`), option.text);
    }
  }
  for (const [index, code] of ['a','b'].entries()) {
    assert.equal(prose(`s02-c90-echo-${code}`), interactionEchoes.S02[0][index+1]);
  }
  const oldSeat = scene('s01-airport').beats.at(-1);
  assert.equal(oldSeat.id, 's01-seat-choice');
  assert.equal(oldSeat.choices.length, 3);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
});
test('C90/C91 choices remain free, route-neutral and converge on unchanged S02', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  for (const first of ['a','b']) for (const second of ['a','b']) {
    const update = createNarrativeRuntimeUpdate({ graph, catalog });
    let state = { narrative: createNarrativeState(graph) };
    const dispatch = action => update({ deltaMs:16,
      inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:10,source:'renderer'}],
      state, setState(next) { state=next; }});
    const nextThrough = id => { for(const beat of scene(id).beats.filter(x=>x.type==='dialogue')) dispatch(`narrative:next:${beat.id}`); };
    nextThrough('s01-airport');
    dispatch('narrative:choose:s01-seat-choice:front-eric');
    nextThrough('s01-eric');
    nextThrough('s01-common');
    assert.equal(state.narrative.sceneId,'s01-c90');
    dispatch('narrative:next:s01-c90-prompt');
    dispatch(`narrative:choose:s01-c90-choice:${first}`);
    nextThrough(`s01-c90-answer-${first}`);
    assert.equal(state.narrative.sceneId,'s01-c91');
    dispatch('narrative:next:s01-c91-prompt');
    dispatch(`narrative:choose:s01-c91-choice:${second}`);
    nextThrough(`s01-c91-answer-${second}`);
    assert.equal(state.narrative.sceneId,'s02-c90-echo');
    dispatch(`narrative:choose:s02-c90-echo-route:${first}`);
    nextThrough(`s02-c90-echo-${first}`);
    assert.equal(state.narrative.sceneId,'s02-road');
    assert.equal(state.narrative.routeLock,null);
    assert.equal(state.narrative.flags[`s01-extra-c90-${first}`],true);
  }
});


test('S02 C90/C91 restore exact authored responses, all option combinations, and preserve original career choice', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  assert.equal(scene('s02-common').nextSceneId, 's02-c90');
  assert.equal(scene('s60-common').nextSceneId, 's41-c90-echo-route');
  for (const [index, authored] of interactionBeats.S02.entries()) {
    const stem = `s02-c${90 + index}`;
    const choice = scene(stem).beats.at(-1);
    assert.equal(scene(stem).beats[0].text.ru, authored.question, `${stem}: authored question lost`);
    assert.equal(choice.type, 'choice', stem);
    assert.deepEqual(choice.choices.map(c => c.label.ru), authored.options.map(c => c.label));
    for (const option of authored.options) {
      assert.equal(prose(`${stem}-answer-${option.code.toLowerCase()}`), option.text);
    }
  }
  for (const first of ['a', 'b']) for (const second of ['a', 'b']) {
    const update = createNarrativeRuntimeUpdate({ graph, catalog });
    let state = { narrative: createNarrativeState(graph) };
    const dispatch = action => update({ deltaMs: 16,
      inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
      state, setState(next) { state = next; } });
    const advance = id => {
      for (const beat of scene(id).beats.filter(b => b.type === 'dialogue')) {
        dispatch(`narrative:next:${beat.id}`);
      }
    };
    advance('s01-airport');
    dispatch('narrative:choose:s01-seat-choice:front-eric');
    advance('s01-eric'); advance('s01-common');
    dispatch('narrative:next:s01-c90-prompt');
    dispatch('narrative:choose:s01-c90-choice:a'); advance('s01-c90-answer-a');
    dispatch('narrative:next:s01-c91-prompt');
    dispatch('narrative:choose:s01-c91-choice:a'); advance('s01-c91-answer-a');
    dispatch('narrative:choose:s02-c90-echo-route:a'); advance('s02-c90-echo-a');
    advance('s02-road');
    dispatch('narrative:choose:s02-career-choice:people');
    advance('s02-people'); advance('s02-common');
    assert.equal(state.narrative.sceneId, 's02-c90');
    dispatch('narrative:next:s02-c90-prompt');
    dispatch(`narrative:choose:s02-c90-choice:${first}`);
    advance(`s02-c90-answer-${first}`);
    assert.equal(state.narrative.sceneId, 's02-c91');
    dispatch('narrative:next:s02-c91-prompt');
    dispatch(`narrative:choose:s02-c91-choice:${second}`);
    advance(`s02-c91-answer-${second}`);
    assert.equal(state.narrative.sceneId, 's65-guesthouse');
    assert.equal(state.narrative.flags[`s02-extra-c90-${first}`], true);
    assert.equal(state.narrative.routeLock, null);
  }
});

test('S41 replays the exact S02-C90 delayed echo and keeps a no-choice compatibility branch', () => {
  const [, a, b] = interactionEchoes.S41.find(([id]) => id === 'S02-C90');
  assert.equal(prose('s41-c90-echo-a'), a);
  assert.equal(prose('s41-c90-echo-b'), b);
  assert.equal(scene('s41-c90-echo-a').nextSceneId, 's41-intro');
  assert.equal(scene('s41-c90-echo-b').nextSceneId, 's41-intro');
  const choice = scene('s41-c90-echo-route').beats[0];
  for (const selected of ['a', 'b', null]) {
    const state = { flags: selected ? { [`s02-extra-c90-${selected}`]: true } : {}, routeLock: null };
    const eligible = choice.choices.filter(option => evaluateNarrativePredicate(option.when, state));
    assert.equal(eligible.length, 1, `S41 echo eligibility ${selected}`);
    assert.equal(eligible[0].targetSceneId, selected ? `s41-c90-echo-${selected}` : 's41-intro');
  }
});
