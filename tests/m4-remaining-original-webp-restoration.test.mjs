import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { presentationData } from '../game-studio/src/presentation.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceMap = JSON.parse(readFileSync(join(root, 'game-studio/visuals/source-map.json'), 'utf8'));
const inventory = JSON.parse(readFileSync(join(root, 'docs/migration/m4-assets-inventory.json'), 'utf8'));
const sha256 = b => createHash('sha256').update(b).digest('hex');
const blobSha = b => createHash('sha1').update(Buffer.from('blob '+b.length+String.fromCharCode(0))).update(b).digest('hex');

test('15 byte-identical original WebP files cover the remaining 16 source-art cues', () => {
  const expected = [
    ['s29-nick-playback','6de857f94b82cfca1ded40a9ea859b59ffe66408b734d7d97105b50e4a1b3d1b','39aa5eff8acc4282dadcd23f72afb24b2efdefbf'],
    ['s52-glove-found','62baca9c9dea6701fd442f19530461da65eef798e61665a29367f6c29bc4c6a5','874f57dee70ea78a093714059044c7e9dd9bee65'],
    ['s30-damir-sleeve-promise-original','93ba01e53165a74f7b1f67c50de7d2a7435c29058f8936700302486c1d3011b5','10e4ed4f1347cea34af1606dfd2a9a89daf64674'],
    ['s55-shum-first-step-original','24063b015131a27b345da15398f91b79e5ff2ee2790f218d3ec604411a81ae96','72ff558612b3f10f014a0930d7a89de86e92887d'],
    ['s31-alice-independent-evening','b6e79093d164c19aa7333aff81589d9ef50da26a1fa64887f379938586d0c7c2','1437be5ceb99500290432d7fd61d6fad1bc83820'],
    ['s62-alice-bookstore-choice','ff691e7bc432581d79aa572ad8623d3ddf37fc45775e5544f1ff6052dfcd2d04','6080abd10b649683309157f7fad2a26a536288aa'],
    ['s34-cancelled-evening','7a3a2182aed85797e45d3268e590a88e7485017714cfdc38e5ef8f2fe1ee184b','cea69e840f3d8c454a8504a1733313727c43b7c6'],
    ['s56-cafe-musicians','50b6d978cdecba97e5bedc2badc6e635d38968065b325c5b5c79beb9c3fad590','462e218ccec9cc0c12146f0bcf40b64ed3d1bbb7'],
    ['s63-alice-solo-concert','215afee53da5ff0fe1f9f4ccb2bdb3cc43449cec2dfee1a32f33126efb69660e','d24ec70cf71df2ff65ea87504cc84b2940829ede'],
    ['s37-eric-alice-cafe','8e067e89e6123bfb1749e7eb9822bbdd1ed4ffe0adc07dd17aaec73ed9c5a92c','f8d0a01d41668f28ea4d011c7b4693b8363799d1'],
    ['s36-snaefellsnes-drive','6949555cabd32c01bb5c8e9ea9f87ee5e0bc5fc94b2b05589ca817bd50e102ce','2f0dfb57939555814af0c8fd8aada55d43105e3f'],
    ['s44-reykjavik-harbour','7737a290f8acf0240fb44520f75a6946769c937915683ac13bded53b7793b79b','d45b97da6e4629e4c4b4daccccf6f84e42710f8b'],
    ['s45-nick-film-final','db1ac7683a73ae5acde33794d1635bad765ee5bc0c27114932972781cdedd89a','c15ae1e3b95a0cb3c6ebc96a50336863cf6c3160'],
    ['s46-airport-checkin','a22c08fb0160ffd0ef53ab3b88b73e935e89e98d729873bc67147554f3d7e26b','d3def9c31ef12a0e5fec9000239fbfbcc3513992'],
    ['s47-alice-morning-harbour','2af4cb5965b5c804f5e442141b29d9e9941ecfce17dc68c3838949d065592bc4','b59147b2bc7f0969b3c63df016957931d2526e28'],
  ];
  assert.equal(expected.length, 15);
  for (const [mediaId, expectedSha, expectedGitBlob] of expected) {
    const media = presentationData.media[mediaId];
    assert.ok(media, mediaId + ': missing native presentation media');
    assert.ok(media.src.endsWith('.webp'), mediaId + ': original source format changed');
    const bytes = readFileSync(join(root, 'game-studio', media.src));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', mediaId);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', mediaId);
    assert.equal(sha256(bytes), expectedSha, mediaId + ': SHA-256 drift');
    assert.equal(blobSha(bytes), expectedGitBlob, mediaId + ': original Git blob drift');
    const entry = inventory.entries.find(item => item.id === mediaId);
    assert.equal(entry?.sourceBlobSha, expectedGitBlob, mediaId);
    assert.equal(entry?.admissionEvidence?.sourceCommit, '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c');
    assert.equal(entry?.licenseEvidence, null, 'rights approval must not be fabricated');
  }
  const restoredCues = sourceMap.entries.filter(item => expected.some(([id]) => item.admittedMediaId === id));
  assert.equal(restoredCues.length, 16);
  for (const cue of restoredCues) {
    const variants = presentationData.beats[cue.graphBeatId];
    assert.ok(variants?.some(variant => variant.background === cue.admittedMediaId || variant.cg?.mediaId === cue.admittedMediaId), cue.graphBeatId + ': original cue not shown');
  }
  assert.equal(sourceMap.entries.filter(item => item.sourceArt && !item.admittedMediaId).length, 0);
  assert.deepEqual(presentationData.beats['s56-active-01'][0].when, { flag: 's34-status-active' });
  assert.deepEqual(presentationData.beats['s56-paused-01'][0].when, { flag: 's34-status-paused' });
});
