import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const original = join(repoRoot, 'game');
const studio = join(repoRoot, 'game-studio');
const textSha = file => createHash('sha256')
  .update(readFileSync(file, 'utf8').replace(/\r\n?/g, '\n'))
  .digest('hex');

test('fresh Studio game is independently owned and consumes native presentation', async () => {
  assert.ok(existsSync(join(studio, 'ludory.components.json')), 'new Studio project not created');
  const ownership = JSON.parse(readFileSync(join(studio, 'ludory.components.json')));
  const project = JSON.parse(readFileSync(join(studio, 'ludory.project.json')));
  assert.equal(ownership.schemaVersion, 2);
  assert.equal(ownership.template.id, 'narrative-interactive');
  assert.equal(ownership.template.version, '1.2.5');
  assert.equal(project.id, 'kiss-at-the-edge-of-the-world');
  assert.deepEqual(project.targets, ['yandex-games', 'vk-games']);
  assert.ok(ownership.authorFiles.includes('src/story.js'));
  assert.ok(ownership.authorFiles.includes('narrative-assets.json'));
  const main = readFileSync(join(studio, 'src/main.js'), 'utf8');
  assert.match(main, /defineNarrativePresentation/);
  assert.match(main, /Reflect\.get\(story, 'presentationData'\)/);
  assert.doesNotMatch(main, /defineEconomy|premiumChoice/);
  // Author-owned extensions are allowed, but the entire original graph's
  // authored beats, prose, conditions and branch effects must remain identical.
  // Redirects cover documented original C90/C91 compatibility chains, not rewritten canonical beats.
  const { graphData: baseline } = await import('../game/src/story.js');
  const { graphData: restored } = await import('../game-studio/src/story.js');
  const revised = new Map(restored.scenes.map(scene => [scene.id, scene]));
  for (const originalScene of baseline.scenes) {
    const current = revised.get(originalScene.id);
    assert.ok(current, `missing original scene: ${originalScene.id}`);
    assert.deepEqual(current.beats, originalScene.beats, `canonical beat changed: ${originalScene.id}`);
    const redirectedTransitions = {
      's01-common': 's01-c90',
      's02-common': 's02-c90',
      's65-guesthouse': 's65-c90',
      's03-message': 's03-c90',
      's03-silence': 's03-c90',
      's04-after-message': 's04-c90',
      's04-after-silence': 's04-c90',
      's05-common': 's05-c90',
      's06-favorite-place': 's06-c90',
      's06-music': 's06-c90',
      's07-eric-favorite': 's07-c90',
      's07-eric-music': 's07-c90',
      's08-warm': 's08-c90',
      's08-neutral': 's08-c90',
      's08-personal': 's08-c90',
      's66-common-b': 's66-c90',
      's09-common-b': 's09-c90',
      's10-common': 's10-c90',
      's11-common-b': 's11-c90',
      's12-return-chocolate': 's12-c90',
      's12-return-alone': 's12-c90',
      's13-return-chocolate': 's13-c90',
      's13-return-alone': 's13-c90',
      's14-gesture-walk': 's14-c90',
      's14-gesture-photo': 's14-c90',
      's15-evening-walk': 's15-c90',
      's15-evening-photo': 's15-c90',
      's16-common': 's16-c90',
      's17-group-a': 's17-c90',
      's17-group-b': 's17-c90',
      's17-group-c': 's17-c90',
      's17-group-d': 's17-c90',
      's22-intro': 's22-s17-c90-echo-dispatch',
      's18-postcards': 's18-c90',
      's18-song': 's18-c90',
      's19-camera-free': 's19-c90',
      's19-breakfast': 's19-c90',
      's20-breakfast': 's20-c90',
      's20-waterfront': 's20-c90',
      's21-friend': 's21-c90',
      's21-bookstore': 's21-c90',
      's61-friend': 's61-c90',
      's61-bookstore': 's61-c90',
      's60-common': 's41-c90-echo-route',
    };
    assert.equal(current.nextSceneId,
      redirectedTransitions[originalScene.id] ?? originalScene.nextSceneId,
      `unexpected canonical transition: ${originalScene.id}`);
  }
  assert.equal(revised.size, baseline.scenes.length + 159, 'expected only documented original authored choices and delayed echoes');
  for (const file of ['src/presentation.js', 'visuals/presentation.json', 'visuals/source-map.json', 'narrative-assets.json']) {
    assert.equal(ownership.files[file], undefined, `visual migration must not alter a managed component: ${file}`);
  }
  for (const scene of ['s02.js', 's03.js', 's17.js', 's48.js']) {
    assert.equal(textSha(join(studio, `src/scenes/${scene}`)), textSha(join(original, `src/scenes/${scene}`)));
  }
});

test('fresh Studio game contains all approved visuals, with canonical proof', () => {
  const manifest = JSON.parse(readFileSync(join(studio, 'narrative-assets.json')));
  const authored = JSON.parse(readFileSync(join(studio, 'visuals/presentation.json')));
  assert.equal(manifest.storySha256, textSha(join(studio, 'src/story.js')));
  const admitted = readdirSync(join(studio, 'assets'))
    .filter(name => /^vis-.*\.png$/i.test(name) && !/-portrait(?:-v2)?\.png$/i.test(name))
    .sort();
  assert.equal(admitted.length, 60);
  assert.ok(existsSync(join(studio, 'assets/branding/kiss-at-the-edge-icon.png')));
  assert.ok(admitted.includes('vis-s02-roadside-cafe.png'));
  assert.ok(admitted.includes('vis-s03-guesthouse-morning.png'));
  assert.ok(admitted.includes('vis-s03-damir.png'));
  assert.equal(Object.keys(manifest.assets).length, 83);
  assert.ok(existsSync(join(studio, 'assets/vis-s01-airport-arrivals.webp')));
  assert.ok(existsSync(join(studio, 'assets/vis-s01-road-trip-van-interior.webp')));
  assert.deepEqual(Object.keys(authored.media).sort(), Object.keys(manifest.assets).sort());
  for (const demo of ['lighthouse.svg', 'shoreline.svg']) {
    assert.equal(existsSync(join(studio, 'assets', demo)), false, `unreferenced starter artwork must be excluded: ${demo}`);
  }
});
