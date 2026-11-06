import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Literal independent SHA-256 checks from pinned read-only EP09/S39.
// Displayed authorial paragraphs are joined with exactly two LF.
const authored = {
  's39-paused': [1, '393b5327a99b3a35dc7f4dc8c6708725e2350d8bbb4938be571956775ba6e5b7'],
  's39-active': [3, 'ca9d8b85c19b0b9ad566f1d1cc6c0c0e35793598a61fdb4e00d8669f2e8d7a66'],
  's39-c1-a': [2, '80fe257c88c2e3beab7d8978e842ad7f47c114698d802216e8eaa09f8a5ee0a6'],
  's39-c1-b': [2, '992886039ebeb38e33875a8605925658933f5d251a28c065c57abfbe85e9445a'],
  's39-common': [1, '486c9ad312d83f7805fc7aaf9387b65724a976e98d69175aa61f91ae512f9b63'],
  's39-c2-a': [1, '42569e7d614759391e75bb50b8b4f930a979ce2ea9ea59e55146eb69fb5080ea'],
  's39-c2-b': [1, '72808908f8ea56633d794729d204c3d31b7d3ea42c1ac2e8755384f67d425a9a'],
  's39-s56-a': [1, '9e6e2d24f6ecea2f9a3826d24417311c084153580ba46ade20771affd6eb5a08'],
  's39-s56-b': [1, '1d68d983353795af02d4b51c0a13cd326cdca80e129bdb112e06821e3ee9197d'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S39 displays nine exact pinned EP09 source blocks and 13 paragraphs', () => {
  assert.equal(Object.keys(authored).length, 9);
  assert.equal(Object.values(authored).reduce((sum, [count]) => sum + count, 0), 13);
  for (const [id, [count, sha]] of Object.entries(authored)) {
    assert.equal(prose(id).length, count, id + ' paragraph count');
    assert.equal(createHash('sha256').update(prose(id).join('\n\n')).digest('hex'), sha,
      id + ' pinned source SHA-256');
  }
});

test('S36 admits only Damir active/paused to S39; closed remains independent', () => {
  assert.deepEqual(choice('s36-route-dispatch', 's36-route-choice')?.choices
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
  for (const status of ['active', 'paused'])
    assert.equal(scene('s39-' + status)?.nextSceneId, 's39-c1');
  assert.equal(scene('s36-after-m3-end'), undefined);
});

test('S39 free C1/C2 and S56 callback preserve manuscript order and closure boundary', () => {
  assert.deepEqual(choice('s39-c1', 's39-c1-choice')?.choices
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Назначить три новых свидания в разных местах', 's39-c1-a',
      [{ op: 'flag_set', id: 's39-status-continues', value: true }]],
    ['b', 'Закончить попытку снова стать парой', 's39-c1-b',
      [{ op: 'flag_set', id: 's39-status-closed', value: true }]],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene('s39-c1-' + id)?.nextSceneId, 's39-common');
  assert.equal(scene('s39-common')?.nextSceneId, 's39-status-dispatch');
  assert.deepEqual(choice('s39-status-dispatch', 's39-status-choice')?.choices
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['continue', { flag: 's39-status-continues' }, 's39-c2', undefined],
    ['closed', { flag: 's39-status-closed' }, 's40-intro', undefined],
  ]);
  assert.deepEqual(choice('s39-c2', 's39-c2-choice')?.choices
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Предложить ему рассказать о своём самом обычном дне', 's39-c2-a',
      [{ op: 'flag_set', id: 's39-memory-ordinary-day', value: true }]],
    ['b', 'Самой пригласить его на прогулку перед завтраком', 's39-c2-b',
      [{ op: 'flag_set', id: 's39-memory-morning-walk', value: true }]],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene('s39-c2-' + id)?.nextSceneId, 's39-s56-dispatch');
  assert.deepEqual(choice('s39-s56-dispatch', 's39-s56-choice')?.choices
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's56-next-dish' }, 's39-s56-a', undefined],
    ['b', { flag: 's56-next-chorus' }, 's39-s56-b', undefined],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene('s39-s56-' + id)?.nextSceneId, 's39-after-open-end');
  assert.equal(scene('s39-after-open-end')?.beats[0].type, 'ending');
  assert.equal(scene('s39-after-closed-end'), undefined);
  for (const id of ['s39-c1', 's39-c2'])
    for (const option of choice(id, id + '-choice').choices)
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'romancePoints', 'publishPermission', 'mediaPermission', 'externalMessaging', 'payment'])
        assert.equal(option[forbidden], undefined, id + '/' + option.id + '/' + forbidden);
  assert.deepEqual(catalogData.interactions, []);
});
