import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independently taken from pinned original EP08 S53, lines 147–181.
// Exact visible paragraphs joined by two LF, not generated from scene code.
const source = {
  's53-active': [3, 'd052cce225e95cce98340d6cea1195ef77384522e3455fe02d8fafaab2a33307'],
  's53-paused': [1, 'fe307721c2ccb53e4d72175a26f9e8ea3b89f72104a3a23c5e4b9550c7a722e7'],
  's53-c1-a': [1, 'f085f08812cf5c34858c5689d7032a947227e58c74f92630680dae2396369900'],
  's53-c1-b': [1, '40da8ab7f8677513f9a96f3a196f17350b972d756c26f668515f6e32a706d726'],
  's53-common': [1, '86b277d0e6f2829d6851033ebbd0464167cf602fff7608414bb5b076cef1f563'],
  's53-c2-a': [1, '933bd13c288690c4febe83ff5114170cf538aab1b402074db7f97164ed87c075'],
  's53-c2-b': [1, '3c7959ea6e4b0593e782425a9c50c2271657f355c05627db8b4d35a579f231ff'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S53 displays seven exact source blocks and nine original paragraphs', () => {
  assert.equal(Object.values(source).reduce((sum, [n]) => sum + n, 0), 9);
  for (const [id, [count, digest]] of Object.entries(source)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), digest, id);
  }
});

test('S53 active/paused require Nick S33 status; closed leads to independent route', () => {
  const dispatch = choice('s33-status-dispatch', 's33-status-choice');
  assert.deepEqual(dispatch.choices.map(({ id, targetSceneId, when }) =>
    [id, targetSceneId, when]), [
    ['a', 's53-active', { flag: 's33-status-active' }],
    ['b', 's53-paused', { flag: 's33-status-paused' }],
    ['c', 's35-intro', { flag: 's33-status-closed' }],
  ]);
  assert.equal(scene('s33-after-m3-end'), undefined);
  for (const id of ['active', 'paused'])
    assert.equal(scene('s53-' + id)?.nextSceneId, 's53-c1');
  const expected = [
    ['s53-c1', 's53-c1-choice', [
      ['a', 'Пойти к книжному без цели и без камеры', 's53-c1-a'],
      ['b', 'Вернуться к группе и не требовать продолжения дня', 's53-c1-b'],
    ]],
    ['s53-common', 's53-c2-choice', [
      ['a', 'Договориться о коротком свидании после возвращения домой', 's53-c2-a'],
      ['b', 'Обменяться любимыми книгами из дорожных сумок', 's53-c2-b'],
    ]],
  ];
  for (const [node, beat, opts] of expected)
    assert.deepEqual(choice(node, beat)?.choices.map(({ id, label, targetSceneId, effects, when }) =>
      [id, label.ru, targetSceneId, effects, when]),
    opts.map(([id, label, target]) => [id, label, target, undefined, undefined]));
  for (const id of ['a', 'b']) {
    assert.equal(scene('s53-c1-' + id)?.nextSceneId, 's53-common');
    assert.equal(scene('s53-c2-' + id)?.nextSceneId, 's36-intro');
  }
  assert.equal(scene('s53-after-m3-end'), undefined);
  assert.deepEqual(catalogData.interactions, []);
});
