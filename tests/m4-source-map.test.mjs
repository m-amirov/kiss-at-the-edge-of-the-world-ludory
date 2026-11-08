import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { graphData } from '../game/src/story.js';

const sourceCommit = '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c';
const canon = [
  ['S01', 'nick-arrives', [0, 4], 's01-airport-05', 'Мужчина держал картонную табличку'],
  ['S01', 'airport-outside', [0, 16], 's01-airport-17', 'За стеклянными дверями аэропорта'],
  ['S01', 'damir-arrives', [0, 24], 's01-airport-25', 'Четвёртый участник стоял у автомата'],
  ['S01', 'car-eric', [2, 0], 's01-eric-01', '— Можно вперёд?'],
  ['S01', 'car-nick', [3, 0], 's01-nick-01', 'Ник отвёл для неё место'],
  ['S01', 'car-damir', [4, 0], 's01-damir-01', 'Алиса сама открыла заднюю дверь'],
  ['S02', 'roadside-cafe', [0, 31], 's02-road-32', 'Эрик остановился у придорожного кафе'],
  ['S03', 'editor-call', [0, 0], 's03-editorial-01', 'Утром дождь превратился'],
  ['S03', 'damir-enters', [4, 0], 's03-coffee-01', 'Дамир вошёл в гостиную'],
];

const readMap = () => JSON.parse(readFileSync(new URL('../game/visuals/source-map.json', import.meta.url), 'utf8'));
const beatById = new Map(graphData.scenes.flatMap(scene => scene.beats.map(beat => [beat.id, beat])));

test('all nine pinned S01–S03 visual cues map exactly once to existing authored beats', () => {
  const map = readMap();
  assert.equal(map.schemaVersion, 1);
  assert.equal(map.sourceCommit, sourceCommit);
  assert.equal(map.entries.length, canon.length);
  const seen = new Set();
  for (const [sourceSceneId, sourceCueId, at, graphBeatId, anchor] of canon) {
    const matching = map.entries.filter(item => item.sourceSceneId === sourceSceneId && item.sourceCueId === sourceCueId);
    assert.equal(matching.length, 1, `missing or duplicate cue: ${sourceSceneId}/${sourceCueId}`);
    const [entry] = matching;
    assert.deepEqual(entry.at, at);
    assert.equal(entry.graphBeatId, graphBeatId);
    assert.equal(entry.status, 'mapped');
    assert.equal(entry.fallback, 'neutral');
    assert.equal(entry.admittedMediaId, null, `unapproved art must never be referenced: ${sourceCueId}`);
    assert.ok(beatById.has(graphBeatId));
    assert.ok(beatById.get(graphBeatId).text.ru.startsWith(anchor));
    assert.ok(entry.sourceArt === null || typeof entry.sourceArt === 'string');
    assert.ok(!seen.has(`${sourceSceneId}:${sourceCueId}`));
    seen.add(`${sourceSceneId}:${sourceCueId}`);
  }
  assert.deepEqual([...new Set(map.entries.map(item => item.sourceSceneId))].sort(), ['S01', 'S02', 'S03']);
});

test('S01 seat cues match actual route flags; return to common stage is explicitly neutral', () => {
  const map = readMap();
  const routes = [
    ['eric', 's01-eric', 'front-eric'],
    ['nick', 's01-nick', 'back-nick'],
    ['damir', 's01-damir', 'back-damir'],
  ];
  const airport = graphData.scenes.find(scene => scene.id === 's01-airport');
  const choiceBeat = airport.beats.find(beat => beat.id === 's01-seat-choice');
  for (const [name, targetSceneId, choiceId] of routes) {
    const entry = map.entries.find(entry => entry.sourceCueId === `car-${name}`);
    assert.deepEqual(entry.when, { flag: `s01-seat-${name}` });
    const choice = choiceBeat.choices.find(choice => choice.id === choiceId);
    assert.equal(choice.targetSceneId, targetSceneId);
    assert.deepEqual(choice.effects, [{ op: 'flag_set', id: `s01-seat-${name}`, value: true }]);
    assert.equal(graphData.scenes.find(scene => scene.id === targetSceneId).nextSceneId, 's01-common');
  }
  assert.deepEqual(map.neutralResets, ['s01-common-01', 's02-road-01', 's03-editorial-01']);
  for (const id of map.neutralResets) assert.ok(beatById.has(id));
  assert.ok(map.openingStages.every(stage => stage.fallback === 'neutral' && stage.admittedMediaId === null));
});
