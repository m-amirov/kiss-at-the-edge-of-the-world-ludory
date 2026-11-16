import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData, presentationData } from '../game-studio/src/story.js';
import { interactionBeats } from '../game-studio/src/original-interactive-beats.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game-studio/assets/ludory-narrative.js';

const graph = defineNarrativeGraph(graphData);
const catalog = defineNarrativeCatalog(catalogData);
const scenes = new Map(graphData.scenes.map(scene => [scene.id, scene]));
const originIds = ['S18', 'S19', 'S20', 'S21', 'S61'];
const originalMedia = {
  S18: 's18-hofn-harbour',
  S19: 's19-hofn-pool',
  S20: 's20-hofn-damir-kitchen',
  S21: 's21-alice-hofn-room',
  S61: 's61-hofn-streets',
};
const followups = {
  S18: 's22-intro',
  S19: 's22-intro',
  S20: 's22-intro',
  S21: 's61-intro',
  S61: 's22-intro',
};
const bridges = {
  's18-postcards': 's18-c90',
  's18-song': 's18-c90',
  's19-camera-free': 's19-c90',
  's19-breakfast': 's19-c90',
  's20-breakfast': 's20-c90',
  's20-waterfront': 's20-c90',
  's21-friend': 's21-c90',
  's21-bookstore': 's21-c90',
  's61-friend': 's61-c90',
  's61-bookstore': 's61-c90',
};

function makeDriver(snapshot) {
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: snapshot ? JSON.parse(JSON.stringify(snapshot))
    : createNarrativeState(graph) };
  return {
    get state() { return state.narrative; },
    send(action) {
      update({
        deltaMs: 16,
        state,
        inputs: [{ schemaVersion: 1, type: 'pointer', action,
          phase: 'up', timestamp: 321, source: 'renderer' }],
        setState(next) { state = next; },
      });
    },
  };
}

const current = run => {
  const state = run.state;
  const beat = scenes.get(state.sceneId)?.beats[state.beatIndex];
  assert.ok(beat, 'Missing native beat ' + state.sceneId + ':' + state.beatIndex);
  return beat;
};
const signature = run => {
  const s = run.state;
  return [s.sceneId, s.beatIndex, s.actionLog.length].join(':');
};

function walkUntil(run, stop, overrides = {}, visited = [], limit = 6500) {
  for (let i = 0; i < limit; i++) {
    const beat = current(run);
    if (stop(run.state, beat)) return visited;
    const before = signature(run);
    if (beat.type === 'dialogue') {
      run.send('narrative:next:' + beat.id);
    } else if (beat.type === 'choice') {
      const expected = overrides[beat.id];
      const candidates = expected
        ? beat.choices.filter(option => option.id === expected)
        : beat.choices;
      let selected = false;
      for (const option of candidates) {
        run.send('narrative:choose:' + beat.id + ':' + option.id);
        if (signature(run) !== before) {
          visited.push([beat.id, option.id]);
          selected = true;
          break;
        }
      }
      assert.ok(selected, 'No eligible source choice ' + beat.id +
        ' (requested ' + String(expected) + ')');
    } else {
      assert.fail('Unexpected ending before target: ' + beat.id);
    }
    assert.notEqual(signature(run), before, 'Native state stalled at ' + beat.id);
  }
  assert.fail('Native route exceeded ' + limit + ' actions');
}

