import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { graphData } from '../game-studio/src/story.js';
import { interactionBeats } from '../game-studio/src/original-interactive-beats.js';
import { presentationData } from '../game-studio/src/presentation.js';

/**
 * A green build is not full original-game fidelity. This regression records
 * the remaining work and prevents the restored source interactions and art
 * links from silently disappearing again. Decrease the ceilings when each
 * group is actually restored; never treat this check as release acceptance.
 */
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceMap = JSON.parse(readFileSync(join(root, 'game-studio/visuals/source-map.json'), 'utf8'));
const graphScenes = new Set(graphData.scenes.map(scene => scene.id));

const expectedExtraChoices = Object.entries(interactionBeats).flatMap(([sourceSceneId, beats]) =>
  beats.map((_, index) => ({
    originalId: `${sourceSceneId}-C${90 + index}`,
    ludorySceneId: `${sourceSceneId.toLowerCase()}-c${90 + index}`,
  })));
const missingExtraChoices = expectedExtraChoices.filter(x => !graphScenes.has(x.ludorySceneId));
const sourceVisuals = sourceMap.entries.filter(entry => entry.sourceArt);
const unresolvedArt = sourceVisuals.filter(entry => !entry.admittedMediaId);

test('original interactive choices have an explicit, non-regressing restoration inventory', () => {
  assert.equal(expectedExtraChoices.length, 96, 'pinned authored interaction source unexpectedly changed');
  assert.equal(new Set(expectedExtraChoices.map(x => x.originalId)).size, 96, 'original IDs are not unique');
  for (const id of ['s01-c90', 's01-c91', 's02-c90', 's02-c91']) {
    assert.ok(graphScenes.has(id), `previously restored authored choice ${id} missing`);
  }
  assert.ok(missingExtraChoices.length <= 92, 'previously restored extra choice was removed');
  for (const source of expectedExtraChoices.filter(x => graphScenes.has(x.ludorySceneId))) {
    const scene = graphData.scenes.find(scene => scene.id === source.ludorySceneId);
    assert.equal(scene.beats.at(-1)?.type, 'choice', `${source.originalId} silently lost its choice beat`);
    assert.equal(scene.beats.at(-1).choices.length, 2, `${source.originalId} option count changed`);
  }
  console.info(`ORIGINAL_GAME_FIDELITY_INCOMPLETE: restored=${96 - missingExtraChoices.length}/96 extra choices; still missing: ${missingExtraChoices.map(x => x.originalId).join(', ')}`);
});

test('authored visual cues have a non-regressing source-to-media inventory', () => {
  assert.equal(sourceMap.sourceCommit, '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c');
  assert.equal(sourceMap.entries.length, 91, 'pinned source cue inventory changed without review');
  assert.ok(unresolvedArt.length <= 16, 'previously admitted original art source was lost');
  for (const entry of sourceVisuals.filter(entry => entry.admittedMediaId)) {
    assert.ok(presentationData.media[entry.admittedMediaId], `${entry.sourceSceneId}/${entry.sourceCueId}: admitted media missing`);
  }
  console.info(`ORIGINAL_GAME_FIDELITY_INCOMPLETE: resolved=${sourceVisuals.length - unresolvedArt.length}/${sourceVisuals.length} source-art cues; still neutral: ${unresolvedArt.map(e => `${e.sourceSceneId}/${e.sourceCueId}`).join(', ')}`);
});

test('restored original scenic and CG artwork is byte-identical to pinned Git blobs', () => {
  for (const [sceneId, cueId, beatId, mediaId, file, sha256, gitBlob] of [
    ['S04', 'thingvellir-trail', 's04-intro-05', 's04-thingvellir-trail',
      'vis-s04-thingvellir-trail.webp', 'bd2dc9a7e5b74a92506a0da81ac8e81eec546d499f65e831c732f218b8c8b7a2', 'cc3fb0434a5365dc9a3981766211c13d695e0e1f'],
    ['S09', 'skogafoss-trail', 's09-intro-09', 's09-skogafoss-trail',
      'vis-s09-skogafoss-trail.webp', '277976da1aa259a9f50171811de31888d4651842047b6954bb9b9e44ffaf714b', '479fdc3a1c30c39ed9cc24b47c83945e2919a6c0'],
    ['S13','skaftafell-notebook','s13-intro-13','s13-skaftafell-travelers',
      'vis-s13-skaftafell-travelers.webp','c6883632633276f0882ad1c532dd659762e0917f95d485df6f11718c40d809c2','4de2c26229b02d40a07ef44d6c857cac953c24c9'],
    ['S15','jokulsarlon-lagoon','s15-intro-06','s15-jokulsarlon-lagoon',
      'vis-s15-jokulsarlon-lagoon.webp','0721cc3745cc93d3e44d04672130fab45b20bd5a843c7417a1853c270dfcd406','4bc84fbb304bdd94fe92b1818fa183479b7e5690'],
    ['S18','hofn-lighthouse','s18-intro-06','s18-hofn-harbour',
      'vis-s18-hofn-harbour.webp','e3da7e44e1407cbb615f46d1d541dfd581daed64429fe01249660344d70bab94','82e0162f4231d9627371f3083b0f6cc993c970ca'],
    ['S18','hofn-dance','s18-intro-36','s18-hofn-dance-lights',
      'vis-s18-hofn-dance-lights.webp','e30079bce0c42a8bc4c713c220e76901c1c7b343000b12f0f9fa2c4ae183ae39','2a5ec83de9d3682ae7b94c5159dc1f5d9aa606cd'],
    ['S18','hofn-walk-back','s18-intro-40','s18-hofn-harbour',
      'vis-s18-hofn-harbour.webp','e3da7e44e1407cbb615f46d1d541dfd581daed64429fe01249660344d70bab94','82e0162f4231d9627371f3083b0f6cc993c970ca'],
  ]) {
    const bytes = readFileSync(join(root, 'game-studio/assets', file));
    const actualSha = createHash('sha256').update(bytes).digest('hex');
    const actualGitBlob = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    assert.equal(actualSha, sha256, `${mediaId} content SHA-256 drift`);
    assert.equal(actualGitBlob, gitBlob, `${mediaId} differs from pinned original Git blob`);
    assert.equal(sourceMap.entries.find(e => e.sourceSceneId === sceneId && e.sourceCueId === cueId)?.admittedMediaId, mediaId);
    assert.equal(presentationData.media[mediaId].src, `assets/${file}`);
    const variant = presentationData.beats[beatId][0];
    assert.equal(variant.background ?? variant.cg?.mediaId, mediaId);
  }
});
