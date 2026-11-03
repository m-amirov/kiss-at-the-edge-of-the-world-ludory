import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { graphData, catalogData } from '../game/src/story.js';
import {
  createNarrativeRuntimeUpdate, createNarrativeState, defineNarrativeCatalog,
  defineNarrativeGraph,
} from '../game/assets/ludory-narrative.js';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const scene = (id) => graphData.scenes.find((s) => s.id === id);
const prose = (id) => (scene(id)?.beats ?? []).filter((b) => b.type === 'dialogue').map((b) => b.text.ru);
// Independently pinned source: 1e775f1:content/season-1-vertical-slice-episodes-01-02.md, S03 only.
const expectedLiteraryBlocks = {
  's03-editorial': [16, '30e6553ee8b2341537247d9a1391df453e4bdb0d0dba5b55e7f7b423b6d92683'],
  's03-career-people': [1, 'cefc0168a260ddfffabf42f01efa947022d48413b2637092722fdac94f15b556'],
  's03-career-place': [1, 'e3de9a698d85d243d55c22c6617658cffa335c3bd245c52e85af534a64b4de77'],
  's03-career-own': [1, '04ae307760e0b270b3bf2e17f7cde88ac94d7ecbdc9c7ce5033ad7f10836426f'],
  's03-coffee': [14, 'df0123f42843155e3711798e6070d2b979fb10a2151629fcc12657f8f99c5008'],
  's03-seat-damir': [3, 'b90653f4aad24f17fc8f5cd0720e8bfbceb7892fb7ecffc152f2df1ca684f5b6'],
  's03-seat-other': [3, 'fa697b2961cbbb0a19c9a8cd18fcbaab7e725c05d63689fe8af7e222b146ec37'],
  's03-waterfront': [50, '635a163c825b53d66d8dabbfb3a331f5a77e1b8551883c12e9e5ccfcafa9a93f'],
  's03-message': [1, '3118ae2469384b85d9c3390226acc2dc7490b16ec784c68e9876d404e3fc88e2'],
  's03-silence': [1, '48d84ae193b0ca041354e7f56b7339ec61871416b455887bd00ca063b34fe63e'],
};

test('S03 retains all 10 canonical literary blocks byte-for-byte', () => {
  for (const [id, [count, digest]] of Object.entries(expectedLiteraryBlocks)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, id);
    assert.equal(sha256(paragraphs.join('\n\n')), digest, id);
  }
  assert.match(prose('s03-editorial')[0], /^Утром дождь превратился/);
  assert.match(prose('s03-waterfront').at(-1), /необходимость этих двадцати метров\.$/);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S65 proceeds to S03; conditional continuation gates do not invent authored decisions', () => {
  assert.equal(scene('s65-guesthouse').nextSceneId, 's03-editorial');
  assert.equal(scene('s65-guesthouse').beats.some((b) => b.type === 'ending'), false);
  for (const id of ['s03-editorial', 's03-coffee']) {
    const last = scene(id)?.beats.at(-1);
    assert.equal(last?.type, 'choice', id);
    assert.ok(last.choices.length > 1);
    assert.ok(last.choices.every((option) =>
      option.label.ru === 'Продолжить' && option.effects === undefined && option.when), id);
  }
  assert.deepEqual(scene('s03-waterfront').beats.at(-1).choices.map((c) => c.id),
    ['message', 'silence']);
  assert.deepEqual(scene('s03-waterfront').beats.at(-1).choices.map((c) => c.targetSceneId),
    ['s03-message', 's03-silence']);
  for (const variant of ['s03-message', 's03-silence']) {
    assert.equal(scene(variant).nextSceneId, 's03-m3-end');
  }
  assert.equal(scene('s03-m3-end').beats.at(-1).type, 'ending');
});

