/* Author-owned reader controls. All story transitions and saves remain Ludory-owned. */

export function mayAdvanceFromTarget(target) {
  return typeof target?.closest === 'function' &&
    !target.closest('button, a, input, textarea, select, [contenteditable], [role="button"]') &&
    !target.closest('.ludory-narrative__panel, .ludory-narrative__toolbar, .ludory-narrative__journal');
}

export function originalReaderTitle(title) {
  return title.replace(/\s*·\s*Ludory\s*$/u, '');
}

function mayAdvanceFromKeyboardTarget(target) {
  // The narrative panel itself is a native focus target; its child buttons are not.
  if (target?.matches?.('.ludory-narrative__panel')) return true;
  return mayAdvanceFromTarget(target);
}

export async function installOriginalGameUi({ document: doc, start = null }) {
  const root = doc.querySelector('#game');
  const chrome = doc.querySelector('.reader-chrome');
  const legacyHeader = doc.querySelector('header');
  const controls = doc.querySelector('#story-controls');
  const storyTitle = doc.querySelector('#story-title');
  if (!root || !controls || (!chrome && !legacyHeader)) {
    throw new TypeError('Original game UI needs the native Ludory shell');
  }

  // The Studio-owned index and entrypoint are immutable. The authored presentation
  // module runs before the native launcher and decorates its existing DOM in place.
  doc.body.classList.add('original-game');
  const visualChrome = chrome || legacyHeader;
  visualChrome.classList.add('reader-chrome');
  controls.classList.add('reader-chrome__actions');
  storyTitle?.classList.add('reader-chrome__title');
  doc.querySelector('#status')?.classList.add('reader-status');
  if (!doc.querySelector('link[data-original-game-theme]')) {
    const stylesheet = doc.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('./original-game.css', import.meta.url).href;
    stylesheet.dataset.originalGameTheme = '';
    doc.head.append(stylesheet);
  }

  const home = doc.createElement('section');
  home.id = 'original-home';
  home.className = 'original-home';
  home.setAttribute('role', 'dialog');
  home.setAttribute('aria-modal', 'true');
  home.setAttribute('aria-label', 'Главное меню');
  home.innerHTML = `
    <div class="original-home__card">
      <p class="original-home__kicker">Интерактивный роман</p>
      <h1>Поцелуй на краю света</h1>
      <p class="original-home__summary">На краю света даже случайная встреча может изменить всё.</p>
      <div class="original-home__actions">
        <button type="button" class="original-home__primary" data-ui="continue-story">Продолжить чтение</button>
        <button type="button" data-ui="new-story">Начать заново</button>
        <button type="button" data-ui="settings">Настройки чтения</button>
      </div>
      <div class="original-home__settings" data-ui="settings-panel" hidden>
        <p>Размер текста</p>
        <button type="button" data-ui="normal-text">Обычный</button>
        <button type="button" data-ui="large-text">Крупный</button>
      </div>
    </div>`;
  doc.body.append(home);

  const menu = doc.createElement('button');
  menu.type = 'button';
  menu.textContent = 'Меню';
  menu.dataset.ui = 'open-menu';
  controls.prepend(menu);

  const storageKey = 'kiss-at-the-edge-ui-preferences-v1';
  try { doc.body.dataset.readingSize = doc.defaultView.localStorage.getItem(storageKey) === 'large' ? 'large' : 'normal'; }
  catch { doc.body.dataset.readingSize = 'normal'; }

  let menuOpen = true;
  function showMenu() {
    menuOpen = true;
    home.hidden = false;
    root.inert = true;
    visualChrome.inert = true;
    home.querySelector('[data-ui="continue-story"]').focus();
  }
  function hideMenu() {
    menuOpen = false;
    home.hidden = true;
    root.inert = false;
    visualChrome.inert = false;
    root.querySelector('.ludory-narrative__panel')?.focus();
  }

  menu.addEventListener('click', showMenu);
  home.querySelector('[data-ui="continue-story"]').addEventListener('click', hideMenu);
  home.querySelector('[data-ui="new-story"]').addEventListener('click', () => {
    if (doc.defaultView.confirm('Начать историю заново? Текущее сохранение будет удалено.')) {
      doc.querySelector('#restart')?.click();
    }
  });
  home.querySelector('[data-ui="settings"]').addEventListener('click', () => {
    const settings = home.querySelector('[data-ui="settings-panel"]');
    settings.hidden = !settings.hidden;
  });
  for (const size of ['normal', 'large']) {
    home.querySelector(`[data-ui="${size}-text"]`).addEventListener('click', () => {
      doc.body.dataset.readingSize = size;
      try { doc.defaultView.localStorage.setItem(storageKey, size); } catch { /* UI-only preference */ }
    });
  }

  function advance() {
    if (menuOpen) return false;
    // Choice beats deliberately have no native Next action. Never choose automatically.
    const next = root.querySelector('.ludory-narrative__panel button[data-action^="narrative:next:"]');
    if (!next || next.disabled) return false;
    next.click();
    return true;
  }

  root.addEventListener('click', event => {
    if (event.target?.closest?.('.ludory-narrative') && mayAdvanceFromTarget(event.target)) advance();
  });
  doc.addEventListener('keydown', event => {
    if (!['Enter', ' ', 'Spacebar', 'ArrowRight'].includes(event.key) || event.repeat ||
        event.altKey || event.ctrlKey || event.metaKey || menuOpen ||
        !mayAdvanceFromKeyboardTarget(event.target) || !mayAdvanceFromKeyboardTarget(doc.activeElement)) return;
    if (advance()) event.preventDefault();
  });

  // Keep Studio's title ownership, but remove the engine suffix from visible prose.
  if (storyTitle && doc.defaultView.MutationObserver) {
    const normalize = () => {
      const title = originalReaderTitle(storyTitle.textContent);
      if (title !== storyTitle.textContent) storyTitle.textContent = title;
    };
    new doc.defaultView.MutationObserver(normalize).observe(storyTitle, { childList: true, characterData: true });
    normalize();
  }

  showMenu();
  if (start !== null) return start();
}

// Presentation is imported by the authored story export, before the managed
// entrypoint calls startNarrative(). This is UI-only, with no graph or save writes.
if (typeof document !== 'undefined' && document.querySelector('#game')) {
  void installOriginalGameUi({ document }).catch(error => {
    const status = document.querySelector('#status');
    if (status) status.textContent = error.message;
  });
}
