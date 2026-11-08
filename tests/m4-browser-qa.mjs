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
  ['.css', 'text/css'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp']]);

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
    const now = document.querySelector('.ludory-narrative__panel')?.getAttribute('aria-label');
    return now && now !== before;
  }, previous, { timeout: 5000 });
}

async function advanceToSeatChoice(page) {
  const seat = page.locator('button[data-action="narrative:choose:s01-seat-choice:front-eric"]');
  for (let index = 0; index < 100; index++) {
    if (await seat.count()) return;
    const panel = page.locator('.ludory-narrative__panel');
    const before = await panel.getAttribute('aria-label');
    const next = page.locator('button[data-action^="narrative:next:"]');
    assert.equal(await next.count(), 1, `Unexpected interaction before seat choice: ${before}`);
    await next.click();
    await waitForBeatChange(page, before);
  }
  assert.fail('S01 seat choice was not reached within 100 beats');
}

async function assertViewport(page, label) {
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.ludory-narrative__panel')?.getBoundingClientRect();
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
      panel: panel && { left: panel.left, right: panel.right, top: panel.top, bottom: panel.bottom } };
  });
  assert.ok(geometry.panel, `${label}: visible narrative panel missing`);
  assert.ok(geometry.scrollWidth <= geometry.width + 2, `${label}: horizontal overflow: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.panel.left >= -2 && geometry.panel.right <= geometry.width + 2,
    `${label}: narrative panel clipped horizontally: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.panel.bottom > 0 && geometry.panel.top < geometry.height,
    `${label}: narrative panel out of viewport: ${JSON.stringify(geometry)}`);
}

async function createPage(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.locator('.ludory-narrative__panel').waitFor();
  await page.waitForFunction(() => document.querySelector('#status')?.textContent === 'История запущена');
  assert.match(await page.title(), /Поцелуй на краю света/);
  assert.match(await page.locator('.ludory-narrative__panel').getAttribute('aria-label'), /^s01-airport:/);
  assert.equal(await page.locator('.ludory-narrative').getAttribute('data-visual'), 'true');
  assert.equal(await page.locator('.ludory-narrative__stage img').count(), 0,
    `${name}: unadmitted media unexpectedly rendered`);
  assert.ok((await page.locator('.ludory-narrative__stage').getAttribute('data-neutral'))?.length,
    `${name}: missing explicit neutral visual fallback`);
  await assertViewport(page, name);
  await page.screenshot({ path: join(evidenceDir, `${name}-start.png`), fullPage: true });
  return { context, page, errors };
}

async function main() {
  await mkdir(evidenceDir, { recursive: true });
  await new Promise((fulfill, reject) => server.listen(0, '127.0.0.1', error => error ? reject(error) : fulfill()));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const mobile = await createPage(browser, 'mobile-390x844', { width: 390, height: 844 });
    try {
      await mobile.page.locator('#language').click();
      assert.equal(await mobile.page.locator('#save').textContent(), 'Save');
      assert.equal(await mobile.page.locator('html').getAttribute('lang'), 'en');
      await mobile.page.locator('#language').click();
      await advanceToSeatChoice(mobile.page);
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-seat-choice.png'), fullPage: true });
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:front-eric"]').click();
      await mobile.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.getAttribute('aria-label')?.startsWith('s01-eric:'));
      assert.equal(await mobile.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-eric');
      await mobile.page.locator('button[data-action="narrative:back"]').click();
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-nick"]').waitFor();
      await mobile.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-nick"]').click();
      await mobile.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.getAttribute('aria-label')?.startsWith('s01-nick:'));
      assert.equal(await mobile.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-nick');
      await mobile.page.locator('#save').click();
      await mobile.page.waitForFunction(() => document.querySelector('#status')?.textContent === 'Сохранено');
      const savedBeat = await mobile.page.locator('.ludory-narrative__panel').getAttribute('aria-label');
      await mobile.page.reload({ waitUntil: 'networkidle' });
      await mobile.page.waitForFunction(() => document.querySelector('#status')?.textContent === 'Сохранение восстановлено');
      assert.equal(await mobile.page.locator('.ludory-narrative__panel').getAttribute('aria-label'), savedBeat);
      await assertViewport(mobile.page, 'mobile-restored');
      await mobile.page.screenshot({ path: join(evidenceDir, 'mobile-restored-nick.png'), fullPage: true });
      assert.deepEqual(mobile.errors, [], `mobile JS errors: ${mobile.errors.join('; ')}`);
    } finally { await mobile.context.close(); }

    const desktop = await createPage(browser, 'desktop-1000x720', { width: 1000, height: 720 });
    try {
      await advanceToSeatChoice(desktop.page);
      await desktop.page.locator('button[data-action="narrative:choose:s01-seat-choice:back-damir"]').click();
      await desktop.page.waitForFunction(() => document.querySelector('.ludory-narrative__panel')?.getAttribute('aria-label')?.startsWith('s01-damir:'));
      assert.equal(await desktop.page.locator('.ludory-narrative__stage').getAttribute('data-variant-id'), 'car-damir');
      await assertViewport(desktop.page, 'desktop-damir');
      await desktop.page.screenshot({ path: join(evidenceDir, 'desktop-damir.png'), fullPage: true });
      assert.deepEqual(desktop.errors, [], `desktop JS errors: ${desktop.errors.join('; ')}`);
    } finally { await desktop.context.close(); }
    process.stdout.write('M4_BROWSER_QA_PASS: mobile/desktop, Eric/Nick/Damir, Back, Save/Reload, neutral art, geometry\n');
  } finally {
    if (browser) await browser.close();
    await new Promise(fulfill => server.close(fulfill));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