function runToS03(seat, career) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let current = { narrative: createNarrativeState(graph) };
  const act = (action) => update({
    deltaMs: 16, state: current,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 22, source: 'renderer' }],
    setState(next) { current = next; },
  });
  const advance = (id) => {
    assert.equal(current.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((b) => b.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  advance('s01-airport');
  act(`narrative:choose:s01-seat-choice:${seat}`);
  advance({ 'front-eric': 's01-eric', 'back-nick': 's01-nick', 'back-damir': 's01-damir' }[seat]);
  advance('s01-common');
  advance('s02-road');
  act(`narrative:choose:s02-career-choice:${career}`);
  advance({ people: 's02-people', place: 's02-place', 'own-choice': 's02-own-choice' }[career]);
  advance('s02-common');
  advance('s65-guesthouse');
  assert.equal(current.narrative.sceneId, 's03-editorial');
  return { act, advance, graph, catalog, getState: () => current.narrative };
}

test('all nine S01×S02 states see exactly their authored S03 variants', () => {
  for (const seat of ['front-eric', 'back-nick', 'back-damir']) {
    for (const career of ['people', 'place', 'own-choice']) {
      const run = runToS03(seat, career);
      run.advance('s03-editorial');
      for (const rejected of ['people', 'place', 'own-choice'].filter((x) => x !== career)) {
        const before = JSON.stringify(run.getState());
        run.act(`narrative:choose:s03-career-dispatch:${rejected}`);
        assert.equal(JSON.stringify(run.getState()), before, 'wrong career gate must be unavailable');
      }
      run.act(`narrative:choose:s03-career-dispatch:${career}`);
      const careerScene = career === 'own-choice' ? 's03-career-own' : `s03-career-${career}`;
      run.advance(careerScene);
      run.advance('s03-coffee');
      const seatOption = seat === 'back-damir' ? 'damir' : 'other';
      const beforeSeat = JSON.stringify(run.getState());
      run.act(`narrative:choose:s03-seat-dispatch:${seatOption === 'damir' ? 'other' : 'damir'}`);
      assert.equal(JSON.stringify(run.getState()), beforeSeat, 'wrong seat gate must be unavailable');
      run.act(`narrative:choose:s03-seat-dispatch:${seatOption}`);
      run.advance(`s03-seat-${seatOption}`);
      assert.equal(run.getState().sceneId, 's03-waterfront');
      assert.equal(run.getState().routeLock, null);
      assert.deepEqual(Object.keys(run.getState().flags)
        .filter((x) => x.startsWith('career-thesis-')), [`career-thesis-${career}`]);
      assert.equal(Object.keys(run.getState().flags).filter((x) => x.startsWith('s01-seat-')).length, 1);
      assert.equal(Object.keys(run.getState().flags).filter((x) => x.startsWith('s03-')).length, 0,
        'continuation gates must not mutate author state');
      if (seat === 'front-eric' && ['people', 'place'].includes(career)) {
        run.advance('s03-waterfront');
        assert.deepEqual(scene('s03-waterfront').beats.at(-1).choices.map((c) => c.id),
          ['message', 'silence']);
        const option = career === 'people' ? 'message' : 'silence';
        run.act(`narrative:choose:s03-after-pharmacy-choice:${option}`);
        assert.equal(run.getState().flags[`s03-damir-${option}`], true);
        assert.equal(run.getState().routeLock, null);
        const serialized = JSON.parse(JSON.stringify(run.getState()));
        const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
        let restored = { narrative: serialized };
        const firstBeat = scene(`s03-${option}`).beats[0];
        update({ deltaMs: 16, state: restored,
          inputs: [{ schemaVersion: 1, type: 'pointer', action: `narrative:next:${firstBeat.id}`,
            phase: 'up', timestamp: 23, source: 'renderer' }],
          setState(next) { restored = next; } });
        assert.equal(restored.narrative.sceneId, 's03-m3-end');
        assert.equal(restored.narrative.routeLock, null);
        assert.equal(restored.narrative.flags[`s03-damir-${option}`], true);
        run.act('narrative:back');
        assert.equal(run.getState().sceneId, 's03-waterfront');
        assert.equal(run.getState().flags[`s03-damir-${option}`], undefined);
        if (option === 'message') {
          run.act('narrative:choose:s03-after-pharmacy-choice:silence');
          assert.equal(run.getState().sceneId, 's03-silence');
          assert.equal(run.getState().flags['s03-damir-message'], undefined);
          assert.equal(run.getState().flags['s03-damir-silence'], true);
          assert.equal(run.getState().routeLock, null);
        }
      }
    }
  }
});
