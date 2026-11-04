import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => scene(id)?.beats.filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru) ?? [];
const sha = (s) => createHash('sha256').update(s).digest('hex');
// Independently pinned to S06 in original manuscript @1e775f1 (not computed from source module).
const proof = {
  's06-intro': [9, 'd2542e5b28a3ebb900f51873701b8a4fa4fddfcb3d0b8758d3bbea0d00fb3665'],
  's06-weather-erik': [3, '1ea15a283757512cf1b0cd8e1440a956b5fe50b6732cd98babdf8fb636e83392'],
  's06-weather-other': [1, 'cf9f909c77b9f639e2795a55f6855c6d571ce1b8468ea58acb15df2c16d0b216'],
  's06-common-a': [1, '17923566928221399be4b9bae087d8555b27d70705be06305cf0b8c4f9235377'],
  's06-seat-eric': [1, '19ed909961a0b7a63f11b613f21a05c1da04f3240f17cc6b6f568e8fa9862fb8'],
  's06-seat-other': [1, 'c2355bbba655dda4caaeae10d37e4017d174bdf2f76c68486b3cec056d779af8'],
  's06-common-b': [83, '95c1f785b6f7c9a99cea5896f2f3ae787d5eea52f2c05d66181c88a4cf4850b4'],
  's06-favorite-place': [1, 'cf3e7746e91f13a51284b7409fe97a1c9b4f18028e876b0056fd65dd17ed7a24'],
  's06-music': [1, 'e88fe99c038fabb7d2152e31bbb9e230bb5ac8a82bb72cfb791045ec79e44060'],
};

test('S06 nine displayed blocks are byte-identical to pinned Russian manuscript', () => {
  for (const [id, [count, digest]] of Object.entries(proof)) {
    assert.equal(paragraphs(id).length, count, id);
    assert.equal(sha(paragraphs(id).join('\n\n')), digest, id);
  }
  assert.match(paragraphs('s06-intro')[0], /^Долина встретила их паром/);
  assert.match(paragraphs('s06-common-b').at(-1), /Они договорились не говорить\.$/);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S05 leads to conditional S06 prose and a free 2-way authored Eric choice', () => {
  assert.equal(scene('s05-common').nextSceneId, 's06-intro');
  assert.equal(scene('s05-m3-end'), undefined);
  const weather = scene('s06-intro').beats.at(-1);
  assert.equal(weather.id, 's06-weather-dispatch');
  assert.deepEqual(weather.choices.map((c) => [c.id, c.targetSceneId]),
    [['erik', 's06-weather-erik'], ['other', 's06-weather-other']]);
  assert.deepEqual(weather.choices[0].when, { flag: 'weather-choice-erik' });
  assert.deepEqual(weather.choices[1].when, { any: [
    { flag: 'weather-choice-nick' }, { flag: 'weather-choice-damir' },
  ] });
  assert.ok(weather.choices.every((c) => c.label.ru === 'Продолжить' && !c.effects));
  assert.equal(scene('s06-weather-erik').nextSceneId, 's06-common-a');
  assert.equal(scene('s06-weather-other').nextSceneId, 's06-common-a');
  const seat = scene('s06-common-a').beats.at(-1);
  assert.equal(seat.id, 's06-seat-dispatch');
  assert.deepEqual(seat.choices[0].when, { flag: 's01-seat-eric' });
  assert.deepEqual(seat.choices[1].when, { any: [{ flag: 's01-seat-nick' }, { flag: 's01-seat-damir' }] });
  assert.ok(seat.choices.every((c) => c.label.ru === 'Продолжить' && !c.effects));
  assert.equal(scene('s06-seat-eric').nextSceneId, 's06-common-b');
  assert.equal(scene('s06-seat-other').nextSceneId, 's06-common-b');
  const choice = scene('s06-common-b').beats.at(-1);
  assert.equal(choice.id, 's06-eric-choice');
  assert.deepEqual(choice.choices.map((c) => [c.id, c.targetSceneId]),
    [['favorite-place', 's06-favorite-place'], ['music', 's06-music']]);
  assert.deepEqual(choice.choices.map((c) => c.label.ru), [
    'Попросить показать его любимое место на тропе',
    'Предложить ему выбрать музыку для обратной дороги',
  ]);
  for (const option of choice.choices) {
    assert.deepEqual(option.effects, [{ op: 'flag_set', id: `eric-map-${option.id}`, value: true }]);
    assert.equal(scene(option.targetSceneId).nextSceneId, 's06-m3-end');
  }
  assert.equal(scene('s06-m3-end').beats.at(-1).type, 'ending');
});

function startAtS06(seatOption = 'front-eric', weatherOption = 'erik') {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const act = (action) => update({ deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 28, source: 'renderer' }],
    setState(next) { state = next; } });
  const advance = (id) => {
    assert.equal(state.narrative.sceneId, id);
    for (const beat of scene(id).beats.filter((item) => item.type === 'dialogue')) {
      act(`narrative:next:${beat.id}`);
    }
  };
  const seatId = { 'front-eric': 'eric', 'back-nick': 'nick', 'back-damir': 'damir' }[seatOption];
  advance('s01-airport');
  act(`narrative:choose:s01-seat-choice:${seatOption}`);
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
  act('narrative:choose:s04-camera-consent-choice:declined');
  advance('s04-declined');
  advance('s04-common');
  act('narrative:choose:s04-s03-dispatch:message');
  advance('s04-after-message');
  advance('s05-intro');
  act(`narrative:choose:s05-weather-choice:${weatherOption}`);
  advance(`s05-${weatherOption}`);
  advance('s05-common');
  assert.equal(state.narrative.sceneId, 's06-intro');
  return { act, advance, getState: () => state.narrative, graph, catalog };
}

