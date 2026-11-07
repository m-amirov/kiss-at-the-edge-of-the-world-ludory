import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently derived from read-only pinned EP09 S57 lines 279–315,
// not from any game module. Exact trimmed paragraphs joined by two LF.
const manuscript = {
  's57-intro': [4, '3fe44cad0cd98c0d5d94bde097be96a175cba81a9c38fec7f74cc8ae9ad31d72'],
  's57-c1-a': [1, 'c744407f7dd4ead020c548a6a8dbf240e42702e9376a54d3b758f43c5077958a'],
  's57-c1-b': [1, 'b050a65d38a6353d377080d473f63dc1b99fe6507461a9a2abfcfcc4fc7bac47'],
  's57-common': [1, '3cd7aecc12ea780cf562c692fba2e3b2447329255717e9efbdb862db664b2457'],
  's57-s39-a': [1, '6fd051cd76f047423d7c6afae0e23bf213cfde3b3fa8c667b557421974a6300d'],
  's57-s39-b': [1, '94aebab5da1f5eb5e34f70f536deb4b5e7a430d40b037f52c601a6e4dbc54ab7'],
};
const scene = (id) => graphData.scenes.find((entry) => entry.id === id);
const choice = (sceneId, beatId) => scene(sceneId)?.beats.find((beat) => beat.id === beatId)?.choices;
const dialogue = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map(({ text }) => text.ru);

test('S57 preserves all six authored blocks and nine exact paragraphs', () => {
  assert.equal(Object.values(manuscript).reduce((sum, [count]) => sum + count, 0), 9);
  for (const [id, [count, hash]] of Object.entries(manuscript)) {
    const paragraphs = dialogue(id);
    assert.equal(paragraphs.length, count, id + ' paragraph count');
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      hash, id + ' original source digest');
  }
});

test('continued Damir S39 enters S57 after S56 callback; breakup remains independent', () => {
  assert.equal(scene('s39-after-open-end'), undefined);
  for (const id of ['a', 'b'])
    assert.equal(scene(`s39-s56-${id}`)?.nextSceneId, 's57-intro');
  assert.deepEqual(choice('s39-status-dispatch', 's39-status-choice')
    .map(({ id, when, targetSceneId }) => [id, when, targetSceneId]), [
    ['continue', { flag: 's39-status-continues' }, 's39-c2'],
    ['closed', { flag: 's39-status-closed' }, 's40-intro'],
  ]);
});

test('S57-C1 is free; exclusive S39-C2 callback reaches unpublished S60 boundary', () => {
  assert.deepEqual(choice('s57-intro', 's57-c1-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Остаться рядом и договориться о следующей встрече', 's57-c1-a',
      [{ op: 'flag_set', id: 's57-next-meeting', value: true }]],
    ['b', 'Остановиться и оставить себе время', 's57-c1-b',
      [{ op: 'flag_set', id: 's57-more-time', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s57-c1-${id}`)?.nextSceneId, 's57-common');
  assert.equal(scene('s57-common')?.nextSceneId, 's57-s39-dispatch');
  assert.deepEqual(choice('s57-s39-dispatch', 's57-s39-choice')
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's39-memory-ordinary-day' }, 's57-s39-a', undefined],
    ['b', { flag: 's39-memory-morning-walk' }, 's57-s39-b', undefined],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene(`s57-s39-${id}`)?.nextSceneId, 's60-intro');
  assert.equal(scene('s57-after-m3-end'), undefined);
  for (const [id, beat] of [['s57-intro', 's57-c1-choice'],
    ['s57-s39-dispatch', 's57-s39-choice']])
    for (const option of choice(id, beat)) for (const prohibited of [
      'cost', 'premium', 'requiredEntitlement', 'publishPermission', 'mediaPermission',
      'externalMessaging', 'purchase', 'routeId', 'realBooking',
    ]) assert.equal(option[prohibited], undefined, `${id}/${option.id}/${prohibited}`);
  assert.deepEqual(catalogData.interactions, []);
});
