import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// From pinned read-only literary EP09 S54, not the game scene module.
// Exact trimmed paragraph bytes are joined with two LF before hashing.
const original = {
  's54-intro': [5, '68621dab41883f8c8fa69cae13f57f6e965c66ab1a7eaa690e047b38a274d423'],
  's54-c1-a': [2, 'e01b53729d8c968d55d87a6b4226da9aa040c91510dd7e964345e7a903a1745d'],
  's54-c1-b': [1, 'fc42f5eac57679124e20c26bd86e491c674df615d177ad5ef0ecb6cc439f9624'],
  's54-common': [1, '438e9f4d40dd44e0ac304873736e5ad3115503f7e1f57c441d632dd95c0859e4'],
  's54-s38-a': [1, 'fa234dba0b2a01a414c32112f8a057a14107d60fafa71119f8cd2cdc4ce0b540'],
  's54-s38-b': [1, '1f37fb3a5589ffecce801d3ec235c70aa94968306900092623a18aaa39408842'],
};
const scene = (id) => graphData.scenes.find((entry) => entry.id === id);
const choice = (sceneId, beatId) => scene(sceneId)?.beats.find((beat) => beat.id === beatId)?.choices;
const prose = (id) => (scene(id)?.beats ?? []).filter(({ type }) => type === 'dialogue')
  .map(({ text }) => text.ru);

test('S54 matches all six original authorial blocks, eleven paragraphs', () => {
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 11);
  for (const [id, [count, sha]] of Object.entries(original)) {
    assert.equal(prose(id).length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(prose(id).join('\n\n')).digest('hex'),
      sha, `${id} exact source hash`);
  }
});

test('only Nick continuing S38 branches reach S54 after the S53 callback', () => {
  assert.equal(scene('s38-after-open-end'), undefined);
  for (const id of ['a', 'b']) assert.equal(scene(`s38-s53-${id}`)?.nextSceneId, 's54-intro');
  assert.deepEqual(choice('s38-status-dispatch', 's38-status-choice')
    .map(({ id, when, targetSceneId }) => [id, when, targetSceneId]), [
    ['continue', { flag: 's38-status-continues' }, 's38-c2'],
    ['closed', { flag: 's38-status-closed' }, 's40-intro'],
  ]);
});

test('S54 free reply and exclusive S38-C2 payoff converge on Draft-only S60 boundary', () => {
  assert.deepEqual(choice('s54-intro', 's54-c1-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Ответить словами', 's54-c1-a',
      [{ op: 'flag_set', id: 's54-answer-words', value: true }]],
    ['b', 'Ответить короткой песенной строчкой', 's54-c1-b',
      [{ op: 'flag_set', id: 's54-answer-song', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s54-c1-${id}`)?.nextSceneId, 's54-common');
  assert.equal(scene('s54-common')?.nextSceneId, 's54-s38-dispatch');
  assert.deepEqual(choice('s54-s38-dispatch', 's54-s38-choice')
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's38-memory-date' }, 's54-s38-a', undefined],
    ['b', { flag: 's38-memory-books' }, 's54-s38-b', undefined],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s54-s38-${id}`)?.nextSceneId, 's54-after-m3-end');
  assert.equal(scene('s54-after-m3-end')?.beats[0].type, 'ending');
  for (const [id, beat] of [['s54-intro', 's54-c1-choice'], ['s54-s38-dispatch', 's54-s38-choice']]) {
    for (const opt of choice(id, beat)) for (const forbidden of [
      'premium', 'cost', 'requiredEntitlement', 'routeId', 'mediaPermission',
      'publishPermission', 'realRecording', 'externalMessaging', 'cameraUpload',
    ]) assert.equal(opt[forbidden], undefined, `${beat}/${opt.id}/${forbidden}`);
  }
  assert.deepEqual(catalogData.interactions, []);
});