function resumeJson(run, snapshot, action) {
  const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
  let state = { narrative: JSON.parse(JSON.stringify(snapshot)) };
  update({ deltaMs: 16, state,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 30, source: 'renderer' }],
    setState(next) { state = next; } });
  return state.narrative;
}

test('all nine S01 seat × S05 weather states choose correct S06 conditional prose', () => {
  for (const seat of ['front-eric', 'back-nick', 'back-damir']) {
    for (const weather of ['nick', 'erik', 'damir']) {
      const run = startAtS06(seat, weather);
      run.advance('s06-intro');
      const weatherId = weather === 'erik' ? 'erik' : 'other';
      const wrongWeatherId = weatherId === 'erik' ? 'other' : 'erik';
      const beforeWeather = JSON.stringify(run.getState());
      run.act(`narrative:choose:s06-weather-dispatch:${wrongWeatherId}`);
      assert.equal(JSON.stringify(run.getState()), beforeWeather);
      run.act(`narrative:choose:s06-weather-dispatch:${weatherId}`);
      run.advance(`s06-weather-${weatherId}`);
      run.advance('s06-common-a');
      const seatId = seat === 'front-eric' ? 'eric' : 'other';
      run.act(`narrative:choose:s06-seat-dispatch:${seatId}`);
      run.advance(`s06-seat-${seatId}`);
      assert.equal(run.getState().sceneId, 's06-common-b');
      assert.equal(run.getState().flags[`weather-choice-${weather}`], true);
      assert.equal(run.getState().flags['consent-camera-declined-respected'], true);
      assert.equal(run.getState().routeLock, null);
      run.advance('s06-common-b');
      run.act('narrative:choose:s06-eric-choice:favorite-place');
      assert.equal(run.getState().flags['eric-map-favorite-place'], true);
      run.advance('s06-favorite-place');
      assert.equal(run.getState().sceneId, 's06-m3-end');
    }
  }
});

test('S06 C2 alternatives remain reversible, restorable and reject invented state', () => {
  const run = startAtS06('back-nick', 'erik');
  run.advance('s06-intro');
  run.act('narrative:choose:s06-weather-dispatch:erik');
  run.advance('s06-weather-erik');
  run.advance('s06-common-a');
  run.act('narrative:choose:s06-seat-dispatch:other');
  run.advance('s06-seat-other');
  run.advance('s06-common-b');
  for (const option of ['favorite-place', 'music']) {
    run.act(`narrative:choose:s06-eric-choice:${option}`);
    const current = run.getState();
    assert.equal(current.sceneId, `s06-${option}`);
    assert.deepEqual(Object.keys(current.flags).filter((key) => key.startsWith('eric-map-')),
      [`eric-map-${option}`]);
    assert.equal(current.flags['weather-choice-erik'], true);
    assert.equal(current.routeLock, null);
    const resumed = resumeJson(run, current, `narrative:next:s06-${option}-01`);
    assert.equal(resumed.sceneId, 's06-m3-end');
    assert.deepEqual(resumed.flags, current.flags);
    const corrupted = JSON.parse(JSON.stringify(current));
    corrupted.flags[`eric-map-${option === 'music' ? 'favorite-place' : 'music'}`] = true;
    assert.throws(() => resumeJson(run, corrupted, `narrative:next:s06-${option}-01`),
      /inconsistent actionLog provenance or position/);
    run.act('narrative:back');
    assert.equal(run.getState().sceneId, 's06-common-b');
    assert.equal(run.getState().flags[`eric-map-${option}`], undefined);
  }
  run.act('narrative:choose:s06-eric-choice:music');
  run.advance('s06-music');
  assert.equal(run.getState().sceneId, 's06-m3-end');
});

test('first game stays fully free while Ludory Economy E5 remains separately opt-in', () => {
  const gameRoot = fileURLToPath(new URL('../game/', import.meta.url));
  assert.equal(existsSync(new URL('config/economy.json', new URL('../game/', import.meta.url))), false);
  assert.equal(existsSync(new URL('config/premium.json', new URL('../game/', import.meta.url))), false);
  assert.ok(gameRoot.endsWith('/game/'));
  assert.equal(catalogData.interactions.length, 0);
  for (const storyScene of graphData.scenes) {
    for (const beat of storyScene.beats.filter((b) => b.type === 'choice')) {
      for (const option of beat.choices) {
        assert.equal(option.cost, undefined, `${storyScene.id}/${option.id}`);
        assert.equal(option.premium, undefined, `${storyScene.id}/${option.id}`);
        assert.equal(option.contentId, undefined, `${storyScene.id}/${option.id}`);
        assert.equal(option.requiredEntitlement, undefined, `${storyScene.id}/${option.id}`);
      }
    }
  }
});
