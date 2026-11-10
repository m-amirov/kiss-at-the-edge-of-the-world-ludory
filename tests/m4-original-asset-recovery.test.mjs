import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { presentationData } from '../game-studio/src/presentation.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const studio = join(root, 'game-studio');
const inventory = JSON.parse(readFileSync(join(root, 'docs/migration/m4-assets-inventory.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitBlobSha = bytes => createHash('sha1').update(Buffer.concat([
  Buffer.from(`blob ${bytes.length}\0`), bytes,
])).digest('hex');

const restoredIds = [
  'kiss-at-the-edge-icon',
  's05-hveragerdi-road', 's06-hveragerdi-eric-alice', 's06-hveragerdi-geothermal-day',
  's07-kitchen-cards', 's07-kitchen-pasta', 's08-guesthouse-strap',
  's09-guesthouse-to-skogafoss-morning', 's10-vik-guesthouse-arrival', 's10-vik-road-song',
  's12-vik-cafe-damir', 's12-vik-street-day', 's13-skaftafell-visitor-parking',
  's14-lagoon-road', 's14-skaftafell-pace', 's15-jokulsarlon-parking-day',
  's16-guesthouse-help', 's16-kitchen-soup', 's17-hofn-guesthouse',
  's18-hofn-breakfast-group', 's18-hofn-breakfast-morning', 's18-hofn-room-morning',
  's19-hofn-pool', 's20-hofn-damir-kitchen', 's21-alice-hofn-room',
  's23-eric-harbor-plan', 's24-nick-pier-consent', 's25-damir-clarity-talk',
  's26-alice-choice', 's26-damir-choice', 's26-eastfjords-courtyard-group',
  's26-eastfjords-guesthouse-courtyard', 's26-eric-choice', 's26-nick-choice',
  's27-egilsstadir-boardwalk', 's28-hverfjall-hood', 's32-eric-calendar-crossroads',
  's33-nick-teaser-reveal', 's37-snaefellsnes-guesthouse-day', 's38-alice-nick-ordinary-day',
  's39-alice-damir-cafe', 's39-alice-damir-cafe-walk', 's40-alice-laptop-window',
  's40-alice-room-laptop-window', 's44-eric-epilogue-month-later',
  's45-nick-home-epilogue-month-later', 's46-airport-bus-day',
  's46-damir-epilogue-month-later', 's47-alice-home-epilogue-month-later',
  's48-guesthouse-exit-group', 's48-guesthouse-exit-morning',
  's49-reykjahlid-window-dance', 's52-hofn-streets-post-workshop',
  's53-nick-no-camera-pool', 's54-alice-nick-karaoke', 's61-hofn-streets',
  's64-alice-snaefellsnes-trail', 's66-hveragerdi-greenhouse',
];

const mediaBySource = new Map(Object.entries(presentationData.media).map(([id, media]) => [media.src, { id, media }]));

