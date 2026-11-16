import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { graphData } from '../game-studio/src/story.js';
import { buildPresentation } from '../tools/m4-build-presentation.mjs';

const studio = fileURLToPath(new URL('../game-studio/', import.meta.url));
const original = fileURLToPath(new URL('../game/', import.meta.url));
const inventory = fileURLToPath(new URL('../docs/migration/m4-assets-inventory.json', import.meta.url));
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

test('studio admits all 83 game images with byte-identical proof', () => {
  const entries = read(inventory).entries;
  const proof = read(join(studio, 'narrative-assets.json'));
  const presentation = read(join(studio, 'visuals/presentation.json'));
  const storyEntries = entries.filter(entry => entry.status === 'accepted' && entry.admittedProject === 'game-studio' && entry.role !== 'branding');
  const mediaId = entry => ({
    's02-roadside-cafe': 'roadside-cafe',
    's03-reykjavik-guesthouse-morning': 'guesthouse-morning',
    's03-editor-call-damir': 'damir-coffee-cg',
    's13-skaftafell-travelers-original': 's13-skaftafell-travelers',
    's18-hofn-dance-lights-original': 's18-hofn-dance-lights',
  }[entry.id] ?? entry.id);
  assert.equal(storyEntries.length, 83);
  for (const entry of storyEntries) {
    const id = mediaId(entry);
    assert.equal(entry.status, 'accepted', `${entry.id}: admission missing`);
    assert.equal(hash(readFileSync(join(studio, entry.admittedPath))), entry.sha256);
    assert.equal(presentation.media[id].src, entry.admittedPath);
    assert.equal(proof.assets[id].sha256, entry.sha256);
  }
  assert.deepEqual(Object.keys(presentation.media).sort(), storyEntries.map(mediaId).sort());
  assert.deepEqual(Object.keys(proof.assets).sort(), storyEntries.map(mediaId).sort());
  assert.deepEqual(buildPresentation({ projectRoot: studio }).assetIds.sort(), storyEntries.map(mediaId).sort());
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
  assert.equal(manifest.beats['s02-road-01'][0].background, 's01-road-trip-van-interior', 'original car art must load');
  assert.equal(manifest.beats['s01-airport-01'][0].background, 's01-airport-arrivals', 'original airport art must load');
  for (const [cueId, mediaId] of [['roadside-cafe', 'roadside-cafe'], ['editor-call', 'guesthouse-morning'], ['damir-enters', 'damir-coffee-cg']]) {
    assert.equal(map.entries.find(entry => entry.sourceCueId === cueId).admittedMediaId, mediaId);
  }
});

test('original opening WebP assets are byte-identical pinned source blobs and persist through S01/S02', () => {
  const p = read(join(studio, 'visuals/presentation.json'));
  const inventory = read(join(studio, '../docs/migration/m4-assets-inventory.json'));
  for (const [id, src, expectedSha, expectedBlob] of [
    ['s01-airport-arrivals', 'assets/vis-s01-airport-arrivals.webp',
      '1e0a93cba2ce8715296c5262a39a464fc9de8ed31479b060d43eff7c1a5aeb5a',
      '8e1b5fd336808ecce16f6958b64c84ac195744c2'],
    ['s01-road-trip-van-interior', 'assets/vis-s01-road-trip-van-interior.webp',
      '84cf38930c45d7cadb49dc0f64ad0eb7fbbf256a2e61a11e27ee1b323e646dcd',
      '7053040d378ddc3bff62966ca5397854421c7b8a'],
  ]) {
    const bytes = readFileSync(join(studio, src));
    const gitHash = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    assert.equal(hash(bytes), expectedSha, `${id}: source WebP pixels/bits changed`);
    assert.equal(gitHash, expectedBlob, `${id}: differs from pinned original Git blob`);
    assert.equal(p.media[id].src, src);
    assert.equal(inventory.entries.find(x => x.id === id).sha256, expectedSha);
  }
  for (let i = 1; i <= 39; i++) {
    assert.equal(p.beats[`s01-airport-${String(i).padStart(2,'0')}`][0].background, 's01-airport-arrivals');
  }
  assert.equal(p.beats['s01-seat-choice'][0].background, 's01-airport-arrivals');
  for (const prefix of ['s01-eric', 's01-nick', 's01-damir', 's01-common']) {
    assert.equal(p.beats[`${prefix}-01`][0].background, 's01-road-trip-van-interior');
  }
  for (let i = 1; i <= 31; i++) {
    assert.equal(p.beats[`s02-road-${String(i).padStart(2,'0')}`][0].background, 's01-road-trip-van-interior');
  }
  assert.equal(p.beats['s02-road-32'][0].background, 'roadside-cafe', 'S02 café must replace the car image');
});
