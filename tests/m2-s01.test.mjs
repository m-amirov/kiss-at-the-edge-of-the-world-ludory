import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { graphData, catalogData } from '../game/src/story.js';
import { resolveNarrativeTitle } from '../game/src/main.js';
import { defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate } from '../game/assets/ludory-narrative.js';

const scene = (id) => graphData.scenes.find((entry) => entry.id === id);
const dialogue = (id) => scene(id).beats.filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru).join('\n');

const sourceBlockSha256 = {
  's01-airport': '7c5d49e856f299af8a0aafc1482537acd1eeb866743dd3f211b73629092dc96c',
  's01-eric': '68a7665024c57342571578eb793ec92a2388e9804a12bd32b63c4c8eb2770933',
  's01-nick': '712d7b0fa31c613acb7cb54a4ebb49cb4e1d674226f3f162564e730b01fb7176',
  's01-damir': '3594fae2e54424cc2ab1ecabbae8375638778c1438dcaa46a14d289caa5f433f',
  's01-common': '0d4a17c945ffa6f564f8bc2a4552ddf9ce23d6cca05cef9221ffde6bd699c720',
};
const hash = (source) => createHash('sha256').update(source).digest('hex');
const canonicalTextHash = (source) => hash(Buffer.from(source.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8'));

test('S01 starts with original red suitcase scene and validates as Ludory graph', () => {
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  assert.doesNotThrow(() => defineNarrativeCatalog(catalogData));
  assert.equal(graphData.startSceneId, 's01-airport');
  assert.match(dialogue('s01-airport'), /Красный чемодан Алисы появился на ленте последним/);
  assert.match(dialogue('s01-airport'), /Алиса посмотрела на Дамира/);
  assert.doesNotMatch(JSON.stringify(graphData), /(^|[^А-Яа-я])Мира([^А-Яа-я]|$)|маяк мигнул/iu);
});

test('S01-C1 has exactly three mutually exclusive route-neutral seat choices', () => {
  const choice = scene('s01-airport').beats.at(-1);
  assert.equal(choice.type, 'choice');
  assert.equal(choice.id, 's01-seat-choice');
  assert.deepEqual(choice.choices.map(({id}) => id), ['front-eric', 'back-nick', 'back-damir']);
  assert.deepEqual(choice.choices.map(({targetSceneId}) => targetSceneId), ['s01-eric', 's01-nick', 's01-damir']);
  for (const option of choice.choices) {
    assert.equal(option.routeId, undefined);
    assert.ok(option.effects.every((effect) => effect.op !== 'route_lock' && effect.op !== 'route_intent'));
  }
});

test('S01 keeps complete distinct branch endings and identical common continuation', () => {
  assert.match(dialogue('s01-eric'), /короткий честный ответ/);
  assert.match(dialogue('s01-nick'), /приятнее его первых шуток/);
  assert.match(dialogue('s01-damir'), /поездка уже не могла притворяться встречей незнакомых людей/);
  for (const id of ['s01-eric','s01-nick','s01-damir']) {
    assert.equal(scene(id).nextSceneId, 's01-common');
    assert.doesNotMatch(dialogue(id), /ГРУППА, КОТОРАЯ ЕЩЁ НЕ ПЕРЕДУМАЛА/);
  }
  assert.match(dialogue('s01-common'), /ГРУППА, КОТОРАЯ ЕЩЁ НЕ ПЕРЕДУМАЛА/);
  assert.match(dialogue('s01-common'), /Алиса впервые за утро смогла смотреть/);
});

test('S01 canonical paragraphs remain byte-identical to the audited literary source blocks', () => {
  for (const [id, expectedSha] of Object.entries(sourceBlockSha256)) {
    const originalParagraphs = scene(id).beats.filter((beat) => beat.type === 'dialogue').map((beat) => beat.text.ru);
    assert.equal(hash(originalParagraphs.join('\n\n')), expectedSha, `${id} source mismatch`);
  }
});

test('narrative asset proof follows the authored story and does not publish template demo art', () => {
  const proof = JSON.parse(readFileSync(new URL('../game/narrative-assets.json', import.meta.url), 'utf8'));
  const bytes = readFileSync(new URL('../game/src/story.js', import.meta.url));
  assert.equal(proof.storySha256, canonicalTextHash(bytes));
  assert.deepEqual(proof.assets, {});
  for (const filename of ['lighthouse.svg', 'shoreline.svg']) {
    assert.equal(existsSync(new URL(`../game/assets/${filename}`, import.meta.url)), false);
  }
});

test('Ludory 1.2.2 keeps canonical authored files outside managed components', () => {
  const state = JSON.parse(readFileSync(new URL('../game/ludory.components.json', import.meta.url), 'utf8'));
  assert.equal(state.schemaVersion, 2);
  assert.deepEqual(state.authorFiles, [
    'src/story.js', 'narrative-assets.json', 'assets/lighthouse.svg', 'assets/shoreline.svg',
  ]);
  assert.deepEqual(Object.keys(state.files).sort(), [
    'assets/ludory-narrative.js', 'index.html', 'src/entry.js', 'src/main.js',
  ]);
  const proof = JSON.parse(readFileSync(new URL('../game/narrative-assets.json', import.meta.url), 'utf8'));
  assert.equal(proof.storySha256, canonicalTextHash(readFileSync(new URL('../game/src/story.js', import.meta.url))));
});

test('Ludory launcher displays the manifest title, not a template demo title', () => {
  const manifest = JSON.parse(readFileSync(new URL('../game/ludory.project.json', import.meta.url), 'utf8'));
  assert.equal(resolveNarrativeTitle(manifest, 'ru'), 'Поцелуй на краю света · Ludory');
  assert.equal(resolveNarrativeTitle(manifest, 'en'), 'Поцелуй на краю света · Ludory');
  const launcher = readFileSync(new URL('../game/src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(launcher, /Вечер у маяка|Lighthouse Evening/);
});

test('S01 choice changes a visible flag without prematurely locking a romance route', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const tick = (event) => update({ deltaMs: 16, inputs: [{ schemaVersion: 1, type: 'pointer', action: event, phase: 'up', timestamp: 10, source: 'renderer' }], state, setState(next) { state = next; } });
  for (const beat of scene('s01-airport').beats.filter((beat) => beat.type === 'dialogue')) tick(`narrative:next:${beat.id}`);
  tick('narrative:choose:s01-seat-choice:front-eric');
  assert.equal(state.narrative.routeLock, null);
  assert.ok(state.narrative.flags['s01-seat-eric']);
  assert.equal(state.narrative.sceneId, 's01-eric');
});

test('every S01 route converges; Back restores state and allows a different seat', () => {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: createNarrativeState(graph) };
  const tick = (action) => update({ deltaMs: 16,
    inputs: [{ schemaVersion: 1, type: 'pointer', action, phase: 'up', timestamp: 10, source: 'renderer' }],
    state, setState(next) { state = next; } });
  const runDialogue = (id) => {
    for (const beat of scene(id).beats.filter((item) => item.type === 'dialogue')) tick(`narrative:next:${beat.id}`);
  };
  runDialogue('s01-airport');
  tick('narrative:choose:s01-seat-choice:back-nick');
  assert.equal(state.narrative.sceneId, 's01-nick');
  assert.equal(state.narrative.flags['s01-seat-nick'], true);
  tick('narrative:back');
  assert.equal(state.narrative.sceneId, 's01-airport');
  assert.equal(state.narrative.flags['s01-seat-nick'], undefined);
  tick('narrative:choose:s01-seat-choice:back-damir');
  assert.equal(state.narrative.sceneId, 's01-damir');
  assert.equal(state.narrative.flags['s01-seat-damir'], true);
  assert.equal(state.narrative.flags['s01-seat-nick'], undefined);
  runDialogue('s01-damir');
  assert.equal(state.narrative.sceneId, 's01-common');
  assert.equal(state.narrative.routeLock, null);
});
