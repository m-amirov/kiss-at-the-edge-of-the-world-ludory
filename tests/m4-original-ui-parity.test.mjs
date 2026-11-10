import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildPresentation } from '../tools/m4-build-presentation.mjs';

const game = new URL('../game-studio/', import.meta.url);
const gamePath = fileURLToPath(game);

test('game installs original UI from author-owned presentation without changing native Studio shell', async () => {
  const index = await readFile(new URL('index.html', game), 'utf8');
  const entry = await readFile(new URL('src/entry.js', game), 'utf8');
  const presentation = await readFile(new URL('src/presentation.js', game), 'utf8');
  const adapter = await readFile(new URL('src/ui/original-game-ui.js', game), 'utf8');
  const registry = JSON.parse(await readFile(new URL('ludory.components.json', game), 'utf8'));
  const digest = content => createHash('sha256').update(content.replace(/\r\n/g, '\n')).digest('hex');
  for (const [path, content] of [['index.html', index], ['src/entry.js', entry], ['src/main.js', await readFile(new URL('src/main.js', game), 'utf8')], ['assets/ludory-narrative.js', await readFile(new URL('assets/ludory-narrative.js', game), 'utf8')]]) {
    assert.equal(digest(content), registry.files[path], `Studio-managed file mutated: ${path}`);
  }
  assert.match(index, /<header(?:\s|>)/);
  assert.match(presentation, /import '\.\/ui\/original-game-ui\.js';/);
  assert.match(adapter, /new URL\('\.\/original-game\.css', import\.meta\.url\)/);
  assert.match(index, /id="game"/);
  assert.match(index, /id="status"/);
  assert.doesNotThrow(() => buildPresentation({ projectRoot: gamePath }));
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

test('original Cormorant and Manrope variable fonts are bundled with OFL licenses and used for their source roles', async () => {
  const css = await readFile(new URL('src/ui/original-game.css', game), 'utf8');
  const original = [
    ['CormorantGaramond[wght].ttf', 'b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0'],
    ['Manrope[wght].ttf', '3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6'],
  ];
  for (const [filename, sha256] of original) {
    const font = await readFile(new URL(`assets/fonts/${filename}`, game));
    assert.equal(createHash('sha256').update(font).digest('hex'), sha256, `source font changed: ${filename}`);
    assert.equal(font.toString('hex', 0, 4), '00010000', `${filename}: not a TrueType font`);
    assert.ok(css.includes(`../../assets/fonts/${filename}`), `${filename}: relative source path missing`);
  }
  for (const license of ['OFL-CormorantGaramond.txt', 'OFL-Manrope.txt']) {
    const text = await readFile(new URL(`assets/fonts/${license}`, game), 'utf8');
    assert.match(text, /SIL OPEN FONT LICENSE Version 1\.1/);
  }
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*'Cinematic Cormorant'/s);
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*'Cinematic Manrope'/s);
  assert.match(css, /\.original-home h1\s*\{[^}]*Cinematic Cormorant/s);
  assert.match(css, /\.original-home__summary\s*\{[^}]*Cinematic Manrope/s);
  assert.match(css, /\.original-home button\s*\{[^}]*Cinematic Manrope/s);
  assert.match(css, /\.ludory-narrative__panel > p\s*\{[^}]*Cinematic Manrope/s);
});
