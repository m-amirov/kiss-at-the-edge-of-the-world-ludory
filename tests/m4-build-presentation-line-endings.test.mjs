import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, cpSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPresentation, canonicalTextSha256 } from '../tools/m4-build-presentation.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const studioRoot = join(repoRoot, 'game-studio');
const inventorySource = join(repoRoot, 'docs/migration/m4-assets-inventory.json');

test('canonical story proof is stable for LF, CRLF, and CR sources', () => {
  const lf = Buffer.from('first line\nsecond line\n', 'utf8');
  const crlf = Buffer.from('first line\r\nsecond line\r\n', 'utf8');
  const cr = Buffer.from('first line\rsecond line\r', 'utf8');
  assert.equal(canonicalTextSha256(lf), canonicalTextSha256(crlf));
  assert.equal(canonicalTextSha256(lf), canonicalTextSha256(cr));
});

test('presentation proof is reproducible when story.js line endings change', () => {
  const base = mkdtempSync(join(tmpdir(), 'm4-line-endings-'));
  const projectRoot = join(base, 'game-studio');
  try {
    cpSync(studioRoot, projectRoot, { recursive: true });
    const inventoryPath = join(base, 'docs/migration/m4-assets-inventory.json');
    mkdirSync(dirname(inventoryPath), { recursive: true });
    cpSync(inventorySource, inventoryPath);

    const story = readFileSync(join(studioRoot, 'src/story.js'), 'utf8').replace(/\r\n?/g, '\n');
    const storyPath = join(projectRoot, 'src/story.js');

    writeFileSync(storyPath, story, 'utf8');
    const lfResult = buildPresentation({ projectRoot, write: true });
    const lfProof = readFileSync(join(projectRoot, 'narrative-assets.json'), 'utf8');

    writeFileSync(storyPath, story.replace(/\n/g, '\r\n'), 'utf8');
    const crlfResult = buildPresentation({ projectRoot, write: true });
    const crlfProof = readFileSync(join(projectRoot, 'narrative-assets.json'), 'utf8');

    assert.equal(crlfResult.storySha256, lfResult.storySha256);
    assert.equal(crlfResult.presentationSha256, lfResult.presentationSha256);
    assert.equal(crlfProof, lfProof);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
