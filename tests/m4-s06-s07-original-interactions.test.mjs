
import test from 'node:test';
import assert from 'node:assert/strict';
import { graphData, catalogData, presentationData } from '../game-studio/src/story.js';
import { interactionBeats, interactionEchoes } from '../game-studio/src/original-interactive-beats.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog,
  createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game-studio/assets/ludory-narrative.js';

const scene = id => graphData.scenes.find(item => item.id === id);
const sourceText = id => scene(id)?.beats
  .filter(item => item.type === 'dialogue').map(item => item.text.ru).join('\n\n');

function makeDriver(graph, catalog, state) {
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let current = state;
  const send = action => update({
    deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
    state: current,
    setState(next) { current = next; },
  });
  return {
    get state() { return current; },
    advance(id) {
      assert.equal(current.narrative.sceneId, id);
      for (const beat of scene(id).beats.filter(beat => beat.type === 'dialogue')) {
        send('narrative:next:' + beat.id);
      }
    },
    choose(beat, code) {
      send('narrative:choose:' + beat + ':' + code);
    },
  };
}

test('original S06/S07 options, dialogue, S08 echo and visual sources are intact', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  const exits = {
    's06-favorite-place': 's06-c90',
    's06-music': 's06-c90',
    's07-eric-favorite': 's07-c90',
    's07-eric-music': 's07-c90',
  };
  for (const [id, next] of Object.entries(exits)) {
    assert.equal(scene(id).nextSceneId, next, 'canonical routing to original choice lost: ' + id);
  }
  const images = {
    's06-c90': ['background', 's06-hveragerdi-geothermal-day'],
    's06-c91': ['background', 's06-hveragerdi-geothermal-day'],
    's07-c90': ['cg', 's07-kitchen-pasta'],
    's07-c91': ['cg', 's07-kitchen-cards'],
  };
  for (const sourceId of ['S06', 'S07']) for (let i = 0; i < 2; i++) {
    const original = interactionBeats[sourceId][i];
    const id = sourceId.toLowerCase() + '-c' + (90 + i);
    const choice = scene(id).beats[1];
    assert.equal(scene(id).beats[0].text.ru, original.question);
    assert.equal(choice.type, 'choice');
    assert.deepEqual(choice.choices.map(x => x.label.ru), original.options.map(x => x.label));
    for (const option of original.options) {
      const code = option.code.toLowerCase(), answer = id + '-answer-' + code;
      assert.equal(sourceText(answer), option.text, answer + ': source prose mismatch');
    }
    const [type, media] = images[id];
    for (const beat of [id + '-prompt', id + '-choice', id + '-answer-a-01', id + '-answer-b-01']) {
      const variant = presentationData.beats[beat]?.[0];
      assert.equal(type === 'background' ? variant?.background : variant?.cg?.mediaId, media, beat);
    }
    for (const option of choice.choices) {
      if (sourceId === 'S07' && i === 0) {
        assert.deepEqual(option.effects, [
          { op: 'flag_set', id: 's07-extra-c90-' + option.id, value: true },
        ]);
      } else {
        assert.ok(!option.effects?.length, id + ': unintended affinity or route changes');
      }
    }
  }
  const echo = interactionEchoes.S08.find(([name]) => name === 'S07-C90');
  assert.equal(sourceText('s08-s07-c90-echo-a'), echo[1]);
  assert.equal(sourceText('s08-s07-c90-echo-b'), echo[2]);
  for (const code of ['a', 'b']) {
    assert.equal(scene('s08-s07-c90-echo-' + code).nextSceneId, 's08-intro');
    assert.equal(presentationData.beats['s08-s07-c90-echo-' + code + '-01']?.[0]?.cg?.mediaId,
      's08-guesthouse-strap');
  }
  const dispatch = scene('s08-s07-c90-echo-route').beats[0];
  assert.equal(dispatch.choices[0].when.flag, 's07-extra-c90-a');
  assert.equal(dispatch.choices[1].when.flag, 's07-extra-c90-b');
  assert.equal(dispatch.choices[2].id, 'legacy', 'earlier saves need a safe unselected route');
  assert.equal(dispatch.choices[2].targetSceneId, 's08-intro');
});

