import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paginateReaderText, createReaderPageState, needsLocalReaderBack } from '../game-studio/src/ui/reader-pagination.js';
import { s38Paused } from '../game-studio/src/scenes/s38.js';
import { s39Active, s39Common } from '../game-studio/src/scenes/s39.js';

test('long S38 and S39 canonical text paginates without missing or duplicated characters', () => {
  for (const source of [s38Paused, s39Active, s39Common]) {
    const pages = paginateReaderText(source, value => value.length <= 110);
    assert.ok(pages.length >= 2, 'long story beats must produce short reading pages');
    assert.equal(pages.join(''), source, 'authored text must be lossless');
    assert.ok(pages.every(page => page && page.length <= 110), 'no page may exceed measured budget');
  }
});

test('reader pagination preserves dialogue punctuation and spaces at sentence boundaries', () => {
  const source = '— Можно? — спросила она. «Да!» — ответил он.  Следующая фраза.\n\nИ ещё одна.';
  const pages = paginateReaderText(source, value => value.length <= 37);
  assert.equal(pages.join(''), source);
  assert.ok(pages.length >= 3);
  assert.ok(pages.every(page => page.length <= 37));
});

test('an overlong sentence splits at word/grapheme boundaries without infinite loops', () => {
  const source = 'Супердлинноесловобезпробелов 😀👩‍🚀 и ещё очень длинная непрерывная фраза без точки';
  const pages = paginateReaderText(source, value => Array.from(value).length <= 11);
  assert.equal(pages.join(''), source);
  assert.ok(pages.length > 4);
  assert.ok(pages.every(page => Array.from(page).length <= 11));
  assert.equal(paginateReaderText('', () => true).join(''), '');
});

test('reader pages advance locally before a native beat transition and backtrack locally', () => {
  const state = createReaderPageState();
  state.sync('s38:paused:ru', ['Первая. ', 'Вторая. ', 'Третья.']);
  assert.equal(state.currentText(), 'Первая. ');
  assert.equal(state.advance(), 'page');
  assert.equal(state.currentText(), 'Вторая. ');
  assert.equal(state.advance(), 'page');
  assert.equal(state.currentText(), 'Третья.');
  assert.equal(state.advance(), 'native');
  assert.equal(state.previous(), 'page');
  assert.equal(state.currentText(), 'Вторая. ');
  assert.equal(state.previous(), 'page');
  assert.equal(state.previous(), 'native');
});

test('native Back enters the preceding beat at its last short page, journal leaves position intact', () => {
  const state = createReaderPageState();
  state.sync('s39:walk:ru', ['one ', 'two ', 'three']);
  state.advance();
  state.sync('s39:walk:ru', ['one ', 'two ', 'three']);
  assert.equal(state.currentText(), 'two ');
  state.sync('s39:following:ru', ['next']);
  state.prepareNativeBack();
  state.sync('s39:walk:ru', ['one ', 'two ', 'three']);
  assert.equal(state.currentText(), 'three');
  assert.equal(state.previous(), 'page');
  assert.equal(state.currentText(), 'two ');
});

test('reader reflow does not skip unread text when viewport shrinks', () => {
  const state = createReaderPageState();
  state.sync('s39:common:ru', ['alpha bravo ', 'charlie delta ', 'echo']);
  state.advance();
  assert.equal(state.currentText(), 'charlie delta ');
  state.sync('s39:common:ru', ['alpha ', 'bravo ', 'charlie ', 'delta echo']);
  assert.equal(state.currentText(), 'charlie ', 'after reflow resume from at or before the old offset');
  state.sync('s39:other:ru', ['new page']);
  assert.equal(state.currentText(), 'new page');
});

test('Back from a choice to the last paged dialogue consumes its return intent', () => {
  const state = createReaderPageState();
  state.sync('s38:dialogue:ru', ['first ', 'last']);
  state.advance();
  // Choice panels have no Next button and do not join the reader pagination state.
  state.prepareNativeBack();
  state.sync('s38:dialogue:ru', ['first ', 'last']);
  assert.equal(state.currentText(), 'last');
  state.sync('s38:following:ru', ['new first ', 'new last']);
  assert.equal(state.currentText(), 'new first ', 'stale Back intent must not skip a new beat');
});

test('a short reader page always offers local Back even when restored runtime has no history', () => {
  assert.equal(needsLocalReaderBack(0, false), false);
  assert.equal(needsLocalReaderBack(1, false), true);
  assert.equal(needsLocalReaderBack(3, false), true);
  assert.equal(needsLocalReaderBack(1, true), false);
});
