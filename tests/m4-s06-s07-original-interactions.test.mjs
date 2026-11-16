
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

test('64 S08/S66/S09 combinations and 16 S10/S11 combinations preserve canonical routes', () => {
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
  let checkpointS10 = null;

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
        if ([a, b, c, e, f, g].every(value => value === 'a')) {
          checkpointS10 = JSON.parse(JSON.stringify(resumed.state));
        }
      }
  assert.ok(checkpointS10, 'Native S10 entry save missing after 64 original permutations');
  let checkpointS12 = null;
  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b']) {
      const route = makeDriver(graph, catalog, JSON.parse(JSON.stringify(checkpointS10)));
      route.advance('s10-intro');
      route.choose('s10-seat-dispatch', 'eric');
      route.advance('s10-seat-eric');
      route.advance('s10-choice');
      route.choose('s10-tone-choice', 'playful');
      route.advance('s10-playful');
      route.advance('s10-common');
      route.advance('s10-c90');
      route.choose('s10-c90-choice', a);
      route.advance('s10-c90-answer-' + a);
      route.advance('s10-c91');
      route.choose('s10-c91-choice', b);
      route.advance('s10-c91-answer-' + b);
      route.advance('s11-intro');
      route.choose('s11-consent-dispatch', 'accepted');
      route.advance('s11-camera-accepted');
      route.advance('s11-common-a');
      // Exercise all three canonical water-safety outcomes without changing
      // their flags or original consent semantics.
      const safety = (a === 'a' && b === 'a') ? 'a' :
        (c === 'b' && e === 'b') ? 'b' : 'c';
      route.choose('s11-safety-choice', safety);
      const safetyNode = {
        a: 's11-safe-point', b: 's11-leave-water', c: 's11-check-rules',
      }[safety];
      route.advance(safetyNode);
      route.advance('s11-common-b');
      route.advance('s11-c90');
      route.choose('s11-c90-choice', c);
      route.advance('s11-c90-answer-' + c);
      const save = JSON.parse(JSON.stringify(route.state));
      const resumed = makeDriver(graph, catalog, save);
      resumed.advance('s11-c91');
      resumed.choose('s11-c91-choice', e);
      resumed.advance('s11-c91-answer-' + e);
      assert.equal(resumed.state.narrative.sceneId, 's12-intro',
        [a,b,c,e].join('') + ': S11 choice lost its canonical S12 continuation');
      assert.equal(resumed.state.narrative.flags['consent-camera-accepted'], true);
      assert.equal(resumed.state.narrative.flags['eric-tone-playful'], true);
      assert.equal(resumed.state.narrative.flags['skogafoss-voice-eric'], true);
      assert.equal(resumed.state.narrative.flags[
        safety === 'b' ? 'beach-footage-none' : 'beach-footage-safe-only'], true);
      assert.equal(resumed.state.narrative.routeLock, null);
      if ([a, b, c, e].every(value => value === 'a')) {
        checkpointS12 = JSON.parse(JSON.stringify(resumed.state));
      }
    }

  assert.ok(checkpointS12, 'Native S12 save missing after actual S10/S11 traversal');
  let checkpointS14 = null;
  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b']) {
      const run = makeDriver(graph, catalog, JSON.parse(JSON.stringify(checkpointS12)));
      run.advance('s12-intro'); run.choose('s12-care-dispatch', 'warm');
      run.advance('s12-care-warm'); run.advance('s12-common-a');
      run.choose('s12-voice-dispatch', 'other');
      run.advance('s12-voice-other'); run.advance('s12-common-b');
      run.choose('s12-past-choice', 'listen');
      run.advance('s12-past-listen'); run.advance('s12-common-c');
      run.choose('s12-draft-choice', 'damir');
      run.advance('s12-draft-damir'); run.advance('s12-common-d');
      run.choose('s12-return-choice', 'chocolate'); run.advance('s12-return-chocolate');
      run.advance('s12-c90'); run.choose('s12-c90-choice', a);
      run.advance('s12-c90-answer-' + a);
      run.advance('s12-c91'); run.choose('s12-c91-choice', b);
      run.advance('s12-c91-answer-' + b);
      const snapshot = JSON.parse(JSON.stringify(run.state));
      const resumed = makeDriver(graph, catalog, snapshot);
      resumed.advance('s13-intro'); resumed.choose('s13-voice-dispatch', 'eric');
      resumed.advance('s13-voice-eric'); resumed.advance('s13-common-a');
      resumed.choose('s13-work-choice', 'editor');
      resumed.advance('s13-work-editor'); resumed.advance('s13-common-b');
      resumed.choose('s13-return-dispatch', 'chocolate');
      resumed.advance('s13-return-chocolate');
      resumed.advance('s13-c90'); resumed.choose('s13-c90-choice', c);
      resumed.advance('s13-c90-answer-' + c);
      resumed.advance('s13-c91'); resumed.choose('s13-c91-choice', e);
      resumed.advance('s13-c91-answer-' + e);
      assert.equal(resumed.state.narrative.sceneId, 's14-intro',
        [a,b,c,e].join('') + ': original S12/S13 response lost the S14 transition');
      for (const flag of ['damir-past-listen', 'draft-shared-damir',
        's12-return-chocolate', 'alice-leads-editor', 'skogafoss-voice-eric']) {
        assert.equal(resumed.state.narrative.flags[flag], true, flag + ': canonical outcome lost');
      }
      assert.equal(resumed.state.narrative.routeLock, null);
      if ([a, b, c, e].every(value => value === 'a')) {
        checkpointS14 = JSON.parse(JSON.stringify(resumed.state));
      }
    }

  assert.ok(checkpointS14, 'S14 checkpoint was not reached via real prior choices');
  let index = 0;
  let checkpointS16 = null;
  for (const a of ['a', 'b']) for (const b of ['a', 'b'])
    for (const c of ['a', 'b']) for (const e of ['a', 'b']) {
      const walk = (index++ % 2) === 0;
      const policy = ['a', 'b', 'c'][(index - 1) % 3];
      const d = makeDriver(graph, catalog, JSON.parse(JSON.stringify(checkpointS14)));
      d.advance('s14-intro');
      d.choose('s14-tone-dispatch', 'playful'); d.advance('s14-tone-playful');
      d.advance('s14-common-a');
      d.choose('s14-pace-choice', 'slow'); d.advance('s14-pace-slow');
      d.advance('s14-common-b');
      d.choose('s14-gesture-choice', walk ? 'walk' : 'photo');
      d.advance(walk ? 's14-gesture-walk' : 's14-gesture-photo');
      d.advance('s14-c90'); d.choose('s14-c90-choice', a);
      d.advance('s14-c90-answer-' + a);
      d.advance('s14-c91'); d.choose('s14-c91-choice', b);
      d.advance('s14-c91-answer-' + b);
      d.advance('s15-intro');
      d.choose('s15-voice-dispatch', 'eric'); d.advance('s15-other-voice');
      d.advance('s15-common-a');
      d.choose('s15-privacy-choice', policy);
      d.advance({ a:'s15-privacy', b:'s15-observed', c:'s15-shared-file' }[policy]);
      d.advance('s15-common-b');
      d.choose('s15-gesture-dispatch', walk ? 'walk' : 'photo');
      d.advance(walk ? 's15-evening-walk' : 's15-evening-photo');
      d.advance('s15-c90'); d.choose('s15-c90-choice', c);
      d.advance('s15-c90-answer-' + c);
      const saved = JSON.parse(JSON.stringify(d.state));
      const restored = makeDriver(graph, catalog, saved);
      restored.advance('s15-c91'); restored.choose('s15-c91-choice', e);
      restored.advance('s15-c91-answer-' + e);
      assert.equal(restored.state.narrative.sceneId, 's16-intro', 
        [a,b,c,e,policy].join('') + ': original S14/S15 did not converge on S16');
      assert.equal(restored.state.narrative.flags['eric-pace-slow'], true);
      assert.equal(restored.state.narrative.flags[walk ? 'eric-gesture-walk' : 'eric-gesture-photo'], true);
      assert.equal(restored.state.narrative.flags[
        { a:'nick-failure-private', b:'nick-failure-observed', c:'nick-failure-shared-file' }[policy]], true);
      assert.equal(restored.state.narrative.routeLock, null);
      if ([a,b,c,e].every(option => option === 'a')) {
        checkpointS16 = JSON.parse(JSON.stringify(restored.state));
      }
    }

  assert.ok(checkpointS16, 'Native S16 checkpoint not reached by prior canonical story');
  let s17Index = 0;
  const sourceEcho = interactionEchoes.S22[0];
  assert.equal(sourceEcho[0], 'S17-C90');
  for (const a of ['a','b']) for (const b of ['a','b'])
    for (const c of ['a','b']) for (const e of ['a','b']) {
      const d = makeDriver(graph, catalog, JSON.parse(JSON.stringify(checkpointS16)));
      d.advance('s16-intro');
      d.choose('s16-care-choice', 'a'); d.advance('s16-tea'); d.advance('s16-common');
      d.advance('s16-c90'); d.choose('s16-c90-choice', a); d.advance('s16-c90-answer-' + a);
      d.advance('s16-c91'); d.choose('s16-c91-choice', b); d.advance('s16-c91-answer-' + b);
      d.advance('s17-intro');
      d.choose('s17-n-dispatch', 'a'); d.advance('s17-n-a');
      d.advance('s17-common-a');
      d.choose('s17-e-dispatch', 'a'); d.advance('s17-e-a');
      d.choose('s17-d-dispatch', 'a'); d.advance('s17-d-a');
      d.choose('s17-group-choice', 'a'); d.advance('s17-group-a');
      d.advance('s17-c90'); d.choose('s17-c90-choice', c);
      d.advance('s17-c90-answer-' + c);
      d.advance('s17-c91'); d.choose('s17-c91-choice', e);
      d.advance('s17-c91-answer-' + e);
      d.advance('s17-common-b');
      // Deliberately exercise Eric's route for both C90 A and C90 B:
      // first Eric trial has C90=A, third trial has C90=B.
      const evening = s17Index === 2 ? 'eric' :
        ['eric','nick','damir','self'][s17Index % 4];
      s17Index++;
      d.choose('s17-evening-choice', evening);
      const next = {eric:'s18-intro',nick:'s19-intro',damir:'s20-intro',self:'s21-intro'}[evening];
      assert.equal(d.state.narrative.sceneId, next,
        [a,b,c,e,evening].join('') + ': four-route S17 ending changed');
      assert.equal(d.state.narrative.flags['s17-extra-c90-' + c], true);
      assert.notEqual(d.state.narrative.flags['s17-extra-c90-' + (c === 'a' ? 'b' : 'a')], true);
      assert.equal(d.state.narrative.flags['s17-evening-' + evening], true);
      assert.equal(d.state.narrative.flags['damir-space-tea'], true);
      assert.equal(d.state.narrative.routeLock, null);

      // Each S17 C90 answer is verified in S22 after the full real Eric
      // evening; this cannot be reduced to a string-only source assertion.
      if (evening !== 'eric') continue;
      d.advance('s18-intro'); d.choose('s18-contact-choice', 'kiss');
      d.advance('s18-kiss'); d.advance('s18-common');
      d.choose('s18-payoff-dispatch-choice','k'); d.advance('s18-k');
      d.choose('s18-followup-choice', 'postcards'); d.advance('s18-postcards');
      d.advance('s22-intro');
      assert.equal(d.state.narrative.sceneId, 's22-s17-c90-echo-dispatch');
      const checkpointS22 = JSON.parse(JSON.stringify(d.state));
      d.choose('s22-s17-c90-echo-dispatch-choice',c);
      assert.equal(sourceText('s22-s17-c90-echo-' + c), sourceEcho[c === 'a' ? 1 : 2]);
      d.advance('s22-s17-c90-echo-' + c);
      assert.equal(d.state.narrative.sceneId, 's22-weather-dispatch');
      assert.equal(d.state.narrative.flags['s17-evening-eric'], true);

      // Pre-restoration saves legitimately lack S17 C90 state. Never invent
      // either reply for such a save; continue to the original S22 weather beat.
      const oldSave = JSON.parse(JSON.stringify(checkpointS22));
      delete oldSave.narrative.flags['s17-extra-c90-a'];
      delete oldSave.narrative.flags['s17-extra-c90-b'];
      const legacy = makeDriver(graph, catalog, oldSave);
      legacy.choose('s22-s17-c90-echo-dispatch-choice','legacy');
      assert.equal(legacy.state.narrative.sceneId,'s22-weather-dispatch');
    }
});

