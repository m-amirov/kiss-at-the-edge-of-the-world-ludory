import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently hashed from pinned read-only EP09/S40, NOT from this game's code.
const original = {
  's40-intro': [2, '30d8eed2c49d5c24ddc526e7eb696ded265b503d434324f05b7354f833b5de60'],
  's40-c1-a': [1, '63602686bf018a63045cc9d25c3684ee1bb021417dbd822675ba7452f95e1dc6'],
  's40-c1-b': [1, '158091f8be6aacefedbd67fb1382f83186bce53716a033ae56c691413a11a4e9'],
  's40-common': [1, '1295f20b900e8a6bc24f74063dae092c7b880845b620440e4837109d710ff7c1'],
  's40-c2-a': [1, 'f88855f8d44d1a3a05964b3948bd59617fb1247dc5488265c650f2a808759042'],
  's40-c2-b': [1, 'b8ca61cb1c8afb75da3bdb22f91be66ff7a43240a133166a87f78f242315a279'],
  's40-s63-a': [1, '7791a5a5ffe823af7effb098f9554063a933bc4d198e1c7cfb20152e53466553'],
  's40-s63-b': [1, 'cef44c6675e9da7b997ac940bbddf8c43dd6123bbdf24212ac4169846805bafc'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S40 matches all eight canonical EP09 prose blocks and nine paragraphs exactly', () => {
  assert.equal(Object.keys(original).length, 8);
  assert.equal(Object.values(original).reduce((n, [count]) => n + count, 0), 9);
  for (const [id, [count, sha]] of Object.entries(original)) {
    assert.equal(prose(id).length, count, `${id}: paragraph count`);
    assert.equal(createHash('sha256').update(prose(id).join('\n\n')).digest('hex'),
      sha, `${id}: original source SHA-256`);
  }
});

test('S36 and closed S37/38/39 paths enter S40 without rewriting route locks', () => {
  assert.deepEqual(choice('s36-route-dispatch', 's36-route-choice')
    .map(({ id, routeId, when, targetSceneId, effects }) =>
      [id, routeId, when, targetSceneId, effects]), [
    ['eric-active', 'eric', { flag: 's32-status-active' }, 's37-active', undefined],
    ['eric-paused', 'eric', { flag: 's32-status-paused' }, 's37-paused', undefined],
    ['eric-closed', 'eric', { flag: 's32-status-closed' }, 's40-intro', undefined],
    ['nick-active', 'nick', { flag: 's33-status-active' }, 's38-active', undefined],
    ['nick-paused', 'nick', { flag: 's33-status-paused' }, 's38-paused', undefined],
    ['nick-closed', 'nick', { flag: 's33-status-closed' }, 's40-intro', undefined],
    ['damir-active', 'damir', { flag: 's34-status-active' }, 's39-active', undefined],
    ['damir-paused', 'damir', { flag: 's34-status-paused' }, 's39-paused', undefined],
    ['damir-closed', 'damir', { flag: 's34-status-closed' }, 's40-intro', undefined],
    ['alice', 'alice', undefined, 's40-intro', undefined],
  ]);
  for (const [id, gate] of [
    ['s37-status-dispatch', 's37-status-choice'],
    ['s38-status-dispatch', 's38-status-choice'],
    ['s39-status-dispatch', 's39-status-choice'],
  ]) {
    const closed = choice(id, gate).find(({ id }) => id === 'closed');
    assert.equal(closed.targetSceneId, 's40-intro');
    assert.equal(closed.effects, undefined);
  }
  for (const id of ['s36-after-m3-end', 's37-after-closed-end',
    's38-after-closed-end', 's39-after-closed-end'])
    assert.equal(scene(id), undefined, `${id} obsolete Draft stop removed`);
});

test('S40 free choices and optional S63 callbacks have exclusive guarded fallthrough', () => {
  assert.equal(scene('s40-intro')?.beats.filter(({ type }) => type === 'dialogue').length, 2);
  assert.deepEqual(choice('s40-intro', 's40-c1-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Написать финальный абзац без подробностей о близких', 's40-c1-a', undefined],
    ['b', 'Написать о собственном выборе как о главном изменении', 's40-c1-b', undefined],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s40-c1-${id}`).nextSceneId, 's40-common');
  assert.deepEqual(choice('s40-common', 's40-c2-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Сходить на местный музыкальный вечер одной', 's40-c2-a',
      [{ op: 'flag_set', id: 's40-evening-music', value: true }]],
    ['b', 'Написать подруге и договориться о встрече дома', 's40-c2-b',
      [{ op: 'flag_set', id: 's40-evening-friend', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s40-c2-${id}`).nextSceneId, 's40-s63-dispatch');
  assert.deepEqual(choice('s40-s63-dispatch', 's40-s63-choice')
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's63-next-ticket' }, 's40-s63-a', undefined],
    ['b', { flag: 's63-next-venue' }, 's40-s63-b', undefined],
    ['none', { not: { any: [{ flag: 's63-next-ticket' }, { flag: 's63-next-venue' }] } },
      's64-intro', undefined],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s40-s63-${id}`).nextSceneId, 's64-intro');
  assert.equal(scene('s40-after-m3-end'), undefined);
  for (const id of ['s40-intro', 's40-common'])
    for (const option of choice(id, id === 's40-intro' ? 's40-c1-choice' : 's40-c2-choice'))
      for (const field of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'publishPermission', 'mediaPermission', 'editorMessageSent', 'friendMessageSent'])
        assert.equal(option[field], undefined, `${id}/${option.id}/${field}`);
  assert.deepEqual(catalogData.interactions, []);
});
