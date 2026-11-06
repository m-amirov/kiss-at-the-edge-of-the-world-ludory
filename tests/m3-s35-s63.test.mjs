import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Literal expectations derived independently from read-only original EP08
// lines 277–328, NOT from the game code. SHA input: paragraphs joined by \n\n.
const source = {
  's35-intro': [3, 'f0339f58d6574ebd6a8da177f25080c659e4a3016a191f45ea2a671d07b9c551'],
  's35-c1-a': [1, '3a10cfb20777a0b33c302b76c9ba899bc71d4eaf617bf98fdeda5e1a8d3eb0f1'],
  's35-c1-b': [1, 'df1e79097173af4ac76b79fe134c85425496b9817810b137fdccebfe1c6e3ed0'],
  's35-common': [1, '8c17848b3049440218e9e7057c59adf9662011d8c54723aed84e4dacdd1073eb'],
  's63-intro': [2, '1ffdb9e6fe33c97ad255d1b0ff59d3d0bdbb13dc62c6a292fa57b58a3f1d7280'],
  's63-c1-a': [1, '5717da84761245771864eaf8d9027ebec33e9d81f545765984546a1a5315185d'],
  's63-c1-b': [1, 'a99412f470081b6a93c6ffebf3309c0e3344ebe16227682eeb0d49f9f01ec183'],
  's63-common': [1, 'ec2f511d7dcfcf52c0d0f49d8e4c2a06eb916a4ec46a61df54b932ccfea518e3'],
  's63-c2-a': [1, 'fef035a06d10576814f5179fad590fb53f6552f375cf0ebc4e6c651d2884acab'],
  's63-c2-b': [1, '150700d7368d65751717ba993ba614d1f110dc0c32ee951b0a34f3924ceb8b1e'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S35/S63 preserve all 10 original blocks and 13 paragraphs verbatim', () => {
  assert.equal(Object.keys(source).length, 10);
  assert.equal(Object.values(source).reduce((n, [count]) => n + count, 0), 13);
  for (const [id, [count, sha]] of Object.entries(source)) {
    const rendered = prose(id);
    assert.equal(rendered.length, count, `${id} paragraphs`);
    assert.equal(createHash('sha256').update(rendered.join('\n\n')).digest('hex'), sha,
      `${id} canonical original SHA-256`);
  }
});

test('S35 article and S63 concert decisions follow only authorial free outcomes', () => {
  const cases = [
    ['s35-intro', 's35-c1-choice', [
      ['a', 'Сохранить согласованные прямые цитаты и убрать личные подробности', 's35-c1-a', undefined],
      ['b', 'Пересобрать материал вокруг собственных наблюдений', 's35-c1-b', undefined],
    ]],
    ['s63-intro', 's63-c1-choice', [
      ['a', 'Остаться на короткую встречу с музыкантами', 's63-c1-a', undefined],
      ['b', 'Вернуться в гостиницу пешком, не задерживаясь', 's63-c1-b', undefined],
    ]],
    ['s63-common', 's63-c2-choice', [
      ['a', 'Сохранить билет и написать несколько строк для себя', 's63-c2-a',
        [{ op: 'flag_set', id: 's63-next-ticket', value: true }]],
      ['b', 'Спросить соседку по ряду о следующем концерте', 's63-c2-b',
        [{ op: 'flag_set', id: 's63-next-venue', value: true }]],
    ]],
  ];
  for (const [id, beatId, expected] of cases) {
    const options = choice(id, beatId)?.choices;
    assert.deepEqual(options?.map(({ id: optionId, label, targetSceneId, effects }) =>
      [optionId, label.ru, targetSceneId, effects]), expected);
    for (const option of options) {
      for (const forbidden of ['premium', 'cost', 'routeId', 'requiredEntitlement',
        'publishPermission', 'mediaPermission', 'quoteRelease', 'consentToPublish',
        'externalAction', 'message', 'upload', 'relocationConsent'])
        assert.equal(option[forbidden], undefined, `${beatId}.${option.id} ${forbidden}`);
    }
  }
  for (const id of ['a', 'b']) {
    assert.equal(scene(`s35-c1-${id}`).nextSceneId, 's35-common');
    assert.equal(scene(`s63-c1-${id}`).nextSceneId, 's63-common');
    assert.equal(scene(`s63-c2-${id}`).nextSceneId, 's63-after-m3-end');
  }
  assert.equal(scene('s35-common').nextSceneId, 's63-intro');
  assert.equal(scene('s63-after-m3-end').beats[0].type, 'ending');
  assert.equal(scene('s40-intro'), undefined, 'future S40 remains unported');
  assert.deepEqual(catalogData.interactions, []);
});

function runtime(snapshot) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: clone(snapshot ?? createNarrativeState(graph)) };
  let writes = 0;
  return {
    act(action) {
      update({ deltaMs: 16, state, inputs: [{ schemaVersion: 1, type: 'pointer',
        action, phase: 'up', timestamp: 211, source: 'renderer' }],
      setState(next) { writes += 1; state = next; } });
    },
    get: () => state.narrative,
    writes: () => writes,
  };
}
function walkUntil(run, stop, actions = {}, max = 7500) {
  for (let i = 0; i < max; i++) {
    const { sceneId, beatIndex } = run.get();
    const beat = scene(sceneId)?.beats[beatIndex];
    assert.ok(beat, `missing beat ${sceneId}:${beatIndex}`);
    if (stop(beat, sceneId)) return;
    const before = `${sceneId}:${beatIndex}`;
    if (beat.type === 'dialogue') run.act(`narrative:next:${beat.id}`);
    else if (beat.type === 'choice') {
      assert.ok(actions[beat.id], `unmapped choice ${beat.id}`);
      run.act(`narrative:choose:${beat.id}:${actions[beat.id]}`);
    } else assert.fail(`premature ending ${sceneId}`);
    assert.notEqual(`${run.get().sceneId}:${run.get().beatIndex}`, before, `stalled ${before}`);
  }
  assert.fail('narrative traversal limit exceeded');
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `invalid ${action} changed state`);
  assert.equal(run.writes(), writes, `invalid ${action} caused state write`);
}