test('S10/S11 extra choices exactly match authored source and preserve safety consent', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  assert.equal(scene('s10-common').nextSceneId, 's10-c90');
  assert.equal(scene('s11-common-b').nextSceneId, 's11-c90');
  assert.equal(scene('s11-common-a').beats.at(-1).choices.length, 3,
    'Existing canonical water safety choices were reduced or replaced');
  for (const sourceId of ['S10', 'S11']) {
    for (let index = 0; index < 2; index++) {
      const original = interactionBeats[sourceId][index];
      const id = sourceId.toLowerCase() + '-c' + (90 + index);
      const sceneNode = scene(id);
      assert.equal(sceneNode.beats[0].text.ru, original.question);
      assert.deepEqual(sceneNode.beats[1].choices.map(choice => choice.label.ru),
        original.options.map(option => option.label));
      assert.equal(sceneNode.beats[1].choices.length, 2);
      assert.ok(sceneNode.beats[1].choices.every(choice => !choice.effects?.length),
        id + ': author reflective choice must not invent route/economy state');
      const next = index === 0 ? sourceId.toLowerCase() + '-c91' :
        sourceId === 'S10' ? 's11-intro' : 's12-intro';
      for (const option of original.options) {
        const answerId = id + '-answer-' + option.code.toLowerCase();
        assert.equal(sourceText(answerId), option.text, 'Original prose changed: ' + answerId);
        assert.equal(scene(answerId).nextSceneId, next);
      }
      for (const beatId of [
        id + '-prompt', id + '-choice', id + '-answer-a-01', id + '-answer-b-01'
      ]) {
        const actual = presentationData.beats[beatId];
        if (sourceId === 'S10') {
          const image = index === 0 ? 's10-vik-road-song' : 's10-vik-guesthouse-arrival';
          assert.equal(index === 0 ? actual?.[0]?.cg?.mediaId : actual?.[0]?.background,
            image, beatId + ': pinned original S10 art was lost');
        } else {
          // The pinned source cue inventory has no S11 original image. A false
          // S10 image pasted onto S11 would be worse than an honest neutral stage.
          assert.equal(actual, undefined, beatId + ': falsely attributed image to S11');
        }
      }
    }
  }
});

