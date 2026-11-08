import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const game = resolve(new URL('../game/', import.meta.url).pathname);
const managed = ['src/main.js', 'src/entry.js', 'index.html', 'assets/ludory-narrative.js'];
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');

test('M4 author migration never modifies managed Studio files or enables the economy', () => {
  const components = JSON.parse(readFileSync(join(game, 'ludory.components.json')));
  const authored = ['src/story.js', 'narrative-assets.json'];
  for (const path of managed) {
    assert.equal(hash(join(game, path)), components.files[path], `Studio-managed file mutated: ${path}`);
    assert.ok(!components.authorFiles.includes(path));
  }
  for (const path of authored) assert.ok(components.authorFiles.includes(path));
  const project = JSON.parse(readFileSync(join(game, 'ludory.project.json')));
  assert.deepEqual(project.targets, ['yandex-games', 'vk-games']);
  assert.doesNotMatch(readFileSync(join(game, 'src/story.js'), 'utf8'), /premiumManifest|economyData|walletBalance/);
});

test('Studio owner registry gate is explicitly unresolved; no component update is claimed', t => {
  const cli = resolve(new URL('../../ludory/.worktrees/m4-native-presentation/packages/studio/bin/ludory.mjs', import.meta.url).pathname);
  // This integration probe runs only when the sibling Ludory checkout exists.
  // A project CI without the checkout should retain the explicit review gate.
  if (!existsSync(cli)) return t.skip('Ludory M4A local checkout is unavailable; component adoption gate remains open');
  const probe = spawnSync(process.execPath, [cli, 'components', 'update', '--project', game, '--json'], { encoding: 'utf8', timeout: 15000 });
  assert.equal(probe.error, undefined);
  assert.equal(probe.status, 2, probe.stderr);
  const result = JSON.parse(probe.stdout);
  assert.equal(result.mode, 'component-update');
  assert.equal(result.status, 'BLOCKED');
  assert.deepEqual(result.writes, []);
  assert.ok(result.conflicts.some(value => value.includes('no registered Studio ownership')));
});

// Fresh Studio v1.2.3 adoption is covered separately by m4-fresh-studio.test.mjs.
// This file keeps the legacy game's intentional BLOCKED gate as a regression check.
