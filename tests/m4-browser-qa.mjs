// Run only on a host with real Chromium: npm install --no-save --package-lock=false playwright@1.62.1
// This exercises the actual Studio-owned static game, not a synthetic renderer fixture.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const gameRoot = fileURLToPath(new URL('../game-studio/', import.meta.url));
const evidenceDir = resolve(process.env.M4_BROWSER_EVIDENCE_DIR || 'artifacts/m4-browser-qa');
const types = new Map([['.html', 'text/html'], ['.js', 'text/javascript'], ['.json', 'application/json'],
  ['.css', 'text/css'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'], ['.png', 'image/png']]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    const filename = resolve(gameRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
    const inside = relative(gameRoot, filename);
    if (inside.startsWith(`..${sep}`) || inside === '..' || inside.startsWith(sep)) {
      response.writeHead(403); response.end(); return;
    }
    const info = await stat(filename);
    if (!info.isFile()) { response.writeHead(404); response.end(); return; }
    const data = await readFile(filename);
    response.writeHead(200, { 'Content-Type': `${types.get(extname(filename)) || 'application/octet-stream'}; charset=utf-8` });
    response.end(data);
  } catch {
    response.writeHead(404); response.end();
  }
});

async function waitForBeatChange(page, previous) {
  await page.waitForFunction(before => {
    const now = document.querySelector('.ludory-narrative__panel')?.dataset.beatId;
    return now && now !== before;
  }, previous, { timeout: 5000 });
}

async function advanceToSeatChoice(page) {
  const seat = page.locator('button[data-action="narrative:choose:s01-seat-choice:front-eric"]');
  for (let index = 0; index < 100; index++) {
    if (await seat.count()) return;
    const panel = page.locator('.ludory-narrative__panel');
    const before = await panel.getAttribute('data-beat-id');
    const next = page.locator('button[data-action^="narrative:next:"]');
    assert.equal(await next.count(), 1, `Unexpected interaction before seat choice: ${before}`);
    await next.click();
    await waitForBeatChange(page, before);
  }
  assert.fail('S01 seat choice was not reached within 100 beats');
}

// Follow the actual authored graph. A target-specific override is required for
// branch coverage; all other free choices take their first authored option.
async function advanceToBeat(page, targetBeatId, choiceOverrides = new Map()) {
  for (let index = 0; index < 2500; index++) {
    const panel = page.locator('.ludory-narrative__panel');
    const beatId = await panel.getAttribute('data-beat-id');
    if (beatId === targetBeatId) return;
    if (index > 0 && index % 250 === 0) console.log(`M4_BROWSER_ROUTE_PROGRESS: target=${targetBeatId} step=${index} current=${beatId}`);
    const next = page.locator('button[data-action^="narrative:next:"]');
    if (await next.count() === 1) {
      await next.click();
    } else {
      const choices = page.locator(`button[data-action^="narrative:choose:${beatId}:"]`);
      assert.ok(await choices.count() > 0, `Unexpected interaction en route to ${targetBeatId}: ${beatId}`);
      const optionOverride = choiceOverrides.get(beatId);
      const choice = Number.isInteger(optionOverride)
        ? choices.nth(optionOverride)
        : optionOverride
          ? page.locator(`button[data-action="narrative:choose:${beatId}:${optionOverride}"]`)
        : choices.first();
      assert.equal(await choice.count(), 1, `Expected authored choice ${beatId}:${optionOverride ?? 'first'}`);
      await choice.click();
    }
    await waitForBeatChange(page, beatId);
  }
  assert.fail(`Narrative did not reach ${targetBeatId} within 300 interactions`);
}