function reachS06(graph, catalog) {
  const d = makeDriver(graph, catalog, { narrative: createNarrativeState(graph) });
  d.advance('s01-airport'); d.choose('s01-seat-choice', 'front-eric');
  d.advance('s01-eric'); d.advance('s01-common');
  d.advance('s01-c90'); d.choose('s01-c90-choice', 'a'); d.advance('s01-c90-answer-a');
  d.advance('s01-c91'); d.choose('s01-c91-choice', 'b'); d.advance('s01-c91-answer-b');
  d.choose('s02-c90-echo-route', 'a'); d.advance('s02-c90-echo-a');
  d.advance('s02-road'); d.choose('s02-career-choice', 'people');
  d.advance('s02-people'); d.advance('s02-common');
  d.advance('s02-c90'); d.choose('s02-c90-choice', 'a'); d.advance('s02-c90-answer-a');
  d.advance('s02-c91'); d.choose('s02-c91-choice', 'a'); d.advance('s02-c91-answer-a');
  d.advance('s65-guesthouse');
  d.advance('s65-c90'); d.choose('s65-c90-choice', 'b'); d.advance('s65-c90-answer-b');
  d.advance('s65-c91'); d.choose('s65-c91-choice', 'b'); d.advance('s65-c91-answer-b');
  d.choose('s03-s65-c90-echo-dispatch', 'b'); d.advance('s03-s65-c90-echo-b');
  d.advance('s03-editorial'); d.choose('s03-career-dispatch', 'people');
  d.advance('s03-career-people'); d.advance('s03-coffee');
  d.choose('s03-seat-dispatch', 'other'); d.advance('s03-seat-other');
  d.advance('s03-waterfront'); d.choose('s03-after-pharmacy-choice', 'message');
  d.advance('s03-message');
  d.advance('s03-c90'); d.choose('s03-c90-choice', 'a'); d.advance('s03-c90-answer-a');
  d.advance('s03-c91'); d.choose('s03-c91-choice', 'b'); d.advance('s03-c91-answer-b');
  d.advance('s04-intro'); d.choose('s04-camera-consent-choice', 'accepted');
  d.advance('s04-accepted'); d.advance('s04-common');
  d.choose('s04-s03-dispatch', 'message'); d.advance('s04-after-message');
  d.advance('s04-c90'); d.choose('s04-c90-choice', 'b'); d.advance('s04-c90-answer-b');
  d.advance('s04-c91'); d.choose('s04-c91-choice', 'b'); d.advance('s04-c91-answer-b');
  d.advance('s05-intro'); d.choose('s05-weather-choice', 'nick');
  d.advance('s05-nick'); d.advance('s05-common');
  d.advance('s05-c90'); d.choose('s05-c90-choice', 'a'); d.advance('s05-c90-answer-a');
  d.advance('s05-c91'); d.choose('s05-c91-choice', 'b'); d.advance('s05-c91-answer-b');
  assert.equal(d.state.narrative.sceneId, 's06-intro');
  return JSON.parse(JSON.stringify(d.state));
}

