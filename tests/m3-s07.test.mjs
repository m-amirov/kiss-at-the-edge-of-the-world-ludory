import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => scene(id)?.beats.filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru) ?? [];
const sha = (text) => createHash('sha256').update(text).digest('hex');
// Independently pinned to the source manuscript @1e775f1, S07 before S08.
const proof = {
  's07-intro': [1, '6b6a4447252adc796a9111ccca601c644f7810b368900effddae9590d8f5a614'],
  's07-weather-nick': [4, 'c3a4fb3a9299bff78c02b353c5c05ba92f1b39fb6d71149274a91ea19677f189'],
  's07-seat-nick': [1, '3e0387d2cfdd660ac8a48870d585016c7e73f950c4b201eb64877fc89a5b414d'],
  's07-common-a': [94, 'ba48e08eaf1f7bef3411ca46e16d7177cd3724d3a8e078df4d5c89388fca8a10'],
  's07-camera-accepted': [1, '8787ce8842c61b213066cbafc2eaf08f8c3cb20c4484cd217a7b7c456b4bc00e'],
  's07-camera-declined': [2, '7727fb8c95f8851e082d0213b6a5e4fac524413d348b76e4e8011b42f7c2bbf9'],
  's07-camera-negotiated': [1, '14245f5dddd83dab25b0fadf4854047d213bf525ce2f6b1af8f1eac2d47c6d5e'],
  's07-common-b': [12, 'cb99d2acbc652a3910a661ce0a816de873452536382fac614d118d528ad43eba'],
  's07-archive-nick': [1, '7054b75ff37e3be7f6f9f2e9eee0621d284e120c80c98aff3c8daad7d9718207'],
  's07-archive-group': [1, '982a39c5476581087dd39241e5ebdbdd5e50b3dc0bddd6ccf323dc9a9e111614'],
  's07-archive-private': [1, 'f982f01520fffcff05428db2e01544aa2919744bd5647d0467577cbe232df9d4'],
  's07-common-c': [1, 'bae9019010b8b7b387bf08b61f772d9a71ddf342b8a22d95c180be5c989dc798'],
  's07-eric-favorite': [1, '5981065d44abf4805d562a342c3c1a63ba95878830352a99aea9f6b16b42aa0d'],
  's07-eric-music': [1, '6deb5fe6278806e79983ed27fada4bb4b5570cdeeb15c8eaad6849b33eb78cc5'],
};

test('S07 has 14 canonical dialogue blocks byte-for-byte as displayed by Ludory', () => {
  for (const [id, [count, digest]] of Object.entries(proof)) {
    assert.equal(paragraphs(id).length, count, id);
    assert.equal(sha(paragraphs(id).join('\n\n')), digest, id);
  }
  assert.match(paragraphs('s07-intro')[0], /^После тропы они доехали/);
  assert.match(paragraphs('s07-common-c')[0], /^На следующий день Ник вспомнил/);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S06 flows into S07 with optional Nick callbacks, three consent variants and S06 payoff', () => {
  assert.equal(scene('s06-favorite-place').nextSceneId, 's07-intro');
  assert.equal(scene('s06-music').nextSceneId, 's07-intro');
  assert.equal(scene('s06-m3-end'), undefined);
  const weather = scene('s07-intro').beats.at(-1);
  assert.equal(weather.id, 's07-weather-dispatch');
  assert.deepEqual(weather.choices.map((c) => [c.id, c.targetSceneId, c.when]), [
    ['nick', 's07-weather-nick', { flag: 'weather-choice-nick' }],
    ['other', 's07-seat-dispatch', { any: [{ flag: 'weather-choice-erik' }, { flag: 'weather-choice-damir' }] }],
  ]);
  assert.equal(scene('s07-weather-nick').nextSceneId, 's07-seat-dispatch');
  const seat = scene('s07-seat-dispatch').beats.at(-1);
  assert.deepEqual(seat.choices.map((c) => [c.id, c.targetSceneId, c.when]), [
    ['nick', 's07-seat-nick', { flag: 's01-seat-nick' }],
    ['other', 's07-common-a', { any: [{ flag: 's01-seat-eric' }, { flag: 's01-seat-damir' }] }],
  ]);
  assert.equal(scene('s07-seat-nick').nextSceneId, 's07-common-a');
  const consent = scene('s07-common-a').beats.at(-1);
  assert.equal(consent.id, 's07-consent-dispatch');
  assert.deepEqual(consent.choices.map((c) => [c.id, c.targetSceneId, c.when]), [
    ['accepted', 's07-camera-accepted', { flag: 'consent-camera-accepted' }],
    ['declined', 's07-camera-declined', { flag: 'consent-camera-declined-respected' }],
    ['negotiated', 's07-camera-negotiated', { flag: 'consent-camera-negotiated' }],
  ]);
  for (const choice of consent.choices) assert.equal(scene(choice.targetSceneId).nextSceneId, 's07-common-b');
  for (const gate of [weather, seat, consent]) {
    assert.ok(gate.choices.every((choice) => choice.label.ru === 'Продолжить' && !choice.effects));
  }
  const archive = scene('s07-common-b').beats.at(-1);
  assert.equal(archive.id, 's07-archive-choice');
  assert.deepEqual(archive.choices.map((c) => [c.id, c.label.ru, c.targetSceneId]), [
    ['nick', 'Снимок Ника у стола', 's07-archive-nick'],
    ['group', 'Групповой кадр с таймером', 's07-archive-group'],
    ['private', 'Ничего не сохранять', 's07-archive-private'],
  ]);
  for (const option of archive.choices) {
    assert.deepEqual(option.effects, [{ op: 'flag_set', id: `kitchen-archive-${option.id}`, value: true }]);
    assert.equal(scene(option.targetSceneId).nextSceneId, 's07-common-c');
  }
  const eric = scene('s07-common-c').beats.at(-1);
  assert.equal(eric.id, 's07-s06-dispatch');
  assert.deepEqual(eric.choices.map((c) => [c.id, c.targetSceneId, c.when]), [
    ['favorite', 's07-eric-favorite', { flag: 'eric-map-favorite-place' }],
    ['music', 's07-eric-music', { flag: 'eric-map-music' }],
  ]);
  assert.ok(eric.choices.every((choice) => choice.label.ru === 'Продолжить' && !choice.effects));
  assert.equal(scene('s07-eric-favorite').nextSceneId, 's08-intro');
  assert.equal(scene('s07-eric-music').nextSceneId, 's08-intro');
  assert.equal(scene('s07-m3-end'), undefined);
});

