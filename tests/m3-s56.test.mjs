import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently derived from read-only EP08, source lines 237–271.
// Source paragraphs are joined with exactly two LF for SHA-256.
const manuscript = {
  's56-active': [3, 'a9ee671b5472a6c44013501b76b19dd5d1abe6a255251a2d22a8c417654c5dc3'],
  's56-paused': [1, 'a519ec8d5339cf6718561d46d0d4260e0ba849fcafc9fc2c263e4d38df456c57'],
  's56-c1-a': [1, '21a0338f21c3d2fc77456e78b6dc66d1f630e4930271975d16c773759b42711b'],
  's56-c1-b': [1, '9910f75a6ecadf0a333b6df5cb765dd46c8bcba871bebb61ef7f036467875a61'],
  's56-common': [1, '7878c9d2d6d2fcfb4eee29c30ebfb0edba4b4e975b9f0c8c2e4fd66704ca253a'],
  's56-c2-a': [1, 'ffb435d020f1a40755cf519ce09448a989fb43ffb231d8f86c41c4b3108504bd'],
  's56-c2-b': [1, '745a3a61c95e58bcea5c15c50bb84774a671c65633858591cdc2669171d057d3'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S56 renders seven exact source blocks with nine original paragraphs', () => {
  assert.equal(Object.keys(manuscript).length, 7);
  assert.equal(Object.values(manuscript).reduce((n, [count]) => n + count, 0), 9);
  for (const [id, [count, hash]] of Object.entries(manuscript)) {
    const blocks = prose(id);
    assert.equal(blocks.length, count, id + ' source paragraphs');
    assert.equal(createHash('sha256').update(blocks.join('\n\n')).digest('hex'),
      hash, id + ' original SHA-256');
  }
});

test('S56 status guard only admits active/paused; closed bypasses romance toward S35', () => {
  assert.equal(scene('s34-common').nextSceneId, 's34-status-dispatch');
  assert.equal(scene('s34-after-m3-end'), undefined);
  assert.deepEqual(choice('s34-status-dispatch', 's34-status-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's56-active', { flag: 's34-status-active' }, undefined],
    ['b', 'Продолжить', 's56-paused', { flag: 's34-status-paused' }, undefined],
    ['c', 'Продолжить', 's34-closed-after-m3-end', { flag: 's34-status-closed' }, undefined],
  ]);
  assert.equal(scene('s34-closed-after-m3-end').beats[0].type, 'ending');
  assert.equal(scene('s35-intro'), undefined, 'S35 is not yet migrated');
  for (const id of ['active', 'paused'])
    assert.equal(scene('s56-' + id).nextSceneId, 's56-c1-dispatch');
});

test('S56 both source choices stay free, C2 retains exclusive S39 callback provenance', () => {
  assert.deepEqual(choice('s56-c1-dispatch', 's56-c1-choice').choices
    .map(({ id, label, targetSceneId, effects }) =>
      [id, label.ru, targetSceneId, effects]), [
    ['a', 'Остаться ещё на одну песню', 's56-c1-a', undefined],
    ['b', 'Выйти на улицу и пройтись до гостиницы', 's56-c1-b', undefined],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene('s56-c1-' + id).nextSceneId, 's56-common');
  assert.deepEqual(choice('s56-common', 's56-c2-choice').choices
    .map(({ id, label, targetSceneId, effects }) =>
      [id, label.ru, targetSceneId, effects]), [
    ['a', 'Найти вместе новое блюдо на завтрашний день', 's56-c2-a',
      [{ op: 'flag_set', id: 's56-next-dish', value: true }]],
    ['b', 'Научить его припеву незнакомой песни', 's56-c2-b',
      [{ op: 'flag_set', id: 's56-next-chorus', value: true }]],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene('s56-c2-' + id).nextSceneId, 's56-after-m3-end');
  assert.equal(scene('s56-after-m3-end').beats[0].type, 'ending');
  assert.equal(scene('s39-intro'), undefined, 'S39 is not yet migrated');
  for (const node of ['s56-c1-dispatch', 's56-common']) {
    const decision = scene(node).beats.find((beat) => beat.type === 'choice');
    for (const option of decision.choices)
      for (const forbidden of ['cost', 'premium', 'routeId', 'requiredEntitlement',
        'mediaPermission', 'publishPermission', 'message', 'upload', 'externalAction',
        'relocationConsent'])
        assert.equal(option[forbidden], undefined, node + ':' + option.id);
  }
  assert.deepEqual(catalogData.interactions, []);
});