test('16 S06/S07 answer permutations preserve native route effects and S08 callback', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const saved = reachS06(graph, catalog);
  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b']) {
      const d = makeDriver(graph, catalog, JSON.parse(JSON.stringify(saved)));
      d.advance('s06-intro'); d.choose('s06-weather-dispatch', 'other');
      d.advance('s06-weather-other'); d.advance('s06-common-a');
      d.choose('s06-seat-dispatch', 'eric'); d.advance('s06-seat-eric');
      d.advance('s06-common-b');
      const route = a === 'a' ? 'favorite-place' : 'music';
      d.choose('s06-eric-choice', route);
      d.advance('s06-' + route);
      d.advance('s06-c90'); d.choose('s06-c90-choice', a); d.advance('s06-c90-answer-' + a);
      d.advance('s06-c91'); d.choose('s06-c91-choice', b); d.advance('s06-c91-answer-' + b);
      d.advance('s07-intro'); d.choose('s07-weather-dispatch', 'nick');
      d.advance('s07-weather-nick'); d.choose('s07-seat-dispatch', 'other');
      d.advance('s07-common-a'); d.choose('s07-consent-dispatch', 'accepted');
      d.advance('s07-camera-accepted'); d.advance('s07-common-b');
      d.choose('s07-archive-choice', 'nick'); d.advance('s07-archive-nick');
      d.advance('s07-common-c');
      d.choose('s07-s06-dispatch', a === 'a' ? 'favorite' : 'music');
      d.advance(a === 'a' ? 's07-eric-favorite' : 's07-eric-music');
      d.advance('s07-c90'); d.choose('s07-c90-choice', c); d.advance('s07-c90-answer-' + c);
      const serialized = JSON.parse(JSON.stringify(d.state));
      const restored = makeDriver(graph, catalog, serialized);
      restored.advance('s07-c91');
      restored.choose('s07-c91-choice', e); restored.advance('s07-c91-answer-' + e);
      restored.choose('s08-s07-c90-echo-dispatch', c);
      restored.advance('s08-s07-c90-echo-' + c);
      assert.equal(restored.state.narrative.sceneId, 's08-intro');
      assert.equal(restored.state.narrative.flags['s07-extra-c90-' + c], true);
      assert.notEqual(restored.state.narrative.flags['s07-extra-c90-' + (c === 'a' ? 'b' : 'a')], true);
      assert.equal(restored.state.narrative.flags['eric-map-' + route], true);
      assert.equal(restored.state.narrative.flags['kitchen-archive-nick'], true);
      assert.equal(restored.state.narrative.flags['consent-camera-accepted'], true);
      assert.equal(restored.state.narrative.routeLock, null);
    }
});

test('S08/S66/S09 source decisions, original answers and native visuals survive porting', () => {
  const sources = [
    ['S08', 's08-guesthouse-strap', 'cg', 's66-intro'],
    ['S66', 's66-hveragerdi-greenhouse', 'background', 's09-intro'],
    ['S09', 's09-skogafoss-trail', 'background', 's10-intro'],
  ];
  for (const [sourceId, artwork, kind, continuation] of sources) {
    assert.equal(interactionBeats[sourceId].length, 2);
    for (let index = 0; index < 2; index++) {
      const name = sourceId.toLowerCase() + '-c' + (90 + index);
      const authored = interactionBeats[sourceId][index];
      const node = scene(name);
      assert.equal(node.beats[0].text.ru, authored.question, name + ' question');
      assert.equal(node.beats[1].type, 'choice');
      assert.deepEqual(node.beats[1].choices.map(c => c.label.ru), authored.options.map(c => c.label));
      for (const option of authored.options) {
        const code = option.code.toLowerCase();
        const answer = scene(name + '-answer-' + code);
        assert.equal(sourceText(answer.id), option.text, answer.id + ' author prose');
        assert.equal(answer.nextSceneId, index === 0 ? sourceId.toLowerCase() + '-c91' : continuation);
        assert.ok(!node.beats[1].choices.some(c => c.effects?.length),
          name + ' must not introduce monetization or relationship mutations');
      }
      for (const beatId of [
        name + '-prompt', name + '-choice', name + '-answer-a-01', name + '-answer-b-01'
      ]) {
        const visual = presentationData.beats[beatId]?.[0];
        assert.ok(visual, beatId + ' lacks mapped original artwork');
        assert.equal(kind === 'cg' ? visual.cg?.mediaId : visual.background, artwork, beatId);
      }
    }
  }
  for (const [id, expected] of Object.entries({
    's08-warm': 's08-c90',
    's08-neutral': 's08-c90',
    's08-personal': 's08-c90',
    's66-common-b': 's66-c90',
    's09-common-b': 's09-c90',
  })) {
    assert.equal(scene(id).nextSceneId, expected, id + ': compatibility bridge lost');
  }
  assert.equal(scene('s08-common').beats.at(-1).choices.length, 3);
  assert.equal(scene('s09-intro').beats.at(-1).choices.length, 3);
});

