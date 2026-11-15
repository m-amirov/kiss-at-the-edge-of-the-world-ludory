import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { interactionBeats, interactionTargets } from '../game-studio/src/original-interactive-beats.js';
import { graphData } from '../game-studio/src/story.js';

const file = fileURLToPath(new URL('../docs/migration/original-choice-source-positions.json', import.meta.url));
const inventory = JSON.parse(readFileSync(file, 'utf8'));

test('all 96 original authored choice positions are pinned from the original reader', () => {
  assert.equal(inventory.schemaVersion, 1);
  assert.equal(inventory.sourceRepository, 'm-amirov/kiss-at-the-edge-of-the-world');
  assert.equal(inventory.sourceCommit, '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c');
  assert.equal(inventory.choicePositions.length, 96);
  assert.equal(new Set(inventory.choicePositions.map(i => i.originalChoiceId)).size, 96);
  const actualById = new Map(inventory.choicePositions.map(item => [item.originalChoiceId, item]));
  for (const [sceneId, choices] of Object.entries(interactionBeats)) {
    const current = inventory.choicePositions.filter(item => item.originalSceneId === sceneId);
    assert.equal(current.length, choices.length, sceneId + ': inconsistent source count');
    const sample = current[0];
    assert.equal(sample.originalEpisode > 0, true, sceneId + ': no original episode');
    assert.equal(sample.canonicalAReadParagraphCount >= 1, true);
    const sourceTargets = interactionTargets(
      { id: sceneId, episode: sample.originalEpisode },
      sample.canonicalAReadParagraphCount
    );
    for (let i = 0; i < choices.length; i++) {
      const sourceId = sceneId + '-C' + (90 + i);
      const item = actualById.get(sourceId);
      assert.ok(item, 'Missing source placement ' + sourceId);
      assert.equal(item.insertAfterParagraph, sourceTargets[i], sourceId + ': drifted source paragraph index');
      assert.equal(item.existingLudorySceneId, sceneId.toLowerCase() + '-c' + (90 + i));
    }
  }
  const ids = new Set(graphData.scenes.map(scene => scene.id));
  const restored = inventory.choicePositions.filter(item => ids.has(item.existingLudorySceneId));
  const missing = inventory.choicePositions.filter(item => !ids.has(item.existingLudorySceneId));
  assert.ok(restored.length >= 26, 'Previously restored authored choices regressed');
  // Runtime paragraph-level insertions are NOT currently implemented. This
  // inventory deliberately does not treat scene-boundary choice nodes as parity.
  console.info('ORIGINAL_PACING_PARITY_PENDING: source-defined=' +
    inventory.choicePositions.length + '; playable-nodes=' + restored.length +
    '; missing-nodes=' + missing.length + '; restored-at-scene-boundaries=' + restored.length);
});

test('pinned early placements explicitly record the original S10/S11 timing', () => {
  const byId = new Map(inventory.choicePositions.map(item => [item.originalChoiceId, item]));
  assert.equal(byId.get('S10-C90').insertAfterParagraph, 15);
  assert.equal(byId.get('S10-C91').insertAfterParagraph, 31);
  assert.equal(byId.get('S11-C90').insertAfterParagraph, 12);
  assert.equal(byId.get('S11-C91').insertAfterParagraph, 24);
  assert.equal(byId.get('S48-C90').insertAfterParagraph, 2);
});
