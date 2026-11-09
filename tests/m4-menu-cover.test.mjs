import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const imagePath = new URL('../game-studio/assets/branding/kiss-at-the-edge-cover.png', import.meta.url);
const cssPath = new URL('../game-studio/src/ui/original-game.css', import.meta.url);
const inventoryPath = new URL('../docs/migration/m4-assets-inventory.json', import.meta.url);
const expected = {
  sourceCommit: '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c',
  sourceBlobSha: 'a0da5d576eeb97156897876e3088d56b6c8686fd',
  sha256: '8f38b9516533fa0cdc760cd44e7dfd21f05d87e7a3589f5229b90a9d5b9fa6a5',
  path: 'assets/branding/kiss-at-the-edge-cover.png',
};

test('menu cover is byte-identical to the rights-pinned original asset', () => {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  const entry = inventory.entries.find(asset => asset.id === 'kiss-at-the-edge-cover');
  assert.equal(inventory.sourceCommit, expected.sourceCommit);
  assert.equal(entry.status, 'accepted');
  assert.equal(entry.admittedPath, expected.path);
  assert.equal(entry.sourceBlobSha, expected.sourceBlobSha);
  assert.equal(entry.sha256, expected.sha256);
  assert.equal(entry.licenseEvidence.sha256.toLowerCase(), expected.sha256);
  assert.equal(entry.licenseEvidence.license, 'generated for this project');

  const bytes = readFileSync(imagePath);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(bytes.length > 2_000_000, 'use the source-quality PNG, not the 46 KB preview WebP');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
  assert.equal(createHash('sha1').update(Buffer.concat([
    Buffer.from(`blob ${bytes.length}\0`), bytes,
  ])).digest('hex'), expected.sourceBlobSha);
});

test('original home uses the admitted local source-quality PNG with an accessible gradient overlay', () => {
  const css = readFileSync(cssPath, 'utf8');
  const home = css.match(/\.original-home\s*\{([^}]+)\}/s)?.[1];
  assert.ok(home, 'original home must retain its CSS background');
  const source = home.match(/url\(['"]?([^)'\"]+)['"]?\)/)?.[1];
  assert.ok(source, 'home must load an actual image');
  assert.equal(new URL(source, cssPath).pathname, imagePath.pathname);
  assert.match(home, /linear-gradient\(/);
});

test('mobile title-cover crop keeps the heroine focal point in view', () => {
  const css = readFileSync(cssPath, 'utf8');
  const mobile = css.match(/@media \(max-width:\s*680px\)\s*\{\s*\.original-home\s*\{([^}]+)\}/s)?.[1];
  assert.ok(mobile, 'mobile title menu overrides missing');
  const position = mobile.match(/background-position:\s*([\d.]+)%\s+center\s*;/)?.[1];
  assert.ok(position, 'mobile background position must be defined');

  // The pinned 1920×900 cover PNG places Alice's facial focal point near x=640.
  // Verify the actual cover-crop geometry, not a particular chosen percentage.
  for (const [width, height] of [[390, 844], [320, 700]]) {
    const scale = Math.max(width / 1920, height / 900);
    const renderedWidth = 1920 * scale;
    const faceX = 640 * scale + (width - renderedWidth) * Number(position) / 100;
    assert.ok(faceX > 30 && faceX < width - 30,
      `Alice's face is cropped out at ${width}×${height}: visible x=${faceX.toFixed(1)}`);
  }
});
