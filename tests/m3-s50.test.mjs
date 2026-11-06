import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently pinned original episode-08 S50 text, lines 61–95.
// SHA-256 covers the displayed paragraphs joined with two newlines.
const authored = {
  's50-active': [3, '10768b75cc2dfcdab8c9329abc1d441346bfa06b867cb108a593ac8ebca71385'],
  's50-paused': [1, 'd41ae1519b40d6312c5e2ae475cf80370e128b4cfebe85c0be5f3d80f371d043'],
  's50-c1-a': [1, '6a9c4dd506b1150377cb082bd7735401e6ba36bae89b0599bbc5310051484908'],
  's50-c1-b': [1, '5e6c8c93c8709c8712d988479f27b167557c33f08d8a4abfef93025dd87bcbdc'],
  's50-common': [1, 'abd4f8db8150db63293700518604777b67377bd932789c9f967618a357dd52b2'],
  's50-c2-a': [1, 'b56b7ba3ba2f613182b2c175756ef6d011b0a8dcdcd50dc1fd9675b9efaba73c'],
  's50-c2-b': [1, 'ea2870f3e096b668bb7b2b30d59ba809102bb52d8f805d5a6806e52cb6c3ea9e'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S50 reproduces all seven original authorial blocks and nine paragraphs verbatim', () => {
  assert.equal(Object.values(authored).reduce((sum, [n]) => sum + n, 0), 9);
  for (const [id, [count, hash]] of Object.entries(authored)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), hash, id);
  }
});

test('S50 guards Eric active/paused, preserves closed independent exit and two free choices', () => {
  const dispatch = choice('s32-status-dispatch', 's32-status-choice');
  assert.deepEqual(dispatch.choices.map(({ id, targetSceneId, when }) =>
    [id, targetSceneId, when]), [
    ['a', 's50-active', { flag: 's32-status-active' }],
    ['b', 's50-paused', { flag: 's32-status-paused' }],
    ['c', 's35-intro', { flag: 's32-status-closed' }],
  ]);
  assert.equal(scene('s32-after-m3-end'), undefined);
  for (const entrance of ['active', 'paused']) {
    assert.equal(scene(`s50-${entrance}`).nextSceneId, 's50-c1');
  }
  const expected = [
    ['s50-c1', 's50-c1-choice', [
      ['a', 'Купить открытку себе, а не для статьи', 's50-c1-a'],
      ['b', 'Подарить Эрику закладку с деревянной птицей', 's50-c1-b'],
    ]],
    ['s50-common', 's50-c2-choice', [
      ['a', 'Попросить рассказать о любимом семейном вечере', 's50-c2-a'],
      ['b', 'Пригласить его вместе выбрать небольшой подарок сестре', 's50-c2-b'],
    ]],
  ];
  for (const [node, beat, options] of expected) {
    assert.deepEqual(choice(node, beat)?.choices.map(({ id, label, targetSceneId, effects, when }) =>
      [id, label.ru, targetSceneId, effects, when]),
    options.map(([id, label, target]) => [id, label, target, undefined, undefined]));
  }
  for (const branch of ['a', 'b']) {
    assert.equal(scene(`s50-c1-${branch}`).nextSceneId, 's50-common');
    assert.equal(scene(`s50-c2-${branch}`).nextSceneId, 's36-intro');
  }
  assert.equal(scene('s50-after-m3-end'), undefined);
  assert.deepEqual(catalogData.interactions, []);
});