test('64 S08/S66/S09 C90/C91 combinations preserve canonical branches up to S10', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const d = makeDriver(graph, catalog, reachS06(graph, catalog));
  d.advance('s06-intro'); d.choose('s06-weather-dispatch', 'other');
  d.advance('s06-weather-other'); d.advance('s06-common-a');
  d.choose('s06-seat-dispatch', 'eric'); d.advance('s06-seat-eric');
  d.advance('s06-common-b'); d.choose('s06-eric-choice', 'favorite-place');
  d.advance('s06-favorite-place');
  d.advance('s06-c90'); d.choose('s06-c90-choice', 'a'); d.advance('s06-c90-answer-a');
  d.advance('s06-c91'); d.choose('s06-c91-choice', 'a'); d.advance('s06-c91-answer-a');
  d.advance('s07-intro'); d.choose('s07-weather-dispatch', 'nick');
  d.advance('s07-weather-nick'); d.choose('s07-seat-dispatch', 'other');
  d.advance('s07-common-a'); d.choose('s07-consent-dispatch', 'accepted');
  d.advance('s07-camera-accepted'); d.advance('s07-common-b');
  d.choose('s07-archive-choice', 'nick'); d.advance('s07-archive-nick');
  d.advance('s07-common-c'); d.choose('s07-s06-dispatch', 'favorite');
  d.advance('s07-eric-favorite');
  d.advance('s07-c90'); d.choose('s07-c90-choice', 'a'); d.advance('s07-c90-answer-a');
  d.advance('s07-c91'); d.choose('s07-c91-choice', 'a'); d.advance('s07-c91-answer-a');
  d.choose('s08-s07-c90-echo-dispatch', 'a'); d.advance('s08-s07-c90-echo-a');
  assert.equal(d.state.narrative.sceneId, 's08-intro');
  const saved = JSON.parse(JSON.stringify(d.state));

  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b'])
      for (const f of ['a', 'b']) for (const g of ['a', 'b']) {
        const route = makeDriver(graph, catalog, JSON.parse(JSON.stringify(saved)));
        route.advance('s08-intro');
        route.choose('s08-weather-dispatch', 'other');
        route.advance('s08-common');
        route.choose('s08-damir-care-choice', 'warm');
        route.advance('s08-warm');
        route.advance('s08-c90');
        route.choose('s08-c90-choice', a);
        route.advance('s08-c90-answer-' + a);
        route.advance('s08-c91');
        route.choose('s08-c91-choice', b);
        route.advance('s08-c91-answer-' + b);

        route.advance('s66-intro'); route.choose('s66-damir-dispatch', 'warm');
        route.advance('s66-damir-warm'); route.advance('s66-common-a');
        route.choose('s66-career-dispatch', 'people');
        route.advance('s66-career-people'); route.advance('s66-common-b');
        route.advance('s66-c90');
        route.choose('s66-c90-choice', c);
        route.advance('s66-c90-answer-' + c);
        route.advance('s66-c91');
        route.choose('s66-c91-choice', e);
        route.advance('s66-c91-answer-' + e);

        route.advance('s09-intro'); route.choose('s09-voice-choice', 'eric');
        route.advance('s09-eric'); route.advance('s09-common-a');
        route.choose('s09-career-dispatch', 'people');
        route.advance('s09-career-people'); route.advance('s09-common-b');
        route.advance('s09-c90');
        route.choose('s09-c90-choice', f);
        route.advance('s09-c90-answer-' + f);
        const checkpoint = JSON.parse(JSON.stringify(route.state));
        const resumed = makeDriver(graph, catalog, checkpoint);
        resumed.advance('s09-c91');
        resumed.choose('s09-c91-choice', g);
        resumed.advance('s09-c91-answer-' + g);
        assert.equal(resumed.state.narrative.sceneId, 's10-intro',
          [a,b,c,e,f,g].join('') + ': narrative lost at S10');
        assert.equal(resumed.state.narrative.flags['damir-care-warm'], true);
        assert.equal(resumed.state.narrative.flags['skogafoss-voice-eric'], true);
        assert.equal(resumed.state.narrative.flags['weather-choice-nick'], true);
        assert.equal(resumed.state.narrative.flags['s07-extra-c90-a'], true);
        assert.equal(resumed.state.narrative.routeLock, null);
      }
});
