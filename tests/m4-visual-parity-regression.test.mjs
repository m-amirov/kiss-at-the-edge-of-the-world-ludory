import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

const ui = new URL('../game-studio/src/ui/original-game-ui.js', import.meta.url);
const css = new URL('../game-studio/src/ui/original-game.css', import.meta.url);
const browserQaScript = new URL('./m4-browser-qa.mjs', import.meta.url);

test('menu copy and action grouping follow the pinned original without inventing episode controls', async () => {
  const source = await readFile(ui, 'utf8');
  assert.match(source, /РОМАНТИЧЕСКАЯ ИСТОРИЯ · ИСЛАНДИЯ/);
  assert.match(source, /Три недели дороги\. Три возможные истории любви\. И возможность выбрать себя\./);
  assert.match(source, /original-home__secondary/);
  assert.match(source, /data-ui="settings">Настройки<\/button>/);
  assert.doesNotMatch(source, />Эпизоды<\/button>/);
});

test('primary menu action names the actual fresh or restored runtime state', async () => {
  const { originalMenuActionLabel } = await import(ui.href);
  assert.equal(originalMenuActionLabel(false), 'Новая игра');
  assert.equal(originalMenuActionLabel(true), 'Продолжить чтение');
});

test('reader parity keeps the menu first, keeps runtime utilities real, and protects mobile artwork', async () => {
  const source = await readFile(css, 'utf8');
  assert.match(source, /\.reader-chrome\s*\{[^}]*left:\s*0/s);
  assert.match(source, /#game \.ludory-narrative__toolbar\s*\{[^}]*right:/s);
  assert.match(source, /@media \(max-width: 680px\)[\s\S]*?\.ludory-narrative__cg\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(source, /#game \.ludory-narrative__panel\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(source, /@media \(max-width: 680px\)[\s\S]*?\.ludory-narrative__panel\s*\{[^}]*max-height:\s*min\(64dvh,560px\)/s);
  assert.match(source, /stage\[data-original-cg\]::before/);
  const uiSource = await readFile(ui, 'utf8');
  assert.match(uiSource, /getAttribute\('src'\)\s*\|\|\s*image\.currentSrc/,
    'responsive source switching must use the current src attribute before currentSrc');
  assert.match(uiSource, /addEventListener\('load',[\s\S]*?ludory-narrative__cg/);
  assert.match(uiSource, /requestAnimationFrame\(retry\)/);
});

test('approved mobile CG compositions are explicit and keep the runtime controls in one row', async () => {
  const { originalCgComposition } = await import(`${ui.href}?composition-regression`);
  const expected = {
    'vis-s03-damir.png': 'a2-s03',
    'vis-s07-kitchen-pasta.png': 'a1-s07',
    'vis-s07-kitchen-cards.png': 'a1-s07',
    'vis-s26-eric-choice.png': 'a2-s26',
    'vis-s26-nick-choice.png': 'a2-s26',
    'vis-s26-damir-choice.png': 'a2-s26',
    'vis-s26-alice-choice.png': 'a2-s26',
    'vis-s38-alice-nick-ordinary-day.png': 'a2-group',
    'vis-s39-alice-damir-cafe.png': 'a2-s39',
    'vis-s39-alice-damir-cafe-walk.png': 'mobile-fallback-s39-walk',
  };
  for (const [mediaFile, composition] of Object.entries(expected)) {
    assert.equal(originalCgComposition(mediaFile), composition, mediaFile);
  }
  assert.equal(originalCgComposition('vis-unmapped.png'), 'default');

  const source = await readFile(css, 'utf8');
  assert.match(source, /data-original-cg-composition\][\s\S]*?object-fit:\s*contain/);
  assert.match(source, /data-original-cg-source-mode="portrait"\][\s\S]*?display:\s*none/);
  assert.match(source, /data-original-cg-mobile-fallback="true"\][\s\S]*?transform:\s*none/);
  assert.doesNotMatch(source, /transform:\s*scale\((?:1\.45|1\.6|1\.48|1\.18)\)/);
  assert.match(source, /data-original-cg-composition\][\s\S]*?object-fit:\s*contain/);
  assert.match(source, /data-original-cg-mobile-fallback="true"[\s\S]*?\.ludory-narrative__background[\s\S]*?object-fit:\s*cover/);
  assert.match(source, /data-original-cg-mobile-fallback="true"[\s\S]*?object-position:\s*center center/);
  assert.match(source, /--original-cg-safe-top:\s*max\(58px,[\s\S]*?env\(safe-area-inset-top/);
  assert.match(source, /data-original-cg-composition\][\s\S]*?top:\s*var\(--original-cg-safe-top\)/);
  assert.match(source, /data-original-cg-mobile-fallback="true"[\s\S]*?\.ludory-narrative__background[\s\S]*?top:\s*0/);
  assert.match(source, /data-original-cg-composition="a2-group"[\s\S]*?\.ludory-narrative__panel/);
  assert.match(source, /data-original-cg-composition="a2-group"[\s\S]*?text-shadow:/);
  assert.match(source, /scroll-padding-block-end:\s*max\(18px,[\s\S]*?safe-area-inset-bottom/);
  assert.match(source, /scroll-margin-block-end:\s*max\(18px,[\s\S]*?safe-area-inset-bottom/);
  assert.match(source, /\.ludory-narrative__panel\s*\{[^}]*min-height:\s*0/);
  assert.match(source, /@media \(max-width: 680px\)[\s\S]*?\.ludory-narrative__toolbar \{\s*top:\s*max\(10px,/);
  const browserQa = await readFile(browserQaScript, 'utf8');
  assert.match(browserQa, /panelScrollable:\s*panelElement\s*\?\s*panelElement\.scrollHeight\s*>\s*panelElement\.clientHeight/);
  assert.match(browserQa, /data-original-cg-media/);
  assert.match(browserQa, /objectFit.*cover/);
  assert.match(browserQa, /scrollIntoViewIfNeeded\(\)/);
  assert.match(browserQa, /action\.y\s*>=\s*-2[\s\S]*?action\.y\s*\+\s*action\.height/);
  assert.match(browserQa, /navigationBottom[\s\S]*?geometry\.y\s*>=\s*navigationBottom\s*-\s*1/);
});
