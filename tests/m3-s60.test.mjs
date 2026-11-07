import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently derived from read-only EP09 S60 (lines 393–417), not game modules.
// Trimmed authorial paragraphs are joined by two LF; no markdown headings or location metadata.
const original = {
  's60-intro': [2, 'a9378c0dcd9b61c145fc384dd98c34ca550a6bbd9ead9f7dfe95ea984880bceb'],
  's60-c1-a': [1, '961d0cbfd8703d66981f115764f1e6aa8170066b59b225c66c1f812bec03e713'],
  's60-c1-b': [1, 'd802360a9cbb411a86413d6d3c8f513e0bfad60519538f0c0b8b09e21ce414b1'],
  's60-c1-c': [1, '55309fc55ccb7977d91590ecddec915b1b09e774a1fd751c3a6dd3033b596936'],
  's60-common': [1, '11bd86b4a4bca8a8711c3150e9b7becf33f86d9572a3df59ba1aec924aada446'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choices = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const paragraphs = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S60 reproduces all five canonical blocks and six paragraphs', () => {
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 6);
  for (const [id, [count, digest]] of Object.entries(original)) {
    const prose = paragraphs(id);
    assert.equal(prose.length, count, `${id}: number of source paragraphs`);
    assert.equal(createHash('sha256').update(prose.join('\n\n')).digest('hex'),
      digest, `${id}: independently pinned source SHA`);
  }
});

test('four completed day-19 routes converge on the same shared S60, never an ending', () => {
  const lastCallbacks = [
    's51-s37-a', 's51-s37-b', 's54-s38-a', 's54-s38-b',
    's57-s39-a', 's57-s39-b', 's64-s40-a', 's64-s40-b',
  ];
  for (const id of lastCallbacks)
    assert.equal(scene(id)?.nextSceneId, 's60-intro', `${id} must reach S60`);
  for (const id of ['s51', 's54', 's57', 's64'])
    assert.equal(scene(`${id}-after-m3-end`), undefined, `${id} old Draft stop removed`);
  assert.equal(scene('s64-common')?.nextSceneId, 's64-s40-dispatch',
    'closed/independent branch must retain its personal S64 payoff');
});

test('all three S60 souvenirs are free, exclusive, and rejoin common S41 boundary', () => {
  assert.deepEqual(choices('s60-intro', 's60-c1-choice')
    ?.map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Деревянную птицу', 's60-c1-a',
      [{ op: 'flag_set', id: 's60-souvenir-bird', value: true }]],
    ['b', 'Салфетку с нарисованной картой', 's60-c1-b',
      [{ op: 'flag_set', id: 's60-souvenir-map', value: true }]],
    ['c', 'Шоколадку, которую можно съесть сразу', 's60-c1-c',
      [{ op: 'flag_set', id: 's60-souvenir-chocolate', value: true }]],
  ]);
  for (const id of ['a', 'b', 'c'])
    assert.equal(scene(`s60-c1-${id}`)?.nextSceneId, 's60-common');
  assert.equal(scene('s60-common')?.nextSceneId, 's60-after-m3-end');
  assert.equal(scene('s60-after-m3-end')?.beats[0].type, 'ending',
    'EP10 S41 is not migrated yet, so this is an unpublished technical boundary');
  for (const option of choices('s60-intro', 's60-c1-choice'))
    for (const key of ['cost', 'premium', 'requiredEntitlement', 'purchase',
      'routeId', 'realDelivery', 'realMessaging', 'mediaPermission', 'publishPermission'])
      assert.equal(option[key], undefined, `no side effect on ${option.id}: ${key}`);
  assert.deepEqual(catalogData.interactions, []);
});
