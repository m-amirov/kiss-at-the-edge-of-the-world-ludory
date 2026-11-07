import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import { defineNarrativeGraph } from '../game/assets/ludory-narrative.js';

// Independently derived from source-repo@1e775f1, EP10 S42 lines 60–110
// and S43 lines 112–134, *before* authoring either game scene module.
// Text blocks omit manuscript headings, normalize surrounding whitespace,
// and join authored paragraphs with two LF.
const original = {
  's42-eric': [2, '676b83f70c6aabadc197d69d9b1f90302dc5507bc5262fa6e16782be9614ef28'],
  's42-nick': [2, '82c7d59696369eccce574a7568ce808440846be47a01ca7e6a40e47725c3a9e2'],
  's42-damir': [5, '6b8fa2502ee6bdac781a9d3e99aa55472edc74dfd2386140c3fb3f85803cb62d'],
  's42-c1-a': [2, '90d71d592de3a27767b38bb4887a8bac805c1dea939250a292a23ab25b4c2262'],
  's42-c1-b': [2, '76ad4b6011b16f54cee8ffd92f393c8c01ecfec3fa05508e1c5ffd1698bd586a'],
  's42-c1-c': [2, '5398e0615eb727960f9177df04519099485a9324fd4dcae03aaaf521de34dd86'],
  's42-common': [1, 'aa30b49848612b46d16d9b99b9828b5cc4ff8854908abbb7a386eb4705bc57e6'],
  's43-intro': [3, '541f1ed0411621a32a1c277c3872ee9451550db437a890eaaf2da4c2ae4241f8'],
  's43-c1-a': [1, '3f3215ba33f27547974f045b9b26f60febd6d2f5a16bfd3997f878868ebbfd50'],
  's43-c1-b': [1, '06f3e64df2d5ac925112f8dfe97c7b03ab7abe8c398965aede3a28ece3b02422'],
  's43-common': [1, 'df9d42c1e5ed05d795ccf6c69d4c3dc020bdec5a67418e43586a88f5569a3cff'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const paragraphs = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S42 and S43 preserve all 11 pinned authorial blocks and 22 paragraphs verbatim', () => {
  assert.equal(Object.keys(original).length, 11);
  assert.equal(Object.values(original).reduce((sum, [n]) => sum + n, 0), 22);
  for (const [id, [count, digest]] of Object.entries(original)) {
    const text = paragraphs(id);
    assert.equal(text.length, count, `${id} source paragraph count`);
    assert.equal(createHash('sha256').update(text.join('\n\n')).digest('hex'),
      digest, `${id} canonical text SHA-256`);
  }
});

test('S41 routes to exactly ten guarded S42/S43 entries and never reopens a closed romance', () => {
  for (const id of ['a', 'b']) assert.equal(scene(`s41-c2-${id}`)?.nextSceneId, 's42-s43-dispatch');
  assert.equal(scene('s41-after-m3-end'), undefined);
  assert.deepEqual(choice('s42-s43-dispatch', 's42-s43-route-choice')?.map(
    ({ id, label, routeId, when, targetSceneId, effects }) =>
      [id, label.ru, routeId, when, targetSceneId, effects]), [
    ['eric', 'Продолжить', 'eric', { flag: 's37-status-continues' }, 's42-eric', undefined],
    ['nick', 'Продолжить', 'nick', { flag: 's38-status-continues' }, 's42-nick', undefined],
    ['damir', 'Продолжить', 'damir', { flag: 's39-status-continues' }, 's42-damir', undefined],
    ['alice', 'Продолжить', 'alice', undefined, 's43-intro', undefined],
    ['eric-early-closed', 'Продолжить', 'eric', { flag: 's32-status-closed' }, 's43-intro', undefined],
    ['eric-late-closed', 'Продолжить', 'eric', { flag: 's37-status-closed' }, 's43-intro', undefined],
    ['nick-early-closed', 'Продолжить', 'nick', { flag: 's33-status-closed' }, 's43-intro', undefined],
    ['nick-late-closed', 'Продолжить', 'nick', { flag: 's38-status-closed' }, 's43-intro', undefined],
    ['damir-early-closed', 'Продолжить', 'damir', { flag: 's34-status-closed' }, 's43-intro', undefined],
    ['damir-late-closed', 'Продолжить', 'damir', { flag: 's39-status-closed' }, 's43-intro', undefined],
  ]);
  for (const id of ['eric', 'nick', 'damir'])
    assert.equal(scene(`s42-${id}`)?.nextSceneId, 's42-c1-choice');
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S42 C1 and S43 C1 offer exact free exclusive decisions and join one Draft boundary', () => {
  assert.deepEqual(choice('s42-c1-choice', 's42-c1-choice')?.map(
    ({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Продолжить роман и назначить следующую конкретную встречу', 's42-c1-a',
      [{ op: 'flag_set', id: 's42-decision-continue', value: true }]],
    ['b', 'Попросить время и пока не продолжать роман', 's42-c1-b',
      [{ op: 'flag_set', id: 's42-decision-pause', value: true }]],
    ['c', 'Закончить отношения с уважением к общему прошлому', 's42-c1-c',
      [{ op: 'flag_set', id: 's42-decision-close', value: true }]],
  ]);
  assert.deepEqual(choice('s43-intro', 's43-c1-choice')?.map(
    ({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Подготовить новый самостоятельный журналистский проект', 's43-c1-a',
      [{ op: 'flag_set', id: 's43-next-project', value: true }]],
    ['b', 'Сделать паузу между поездками и вернуться к обычной жизни', 's43-c1-b',
      [{ op: 'flag_set', id: 's43-next-rest', value: true }]],
  ]);
  for (const id of ['a', 'b', 'c'])
    assert.equal(scene(`s42-c1-${id}`)?.nextSceneId, 's42-common');
  for (const id of ['a', 'b'])
    assert.equal(scene(`s43-c1-${id}`)?.nextSceneId, 's43-common');
  assert.equal(scene('s42-common')?.nextSceneId, 's42-s43-after-m3-end');
  assert.equal(scene('s43-common')?.nextSceneId, 's42-s43-after-m3-end');
  assert.equal(scene('s42-s43-after-m3-end')?.beats[0]?.type, 'ending');
  for (const id of ['s44-intro', 's45-intro', 's46-intro', 's47-intro'])
    assert.equal(scene(id), undefined, `${id} not yet migrated`);
  for (const option of [...choice('s42-c1-choice', 's42-c1-choice'),
    ...choice('s43-intro', 's43-c1-choice')]) {
    for (const key of ['cost', 'premium', 'requiredEntitlement', 'purchase',
      'publishPermission', 'mediaPermission', 'realMessage', 'realMedia'])
      assert.equal(option[key], undefined, `forbidden ${key} on option ${option.id}`);
  }
  assert.deepEqual(catalogData.interactions, []);
});