function startAtS07({ seat = 'front-eric', weather = 'erik', consent = 'accepted', eric = 'favorite-place' } = {}) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const act = (action) => update({ deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 55, source: 'renderer' }],
    setState(next) { state = next; } });
  const advance = (id) => {
    assert.equal(state.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((b) => b.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  const seatId = { 'front-eric': 'eric', 'back-nick': 'nick', 'back-damir': 'damir' }[seat];
  advance('s01-airport');
  act(`narrative:choose:s01-seat-choice:${seat}`);
  advance(`s01-${seatId}`);
  advance('s01-common');
  advance('s02-road');
  act('narrative:choose:s02-career-choice:people');
  advance('s02-people');
  advance('s02-common');
  advance('s65-guesthouse');
  advance('s03-editorial');
  act('narrative:choose:s03-career-dispatch:people');
  advance('s03-career-people');
  advance('s03-coffee');
  act(`narrative:choose:s03-seat-dispatch:${seatId === 'damir' ? 'damir' : 'other'}`);
  advance(`s03-seat-${seatId === 'damir' ? 'damir' : 'other'}`);
  advance('s03-waterfront');
  act('narrative:choose:s03-after-pharmacy-choice:message');
  advance('s03-message');
  advance('s04-intro');
  act(`narrative:choose:s04-camera-consent-choice:${consent}`);
  advance(`s04-${consent}`);
  advance('s04-common');
  act('narrative:choose:s04-s03-dispatch:message');
  advance('s04-after-message');
  advance('s05-intro');
  act(`narrative:choose:s05-weather-choice:${weather}`);
  advance(`s05-${weather}`);
  advance('s05-common');
  advance('s06-intro');
  const weatherId = weather === 'erik' ? 'erik' : 'other';
  act(`narrative:choose:s06-weather-dispatch:${weatherId}`);
  advance(`s06-weather-${weatherId}`);
  advance('s06-common-a');
  const s06SeatId = seat === 'front-eric' ? 'eric' : 'other';
  act(`narrative:choose:s06-seat-dispatch:${s06SeatId}`);
  advance(`s06-seat-${s06SeatId}`);
  advance('s06-common-b');
  act(`narrative:choose:s06-eric-choice:${eric}`);
  advance(`s06-${eric}`);
  assert.equal(state.narrative.sceneId, 's07-intro');
  return { act, advance, getState: () => state.narrative, graph, catalog };
}

function resumeJson(run, snapshot, action) {
  const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
  let state = { narrative: JSON.parse(JSON.stringify(snapshot)) };
  update({ deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 56, source: 'renderer' }],
    setState(next) { state = next; } });
  return state.narrative;
}

function beforeArchive(run, { weatherNick = false, seatNick = false, consent } = {}) {
  run.advance('s07-intro');
  const weatherId = weatherNick ? 'nick' : 'other';
  const wrongWeather = weatherNick ? 'other' : 'nick';
  const stateBefore = JSON.stringify(run.getState());
  run.act(`narrative:choose:s07-weather-dispatch:${wrongWeather}`);
  assert.equal(JSON.stringify(run.getState()), stateBefore, 'unavailable weather branch must not advance');
  run.act(`narrative:choose:s07-weather-dispatch:${weatherId}`);
  if (weatherNick) run.advance('s07-weather-nick');
  const seatId = seatNick ? 'nick' : 'other';
  const seatBefore = JSON.stringify(run.getState());
  run.act(`narrative:choose:s07-seat-dispatch:${seatNick ? 'other' : 'nick'}`);
  assert.equal(JSON.stringify(run.getState()), seatBefore, 'unavailable seat branch must not advance');
  run.act(`narrative:choose:s07-seat-dispatch:${seatId}`);
  if (seatNick) run.advance('s07-seat-nick');
  run.advance('s07-common-a');
  const consentBefore = JSON.stringify(run.getState());
  run.act(`narrative:choose:s07-consent-dispatch:${consent === 'accepted' ? 'declined' : 'accepted'}`);
  assert.equal(JSON.stringify(run.getState()), consentBefore, 'unavailable consent branch must not advance');
  run.act(`narrative:choose:s07-consent-dispatch:${consent}`);
  run.advance(`s07-camera-${consent}`);
  assert.equal(run.getState().sceneId, 's07-common-b');
}

