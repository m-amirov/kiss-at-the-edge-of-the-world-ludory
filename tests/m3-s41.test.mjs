import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import { defineNarrativeGraph } from '../game/assets/ludory-narrative.js';

// Independently hashed from read-only source EP10 S41 lines 9–57 at 1e775f1.
// Each block: trimmed paragraph(s), two LF separating paragraphs, no markdown headings.
const canonical = {
  's41-intro': [6, 'ed1b6bbea8abd77f2505beaf497d60c4c726a0143f1ba58c4d5e30f83b665da4'],
  's41-career-people': [1, 'daf3d863bfe3d33632cc3d3d45ba2ed114de18da0437429a305b3eb03cc4c521'],
  's41-career-place': [1, '0d12d3c7bc6186a728681808f2eda120dd03dae81042af564404d3b502f7d765'],
  's41-career-own': [1, '3f2dc8c02cba59a5dd0f29e5f4989da57831ef1cca0bfd164fe69ce3b60c951c'],
  's41-c1-a': [1, '608f035a6a7d059abcaa1cc334f90e9e7e2b8c08bb36951524bd71db965e9b01'],
  's41-c1-b': [1, 'e9f06d42c951c7aa36d4bca9b31398be0abf27cb20d71b274e7cdc8f904daf18'],
  's41-common': [1, '38874726492ac8b675844e37fdf7a39f2fbeec7011d4ce0ace3b421be0aa94fb'],
  's41-c2-a': [1, 'cc50a949421b9a00795729a40cb3037e49c107e2f87d6e783ba7f8bba5827761'],
  's41-c2-b': [1, '8e14c12c6aeae0a88c25053980de252d004c75f46486356df7241eaf66183197'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const choices = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;

test('S41 preserves nine exact authorial blocks and fourteen source paragraphs', () => {
  assert.equal(Object.values(canonical).reduce((n, [count]) => n + count, 0), 14);
  for (const [id, [count, digest]] of Object.entries(canonical)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, `${id} original paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      digest, `${id} original source hash`);
  }
});

test('all four S60 routes enter one shared S41 and exact exclusive career-thesis callback', () => {
  assert.equal(scene('s60-common')?.nextSceneId, 's41-intro');
  assert.equal(scene('s60-after-m3-end'), undefined, 'old unpublished Draft stop removed');
  assert.equal(scene('s41-intro')?.nextSceneId, 's41-career-dispatch');
  assert.deepEqual(choices('s41-career-dispatch', 's41-career-choice')
    ?.map(({ id, label, when, targetSceneId, effects }) =>
      [id, label.ru, when, targetSceneId, effects]), [
    ['people', 'Продолжить', { flag: 'career-thesis-people' }, 's41-career-people', undefined],
    ['place', 'Продолжить', { flag: 'career-thesis-place' }, 's41-career-place', undefined],
    ['own-choice', 'Продолжить', { flag: 'career-thesis-own-choice' }, 's41-career-own', undefined],
  ]);
  for (const id of ['people', 'place', 'own'])
    assert.equal(scene(`s41-career-${id}`)?.nextSceneId, 's41-title-choice');
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S41 free headline and after-article choices preserve source order and Draft boundary', () => {
  assert.deepEqual(choices('s41-title-choice', 's41-c1-choice')
    ?.map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Дорога, на которой пришлось остановиться', 's41-c1-a',
      [{ op: 'flag_set', id: 's41-headline-road', value: true }]],
    ['b', 'Три недели, которые не уместились в карту', 's41-c1-b',
      [{ op: 'flag_set', id: 's41-headline-map', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s41-c1-${id}`)?.nextSceneId, 's41-common');
  assert.deepEqual(choices('s41-common', 's41-c2-choice')
    ?.map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Позвать всю группу на короткую общую прогулку', 's41-c2-a',
      [{ op: 'flag_set', id: 's41-aftertext-group-walk', value: true }]],
    ['b', 'Оставить себе час одиночества перед общим прощанием', 's41-c2-b',
      [{ op: 'flag_set', id: 's41-aftertext-alone', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s41-c2-${id}`)?.nextSceneId, 's42-s43-dispatch');
  assert.equal(scene('s41-after-m3-end'), undefined, 'old unpublished S41 Draft stop removed');
  assert.equal(scene('s42-eric')?.nextSceneId, 's42-c1-choice', 'romantic EP10 now migrated');
  assert.equal(scene('s43-intro')?.id, 's43-intro', 'independent EP10 now migrated');
  for (const opt of [...choices('s41-title-choice', 's41-c1-choice'),
    ...choices('s41-common', 's41-c2-choice')]) {
    for (const key of ['cost', 'premium', 'requiredEntitlement', 'purchase',
      'publishPermission', 'mediaPermission', 'realMessage', 'realMedia'])
      assert.equal(opt[key], undefined, `${key} forbidden on ${opt.id}`);
  }
  assert.deepEqual(catalogData.interactions, []);
});
