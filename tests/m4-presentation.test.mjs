import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, cpSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { graphData } from '../game/src/story.js';
import { presentationData } from '../game/src/presentation.js';
import { buildPresentation, canonicalTextSha256 } from '../tools/m4-build-presentation.mjs';

const ROOT = fileURLToPath(new URL('../game/', import.meta.url));
const hash = input => createHash('sha256').update(input).digest('hex');
const beatById = new Map(graphData.scenes.flatMap(scene => scene.beats.map(beat => [beat.id, beat])));

function fixture(callback) {
  const base = mkdtempSync(join(tmpdir(), 'm4-presentation-'));
  const game = join(base, 'game');
  try {
    for (const relative of ['visuals/presentation.json', 'visuals/source-map.json', 'src/story.js', 'src/presentation.js', 'narrative-assets.json']) {
      const from = join(ROOT, relative);
      const to = join(game, relative);
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
    const inventoryPath = join(base, 'docs/migration/m4-assets-inventory.json');
    mkdirSync(dirname(inventoryPath), { recursive: true });
    cpSync(fileURLToPath(new URL('../docs/migration/m4-assets-inventory.json', import.meta.url)), inventoryPath);
    const mediaPath = join(game, 'assets/vis-fixture.webp');
    mkdirSync(dirname(mediaPath), { recursive: true });
    const mediaBytes = Buffer.from('RIFF-fixture-WEBP-bytes');
    writeFileSync(mediaPath, mediaBytes);
    const manifestPath = join(game, 'visuals/presentation.json');
    const manifest = JSON.parse(readFileSync(manifestPath));
    const inventory = JSON.parse(readFileSync(inventoryPath));
    manifest.media.fixture = { kind: 'background', src: 'assets/vis-fixture.webp', alt: { ru: 'Проверка', en: 'Test' } };
    manifest.beats['s01-airport-05'] = [{ id: 'fixture', background: 'fixture' }];
    inventory.entries.push({ id: 'fixture', status: 'accepted', admittedPath: 'assets/vis-fixture.webp', sha256: hash(mediaBytes) });
    const update = () => {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
    };
    update();
    callback({ game, manifest, inventory, mediaPath, manifestPath, inventoryPath, update });
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

test('generated presentation is reproducible, with immutable graph and no unapproved media', () => {
  const expected = buildPresentation({ projectRoot: ROOT });
  assert.deepEqual(expected.assetIds, []);
  assert.equal(expected.blocked, 9, 'all nine art placements remain unadmitted and neutral');
  assert.match(expected.presentationSha256, /^[0-9a-f]{64}$/);
  assert.equal(expected.storySha256, canonicalTextSha256(readFileSync(join(ROOT, 'src/story.js'))));
  assert.deepEqual(presentationData, JSON.parse(readFileSync(join(ROOT, 'visuals/presentation.json'))));
  assert.deepEqual(JSON.parse(readFileSync(join(ROOT, 'narrative-assets.json'))), {
    schemaVersion: 1, storySha256: expected.storySha256, assets: {},
  });
  const allBeats = graphData.scenes.flatMap(scene => scene.beats);
  assert.equal(graphData.scenes.length, 606);
  assert.equal(allBeats.filter(beat => beat.type === 'dialogue').length, 2633);
  assert.equal(allBeats.filter(beat => beat.type === 'choice').length, 164);
  assert.deepEqual([...new Set(allBeats.filter(beat => beat.type === 'ending').map(beat => beat.endingId))].sort(),
    ['alice', 'damir-a', 'damir-b', 'eric-a', 'eric-b', 'nick-a', 'nick-b']);
});

test('every pilot cue and three seat branches has explicit neutral presentation', () => {
  const sourceMap = JSON.parse(readFileSync(join(ROOT, 'visuals/source-map.json')));
  assert.deepEqual(presentationData.media, {});
  for (const cue of [...sourceMap.entries, ...sourceMap.openingStages]) {
    assert.ok(beatById.has(cue.graphBeatId));
    const variants = presentationData.beats[cue.graphBeatId];
    assert.equal(variants.length, 1);
    assert.ok(variants[0].neutral?.reason, cue.graphBeatId);
    assert.equal(variants[0].background, undefined);
    assert.deepEqual(variants[0].when ?? null, cue.when ?? null);
  }
  for (const neutralBeat of sourceMap.neutralResets) {
    assert.ok(presentationData.beats[neutralBeat]?.[0].neutral?.reason);
  }
});

test('media require accepted, hash-matching, regular local flat assets with proof', () => {
  fixture(({ game, manifest, inventory, mediaPath, inventoryPath, update }) => {
    assert.doesNotThrow(() => buildPresentation({ projectRoot: game, write: true }));
    assert.deepEqual(buildPresentation({ projectRoot: game }).assetIds, ['fixture']);
    assert.equal(JSON.parse(readFileSync(join(game, 'narrative-assets.json'))).assets.fixture.sha256, hash(readFileSync(mediaPath)));
    inventory.entries.at(-1).status = 'candidate'; update();
    assert.throws(() => buildPresentation({ projectRoot: game }), /accepted|admission/i);
    inventory.entries.at(-1).status = 'accepted'; inventory.entries.at(-1).sha256 = '0'.repeat(64); update();
    assert.throws(() => buildPresentation({ projectRoot: game }), /hash|sha256/i);
    inventory.entries.at(-1).sha256 = hash(readFileSync(mediaPath)); update();
    manifest.media.fixture.src = 'https://example.invalid/pic.webp'; update();
    assert.throws(() => buildPresentation({ projectRoot: game }), /path|src|unsafe/i);
    manifest.media.fixture.src = 'assets/vis-fixture.webp'; update();
    inventory.entries.pop(); update();
    assert.throws(() => buildPresentation({ projectRoot: game }), /accepted|admission/i);
    inventory.entries.push({ id: 'fixture', status: 'accepted', admittedPath: 'assets/vis-fixture.webp', sha256: hash(readFileSync(mediaPath)) }); update();
    rmSync(mediaPath);
    symlinkSync(join(game, 'src/story.js'), mediaPath);
    assert.throws(() => buildPresentation({ projectRoot: game }), /symlink|regular/i);
  });
});
