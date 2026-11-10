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

test('fresh Studio game is independently owned and consumes native presentation', () => {
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
  assert.equal(textSha(join(studio, 'src/story.js')), textSha(join(original, 'src/story.js')), 'ported narrative must remain unchanged');
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
  const admitted = readdirSync(join(studio, 'assets')).filter(name => /^vis-.*\.png$/i.test(name)).sort();
  assert.equal(admitted.length, 60);
  assert.ok(existsSync(join(studio, 'assets/branding/kiss-at-the-edge-icon.png')));
  assert.ok(admitted.includes('vis-s02-roadside-cafe.png'));
  assert.ok(admitted.includes('vis-s03-guesthouse-morning.png'));
  assert.ok(admitted.includes('vis-s03-damir.png'));
  assert.equal(Object.keys(manifest.assets).length, 60);
  assert.deepEqual(Object.keys(authored.media).sort(), Object.keys(manifest.assets).sort());
  for (const demo of ['lighthouse.svg', 'shoreline.svg']) {
    assert.equal(existsSync(join(studio, 'assets', demo)), false, `unreferenced starter artwork must be excluded: ${demo}`);
  }
});