test('source-verbatim S18/S19/S20/S21/S61 choices and original art, without economy', () => {
  assert.equal(Object.keys(bridges).length, 10);
  for (const [sourceId, mediaId] of Object.entries(originalMedia)) {
    const originals = interactionBeats[sourceId];
    assert.equal(originals?.length, 2);
    for (const i of [0, 1]) {
      const stem = sourceId.toLowerCase() + '-c' + (90 + i);
      const node = scenes.get(stem);
      assert.ok(node, 'Missing playable original decision ' + stem);
      assert.equal(node.beats[0].text.ru, originals[i].question);
      assert.equal(node.beats[1].type, 'choice');
      assert.deepEqual(node.beats[1].choices.map(c => c.label.ru),
        originals[i].options.map(o => o.label));
      assert.equal(node.beats[1].choices.length, 2);
      assert.ok(node.beats[1].choices.every(c => !c.effects?.length),
        stem + ': inserted unexpected affinity, premium or publication effects');
      for (const option of originals[i].options) {
        const id = stem + '-answer-' + option.code.toLowerCase();
        const answer = scenes.get(id);
        assert.ok(answer, 'Missing original response scene ' + id);
        assert.equal(answer.beats.filter(beat => beat.type === 'dialogue')
          .map(beat => beat.text.ru).join('\n\n'), option.text);
        assert.equal(answer.nextSceneId, i === 0
          ? sourceId.toLowerCase() + '-c91' : followups[sourceId]);
      }
      for (const suffix of ['prompt', 'choice', 'answer-a-01', 'answer-b-01']) {
        const beatId = stem + '-' + suffix;
        assert.equal(presentationData.beats[beatId]?.[0]?.cg?.mediaId, mediaId,
          beatId + ': admitted original media lost');
      }
    }
  }
  for (const [sceneId, next] of Object.entries(bridges)) {
    assert.equal(scenes.get(sceneId)?.nextSceneId, next, sceneId);
  }
  assert.equal(scenes.get('s17-common-b').beats.at(-1).choices.length, 4,
    'Four original romantic/independent evening routes must remain available');
});

test('all five original scenes are playable on real native routes with save restore', () => {
  const start = makeDriver();
  walkUntil(start, (state, beat) => beat.id === 's17-evening-choice');
  assert.equal(start.state.sceneId, 's17-common-b');
  const checkpoint = JSON.parse(JSON.stringify(start.state));
  const cases = [
    ['eric', ['S18']],
    ['nick', ['S19']],
    ['damir', ['S20']],
    ['self', ['S21', 'S61']],
  ];
  // Four alternatives per evening and sixteen for the independent
  // S21-to-S61 continuation. Existing canonical choices stay real.
  let paths = 0;
  for (const [evening, sourceIds] of cases) {
    const pairs = sourceIds.length === 2
      ? Array.from({ length: 16 }, (_, n) => [
          (n & 1) ? 'b' : 'a', (n & 2) ? 'b' : 'a',
          (n & 4) ? 'b' : 'a', (n & 8) ? 'b' : 'a',
        ])
      : [['a','a'],['a','b'],['b','a'],['b','b']];
    for (const answers of pairs) {
      const run = makeDriver(checkpoint);
      const overrides = { 's17-evening-choice': evening };
      sourceIds.forEach((id, i) => {
        overrides[id.toLowerCase()+'-c90-choice'] = answers[i * 2];
        overrides[id.toLowerCase()+'-c91-choice'] = answers[i * 2 + 1];
      });
      const choices = [];
      const saveAt = sourceIds[0].toLowerCase() + '-c91-prompt';
      walkUntil(run, (_, beat) => beat.id === saveAt, overrides, choices);
      const serialized = JSON.parse(JSON.stringify(run.state));
      const resumed = makeDriver(serialized);
      walkUntil(resumed, state => state.sceneId === 's22-intro', overrides, choices);
      assert.equal(resumed.state.sceneId, 's22-intro');
      assert.equal(resumed.state.flags['s17-evening-' + evening], true);
      assert.equal(resumed.state.routeLock, null);
      for (let i = 0; i < sourceIds.length; i++) {
        const id = sourceIds[i].toLowerCase();
        assert.ok(choices.some(([beat, code]) =>
          beat === id + '-c90-choice' && code === answers[i * 2]),
          'Missed ' + id + ' original C90 choice on ' + evening);
        assert.ok(choices.some(([beat, code]) =>
          beat === id + '-c91-choice' && code === answers[i * 2 + 1]),
          'Missed ' + id + ' original C91 choice on ' + evening);
      }
      paths++;
    }
  }
  assert.equal(paths, 28, 'Native route permutation coverage changed');
});
