/** Paginate authored prose without changing the engine's beat or its source text. */
export function paginateReaderText(text, fits, locale = 'ru') {
  if (typeof text !== 'string' || typeof fits !== 'function') {
    throw new TypeError('Reader pagination requires prose and a layout predicate');
  }
  if (!text) return [''];

  const segment = granularity => new Intl.Segmenter(locale, { granularity });
  const pages = [];
  let current = '';
  const flush = () => {
    if (!current) return;
    pages.push(current);
    current = '';
  };

  function addUnit(unit, fallback = 'word') {
    if (!unit) return;
    if (fits(current + unit)) {
      current += unit;
      return;
    }
    flush();
    if (fits(unit)) {
      current = unit;
      return;
    }
    if (fallback === 'word') {
      for (const word of unit.match(/\S+\s*|\s+/gu) || []) addUnit(word, 'grapheme');
      return;
    }
    for (const { segment: grapheme } of segment('grapheme').segment(unit)) {
      if (!fits(current + grapheme)) flush();
      if (!fits(grapheme)) throw new RangeError('Reader viewport cannot fit a grapheme');
      current += grapheme;
    }
  }

  for (const { segment: sentence } of segment('sentence').segment(text)) addUnit(sentence);
  flush();
  return pages;
}

/** Local reader position; intentionally separate from Ludory's saved narrative state. */
export function createReaderPageState() {
  let key = null;
  let pages = [''];
  let index = 0;
  let returnToLastPage = false;

  function pageStart(pageIndex, fragments = pages) {
    return fragments.slice(0, pageIndex).reduce((count, value) => count + value.length, 0);
  }

  return {
    sync(nextKey, nextPages) {
      if (!Array.isArray(nextPages) || !nextPages.length) throw new TypeError('Reader pages are required');
      if (returnToLastPage) {
        index = nextPages.length - 1;
        returnToLastPage = false;
        key = nextKey;
      } else if (nextKey !== key) {
        index = 0;
        key = nextKey;
      } else {
        // On narrower screens re-display already read words if necessary; never skip new ones.
        const oldStart = pageStart(index);
        let start = 0;
        index = 0;
        for (let position = 1; position < nextPages.length; position++) {
          start += nextPages[position - 1].length;
          if (start > oldStart) break;
          index = position;
        }
      }
      pages = nextPages;
    },
    currentText() { return pages[index]; },
    advance() {
      if (index >= pages.length - 1) return 'native';
      index++;
      return 'page';
    },
    previous() {
      if (index <= 0) return 'native';
      index--;
      return 'page';
    },
    prepareNativeBack() { returnToLastPage = true; },
    clearPendingBack() { returnToLastPage = false; },
    pageIndex() { return index; },
    pageCount() { return pages.length; },
  };
}

/** Native history is intentionally not persisted, but local pages still need Back. */
export function needsLocalReaderBack(pageIndex, nativeBackPresent) {
  return pageIndex > 0 && !nativeBackPresent;
}

