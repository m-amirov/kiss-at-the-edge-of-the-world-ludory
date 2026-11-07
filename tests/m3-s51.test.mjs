import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently calculated from read-only original EP09 S51, not from scene modules.
// Each hash covers trimmed authored paragraphs joined with exactly two LF.
const original = {
  's51-intro': [4, '30bf752adaae0a2051b0d44e34d16368854bb258b006b5f187188ef8567e7d1b'],
  's51-c1-a': [1, '0f7e8118c7271ad804f99db14c106a1b05dc9f70f70517251b891473026376cc'],
  's51-c1-b': [2, '3e8ccc5ca75fc208ffbfd3237e9e6d963dce4de5962ac9bee8cba0f4627b7b44'],
  's51-common': [1, 'c06cbc5f7823f84d089cbac86eb7f1eb1fc01156074aa5e9d7152ab2015df8d4'],
  's51-s37-a': [1, 'b7365ca8e4d1b57b32da9aaaee681e338445da4fb133b4266063dbd28899ce92'],
  's51-s37-b': [1, '4621cd798161a6eaef688c72998ca7dc085e8b2228abe089dd6b1ebeb088c9c5'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S51 preserves all six original EP09 prose blocks and ten authorial paragraphs', () => {
  assert.equal(Object.keys(original).length, 6);
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 10);
  for (const [id, [count, hash]] of Object.entries(original)) {
    assert.equal(prose(id).length, count, `${id}: paragraph count`);
    assert.equal(createHash('sha256').update(prose(id).join('\n\n')).digest('hex'),
      hash, `${id}: pinned manuscript hash`);
  }
});

test('only S37 continued Eric routes enter S51, while S37 breakup retains independent path', () => {
  assert.equal(scene('s37-after-open-end'), undefined);
  for (const id of ['a', 'b']) assert.equal(scene(`s37-c2-${id}`)?.nextSceneId, 's51-intro');
  assert.deepEqual(choice('s37-status-dispatch', 's37-status-choice')
    .map(({ id, when, targetSceneId }) => [id, when, targetSceneId]), [
    ['continue', { flag: 's37-status-continues' }, 's37-c2'],
    ['closed', { flag: 's37-status-closed' }, 's40-intro'],
  ]);
});

test('S51 free C1 A/B and guarded S37 morning payoff end at Draft-only S60 boundary', () => {
  assert.deepEqual(choice('s51-intro', 's51-c1-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Остаться ещё на час вдвоём', 's51-c1-a',
      [{ op: 'flag_set', id: 's51-evening-together', value: true }]],
    ['b', 'Пожелать спокойной ночи и закончить день отдельно', 's51-c1-b',
      [{ op: 'flag_set', id: 's51-evening-apart', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s51-c1-${id}`)?.nextSceneId, 's51-common');
  assert.equal(scene('s51-common')?.nextSceneId, 's51-s37-dispatch');
  assert.deepEqual(choice('s51-s37-dispatch', 's51-s37-choice')
    .map(({ id, when, targetSceneId, effects }) => [id, when, targetSceneId, effects]), [
    ['a', { flag: 's37-morning-sunrise' }, 's51-s37-a', undefined],
    ['b', { flag: 's37-morning-breakfast' }, 's51-s37-b', undefined],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s51-s37-${id}`)?.nextSceneId, 's51-after-m3-end');
  assert.equal(scene('s51-after-m3-end')?.beats[0].type, 'ending');
  for (const [id, beat] of [['s51-intro', 's51-c1-choice'],
    ['s51-s37-dispatch', 's51-s37-choice']]) {
    for (const option of choice(id, beat)) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'publishPermission', 'mediaPermission', 'externalMessaging', 'realDevicePhoto']) {
        assert.equal(option[forbidden], undefined, `${beat}/${option.id}/${forbidden}`);
      }
    }
  }
  assert.deepEqual(catalogData.interactions, []);
});
