import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData, presentationData } from '../game-studio/src/story.js';
import { interactionBeats } from '../game-studio/src/original-interactive-beats.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog,
  createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game-studio/assets/ludory-narrative.js';

const graph = defineNarrativeGraph(graphData);
const catalog = defineNarrativeCatalog(catalogData);
const scenes = new Map(graphData.scenes.map(scene => [scene.id, scene]));
const following = { S22: 's23-intro', S23: 's23-followup-dispatch' };
const bridge = {
  's22-stop-group': 's22-c90',
  's22-stop-notes': 's22-c90',
  's23-stop-group': 's23-c90',
  's23-stop-notes': 's23-c90',
};

test('original S22/S23 questions, answers, and all canonical branch guards are preserved', () => {
  for (const [id, destination] of Object.entries(following)) {
    const choices = interactionBeats[id];
    assert.equal(choices?.length, 2);
    for (let i = 0; i < 2; i++) {
      const stem = id.toLowerCase() + '-c' + (90 + i);
      const node = scenes.get(stem);
      assert.equal(node.beats[0].text.ru, choices[i].question);
      assert.equal(node.beats[1].type, 'choice');
      assert.equal(node.beats[1].choices.length, 2);
      assert.deepEqual(node.beats[1].choices.map(x => x.label.ru),
        choices[i].options.map(x => x.label));
      for (const option of choices[i].options) {
        const answerId = stem + '-answer-' + option.code.toLowerCase();
        const response = scenes.get(answerId);
        assert.ok(response, answerId);
        assert.equal(response.beats.filter(beat => beat.type === 'dialogue')
          .map(beat => beat.text.ru).join('\n\n'), option.text, answerId);
        assert.equal(response.nextSceneId,
          i === 0 ? id.toLowerCase() + '-c91' : destination);
      }
      for (const option of node.beats[1].choices) {
        assert.equal(option.effects, undefined, 'Free reflective decision was changed: ' + stem);
        for (const forbidden of ['cost', 'premium', 'routeLock', 'publishPermission']) {
          assert.equal(option[forbidden], undefined, stem + ':' + forbidden);
        }
      }
      // S22 has no source artwork cue; the S23 harbor CG depicts a specific
      // Eric paragraph and must not be silently duplicated for every route.
      for (const suffix of ['prompt','choice','answer-a-01','answer-b-01']) {
        assert.equal(presentationData.beats[stem + '-' + suffix], undefined,
          'Misattributed image to ' + stem + '-' + suffix);
      }
    }
  }
  assert.equal(presentationData.beats['s23-intro-01']?.[0]?.cg?.mediaId,
    's23-eric-harbor-plan', 'existing authored S23 source image was lost');
  for (const [source, destination] of Object.entries(bridge)) {
    assert.equal(scenes.get(source)?.nextSceneId, destination);
  }
  const nChoices = sceneId => scenes.get(sceneId).beats
    .filter(beat => beat.type === 'choice').at(-1).choices.length;
  assert.equal(nChoices('s22-common-a'), 2);
  assert.equal(nChoices('s22-common-b'), 2);
  assert.equal(nChoices('s23-evening-dispatch'), 4);
  assert.equal(nChoices('s23-contact-dispatch'), 4);
  assert.equal(nChoices('s23-common-a'), 2);
  assert.equal(nChoices('s23-followup-dispatch'), 3);
});

function driver(snapshot) {
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: snapshot
    ? JSON.parse(JSON.stringify(snapshot)) : createNarrativeState(graph) };
  return {
    get state() { return state.narrative; },
    send(action) {
      update({ deltaMs: 16, state,
        inputs: [{ schemaVersion: 1, type: 'pointer', action,
          phase: 'up', timestamp: 223, source: 'renderer' }],
        setState(next) { state = next; },
      });
    },
  };
}

