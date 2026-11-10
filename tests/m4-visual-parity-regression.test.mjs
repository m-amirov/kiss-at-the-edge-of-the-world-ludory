import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

const ui = new URL('../game-studio/src/ui/original-game-ui.js', import.meta.url);
const css = new URL('../game-studio/src/ui/original-game.css', import.meta.url);

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
});
