import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently derived from the pinned EP09 manuscript S37, not scene module output.
// A block's hash covers its original paragraphs joined with exactly two newlines.
const authored = {
  's37-paused': [1, '938ec41655881cfa66834e1653892d47d953cc923fd66c058d4d0dcf40bc69ff'],
  's37-active': [3, 'e8e0b602e77b44354772a45906f1cfc2c66fec165129982a40ec0c9005b16a0a'],
  's37-c1-a': [2, '0c8411c723a35490634e615ea061c9ee2e0c98b209d77b56ccf62681396df7f0'],
  's37-c1-b': [2, '7908d8673615df79569b1d57af259d44d5ca8f80f2b33ac411450d1299562b05'],
  's37-common': [1, '6c9a71db14bb942064158f19019d6fa73332cf0e1281c80b4d2e2e8d452951bf'],
  's37-c2-a': [1, 'bdf7d6ace0738c44192a88551a8ca8f8392be0efe2990a46910f58942155f6f2'],
  's37-c2-b': [1, '8f42085d03da841d18075c21a2f72b3f9324c89712c9f0aa757c5cbcb87cf272'],
  's37-s50-a': [1, '7142dbde4f726a30097a256633d2f4659b1a552536a10af7b059d68d026046e0'],
  's37-s50-b': [1, 'ea45820d82b3c24c228bdeaeb9795156c7ee9225df82e4ea7bcf8efca9a14129'],
};
const scene = (id) => graphData.scenes.find((entry) => entry.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter(({ type }) => type === 'dialogue')
  .map(({ text }) => text.ru);

test('S37 reproduces all nine original blocks and 13 authorial paragraphs', () => {
  assert.equal(Object.values(authored).reduce((sum, [count]) => sum + count, 0), 13);
  for (const [id, [count, sha]] of Object.entries(authored)) {
    const actual = prose(id);
    assert.equal(actual.length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(actual.join('\n\n')).digest('hex'), sha,
      `${id} pinned manuscript SHA-256`);
  }
});

test('S36 routes only active/paused Eric into S37, with other paths at Draft stop', () => {
  assert.equal(scene('s36-common')?.nextSceneId, 's36-route-dispatch');
  const edges = choice('s36-route-dispatch', 's36-route-choice')?.choices;
  assert.deepEqual(edges?.map(({ id, targetSceneId, routeId, when, effects }) =>
    [id, targetSceneId, routeId, when, effects]), [
    ['eric-active', 's37-active', 'eric', { flag: 's32-status-active' }, undefined],
    ['eric-paused', 's37-paused', 'eric', { flag: 's32-status-paused' }, undefined],
    ['eric-closed', 's36-after-m3-end', 'eric', { flag: 's32-status-closed' }, undefined],
    ['nick', 's36-after-m3-end', 'nick', undefined, undefined],
    ['damir', 's36-after-m3-end', 'damir', undefined, undefined],
    ['alice', 's36-after-m3-end', 'alice', undefined, undefined],
  ]);
  assert.equal(scene('s37-active')?.nextSceneId, 's37-c1');
  assert.equal(scene('s37-paused')?.nextSceneId, 's37-c1');
  assert.equal(scene('s36-after-m3-end')?.beats[0].type, 'ending');
});

test('S37 preserves free authored decisions, a closed-romance boundary and S50 callbacks', () => {
  const first = choice('s37-c1', 's37-c1-choice');
  assert.deepEqual(first?.choices.map(({ id, label, targetSceneId, effects }) =>
    [id, label.ru, targetSceneId, effects]), [
    ['a', 'Предложить конкретную встречу после возвращения домой', 's37-c1-a',
      [{ op: 'flag_set', id: 's37-status-continues', value: true }]],
    ['b', 'Оставить близость путешествию и завершить роман', 's37-c1-b',
      [{ op: 'flag_set', id: 's37-status-closed', value: true }]],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s37-c1-${variant}`)?.nextSceneId, 's37-common');
  assert.equal(scene('s37-common')?.nextSceneId, 's37-s50-dispatch');
  const callback = choice('s37-s50-dispatch', 's37-s50-choice');
  assert.deepEqual(callback?.choices.map(({ id, when, targetSceneId, effects }) =>
    [id, when, targetSceneId, effects]), [
    ['a', { flag: 's50-family-story' }, 's37-s50-a', undefined],
    ['b', { flag: 's50-sister-gift' }, 's37-s50-b', undefined],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s37-s50-${variant}`)?.nextSceneId, 's37-status-dispatch');
  const ending = choice('s37-status-dispatch', 's37-status-choice');
  assert.deepEqual(ending?.choices.map(({ id, when, targetSceneId, effects }) =>
    [id, when, targetSceneId, effects]), [
    ['continue', { flag: 's37-status-continues' }, 's37-c2', undefined],
    ['closed', { flag: 's37-status-closed' }, 's37-after-closed-end', undefined],
  ]);
  const next = choice('s37-c2', 's37-c2-choice');
  assert.deepEqual(next?.choices.map(({ id, label, targetSceneId, effects }) =>
    [id, label.ru, targetSceneId, effects]), [
    ['a', 'Позвать его увидеть рассвет вдвоём', 's37-c2-a',
      [{ op: 'flag_set', id: 's37-morning-sunrise', value: true }]],
    ['b', 'Пригласить его вместе приготовить поздний завтрак', 's37-c2-b',
      [{ op: 'flag_set', id: 's37-morning-breakfast', value: true }]],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s37-c2-${variant}`)?.nextSceneId, 's37-after-open-end');
  assert.equal(scene('s37-after-open-end')?.beats[0].type, 'ending');
  assert.equal(scene('s37-after-closed-end')?.beats[0].type, 'ending');
  for (const id of ['s37-c1', 's37-c2']) {
    for (const option of choice(id, `${id}-choice`).choices) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeLock',
        'publishPermission', 'mediaPermission', 'externalMessaging'])
        assert.equal(option[forbidden], undefined, `${id}/${option.id} forbids ${forbidden}`);
    }
  }
  assert.deepEqual(catalogData.interactions, []);
});