const getBeat = run => {
  const state = run.state;
  const beat = scenes.get(state.sceneId)?.beats[state.beatIndex];
  assert.ok(beat, 'Missing native beat: ' + state.sceneId + ':' + state.beatIndex);
  return beat;
};
const sig = run => [run.state.sceneId, run.state.beatIndex,
  run.state.actionLog.length].join(':');

function traverse(run, stop, choices = {}, visited = [], limit = 6500) {
  for (let i = 0; i < limit; i++) {
    const beat = getBeat(run);
    if (stop(run.state, beat)) return visited;
    const before = sig(run);
    if (beat.type === 'dialogue') run.send('narrative:next:' + beat.id);
    else if (beat.type === 'choice') {
      const candidates = choices[beat.id]
        ? beat.choices.filter(opt => opt.id === choices[beat.id]) : beat.choices;
      let consumed = false;
      for (const candidate of candidates) {
        run.send('narrative:choose:' + beat.id + ':' + candidate.id);
        if (sig(run) !== before) {
          visited.push([beat.id,candidate.id]);
          consumed = true;
          break;
        }
      }
      assert.ok(consumed, 'No eligible native answer for ' + beat.id +
        ' explicit=' + String(choices[beat.id]));
    } else assert.fail('Unexpected technical ending before target: ' + beat.id);
    assert.notEqual(sig(run), before, 'Native state stalled: ' + beat.id);
  }
  assert.fail('Exceeded native action bound while reaching target');
}

test('all four S17 evenings lead through S22/S23 original choices to S24 after save/restore', () => {
  const initial = driver();
  traverse(initial, (_,beat) => beat.id === 's17-evening-choice');
  const eveningCheckpoint = JSON.parse(JSON.stringify(initial.state));
  const evenings = ['eric', 'nick', 'damir', 'self'];
  let completed = 0;
  for (const evening of evenings) {
    const path = driver(eveningCheckpoint);
    traverse(path, state => state.sceneId === 's22-intro',
      { 's17-evening-choice': evening });
    const sharedCheckpoint = JSON.parse(JSON.stringify(path.state));
    for (let combination = 0; combination < 16; combination++) {
      const answers = [0,1,2,3].map(bit => (combination & (1 << bit)) ? 'b' : 'a');
      const native = driver(sharedCheckpoint);
      const overrides = {
        's22-c90-choice': answers[0],
        's22-c91-choice': answers[1],
        's23-c90-choice': answers[2],
        's23-c91-choice': answers[3],
      };
      const visited = [];
      traverse(native, (_, beat) => beat.id === 's23-c90-prompt',
        overrides, visited);
      const serialized = JSON.parse(JSON.stringify(native.state));
      const continued = driver(serialized);
      traverse(continued, state => state.sceneId === 's24-intro',
        overrides, visited);
      assert.equal(continued.state.sceneId, 's24-intro');
      assert.equal(continued.state.flags['s17-evening-' + evening], true);
      assert.equal(continued.state.routeLock, null);
      const eveningAction = visited.find(([id]) => id === 's23-evening-choice');
      assert.equal(eveningAction?.[1], evening === 'self' ? 'alice' : evening,
        'S23 original evening callback changed');
      const contact = visited.find(([id]) => id === 's23-contact-choice');
      assert.equal(contact?.[1] === 'skip', evening !== 'eric');
      const followup = visited.find(([id]) => id === 's23-followup-choice');
      assert.equal(followup?.[1] === 'skip', evening !== 'eric');
      for (const [i,id] of [
        's22-c90-choice','s22-c91-choice','s23-c90-choice','s23-c91-choice'
      ].entries()) {
        assert.ok(visited.some(([beat, answer]) => beat === id && answer === answers[i]),
          id + ' missing: ' + evening + ' / ' + combination);
      }
      assert.ok(visited.some(([id]) => id === 's22-repair-choice'));
      assert.ok(visited.some(([id]) => id === 's22-stop-choice'));
      completed++;
    }
  }
  assert.equal(completed, 64);
});
