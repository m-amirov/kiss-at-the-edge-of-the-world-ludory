import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Literal checksums computed independently from the pinned, read-only EP08
// manuscript lines 187–229, joining source paragraphs with exactly two LF.
const source = {
  's34-intro': [9, '4e1154234f86669c102e4027b6afac4e051222b0652247f6049761258bbc6efb'],
  's34-c1-a': [2, 'd9df247094175e63deb5c4bbc9e3b3c1fba2a69eb5573c3741a18425a89e1cd0'],
  's34-c1-b': [3, 'e5cbc286c371921b220e8bd15257851550978b9de8860f162f43a390e6018829'],
  's34-c1-c': [2, '9451f854575445d37c31dd82dd54b57580052fb1edf226a108408369e23501b8'],
  's34-common': [1, '79db75bf2209cc329a57f722b91f43240a0300aa395d75371b4052a7872db70c'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => (scene(id)?.beats ?? [])
  .filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru);

test('S34 shows all five manuscript blocks and 17 original paragraphs verbatim', () => {
  assert.equal(Object.keys(source).length, 5);
  assert.equal(Object.values(source).reduce((sum, [count]) => sum + count, 0), 17);
  for (const [id, [count, hash]] of Object.entries(source)) {
    const text = paragraphs(id);
    assert.equal(text.length, count, id + ' original paragraph count');
    assert.equal(createHash('sha256').update(text.join('\n\n')).digest('hex'),
      hash, id + ' source prose hash');
  }
});

test('S34 is a Damir-only day-16 choice with three free status outcomes', () => {
  for (const callback of ['a', 'b'])
    assert.equal(scene('s55-callback-' + callback).nextSceneId, 's34-intro');
  assert.equal(scene('s55-after-m3-end'), undefined);
  const decision = scene('s34-intro').beats.find((beat) => beat.id === 's34-c1-choice');
  assert.deepEqual(decision.choices.map(({ id, label, targetSceneId, effects }) =>
    [id, label.ru, targetSceneId, effects]), [
    ['a', 'Предложить встретиться позже, без обязательства решить будущее',
      's34-c1-a', [{ op: 'flag_set', id: 's34-status-active', value: true }]],
    ['b', 'Взять паузу до конца следующего дня',
      's34-c1-b', [{ op: 'flag_set', id: 's34-status-paused', value: true }]],
    ['c', 'Закончить романтическую историю',
      's34-c1-c', [{ op: 'flag_set', id: 's34-status-closed', value: true }]],
  ]);
  for (const option of decision.choices) {
    for (const forbidden of ['premium', 'cost', 'routeId', 'romancePoints',
      'requiredEntitlement', 'relocationConsent', 'clinicContract',
      'publishPermission', 'mediaPermission', 'upload', 'externalAction'])
      assert.equal(option[forbidden], undefined, option.id + ' ' + forbidden);
  }
  for (const id of ['a', 'b', 'c'])
    assert.equal(scene('s34-c1-' + id).nextSceneId, 's34-common');
  assert.equal(scene('s34-common').nextSceneId, 's34-status-dispatch');
  assert.equal(scene('s34-after-m3-end'), undefined);
  assert.deepEqual(catalogData.interactions, []);
});
