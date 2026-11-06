import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Source-independent digests from pinned EP09/S38; paragraphs joined by two LF.
const authored = {
  's38-paused': [1, 'e147d3fb22a3baae651c6dec37e23cce50f0384be836f8d7d0e288558a7a10a7'],
  's38-active': [4, '47805d97eb75e740350215e1b08e52b7f9bc68dcefd5196a11752caf5a8995a1'],
  's38-c1-a': [2, '73d9c25b25f2e4581011ec0b2e56a82d7707748c6f6819892e4523dec0a0ded4'],
  's38-c1-b': [2, '61f6e5783f68cdd29d235224a52b35a338bf49153777ec67420253c658d7c2d9'],
  's38-common': [1, '6918efe06b0d32efd023419f5ccc361192aae62a7f99664997930c5e030b4cab'],
  's38-c2-a': [1, '38d1676c33c5b67683782c26844d1455428539c5cf47e184b239c08028a89325'],
  's38-c2-b': [1, 'cb63277b1de0ba68f2a48a450851aaa1c20f420337824ac2067d1d252f47b26b'],
  's38-s53-a': [1, '014a6b37b5fe76fdbb2677a58124771d4628cb7eda5bef873af40bdcd0eb1de7'],
  's38-s53-b': [1, '1c37af35552823254ff2fd0e441a0901cfb6773d98b41fa4bdac36876fe7e1bb'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter(({ type }) => type === 'dialogue')
  .map(({ text }) => text.ru);

test('S38 displays nine exact EP09 authorial blocks and 14 paragraphs', () => {
  assert.equal(Object.values(authored).reduce((sum, [count]) => sum + count, 0), 14);
  for (const [id, [count, sha]] of Object.entries(authored)) {
    const actual = prose(id);
    assert.equal(actual.length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(actual.join('\n\n')).digest('hex'), sha,
      `${id} pinned manuscript SHA-256`);
  }
});

test('S36 admits only Nick active/paused to S38; closed romance remains independent', () => {
  const dispatch = choice('s36-route-dispatch', 's36-route-choice');
  assert.deepEqual(dispatch?.choices.map(({ id, routeId, when, targetSceneId, effects }) =>
    [id, routeId, when, targetSceneId, effects]), [
    ['eric-active', 'eric', { flag: 's32-status-active' }, 's37-active', undefined],
    ['eric-paused', 'eric', { flag: 's32-status-paused' }, 's37-paused', undefined],
    ['eric-closed', 'eric', { flag: 's32-status-closed' }, 's36-after-m3-end', undefined],
    ['nick-active', 'nick', { flag: 's33-status-active' }, 's38-active', undefined],
    ['nick-paused', 'nick', { flag: 's33-status-paused' }, 's38-paused', undefined],
    ['nick-closed', 'nick', { flag: 's33-status-closed' }, 's36-after-m3-end', undefined],
    ['damir', 'damir', undefined, 's36-after-m3-end', undefined],
    ['alice', 'alice', undefined, 's36-after-m3-end', undefined],
  ]);
  for (const status of ['active', 'paused'])
    assert.equal(scene(`s38-${status}`)?.nextSceneId, 's38-c1');
  assert.equal(scene('s36-after-m3-end')?.beats[0].type, 'ending');
});

test('S38 free C1/C2, S53 callback and closed-romance boundary are guarded', () => {
  assert.deepEqual(choice('s38-c1', 's38-c1-choice')?.choices
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Провести вместе обычный уикенд дома после путешествия', 's38-c1-a',
      [{ op: 'flag_set', id: 's38-status-continues', value: true }]],
    ['b', 'Оставить их историю прекрасной поездкой', 's38-c1-b',
      [{ op: 'flag_set', id: 's38-status-closed', value: true }]],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s38-c1-${variant}`)?.nextSceneId, 's38-common');
  assert.equal(scene('s38-common')?.nextSceneId, 's38-status-dispatch');
  assert.deepEqual(choice('s38-s53-dispatch', 's38-s53-choice')?.choices
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's53-next-coffee' }, 's38-s53-a', undefined],
    ['b', { flag: 's53-next-books' }, 's38-s53-b', undefined],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s38-s53-${variant}`)?.nextSceneId, 's38-after-open-end');
  assert.deepEqual(choice('s38-status-dispatch', 's38-status-choice')?.choices
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['continue', { flag: 's38-status-continues' }, 's38-c2', undefined],
    ['closed', { flag: 's38-status-closed' }, 's38-after-closed-end', undefined],
  ]);
  assert.deepEqual(choice('s38-c2', 's38-c2-choice')?.choices
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Пригласить его на свидание без шуток о съёмке', 's38-c2-a',
      [{ op: 'flag_set', id: 's38-memory-date', value: true }]],
    ['b', 'Предложить выбрать друг другу книгу в магазине', 's38-c2-b',
      [{ op: 'flag_set', id: 's38-memory-books', value: true }]],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s38-c2-${variant}`)?.nextSceneId, 's38-s53-dispatch');
  for (const variant of ['open', 'closed'])
    assert.equal(scene(`s38-after-${variant}-end`)?.beats[0].type, 'ending');
  for (const node of ['s38-c1', 's38-c2'])
    for (const option of choice(node, `${node}-choice`).choices)
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeLock',
        'publishPermission', 'mediaPermission', 'externalMessaging'])
        assert.equal(option[forbidden], undefined, `${node}/${option.id} forbids ${forbidden}`);
  assert.deepEqual(catalogData.interactions, []);
});
