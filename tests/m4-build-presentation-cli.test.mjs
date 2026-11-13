import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (...args) => execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' });

test('presentation checker accepts an explicit Studio project and keeps legacy default', () => {
  const studio = run('tools/m4-build-presentation.mjs', '--check', '--project', 'game-studio');
  assert.match(studio, /"assetIds"/);
  const legacy = run('tools/m4-build-presentation.mjs', '--check');
  assert.match(legacy, /"assetIds"/);
});