test('S12/S13 original prompts, responses and source art remain exact', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  const expected = [
    ['S12', 's13-intro', [
      ['cg', 's12-vik-cafe-damir'], ['background', 's12-vik-street-day']]],
    ['S13', 's14-intro', [
      ['background', 's13-skaftafell-visitor-parking'], ['cg', 's13-skaftafell-travelers']]],
  ];
  for (const [sceneId, continuation, media] of expected) {
    const original = interactionBeats[sceneId];
    assert.equal(original.length, 2);
    for (let index = 0; index < 2; index++) {
      const id = sceneId.toLowerCase() + '-c' + (90 + index);
      const node = scene(id);
      assert.equal(node.beats[0].text.ru, original[index].question);
      assert.equal(node.beats[1].type, 'choice');
      assert.deepEqual(node.beats[1].choices.map(c => c.label.ru),
        original[index].options.map(c => c.label));
      assert.ok(node.beats[1].choices.every(c => !c.effects?.length),
        'Unexpected paid or affinity choice '+ id);
      for (const option of original[index].options) {
        const answerId = id + '-answer-' + option.code.toLowerCase();
        assert.equal(sourceText(answerId), option.text);
        assert.equal(scene(answerId).nextSceneId,
          index === 0 ? sceneId.toLowerCase() + '-c91' : continuation);
      }
      const [kind, artId] = media[index];
      for (const beatId of [id + '-prompt', id + '-choice',
        id + '-answer-a-01', id + '-answer-b-01']) {
        const variant = presentationData.beats[beatId]?.[0];
        assert.equal(kind === 'cg' ? variant?.cg?.mediaId : variant?.background,
          artId, beatId + ': lost original art continuity');
      }
    }
  }
  for (const [sceneId, next] of Object.entries({
    's12-return-chocolate': 's12-c90', 's12-return-alone': 's12-c90',
    's13-return-chocolate': 's13-c90', 's13-return-alone': 's13-c90'
  })) {
    assert.equal(scene(sceneId).nextSceneId, next);
  }
  assert.equal(scene('s12-common-d').beats.at(-1).choices.length, 2);
  assert.equal(scene('s13-common-a').beats.at(-1).choices.length, 2);
});

