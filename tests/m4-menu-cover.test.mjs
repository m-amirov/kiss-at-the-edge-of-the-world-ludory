import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const imagePath = new URL('../game-studio/assets/branding/menu-hero.webp', import.meta.url);
const cssPath = new URL('../game-studio/src/ui/original-game.css', import.meta.url);
const inventoryPath = new URL('../docs/migration/m4-assets-inventory.json', import.meta.url);
const expected = {
  sourceCommit: '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c',
  sourceBlobSha: '345b55a861af17433b4a20da9cc374bdeb5c3192',
  sha256: '5667bec6163ef908f42ea4f0fbd291307f4c9cf91eae04019c6ba82d7c97f07b',
  path: 'assets/branding/menu-hero.webp',
};

test('menu cover is byte-identical to the rights-pinned original asset', () => {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  const entry = inventory.entries.find(asset => asset.id === 'menu-hero-alice');
  assert.equal(inventory.sourceCommit, expected.sourceCommit);
  assert.equal(entry.status, 'accepted');
  assert.equal(entry.admittedPath, expected.path);
  assert.equal(entry.sourceBlobSha, expected.sourceBlobSha);
  assert.equal(entry.sha256, expected.sha256);
  assert.equal(entry.licenseEvidence.sha256.toLowerCase(), expected.sha256);
  assert.equal(entry.licenseEvidence.license, 'generated for this project');

  const bytes = readFileSync(imagePath);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
  assert.equal(createHash('sha1').update(Buffer.concat([
    Buffer.from(`blob ${bytes.length}\0`), bytes,
  ])).digest('hex'), expected.sourceBlobSha);
});

test('original home uses the admitted local WebP with an accessible gradient overlay', () => {
  const css = readFileSync(cssPath, 'utf8');
  const home = css.match(/\.original-home\s*\{([^}]+)\}/s)?.[1];
  assert.ok(home, 'original home must retain its CSS background');
  const source = home.match(/url\(['"]?([^)'\"]+)['"]?\)/)?.[1];
  assert.ok(source, 'home must load an actual image');
  assert.equal(new URL(source, cssPath).pathname, imagePath.pathname);
  assert.match(home, /linear-gradient\(/);
});
