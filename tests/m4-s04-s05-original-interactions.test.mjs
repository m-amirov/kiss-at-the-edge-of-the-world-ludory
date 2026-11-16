import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData, presentationData } from '../game-studio/src/story.js';
import { interactionBeats } from '../game-studio/src/original-interactive-beats.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog,
  createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game-studio/assets/ludory-narrative.js';

const scene = id => graphData.scenes.find(s => s.id === id);
const textOf = id => scene(id).beats.filter(b => b.type === 'dialogue').map(b => b.text.ru).join('\n\n');

test('all four S04/S05 C90/C91 decisions use exact source prose and native media', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  assert.equal(scene('s04-after-message').nextSceneId, 's04-c90');
  assert.equal(scene('s04-after-silence').nextSceneId, 's04-c90');
  assert.equal(scene('s05-common').nextSceneId, 's05-c90');
  assert.equal(scene('s04-intro').beats.at(-1).choices.length, 3,
    'original consent choice must not change');
  assert.equal(scene('s05-intro').beats.at(-1).choices.length, 3,
    'original weather choice must not change');
  for (const [sourceId, background] of [
    ['S04', 's04-thingvellir-trail'],
    ['S05', 's05-hveragerdi-road'],
  ]) {
    const items = interactionBeats[sourceId];
    assert.equal(items.length, 2, sourceId + ': pinned source changed');
    for (let index = 0; index < items.length; index++) {
      const source = items[index];
      const id = sourceId.toLowerCase() + '-c' + (90 + index);
      assert.equal(scene(id).beats[0].text.ru, source.question);
      const choice = scene(id).beats.at(-1);
      assert.equal(choice.type, 'choice');
      assert.equal(choice.choices.length, 2);
      assert.deepEqual(choice.choices.map(c => c.label.ru), source.options.map(c => c.label));
      assert.ok(choice.choices.every(c => !c.effects),
        id + ': original reflective choice must remain route-neutral');
      for (const option of source.options) {
        assert.equal(textOf(id + '-answer-' + option.code.toLowerCase()), option.text);
      }
      for (const beat of [id + '-prompt', id + '-choice',
        id + '-answer-a-01', id + '-answer-b-01']) {
        assert.equal(presentationData.beats[beat]?.[0]?.background, background,
          beat + ': scene artwork lost');
      }
    }
  }
});

function makeDriver(graph, catalog, initialState) {
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = initialState;
  const send = action => update({
    deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up',
      timestamp: 10, source: 'renderer' }],
    state, setState(next) { state = next; },
  });
  const advance = id => {
    assert.equal(state.narrative.sceneId, id, 'unexpected scene before ' + id);
    for (const beat of scene(id).beats.filter(b => b.type === 'dialogue')) {
      send('narrative:next:' + beat.id);
    }
  };
  return {
    advance, choose(beat, code) { send('narrative:choose:' + beat + ':' + code); },
    get state() { return state; },
  };
}

test('all 16 restored S04/S05 option permutations retain canon and arrive at S06', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const d = makeDriver(graph, catalog, { narrative: createNarrativeState(graph) });
  d.advance('s01-airport'); d.choose('s01-seat-choice', 'front-eric');
  d.advance('s01-eric'); d.advance('s01-common');
  d.advance('s01-c90'); d.choose('s01-c90-choice', 'a'); d.advance('s01-c90-answer-a');
  d.advance('s01-c91'); d.choose('s01-c91-choice', 'a'); d.advance('s01-c91-answer-a');
  d.choose('s02-c90-echo-route', 'a'); d.advance('s02-c90-echo-a');
  d.advance('s02-road'); d.choose('s02-career-choice', 'people');
  d.advance('s02-people'); d.advance('s02-common');
  d.advance('s02-c90'); d.choose('s02-c90-choice', 'a'); d.advance('s02-c90-answer-a');
  d.advance('s02-c91'); d.choose('s02-c91-choice', 'a'); d.advance('s02-c91-answer-a');
  d.advance('s65-guesthouse');
  d.advance('s65-c90'); d.choose('s65-c90-choice', 'a'); d.advance('s65-c90-answer-a');
  d.advance('s65-c91'); d.choose('s65-c91-choice', 'a'); d.advance('s65-c91-answer-a');
  d.choose('s03-s65-c90-echo-dispatch', 'a'); d.advance('s03-s65-c90-echo-a');
  d.advance('s03-editorial'); d.choose('s03-career-dispatch', 'people');
  d.advance('s03-career-people'); d.advance('s03-coffee');
  d.choose('s03-seat-dispatch', 'other'); d.advance('s03-seat-other');
  d.advance('s03-waterfront'); d.choose('s03-after-pharmacy-choice', 'message');
  d.advance('s03-message');
  d.advance('s03-c90'); d.choose('s03-c90-choice', 'a'); d.advance('s03-c90-answer-a');
  d.advance('s03-c91'); d.choose('s03-c91-choice', 'a'); d.advance('s03-c91-answer-a');
  d.advance('s04-intro'); d.choose('s04-camera-consent-choice', 'accepted');
  d.advance('s04-accepted'); d.advance('s04-common');
  d.choose('s04-s03-dispatch', 'message'); d.advance('s04-after-message');
  assert.equal(d.state.narrative.sceneId, 's04-c90');
  const saveSnapshot = JSON.parse(JSON.stringify(d.state));
  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b']) {
      const run = makeDriver(graph, catalog, JSON.parse(JSON.stringify(saveSnapshot)));
      run.advance('s04-c90'); run.choose('s04-c90-choice', a);
      run.advance('s04-c90-answer-' + a);
      run.advance('s04-c91'); run.choose('s04-c91-choice', b);
      run.advance('s04-c91-answer-' + b);
      run.advance('s05-intro');
      const weather = c === 'a' && e === 'a' ? 'erik' : 'nick';
      run.choose('s05-weather-choice', weather);
      run.advance('s05-' + weather); run.advance('s05-common');
      run.advance('s05-c90'); run.choose('s05-c90-choice', c);
      run.advance('s05-c90-answer-' + c);
      run.advance('s05-c91'); run.choose('s05-c91-choice', e);
      run.advance('s05-c91-answer-' + e);
      assert.equal(run.state.narrative.sceneId, 's06-intro');
      assert.equal(run.state.narrative.routeLock, null);
      assert.equal(run.state.narrative.flags['consent-camera-accepted'], true);
      assert.equal(run.state.narrative.flags['s03-damir-message'], true);
      assert.equal(run.state.narrative.flags['weather-choice-' + weather], true);
    }
});
