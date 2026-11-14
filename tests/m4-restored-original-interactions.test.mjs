import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData } from '../game-studio/src/story.js';
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
    const choice = scene(name).beats[0];
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
    dispatch(`narrative:choose:s01-c90-choice:${first}`);
    nextThrough(`s01-c90-answer-${first}`);
    assert.equal(state.narrative.sceneId,'s01-c91');
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