test('real runtime preserves Nick, camera consent and S06 callbacks across three prior routes', () => {
  const cases = [
    { seat: 'back-nick', weather: 'nick', consent: 'accepted', eric: 'favorite-place',
      weatherNick: true, seatNick: true, archive: 'nick', ericBranch: 'favorite' },
    { seat: 'front-eric', weather: 'erik', consent: 'declined', eric: 'music',
      weatherNick: false, seatNick: false, archive: 'private', ericBranch: 'music' },
    { seat: 'back-damir', weather: 'damir', consent: 'negotiated', eric: 'favorite-place',
      weatherNick: false, seatNick: false, archive: 'group', ericBranch: 'favorite' },
    { seat: 'back-nick', weather: 'erik', consent: 'accepted', eric: 'music',
      weatherNick: false, seatNick: true, archive: 'group', ericBranch: 'music' },
    { seat: 'front-eric', weather: 'nick', consent: 'declined', eric: 'favorite-place',
      weatherNick: true, seatNick: false, archive: 'private', ericBranch: 'favorite' },
  ];
  for (const scenario of cases) {
    const run = startAtS07(scenario);
    beforeArchive(run, scenario);
    run.advance('s07-common-b');
    run.act(`narrative:choose:s07-archive-choice:${scenario.archive}`);
    run.advance(`s07-archive-${scenario.archive}`);
    run.advance('s07-common-c');
    const payoffBefore = JSON.stringify(run.getState());
    run.act(`narrative:choose:s07-s06-dispatch:${scenario.ericBranch === 'music' ? 'favorite' : 'music'}`);
    assert.equal(JSON.stringify(run.getState()), payoffBefore, 'unavailable S06 payoff must not advance');
    run.act(`narrative:choose:s07-s06-dispatch:${scenario.ericBranch}`);
    run.advance(`s07-eric-${scenario.ericBranch}`);
    assert.equal(run.getState().sceneId, 's08-intro');
    assert.equal(run.getState().flags[`kitchen-archive-${scenario.archive}`], true);
    assert.equal(run.getState().flags[`weather-choice-${scenario.weather}`], true);
    assert.equal(run.getState().flags[`consent-camera-${scenario.consent === 'declined' ? 'declined-respected' : scenario.consent}`], true);
    assert.equal(run.getState().routeLock, null);
  }
});

test('S07 archive alternatives undo cleanly on Back and JSON continuation rejects fabricated flags', () => {
  const run = startAtS07({ seat: 'back-nick', weather: 'nick', consent: 'accepted' });
  beforeArchive(run, { weatherNick: true, seatNick: true, consent: 'accepted' });
  run.advance('s07-common-b');
  for (const option of ['nick', 'group', 'private']) {
    run.act(`narrative:choose:s07-archive-choice:${option}`);
    const current = run.getState();
    assert.equal(current.sceneId, `s07-archive-${option}`);
    assert.deepEqual(Object.keys(current.flags).filter((key) => key.startsWith('kitchen-archive-')),
      [`kitchen-archive-${option}`]);
    const resumed = resumeJson(run, current, `narrative:next:s07-archive-${option}-01`);
    assert.equal(resumed.sceneId, 's07-common-c');
    assert.deepEqual(resumed.flags, current.flags);
    const corrupted = JSON.parse(JSON.stringify(current));
    corrupted.flags[`kitchen-archive-${option === 'nick' ? 'group' : 'nick'}`] = true;
    assert.throws(() => resumeJson(run, corrupted, `narrative:next:s07-archive-${option}-01`),
      /inconsistent actionLog provenance or position/);
    run.act('narrative:back');
    assert.equal(run.getState().sceneId, 's07-common-b');
    assert.equal(run.getState().flags[`kitchen-archive-${option}`], undefined);
  }
});

test('S07 remains fully free and does not adopt optional Ludory Economy E5', () => {
  for (const pathname of ['config/economy.json', 'config/premium.json']) {
    assert.equal(existsSync(new URL(`../game/${pathname}`, import.meta.url)), false, pathname);
  }
  assert.equal(catalogData.interactions.length, 0);
  for (const item of graphData.scenes) {
    for (const beat of item.beats.filter((b) => b.type === 'choice')) {
      for (const choice of beat.choices) {
        for (const key of ['cost', 'premium', 'contentId', 'requiredEntitlement']) {
          assert.equal(choice[key], undefined, `${item.id}/${choice.id}/${key}`);
        }
      }
    }
  }
});
