import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independent SHA-256 of the seven exact visible paragraphs in pinned EP09
// lines 9, 11, 13, 15, 21, 25 and 29. Blank paragraphs joined by two LF.
const original = {
  's36-intro': [4, 'cb55419be0402944582c43aade9a263d1f6d8dd1b271efdb917ee3997b6a35fe'],
  's36-c1-a': [1, 'b1ca0c4eca686bec9548066347cf0e0c6c6bbf04a62afb8702f3dc5f3c654e80'],
  's36-c1-b': [1, '46a28f4be1e05aa0f47615359efe5cf8d90232bc49bce375d1e8a6a33624e2b5'],
  's36-common': [1, '5ac0eff2b3c29bfefe0723e838ee63f84bce51b894d485b8f322d54670e92604'],
};
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const paragraphs = (id) => (scene(id)?.beats ?? [])
  .filter(({ type }) => type === 'dialogue').map(({ text }) => text.ru);

test('shared S36 displays all seven exact original EP09 paragraphs', () => {
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 7);
  for (const [id, [count, sha]] of Object.entries(original)) {
    const visible = paragraphs(id);
    assert.equal(visible.length, count, `authored paragraph count in ${id}`);
    assert.equal(createHash('sha256').update(visible.join('\n\n')).digest('hex'), sha,
      `${id} source text SHA-256`);
  }
});

test('all four day-16 paths converge to free S36-C1 with exact authorial labels', () => {
  for (const prefix of ['s50', 's53', 's56', 's63']) {
    for (const variant of ['a', 'b'])
      assert.equal(scene(`${prefix}-c2-${variant}`)?.nextSceneId, 's36-intro',
        `${prefix} variant ${variant} must not end early`);
    assert.equal(scene(`${prefix}-after-m3-end`), undefined,
      `obsolete ${prefix} Draft stop must be removed`);
  }
  const intro = scene('s36-intro');
  const c1 = intro?.beats.find(({ id }) => id === 's36-c1-choice');
  assert.deepEqual(c1?.choices.map(({ id, label, targetSceneId, effects, cost, premium, when }) =>
    [id, label.ru, targetSceneId, effects, cost, premium, when]), [
    ['a', 'Предложить всем короткую прогулку до возвращения в машину', 's36-c1-a',
      undefined, undefined, undefined, undefined],
    ['b', 'Остаться в кафе и поговорить с теми, кто хочет', 's36-c1-b',
      undefined, undefined, undefined, undefined],
  ]);
  for (const variant of ['a', 'b'])
    assert.equal(scene(`s36-c1-${variant}`)?.nextSceneId, 's36-common');
  assert.equal(scene('s36-common')?.nextSceneId, 's36-route-dispatch');
  assert.equal(scene('s36-after-m3-end')?.beats[0].type, 'ending');
  assert.ok(scene('s37-active') && scene('s37-paused'), 'Eric day-18 is integrated');
  for (const routeNext of ['s38-intro', 's39-intro', 's40-intro'])
    assert.equal(scene(routeNext), undefined, `future ${routeNext} unported`);
  assert.deepEqual(catalogData.interactions, [], 'no hidden premium or physical interactions');
});