function pngSize(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('all 58 provenance-matched candidates are admitted as original PNG bytes', () => {
  const byId = new Map(inventory.entries.map(entry => [entry.id, entry]));
  assert.equal(inventory.sourceCommit, '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c');
  assert.equal(restoredIds.length, 58);
  assert.equal(inventory.entries.filter(entry => entry.status === 'accepted').length, 63);
  assert.equal(inventory.entries.filter(entry => entry.status === 'candidate').length, 0);
  assert.equal(inventory.entries.filter(entry => entry.status === 'blocked').length, 60);

  for (const id of restoredIds) {
    const entry = byId.get(id);
    assert.equal(entry?.status, 'accepted', `${id}: not admitted`);
    assert.ok(entry.licenseEvidence?.license, `${id}: rights proof missing`);
    assert.equal(entry.licenseEvidence?.sha256?.toLowerCase(), entry.sha256, `${id}: rights hash mismatch`);
    assert.ok(entry.admissionEvidence?.sourceBlobSha, `${id}: source blob evidence missing`);
    const relative = id === 'kiss-at-the-edge-icon' ? 'assets/branding/kiss-at-the-edge-icon.png' : `assets/vis-${id}.png`;
    assert.equal(entry.admittedPath, relative, `${id}: unexpected admitted path`);
    const file = join(studio, relative);
    assert.ok(existsSync(file), `${id}: admitted file missing`);
    const bytes = readFileSync(file);
    assert.equal(sha256(bytes), entry.sha256, `${id}: SHA-256 changed`);
    assert.equal(gitBlobSha(bytes), entry.sourceBlobSha, `${id}: Git blob changed`);
    const size = pngSize(bytes);
    if (id === 'kiss-at-the-edge-icon') assert.deepEqual(size, { width: 512, height: 512 });
    else assert.ok(size.width >= 1600 && size.height >= 800, `${id}: source resolution reduced`);
  }
});

test('presentation contains every admitted story image and keeps authored route boundaries', () => {
  const byId = new Map(inventory.entries.map(entry => [entry.id, entry]));
  const admittedStory = [...byId.values()].filter(entry => entry.status === 'accepted' && entry.admittedProject === 'game-studio' && entry.role !== 'branding');
  assert.equal(admittedStory.length, 60);
  assert.equal(Object.keys(presentationData.media).length, 60);
  for (const entry of admittedStory) {
    const match = mediaBySource.get(entry.admittedPath);
    assert.ok(match, `${entry.id}: missing presentation media`);
    assert.equal(match.media.src, entry.admittedPath);
  }

  const beat = id => presentationData.beats[id]?.[0];
  assert.equal(beat('s07-common-a-01').cg.mediaId, 's07-kitchen-pasta');
  assert.equal(beat('s07-common-a-43').cg.mediaId, 's07-kitchen-cards');
  assert.equal(beat('s18-common-02').background, 's18-hofn-room-morning');
  assert.equal(beat('s18-common-04').cg.mediaId, 's18-hofn-breakfast-group');
  assert.equal(beat('s26-intro-03').cg.mediaId, 's26-eastfjords-courtyard-group');
  for (const [scene, mediaId] of [
    ['s26-choice-eric-01', 's26-eric-choice'],
    ['s26-choice-nick-01', 's26-nick-choice'],
    ['s26-choice-damir-01', 's26-damir-choice'],
    ['s26-choice-alice-01', 's26-alice-choice'],
  ]) {
    assert.equal(beat(scene).cg.mediaId, mediaId);
    assert.deepEqual(beat(scene).when, { routeIntent: mediaId.replace('s26-', '').replace('-choice', '') });
  }
  assert.equal(beat('s39-paused-01').cg.mediaId, 's39-alice-damir-cafe');
  assert.equal(beat('s39-active-01').cg.mediaId, 's39-alice-damir-cafe');
  assert.equal(beat('s39-common-01').background, 's39-alice-damir-cafe-walk');
  assert.equal(beat('s44-common-01').cg.mediaId, 's44-eric-epilogue-month-later');
  assert.equal(beat('s45-common-01').cg.mediaId, 's45-nick-home-epilogue-month-later');
  assert.equal(beat('s46-common-01').cg.mediaId, 's46-damir-epilogue-month-later');
  assert.equal(beat('s47-common-01').cg.mediaId, 's47-alice-home-epilogue-month-later');
  assert.equal(beat('s48-common-01').background, 's48-guesthouse-exit-morning');
  assert.equal(beat('s48-common-01').cg.mediaId, 's48-guesthouse-exit-group');
});

test('original icon is wired through the author-owned UI adapter', () => {
  const adapter = readFileSync(join(studio, 'src/ui/original-game-ui.js'), 'utf8');
  assert.match(adapter, /kiss-at-the-edge-icon\.png/);
  assert.equal(byIconPath(), 'assets/branding/kiss-at-the-edge-icon.png');
});

function byIconPath() {
  return inventory.entries.find(entry => entry.id === 'kiss-at-the-edge-icon')?.admittedPath;
}
