import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  assert.ok(graphScenes.has('s01-c90') && graphScenes.has('s01-c91'), 'first restored pilot choices missing');
  assert.ok(missingExtraChoices.length <= 94, 'previously restored extra choice was removed');
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
  assert.ok(unresolvedArt.length <= 23, 'previously admitted original art source was lost');
  for (const entry of sourceVisuals.filter(entry => entry.admittedMediaId)) {
    assert.ok(presentationData.media[entry.admittedMediaId], `${entry.sourceSceneId}/${entry.sourceCueId}: admitted media missing`);
  }
  console.info(`ORIGINAL_GAME_FIDELITY_INCOMPLETE: resolved=${sourceVisuals.length - unresolvedArt.length}/${sourceVisuals.length} source-art cues; still neutral: ${unresolvedArt.map(e => `${e.sourceSceneId}/${e.sourceCueId}`).join(', ')}`);
});
