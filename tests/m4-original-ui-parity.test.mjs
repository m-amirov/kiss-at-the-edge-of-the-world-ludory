import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildPresentation } from '../tools/m4-build-presentation.mjs';

const game = new URL('../game-studio/', import.meta.url);

test('game installs original UI from author-owned presentation without changing native Studio shell', async () => {
  const index = await readFile(new URL('index.html', game), 'utf8');
  const entry = await readFile(new URL('src/entry.js', game), 'utf8');
  const presentation = await readFile(new URL('src/presentation.js', game), 'utf8');
  const adapter = await readFile(new URL('src/ui/original-game-ui.js', game), 'utf8');
  const registry = JSON.parse(await readFile(new URL('ludory.components.json', game), 'utf8'));
  const digest = content => createHash('sha256').update(content).digest('hex');
  assert.equal(digest(index), registry.files['index.html']);
  assert.equal(digest(entry), registry.files['src/entry.js']);
  assert.match(index, /<header(?:\s|>)/);
  assert.match(presentation, /import '\.\/ui\/original-game-ui\.js';/);
  assert.match(adapter, /new URL\('\.\/original-game\.css', import\.meta\.url\)/);
  assert.match(index, /id="game"/);
  assert.match(index, /id="status"/);
  assert.doesNotThrow(() => buildPresentation({ projectRoot: new URL('.', game).pathname }));
});

test('authored presentation stylesheet defines a viewport-filling scene and bottom dialogue overlay', async () => {
  const css = await readFile(new URL('src/ui/original-game.css', game), 'utf8');
  assert.match(css, /#game \.ludory-narrative\s*\{/);
  assert.match(css, /#game \.ludory-narrative__stage\s*\{/);
  assert.match(css, /#game \.ludory-narrative__panel\s*\{/);
  assert.match(css, /#game \.ludory-narrative__actions button\s*\{/);
});

test('stage-advance guard rejects controls and dialogue, but accepts the visual stage', async () => {
  const { mayAdvanceFromTarget } = await import('../game-studio/src/ui/original-game-ui.js');
  const target = selector => ({ closest: candidate => candidate.split(/,\s*/).includes(selector) ? {} : null });
  assert.equal(mayAdvanceFromTarget(target('.ludory-narrative__panel')), false);
  assert.equal(mayAdvanceFromTarget(target('button')), false);
  assert.equal(mayAdvanceFromTarget({ closest: () => null }), true);
});

test('technical engine suffix does not appear in the authored reader title', async () => {
  const { originalReaderTitle } = await import('../game-studio/src/ui/original-game-ui.js');
  assert.equal(originalReaderTitle('Поцелуй на краю света · Ludory'), 'Поцелуй на краю света');
  assert.equal(originalReaderTitle('Поцелуй на краю света'), 'Поцелуй на краю света');
});

test('mobile top actions have accessible touch target height', async () => {
  const css = await readFile(new URL('src/ui/original-game.css', game), 'utf8');
  assert.match(css, /\.reader-chrome__actions button\s*\{[^}]*min-height:\s*44px/s);
});
