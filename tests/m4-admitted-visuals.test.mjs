import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { graphData } from '../game-studio/src/story.js';
import { buildPresentation } from '../tools/m4-build-presentation.mjs';

const studio = new URL('../game-studio/', import.meta.url).pathname;
const original = new URL('../game/', import.meta.url).pathname;
const inventory = new URL('../docs/migration/m4-assets-inventory.json', import.meta.url).pathname;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => JSON.parse(readFileSync(path, 'utf8'));

const admitted = [
  {
    id: 's02-roadside-cafe', mediaId: 'roadside-cafe', path: 'assets/vis-s02-roadside-cafe.png',
    sha256: 'f6d2adc4a65d2b30e9eb86203e34a848cc79c69a206a9f81a5a6c9b823bb1c13',
  },
  {
    id: 's03-reykjavik-guesthouse-morning', mediaId: 'guesthouse-morning', path: 'assets/vis-s03-guesthouse-morning.png',
    sha256: '2ca12077112219ffbc9dfd916f504574ee624c2504a3a3c3fad90e741d3ed4bd',
  },
  {
    id: 's03-editor-call-damir', mediaId: 'damir-coffee-cg', path: 'assets/vis-s03-damir.png',
    sha256: 'aea38cdcffafe5233e8e6d3d93ad5618e41ab94addae40c0a143325a9b80561a',
  },
];

test('studio admits exactly three pinned project images with byte-identical proof', () => {
  const entries = read(inventory).entries;
  const proof = read(join(studio, 'narrative-assets.json'));
  const presentation = read(join(studio, 'visuals/presentation.json'));
  for (const asset of admitted) {
    const entry = entries.find(item => item.id === asset.id);
    assert.equal(entry.status, 'accepted', `${asset.id}: admission missing`);
    assert.equal(entry.admittedPath, asset.path);
    assert.equal(entry.sha256, asset.sha256);
    assert.equal(hash(readFileSync(join(studio, asset.path))), asset.sha256);
    assert.equal(presentation.media[asset.mediaId].src, asset.path);
    assert.equal(proof.assets[asset.mediaId].sha256, asset.sha256);
  }
  assert.deepEqual(Object.keys(presentation.media).sort(), admitted.map(a => a.mediaId).sort());
  assert.deepEqual(Object.keys(proof.assets).sort(), admitted.map(a => a.mediaId).sort());
  assert.deepEqual(buildPresentation({ projectRoot: studio }).assetIds.sort(), admitted.map(a => a.mediaId).sort());
  assert.deepEqual(buildPresentation({ projectRoot: original }).assetIds, [], 'legacy game remains unchanged');
});

test('S02 café and S03 guesthouse/CG continue across their authored contiguous beats', () => {
  const manifest = read(join(studio, 'visuals/presentation.json'));
  const map = read(join(studio, 'visuals/source-map.json'));
  const beats = scene => graphData.scenes.find(entry => entry.id === scene).beats.map(beat => beat.id);
  for (const beatId of [...beats('s02-road').slice(31), ...['s02-people', 's02-place', 's02-own-choice'].flatMap(beats)]) {
    assert.equal(manifest.beats[beatId]?.[0].background, 'roadside-cafe', beatId);
  }
  for (const beatId of [...beats('s03-editorial'), ...['s03-career-people', 's03-career-place', 's03-career-own'].flatMap(beats)]) {
    assert.equal(manifest.beats[beatId]?.[0].background, 'guesthouse-morning', beatId);
  }
  for (const beatId of [...beats('s03-coffee'), ...['s03-seat-damir', 's03-seat-other'].flatMap(beats)]) {
    assert.deepEqual(manifest.beats[beatId]?.[0].cg, { mediaId: 'damir-coffee-cg', mode: 'replace-stage' }, beatId);
  }
  assert.ok(manifest.beats['s02-road-01'][0].neutral, 'unverified road art stays neutral');
  assert.ok(manifest.beats['s01-airport-01'][0].neutral, 'unverified airport art stays neutral');
  for (const [cueId, mediaId] of [['roadside-cafe', 'roadside-cafe'], ['editor-call', 'guesthouse-morning'], ['damir-enters', 'damir-coffee-cg']]) {
    assert.equal(map.entries.find(entry => entry.sourceCueId === cueId).admittedMediaId, mediaId);
  }
});
