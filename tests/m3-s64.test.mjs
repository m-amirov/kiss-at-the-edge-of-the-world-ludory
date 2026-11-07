import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';

// Independent hashes of pinned read-only EP09 S64 (359–392), not of game modules.
const original = {
  's64-intro': [3, '90a47c0d698a3051b20953c5199a2cb5948df29c6096f8c1836d398a22a1d3c8'],
  's64-c1-a': [1, '8efce3a544dc40ac6685e4e85412dedfe6f4d7dbeb942a05a445286e789a4479'],
  's64-c1-b': [1, 'fc277ec30227b2920c303a0f1eda979a5072bfb13fba575526ff9628ebd3f891'],
  's64-common': [1, '54f4cb451a770c5585cd3699ac2d478594a9c992cd8f9fed2e4b71ae290236c9'],
  's64-s40-a': [1, '9366a573bed2183b5dc961a377d1225544e89b36c4a0628cab27e9cf15d5a7a3'],
  's64-s40-b': [1, '43cf406c1806abfc8a2da5303b2aca1c9c13e5ed2204da73cd227357d966d889'],
};
const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S64 preserves all six EP09 authorial blocks and eight paragraphs exactly', () => {
  assert.equal(Object.keys(original).length, 6);
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 8);
  for (const [id, [count, hash]] of Object.entries(original)) {
    assert.equal(prose(id).length, count, `${id}: paragraph count`);
    assert.equal(createHash('sha256').update(prose(id).join('\n\n')).digest('hex'),
      hash, `${id}: pinned original SHA-256`);
  }
});

test('all S40 terminal branches enter day-19 S64, without an obsolete Draft ending', () => {
  assert.equal(scene('s40-after-m3-end'), undefined);
  assert.deepEqual(choice('s40-s63-dispatch', 's40-s63-choice')
    .map(({ id, targetSceneId }) => [id, targetSceneId]), [
    ['a', 's40-s63-a'], ['b', 's40-s63-b'], ['none', 's64-intro'],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s40-s63-${id}`).nextSceneId, 's64-intro');
});

test('S64 free career choice and exclusive S40 callback converge at a Draft-only S60 boundary', () => {
  assert.deepEqual(choice('s64-intro', 's64-c1-choice')
    .map(({ id, label, targetSceneId, effects }) => [id, label.ru, targetSceneId, effects]), [
    ['a', 'Подать заявку на самостоятельный журналистский проект', 's64-c1-a',
      [{ op: 'flag_set', id: 's64-career-project', value: true }]],
    ['b', 'Оставить себе свободный месяц после поездки', 's64-c1-b',
      [{ op: 'flag_set', id: 's64-career-break', value: true }]],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s64-c1-${id}`).nextSceneId, 's64-common');
  assert.equal(scene('s64-common').nextSceneId, 's64-s40-dispatch');
  assert.deepEqual(choice('s64-s40-dispatch', 's64-s40-choice')
    .map(({ id, label, when, targetSceneId, effects }) =>
      [id, label.ru, when, targetSceneId, effects]), [
    ['a', 'Продолжить', { flag: 's40-evening-music' }, 's64-s40-a', undefined],
    ['b', 'Продолжить', { flag: 's40-evening-friend' }, 's64-s40-b', undefined],
  ]);
  for (const id of ['a', 'b']) assert.equal(scene(`s64-s40-${id}`).nextSceneId, 's60-intro');
  assert.equal(scene('s64-after-m3-end'), undefined);
  for (const id of ['s64-intro', 's64-s40-dispatch']) {
    for (const option of choice(id, id === 's64-intro' ? 's64-c1-choice' : 's64-s40-choice')) {
      for (const field of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'publishPermission', 'mediaPermission', 'editorMessageSent', 'realVoiceRecording']) {
        assert.equal(option[field], undefined, `${id}/${option.id}/${field}`);
      }
    }
  }
  assert.deepEqual(catalogData.interactions, []);
});