test('S14/S15 original questions, responses and admitted original art remain exact', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  const groups = [
    ['S14', 's15-intro', [['cg', 's14-skaftafell-pace'], ['background', 's14-lagoon-road']]],
    ['S15', 's16-intro', [['background', 's15-jokulsarlon-lagoon'], ['background', 's15-jokulsarlon-parking-day']]],
  ];
  for (const [sourceId, next, illustrations] of groups) {
    assert.equal(interactionBeats[sourceId].length, 2);
    for (let i = 0; i < 2; i++) {
      const name = sourceId.toLowerCase() + '-c' + (90 + i);
      const authored = interactionBeats[sourceId][i], node = scene(name);
      assert.equal(node.beats[0].text.ru, authored.question);
      assert.equal(node.beats[1].type, 'choice');
      assert.deepEqual(node.beats[1].choices.map(c => c.label.ru), authored.options.map(o => o.label));
      assert.ok(node.beats[1].choices.every(c => !c.effects?.length),
        name + ': unexpected consent/route/economy state change');
      for (const option of authored.options) {
        const answer = name + '-answer-' + option.code.toLowerCase();
        assert.equal(sourceText(answer), option.text);
        assert.equal(scene(answer).nextSceneId,
          i === 0 ? sourceId.toLowerCase() + '-c91' : next);
      }
      const [kind, media] = illustrations[i];
      for (const beat of [name + '-prompt', name + '-choice',
        name + '-answer-a-01', name + '-answer-b-01']) {
        const visual = presentationData.beats[beat]?.[0];
        assert.equal(kind === 'cg' ? visual?.cg?.mediaId : visual?.background,
          media, beat + ': original art continuity failed');
      }
    }
  }
  for (const [id, next] of Object.entries({
    's14-gesture-walk': 's14-c90', 's14-gesture-photo': 's14-c90',
    's15-evening-walk': 's15-c90', 's15-evening-photo': 's15-c90',
  })) assert.equal(scene(id).nextSceneId, next);
  assert.equal(scene('s15-common-a').beats.at(-1).choices.length, 3,
    'S15 original consent/privacy branching lost');
  assert.equal(scene('s14-common-a').beats.at(-1).choices.length, 2);
});