/** Decorates replacement native panels, without owning narrative progression or saves. */
export function installReaderPagination({ root, document: doc, isMenuOpen }) {
  const pageState = createReaderPageState();
  let panel = null;
  let paragraph = null;
  let authoredText = '';
  let nextButton = null;
  let nativeAdvancePending = false;
  let journalPageKey = null;
  let dragStart = null;
  let gestureDragged = false;
  let ignoreClickUntil = 0;

  const readerKey = candidate =>
    `${candidate.dataset.sceneId}:${candidate.dataset.beatId}:${doc.documentElement.lang}`;

  function renderLocalBack() {
    const toolbar = panel?.querySelector('.ludory-narrative__toolbar');
    if (!toolbar) return;
    const existing = toolbar.querySelector('button[data-reader-local-back]');
    const journalVisible = Boolean(panel.querySelector('.ludory-narrative__journal'));
    const sameProseInJournal = journalVisible && journalPageKey === readerKey(panel);
    const proseVisible = !journalVisible && Boolean(paragraph && nextButton);
    const nativeBackPresent = Boolean(toolbar.querySelector('button[data-action="narrative:back"]'));
    if (!(sameProseInJournal || proseVisible) ||
        !needsLocalReaderBack(pageState.pageIndex(), nativeBackPresent)) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const button = doc.createElement('button');
    button.type = 'button';
    button.dataset.readerLocalBack = '';
    button.textContent = doc.documentElement.lang === 'en' ? 'Back' : 'Назад';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (pageState.previous() !== 'page') return;
      if (panel.querySelector('.ludory-narrative__journal')) {
        panel.querySelector('button[data-ui="journal"]')?.click();
      } else {
        displayCurrent();
      }
    });
    toolbar.prepend(button);
  }

  function layoutPages(text) {
    const width = Math.max(1, paragraph.getBoundingClientRect().width);
    const measure = paragraph.cloneNode(false);
    measure.setAttribute('aria-hidden', 'true');
    measure.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;` +
      `left:0;top:0;width:${width}px;min-width:0;max-height:none;overflow:visible;`;
    panel.append(measure);
    try {
      const lineHeight = Number.parseFloat(doc.defaultView.getComputedStyle(paragraph).lineHeight);
      const limit = Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight * 5 + 1 : 140;
      return paginateReaderText(text, candidate => {
        measure.textContent = candidate;
        return measure.getBoundingClientRect().height <= limit;
      }, doc.documentElement.lang || 'ru');
    } finally {
      measure.remove();
    }
  }

  function displayCurrent() {
    if (!paragraph?.isConnected) return;
    paragraph.textContent = pageState.currentText();
    panel.scrollTop = 0;
    panel.dataset.readerPage = String(pageState.pageIndex() + 1);
    panel.dataset.readerPageCount = String(pageState.pageCount());
    renderLocalBack();
  }

  function sync() {
    const currentPanel = root.querySelector('.ludory-narrative__panel');
    if (!currentPanel || currentPanel === panel) return;
    const wasJournal = Boolean(panel?.querySelector('.ludory-narrative__journal'));
    const priorProseKey = panel && paragraph && nextButton ? readerKey(panel) : null;
    panel = currentPanel;
    nativeAdvancePending = false;
    nextButton = panel.querySelector('button[data-action^="narrative:next:"]');
    paragraph = null;
    authoredText = '';
    if (!nextButton) {
      if (panel.querySelector('.ludory-narrative__journal')) {
        // The journal is an overlay over the same beat, not a choice. Leave
        // pending native Back intact until it is closed on the previous beat.
        if (!wasJournal) journalPageKey = priorProseKey;
        renderLocalBack();
        return;
      }
      // A native Back may land on a choice. Its next branch is forward travel,
      // not the completion of the pending Back intent.
      journalPageKey = null;
      pageState.clearPendingBack();
      return; // Choices/interactions always remain native.
    }
    journalPageKey = null;
    paragraph = [...panel.children].find(child => child.tagName === 'P' &&
      !child.classList.contains('ludory-narrative__speaker') &&
      !child.classList.contains('ludory-narrative__reply')) || null;
    authoredText = paragraph?.textContent || '';
    pageState.sync(readerKey(panel), paragraph ? layoutPages(authoredText) : ['']);
    if (paragraph) displayCurrent();
  }

  function repaginate() {
    if (!panel?.isConnected || !paragraph?.isConnected || !nextButton?.isConnected) return;
    pageState.sync(readerKey(panel), layoutPages(authoredText));
    displayCurrent();
  }

  function advance() {
    if (isMenuOpen()) return false;
    sync();
    if (nativeAdvancePending) return false;
    if (!nextButton?.isConnected || !nextButton || nextButton.disabled) return false;
    if (pageState.advance() === 'page') {
      displayCurrent();
      return true;
    }
    nativeAdvancePending = true;
    nextButton.click(); // Native Ludory action remains the only graph transition.
    return true;
  }

  root.addEventListener('click', event => {
    const back = event.target?.closest?.('button[data-action="narrative:back"]');
    if (!back || isMenuOpen()) return;
    const journalVisible = Boolean(panel?.querySelector('.ludory-narrative__journal'));
    const canBackWithinBeat = panel?.isConnected && (journalVisible
      ? journalPageKey === readerKey(panel) : paragraph?.isConnected);
    if (canBackWithinBeat && pageState.previous() === 'page') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (journalVisible) panel.querySelector('button[data-ui="journal"]')?.click();
      else displayCurrent();
    } else {
      pageState.prepareNativeBack();
    }
  }, true);

  root.addEventListener('pointerdown', event => {
    if (event.isPrimary === false) return;
    dragStart = { x: event.clientX, y: event.clientY };
    gestureDragged = false;
  }, { passive: true });
  root.addEventListener('pointermove', event => {
    if (dragStart && Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 8) {
      gestureDragged = true;
    }
  }, { passive: true });
  const endPointerGesture = () => {
    if (gestureDragged) ignoreClickUntil = doc.defaultView.performance.now() + 350;
    dragStart = null;
    gestureDragged = false;
  };
  root.addEventListener('pointerup', endPointerGesture, { passive: true });
  root.addEventListener('pointercancel', endPointerGesture, { passive: true });

  const observer = new doc.defaultView.MutationObserver(sync);
  observer.observe(root, { childList: true, subtree: true });
  let resizeFrame = 0;
  doc.defaultView.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = doc.defaultView.requestAnimationFrame(() => {
      resizeFrame = 0;
      repaginate();
    });
  }, { passive: true });
  doc.fonts?.ready.then(repaginate).catch(() => {});
  doc.querySelector('link[data-original-game-theme]')?.addEventListener('load', repaginate);
  sync();

  return {
    advance,
    repaginate,
    shouldIgnoreTap() {
      return isMenuOpen() || doc.defaultView.performance.now() < ignoreClickUntil ||
        Boolean(doc.defaultView.getSelection?.()?.toString().trim());
    },
  };
}