async function assertPilotCue(page, beatId, variantId, label, expectedMediaId = null) {
  const current = await page.locator('.ludory-narrative__panel').getAttribute('data-beat-id');
  assert.equal(current, beatId, `${label}: unexpected beat`);
  assert.equal(await page.locator('.ludory-narrative__panel h2')
    .filter({ hasText: /^s\d{2}-/ }).count(), 0, `${label}: raw scene ID visible as heading`);
  const stage = page.locator('.ludory-narrative__stage');
  assert.equal(await stage.getAttribute('data-variant-id'), variantId, `${label}: wrong visual mapping`);
  if (expectedMediaId === null) {
    assert.ok((await stage.getAttribute('data-neutral'))?.length, `${label}: unadmitted art lacks neutral reason`);
    assert.equal(await stage.locator('img').count(), 0, `${label}: unadmitted media rendered`);
  } else {
    assert.equal(await stage.getAttribute('data-neutral'), null, `${label}: admitted art must not be neutral`);
    const images = stage.locator('img');
    assert.equal(await images.count(), 1, `${label}: exactly one admitted art layer expected`);
    const image = images.first();
    const files = {
      'roadside-cafe': 'vis-s02-roadside-cafe.png',
      'guesthouse-morning': 'vis-s03-guesthouse-morning.png',
      'damir-coffee-cg': 'vis-s03-damir.png',
      's07-kitchen-pasta': 'vis-s07-kitchen-pasta.png',
      's07-kitchen-cards': 'vis-s07-kitchen-cards.png',
      's18-hofn-breakfast-morning': 'vis-s18-hofn-breakfast-morning.png',
      's18-hofn-room-morning': 'vis-s18-hofn-room-morning.png',
      's18-hofn-breakfast-group': 'vis-s18-hofn-breakfast-group.png',
      's26-eastfjords-guesthouse-courtyard': 'vis-s26-eastfjords-guesthouse-courtyard.png',
      's26-eastfjords-courtyard-group': 'vis-s26-eastfjords-courtyard-group.png',
      's26-eric-choice': 'vis-s26-eric-choice.png',
      's26-nick-choice': 'vis-s26-nick-choice.png',
      's26-damir-choice': 'vis-s26-damir-choice.png',
      's26-alice-choice': 'vis-s26-alice-choice.png',
      's38-alice-nick-ordinary-day': 'vis-s38-alice-nick-ordinary-day.png',
      's39-alice-damir-cafe': 'vis-s39-alice-damir-cafe.png',
      's39-alice-damir-cafe-walk': 'vis-s39-alice-damir-cafe-walk.png',
      's44-eric-epilogue-month-later': 'vis-s44-eric-epilogue-month-later.png',
      's45-nick-home-epilogue-month-later': 'vis-s45-nick-home-epilogue-month-later.png',
      's46-airport-bus-day': 'vis-s46-airport-bus-day.png',
      's46-damir-epilogue-month-later': 'vis-s46-damir-epilogue-month-later.png',
      's47-alice-home-epilogue-month-later': 'vis-s47-alice-home-epilogue-month-later.png',
      's48-guesthouse-exit-group': 'vis-s48-guesthouse-exit-group.png',
    };
    assert.ok((await image.getAttribute('src'))?.endsWith(`/assets/${files[expectedMediaId]}`), `${label}: wrong media URL`);
    await page.waitForFunction(() => {
      const img = document.querySelector('.ludory-narrative__stage img');
      return img?.complete && img.naturalWidth > 0;
    }, undefined, { timeout: 10000 });
    await image.evaluate(async img => { if (typeof img.decode === 'function') await img.decode(); });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.ok((await image.getAttribute('alt'))?.length, `${label}: accessible image description missing`);
    assert.equal(await stage.getAttribute('data-degraded'), null, `${label}: image degraded`);
    const geometry = await image.boundingBox();
    assert.ok(geometry && geometry.width > 0 && geometry.height > 0, `${label}: image has no rendered area`);
    assert.ok(geometry.x >= -2 && geometry.y >= -2 &&
      geometry.x + geometry.width <= (await page.evaluate(() => innerWidth)) + 2 &&
      geometry.y + geometry.height <= (await page.evaluate(() => innerHeight)) + 2,
    `${label}: image is clipped by the viewport: ${JSON.stringify(geometry)}`);
  }
  await assertViewport(page, label);
}