test('S16/S17 original choices and S22 delayed echo keep canonical scene and image data', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  for (const [sourceId, successors, images] of [
    ['S16','s17-intro',['s16-guesthouse-help','s16-kitchen-soup']],
    ['S17','s17-common-b',['s17-hofn-guesthouse','s17-hofn-guesthouse']],
  ]) {
    for (let i = 0; i < 2; i++) {
      const id = sourceId.toLowerCase() + '-c' + (90 + i);
      const authored = interactionBeats[sourceId][i];
      assert.equal(scene(id).beats[0].text.ru, authored.question);
      assert.deepEqual(scene(id).beats[1].choices.map(c => c.label.ru),
        authored.options.map(o => o.label));
      for (const option of authored.options) {
        const responseId = id + '-answer-' + option.code.toLowerCase();
        assert.equal(sourceText(responseId), option.text, responseId);
        assert.equal(scene(responseId).nextSceneId,
          i === 0 ? sourceId.toLowerCase() + '-c91' : successors);
      }
      if (sourceId === 'S17' && i === 0) {
        for (const opt of scene(id).beats[1].choices) {
          assert.deepEqual(opt.effects, [{
            op:'flag_set', id:'s17-extra-c90-' + opt.id, value:true
          }]);
        }
      } else assert.ok(scene(id).beats[1].choices.every(choice => !choice.effects?.length));
      for (const beat of [id+'-prompt', id+'-choice',id+'-answer-a-01',id+'-answer-b-01']) {
        assert.equal(presentationData.beats[beat]?.[0]?.cg?.mediaId,
          images[i], beat + ' original art mapping mismatch');
      }
    }
  }
  assert.equal(scene('s16-common').nextSceneId,'s16-c90');
  for (const suffix of ['a','b','c','d']) {
    assert.equal(scene('s17-group-' + suffix).nextSceneId,'s17-c90');
  }
  assert.equal(scene('s22-intro').nextSceneId,'s22-s17-c90-echo-dispatch');
  assert.equal(scene('s22-s17-c90-echo-dispatch').beats[0].choices.length,3);
  assert.equal(scene('s22-s17-c90-echo-a').nextSceneId,'s22-weather-dispatch');
  assert.equal(scene('s22-s17-c90-echo-b').nextSceneId,'s22-weather-dispatch');
  for (const suffix of ['a','b']) {
    assert.equal(sourceText('s22-s17-c90-echo-'+suffix),
      interactionEchoes.S22[0][suffix === 'a' ? 1 : 2]);
  }
  assert.equal(scene('s17-common-b').beats.at(-1).choices.length,4,
    'S17 canonical four-evening choice was replaced');
});
