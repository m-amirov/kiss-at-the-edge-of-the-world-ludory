import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData, presentationData } from '../game-studio/src/story.js';
import { interactionBeats, interactionEchoes } from '../game-studio/src/original-interactive-beats.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game-studio/assets/ludory-narrative.js';

const scene = id => graphData.scenes.find(item => item.id === id);
const textOf = id => scene(id).beats.filter(beat => beat.type === 'dialogue').map(beat => beat.text.ru).join('\n\n');

test('S65 and S03 recover four exact authored C90/C91 choices and original S03 delayed echo', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.equal(scene('s65-guesthouse').nextSceneId, 's65-c90');
  for (const id of ['s03-message', 's03-silence']) assert.equal(scene(id).nextSceneId, 's03-c90');
  for (const name of ['S65', 'S03']) for (let index = 0; index < 2; index++) {
    const original = interactionBeats[name][index];
    const id = name.toLowerCase() + '-c' + (90 + index);
    const prompt = scene(id).beats[0];
    const choice = scene(id).beats[1];
    assert.equal(prompt.text.ru, original.question, id);
    assert.equal(choice.type, 'choice', id);
    assert.deepEqual(choice.choices.map(item => item.label.ru), original.options.map(item => item.label), id);
    for (const option of original.options) {
      assert.equal(textOf(id + '-answer-' + option.code.toLowerCase()), option.text);
    }
  }
  const echo = interactionEchoes.S03.find(entry => entry[0] === 'S65-C90');
  assert.equal(textOf('s03-s65-c90-echo-a'), echo[1]);
  assert.equal(textOf('s03-s65-c90-echo-b'), echo[2]);
  const dispatch = scene('s03-s65-c90-echo-route').beats[0];
  assert.equal(dispatch.choices.length, 3);
  assert.deepEqual(dispatch.choices.find(x => x.id === 'legacy').when, {
    not: { any: [{ flag: 's65-extra-c90-a' }, { flag: 's65-extra-c90-b' }] },
  });
  for (const id of ['s03-s65-c90-echo-dispatch', 's03-s65-c90-echo-a-01', 's03-s65-c90-echo-b-01']) {
    assert.equal(presentationData.beats[id][0].background, 'guesthouse-morning');
  }
});

test('S65/S03 choices are playable for all combinations without disrupting canonical S03 choices', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  for (const s65first of ['a', 'b']) for (const s65second of ['a', 'b'])
    for (const s03first of ['a', 'b']) for (const s03second of ['a', 'b']) {
      const update = createNarrativeRuntimeUpdate({ graph, catalog });
      let state = { narrative: createNarrativeState(graph) };
      const send = action => update({
        deltaMs: 16,
        inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
        state, setState(next) { state = next; },
      });
      const advance = id => {
        assert.equal(state.narrative.sceneId, id, 'wrong scene before ' + id);
        for (const beat of scene(id).beats.filter(beat => beat.type === 'dialogue')) {
          send('narrative:next:' + beat.id);
        }
      };
      const choose = (beat, option) => send('narrative:choose:' + beat + ':' + option);
      advance('s01-airport'); choose('s01-seat-choice', 'front-eric');
      advance('s01-eric'); advance('s01-common');
      advance('s01-c90'); choose('s01-c90-choice', 'a'); advance('s01-c90-answer-a');
      advance('s01-c91'); choose('s01-c91-choice', 'a'); advance('s01-c91-answer-a');
      choose('s02-c90-echo-route', 'a'); advance('s02-c90-echo-a');
      advance('s02-road'); choose('s02-career-choice', 'people');
      advance('s02-people'); advance('s02-common');
      advance('s02-c90'); choose('s02-c90-choice', 'a'); advance('s02-c90-answer-a');
      advance('s02-c91'); choose('s02-c91-choice', 'a'); advance('s02-c91-answer-a');
      advance('s65-guesthouse');
      advance('s65-c90'); choose('s65-c90-choice', s65first);
      // Serialize while an authored outcome is pending, as when reloading a save.
      state = JSON.parse(JSON.stringify(state));
      advance('s65-c90-answer-' + s65first);
      advance('s65-c91'); choose('s65-c91-choice', s65second);
      advance('s65-c91-answer-' + s65second);
      assert.equal(state.narrative.sceneId, 's03-s65-c90-echo-route');
      choose('s03-s65-c90-echo-dispatch', s65first);
      advance('s03-s65-c90-echo-' + s65first);
      assert.equal(state.narrative.flags['s65-extra-c90-' + s65first], true);
      advance('s03-editorial'); choose('s03-career-dispatch', 'people');
      advance('s03-career-people');
      advance('s03-coffee'); choose('s03-seat-dispatch', 'other');
      advance('s03-seat-other'); advance('s03-waterfront');
      choose('s03-after-pharmacy-choice', 'message'); advance('s03-message');
      advance('s03-c90'); choose('s03-c90-choice', s03first);
      advance('s03-c90-answer-' + s03first);
      advance('s03-c91'); choose('s03-c91-choice', s03second);
      advance('s03-c91-answer-' + s03second);
      assert.equal(state.narrative.sceneId, 's04-intro');
      assert.equal(state.narrative.routeLock, null);
      assert.equal(state.narrative.flags['s03-damir-message'], true);
    }
});