async function assertViewport(page, label) {
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.ludory-narrative__panel')?.getBoundingClientRect();
    const reader = document.querySelector('.ludory-narrative')?.getBoundingClientRect();
    const stage = document.querySelector('.ludory-narrative__stage')?.getBoundingClientRect();
    const dialogue = document.querySelector('.ludory-narrative__panel > p');
    const actions = [...document.querySelectorAll('.ludory-narrative__actions button')]
      .filter(button => button.getClientRects().length).map(button => button.getBoundingClientRect());
    const chromeButtons = [...document.querySelectorAll('.reader-chrome button')]
      .filter(button => button.getClientRects().length).map(button => button.getBoundingClientRect());
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
      reader: reader && { top: reader.top, bottom: reader.bottom, left: reader.left, right: reader.right },
      stage: stage && { top: stage.top, bottom: stage.bottom, left: stage.left, right: stage.right },
      font: dialogue ? parseFloat(getComputedStyle(dialogue).fontSize) : null,
      panel: panel && { left: panel.left, right: panel.right, top: panel.top, bottom: panel.bottom },
      actions: actions.map(box => ({ top: box.top, bottom: box.bottom, height: box.height })),
      chromeButtons: chromeButtons.map(box => ({ top: box.top, bottom: box.bottom, height: box.height })) };
  });
  assert.ok(geometry.panel, `${label}: visible narrative panel missing`);
  assert.ok(geometry.scrollWidth <= geometry.width + 2, `${label}: horizontal overflow: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.panel.left >= -2 && geometry.panel.right <= geometry.width + 2,
    `${label}: narrative panel clipped horizontally: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.panel.bottom > 0 && geometry.panel.top < geometry.height,
    `${label}: narrative panel out of viewport: ${JSON.stringify(geometry)}`);
  for (const [name, box] of [['reader', geometry.reader], ['stage', geometry.stage]]) {
    assert.ok(box && Math.abs(box.top) <= 2 && Math.abs(box.left) <= 2 &&
      Math.abs(box.right - geometry.width) <= 2 && Math.abs(box.bottom - geometry.height) <= 2,
    `${label}: ${name} must fill the screen: ${JSON.stringify(geometry)}`);
  }
  assert.ok(Math.abs(geometry.panel.bottom - geometry.height) <= 2,
    `${label}: dialogue must anchor to the bottom: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.font === null || geometry.font >= 16,
    `${label}: dialogue text too small: ${JSON.stringify(geometry)}`);
  for (const box of [...geometry.actions, ...geometry.chromeButtons]) {
    assert.ok(box.height >= 44, `${label}: touch target too small: ${JSON.stringify(box)}`);
    assert.ok(box.top >= -2 && box.bottom <= geometry.height + 2,
      `${label}: touch target outside viewport: ${JSON.stringify(box)}`);
  }
}

async function createPage(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  const originalMenu = page.locator('#original-home');
  await originalMenu.waitFor();
  assert.equal(await originalMenu.isVisible(), true, `${name}: original title menu missing`);
  assert.equal(await page.locator('#game').getAttribute('inert'), '', `${name}: story must be inert behind menu`);
  const cover = await originalMenu.evaluate(async menu => {
    const background = getComputedStyle(menu).backgroundImage;
    const candidate = background.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (!candidate) return { background, loaded: false };
    const image = new Image();
    image.src = candidate;
    try { await image.decode(); } catch { return { background, loaded: false }; }
    return { background, loaded: image.naturalWidth === 1920 && image.naturalHeight === 900 };
  });
  assert.equal(cover.loaded, true, `${name}: original menu cover missing or undecodable: ${cover.background}`);
  assert.match(cover.background, /kiss-at-the-edge-cover\.png/, `${name}: low-quality WebP is still used for the menu`);
  const typography = await originalMenu.evaluate(async menu => {
    await document.fonts.ready;
    const title = getComputedStyle(menu.querySelector('h1')).fontFamily;
    const summary = getComputedStyle(menu.querySelector('.original-home__summary')).fontFamily;
    const actions = getComputedStyle(menu.querySelector('.original-home__primary')).fontFamily;
    const sourceFonts = [...document.fonts].filter(face =>
      ['Cinematic Cormorant', 'Cinematic Manrope'].includes(face.family));
    return { title, summary, actions, fonts: sourceFonts.map(({ family, status }) => ({ family, status })) };
  });
  assert.match(typography.title, /Cinematic Cormorant/, `${name}: source display face missing`);
  assert.match(typography.summary, /Cinematic Manrope/, `${name}: source body face missing`);
  assert.match(typography.actions, /Cinematic Manrope/, `${name}: source button face missing`);
  for (const family of ['Cinematic Cormorant', 'Cinematic Manrope']) {
    assert.ok(typography.fonts.some(face => face.family === family && face.status === 'loaded'),
      `${name}: local font ${family} not loaded: ${JSON.stringify(typography)}`);
  }
  const menuBounds = await originalMenu.locator('[data-ui="continue-story"]').boundingBox();
  assert.ok(menuBounds && menuBounds.y >= 0 && menuBounds.y + menuBounds.height <= viewport.height,
    `${name}: Continue menu action not visible on screen`);
  await page.screenshot({ path: join(evidenceDir, `${name}-menu.png`), fullPage: true });
  await originalMenu.locator('[data-ui="continue-story"]').click();
  assert.equal(await originalMenu.isVisible(), false, `${name}: reader did not open`);
  try {
    await page.locator('.ludory-narrative__panel').waitFor();
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      status: document.querySelector('#status')?.textContent,
      gameText: document.querySelector('#game')?.textContent,
      gameHtml: document.querySelector('#game')?.innerHTML.slice(0, 500),
      menuHidden: document.querySelector('#original-home')?.hidden,
    }));
    console.error(`M4_BROWSER_STARTUP_DIAGNOSTIC: ${JSON.stringify(diagnostic)}`);
    throw new Error(`${error.message}; startup diagnostic: ${JSON.stringify(diagnostic)}`, { cause: error });
  }
  const storyFont = await page.locator('.ludory-narrative__panel > p').first().evaluate(el => getComputedStyle(el).fontFamily);
  assert.match(storyFont, /Cinematic Manrope/, `${name}: original narrative typeface missing`);
  assert.equal(await page.locator('.reader-chrome button:visible').count(), 1,
    `${name}: reading HUD must expose only Menu (native utilities belong in settings)`);
  await page.waitForFunction(() => document.querySelector('#status')?.textContent === 'История запущена');
  assert.match(await page.title(), /Поцелуй на краю света/);
  assert.equal(await page.locator('.ludory-narrative__panel').getAttribute('data-scene-id'), 's01-airport');
  assert.equal(await page.locator('.ludory-narrative__panel').getAttribute('aria-label'), 'История');
  assert.equal(await page.locator('.ludory-narrative__panel h2')
    .filter({ hasText: /^s\d{2}-/ }).count(), 0, `${name}: raw scene ID visible as heading`);
  assert.equal(await page.locator('.ludory-narrative').getAttribute('data-visual'), 'true');
  assert.equal(await page.locator('.ludory-narrative__stage img').count(), 0,
    `${name}: unadmitted media unexpectedly rendered`);
  assert.ok((await page.locator('.ludory-narrative__stage').getAttribute('data-neutral'))?.length,
    `${name}: missing explicit neutral visual fallback`);
  await assertViewport(page, name);
  await page.screenshot({ path: join(evidenceDir, `${name}-start.png`), fullPage: true });
  return { context, page, errors };
}

async function verifyStageNavigation(page, label) {
  const panel = page.locator('.ludory-narrative__panel');
  const first = await panel.getAttribute('data-beat-id');
  await page.locator('.ludory-narrative').click({ position: { x: 180, y: 190 } });
  await waitForBeatChange(page, first);
  const second = await panel.getAttribute('data-beat-id');
  await panel.focus();
  await page.keyboard.press('ArrowRight');
  await waitForBeatChange(page, second);
  const third = await panel.getAttribute('data-beat-id');
  assert.notEqual(third, first, `${label}: keyboard did not advance`);
  await panel.focus();
  await page.keyboard.press('Space');
  await waitForBeatChange(page, third);
  const fourth = await panel.getAttribute('data-beat-id');
  await panel.focus();
  await page.keyboard.press('Enter');
  await waitForBeatChange(page, fourth);
  const previous = await panel.getAttribute('data-beat-id');
  await page.locator('[data-ui="open-menu"]').click();
  assert.equal(await page.locator('#original-home').isVisible(), true, `${label}: menu cannot reopen`);
  await page.locator('[data-ui="continue-story"]').click();
  assert.equal(await panel.getAttribute('data-beat-id'), previous,
    `${label}: opening the menu must not change story progress`);
}

async function openReaderSettings(page) {
  await page.locator('[data-ui="open-menu"]').click();
  if (!(await page.locator('[data-ui="settings-panel"]').isVisible())) {
    await page.locator('[data-ui="settings"]').click();
  }
}

async function main() {
  await mkdir(evidenceDir, { recursive: true });
  await new Promise((fulfill, reject) => server.listen(0, '127.0.0.1', error => error ? reject(error) : fulfill()));
  let browser;
  try {
    browser = await chromium.launch({ headless: true,
      ...(process.env.M4_BROWSER_CHROMIUM_PATH ? { executablePath: process.env.M4_BROWSER_CHROMIUM_PATH } : {}) });
    const mobile = await createPage(browser, 'mobile-390x844', { width: 390, height: 844 });
    try {
      await verifyStageNavigation(mobile.page, 'mobile');
      await openReaderSettings(mobile.page);
      await mobile.page.locator('#language').click();
      assert.equal(await mobile.page.locator('#save').textContent(), 'Save');
      assert.equal(await mobile.page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await mobile.page.locator('.ludory-narrative__panel').getAttribute('aria-label'), 'Narrative');
      await mobile.page.locator('#language').click();
      await mobile.page.locator('[data-ui="continue-story"]').click();
      await advanceToSeatChoice(mobile.page);
      const choiceBeat = await mobile.page.locator('.ludory-narrative__panel').getAttribute('data-beat-id');
      await mobile.page.locator('.ludory-narrative').click({ position: { x: 180, y: 190 } });
      assert.equal(await mobile.page.locator('.ludory-narrative__panel').getAttribute('data-beat-id'), choiceBeat,
        'stage tap must not skip a choice');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-seat-choice.png'), fullPage: true });
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:front-eric"]').click();
      await mobile.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.dataset.sceneId === 's01-eric');
      assert.equal(await mobile.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-eric');
      await mobile.page.locator('button[data-action="narrative:back"]').click();
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-nick"]').waitFor();
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-nick"]').click();
      await mobile.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.dataset.sceneId === 's01-nick');
      assert.equal(await mobile.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-nick');
      await openReaderSettings(mobile.page);
      await mobile.page.locator('#save').click();
      await mobile.page.waitForFunction(() => document.querySelector('#status')?.textContent === 'Сохранено');
      const savedBeat = await mobile.page.locator('.ludory-narrative__panel').getAttribute('data-beat-id');
      await mobile.page.reload({ waitUntil: 'networkidle' });
      await mobile.page.waitForFunction(() => document.querySelector('#status')?.textContent === 'Сохранение восстановлено');
      await mobile.page.locator('[data-ui="continue-story"]').click();
      assert.equal(await mobile.page.locator('.ludory-narrative__panel').getAttribute('data-beat-id'), savedBeat);
      await assertViewport(mobile.page, 'mobile-restored');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-restored-nick.png'), fullPage: true });
      await advanceToBeat(mobile.page, 's02-road-32');
      await assertPilotCue(mobile.page, 's02-road-32', 'roadside-cafe', 'mobile S02 café', 'roadside-cafe');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-s02-cafe.png'), fullPage: true });
      await advanceToBeat(mobile.page, 's03-editorial-01');
      await assertPilotCue(mobile.page, 's03-editorial-01', 'editor-call', 'mobile S03 guesthouse', 'guesthouse-morning');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-s03-guesthouse.png'), fullPage: true });
      await advanceToBeat(mobile.page, 's03-coffee-01');
      await assertPilotCue(mobile.page, 's03-coffee-01', 'damir-enters', 'mobile S03 Damir CG', 'damir-coffee-cg');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-s03-damir.png'), fullPage: true });
      await advanceToBeat(mobile.page, 's07-common-a-01');
      await assertPilotCue(mobile.page, 's07-common-a-01', 'visual-s07-kitchen-pasta-1', 'mobile S07 pasta', 's07-kitchen-pasta');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-s07-kitchen-pasta.png'), fullPage: true });
      await advanceToBeat(mobile.page, 's18-common-01');
      await assertPilotCue(mobile.page, 's18-common-01', 'visual-s18-hofn-breakfast-morning-1', 'mobile S18 day-ten morning', 's18-hofn-breakfast-morning');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-s18-day-ten-morning.png'), fullPage: true });
      assert.deepEqual(mobile.errors, [], `mobile JS errors: ${mobile.errors.join('; ')}`);
    } finally { await mobile.context.close(); }

    const desktop = await createPage(browser, 'desktop-1000x720', { width: 1000, height: 720 });
    try {
      await verifyStageNavigation(desktop.page, 'desktop');
      await advanceToSeatChoice(desktop.page);
      await desktop.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-damir"]').click();
      await desktop.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.dataset.sceneId === 's01-damir');
      assert.equal(await desktop.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-damir');
      await assertViewport(desktop.page, 'desktop-damir');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-damir.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's01-common-01');
      await assertPilotCue(desktop.page, 's01-common-01', 'common-road', 'S01 shared road');
      await advanceToBeat(desktop.page, 's02-road-01');
      await assertPilotCue(desktop.page, 's02-road-01', 'road-opening', 'S02 road opening');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s02-road.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's02-road-32');
      await assertPilotCue(desktop.page, 's02-road-32', 'roadside-cafe', 'S02 roadside cafe', 'roadside-cafe');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s02-cafe.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's02-road-33');
      await assertPilotCue(desktop.page, 's02-road-33', 'roadside-cafe-continuation', 'S02 café continuity', 'roadside-cafe');
      await advanceToBeat(desktop.page, 's03-editorial-01');
      await assertPilotCue(desktop.page, 's03-editorial-01', 'editor-call', 'S03 editorial call', 'guesthouse-morning');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s03-editorial.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's03-editorial-02');
      await assertPilotCue(desktop.page, 's03-editorial-02', 'guesthouse-morning-continuation', 'S03 morning continuity', 'guesthouse-morning');
      await advanceToBeat(desktop.page, 's03-coffee-01');
      await assertPilotCue(desktop.page, 's03-coffee-01', 'damir-enters', 'S03 Damir coffee', 'damir-coffee-cg');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s03-coffee.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's03-coffee-02');
      await assertPilotCue(desktop.page, 's03-coffee-02', 'damir-coffee-continuation', 'S03 coffee continuity', 'damir-coffee-cg');
      await advanceToBeat(desktop.page, 's07-common-a-01');
      await assertPilotCue(desktop.page, 's07-common-a-01', 'visual-s07-kitchen-pasta-1', 'S07 kitchen pasta', 's07-kitchen-pasta');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s07-kitchen-pasta.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's07-common-a-43');
      await assertPilotCue(desktop.page, 's07-common-a-43', 'visual-s07-kitchen-cards-1', 'S07 kitchen cards', 's07-kitchen-cards');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s07-kitchen-cards.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's18-common-01');
      await assertPilotCue(desktop.page, 's18-common-01', 'visual-s18-hofn-breakfast-morning-1', 'S18 day-ten morning', 's18-hofn-breakfast-morning');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s18-day-ten-morning.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's18-common-02');
      await assertPilotCue(desktop.page, 's18-common-02', 'visual-s18-hofn-room-morning-1', 'S18 morning room', 's18-hofn-room-morning');
      await advanceToBeat(desktop.page, 's18-common-04');
      await assertPilotCue(desktop.page, 's18-common-04', 'visual-s18-hofn-breakfast-group-1', 'S18 breakfast group', 's18-hofn-breakfast-group');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s18-breakfast-group.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's26-intro-01');
      await assertPilotCue(desktop.page, 's26-intro-01', 'visual-s26-eastfjords-guesthouse-courtyard-1', 'S26 guesthouse courtyard', 's26-eastfjords-guesthouse-courtyard');
      await advanceToBeat(desktop.page, 's26-intro-03');
      await assertPilotCue(desktop.page, 's26-intro-03', 'visual-s26-eastfjords-courtyard-group-1', 'S26 courtyard group', 's26-eastfjords-courtyard-group');
      await advanceToBeat(desktop.page, 's26-choice-eric-01');
      await assertPilotCue(desktop.page, 's26-choice-eric-01', 'visual-s26-eric-choice-1', 'S26 Eric route', 's26-eric-choice');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s26-eric.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's48-common-01');
      await assertPilotCue(desktop.page, 's48-common-01', 'visual-s48-guesthouse-exit-group-1', 'S48 departure morning', 's48-guesthouse-exit-group');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s48-departure.png'), fullPage: true });
      await advanceToBeat(desktop.page, 's44-common-01');
      await assertPilotCue(desktop.page, 's44-common-01', 'visual-s44-eric-epilogue-month-later-1', 'S44 month-later epilogue', 's44-eric-epilogue-month-later');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-s44-epilogue.png'), fullPage: true });
      // A new story must use the one native restart handler and explicitly clear the save.
      await desktop.page.locator('[data-ui="open-menu"]').click();
      desktop.page.once('dialog', dialog => dialog.accept());
      await desktop.page.locator('[data-ui="new-story"]').click();
      await desktop.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.dataset.beatId === 's01-airport-01' &&
        document.querySelector('#original-home')?.hidden === false, undefined, { timeout: 10000 });
      await desktop.page.locator('[data-ui="continue-story"]').click();
      assert.equal(await desktop.page.locator('.ludory-narrative__panel').getAttribute('data-beat-id'), 's01-airport-01',
        'explicit New Story must restart the native graph from S01');
      assert.deepEqual(desktop.errors, [], `desktop JS errors: ${desktop.errors.join('; ')}`);
    } finally { await desktop.context.close(); }

    const specialRoutes = [
      ['s38-paused-01', 1, new Map([['s26-route-choice', 1], ['s33-c1-choice', 1], ['s36-route-choice', 0]]),
        'visual-s38-alice-nick-ordinary-day-1', 'S38 ordinary day', 's38-alice-nick-ordinary-day'],
      ['s39-active-01', 2, new Map([['s26-route-choice', 2]]),
        'visual-s39-alice-damir-cafe-1', 'S39 café', 's39-alice-damir-cafe'],
    ];
    for (const [target, routeChoice, extraOverrides, variant, label, media] of specialRoutes) {
      const special = await createPage(browser, `desktop-${target}`, { width: 1000, height: 720 });
      try {
        const overrides = new Map([['s17-evening-choice', routeChoice], ...extraOverrides]);
        await advanceToBeat(special.page, target, overrides);
        await assertPilotCue(special.page, target, variant, label, media);
        await special.page.screenshot({ path: join(evidenceDir, `desktop-${target}.png`), fullPage: true });
        if (target === 's39-active-01') {
          await advanceToBeat(special.page, 's39-common-01');
          await assertPilotCue(special.page, 's39-common-01', 'visual-s39-alice-damir-cafe-walk-1', 'S39 café walk', 's39-alice-damir-cafe-walk');
          await special.page.screenshot({ path: join(evidenceDir, 'desktop-s39-cafe-walk.png'), fullPage: true });
          await advanceToBeat(special.page, 's46-intro-01');
          await assertPilotCue(special.page, 's46-intro-01', 'visual-s46-airport-bus-day-1', 'S46 airport bus', 's46-airport-bus-day');
          await advanceToBeat(special.page, 's46-common-01');
          await assertPilotCue(special.page, 's46-common-01', 'visual-s46-damir-epilogue-month-later-1', 'S46 month-later epilogue', 's46-damir-epilogue-month-later');
          await special.page.screenshot({ path: join(evidenceDir, 'desktop-s46-epilogue.png'), fullPage: true });
        }
        assert.deepEqual(special.errors, [], `${label} JS errors: ${special.errors.join('; ')}`);
      } finally { await special.context.close(); }
    }
    process.stdout.write('M4_BROWSER_QA_PASS: mobile/desktop, Save/Reload/Back, S01→S03, S07, S18, S26 Eric route plus static four-route proof, S38, S39, S44/S46→S48, fonts, image geometry, no JS errors\n');
  } finally {
    if (browser) await browser.close();
    await new Promise(fulfill => server.close(fulfill));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
