import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateMobileAssets } from '../tools/m4-build-presentation.mjs';
import {
  originalCgComposition,
  originalCgMobileMode,
  originalCgSource,
} from '../game-studio/src/ui/original-game-ui.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const studio = join(root, 'game-studio');
const mobile = JSON.parse(readFileSync(join(root, 'docs/migration/m4-mobile-assets.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

const active = new Map(mobile.entries.map(entry => [entry.desktopMediaId, entry]));

test('mobile provenance admits only explicit portrait sources and preserves their bytes', () => {
  assert.equal(mobile.schemaVersion, 1);
  assert.equal(mobile.sourceCommit, '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c');
  assert.equal(mobile.mobileBreakpoint, 680);
  assert.equal(mobile.entries.length, 9);
  assert.deepEqual([...active.keys()].sort(), [
    'damir-coffee-cg', 's07-kitchen-cards', 's07-kitchen-pasta',
    's26-alice-choice', 's26-damir-choice', 's26-eric-choice', 's26-nick-choice',
    's38-alice-nick-ordinary-day', 's39-alice-damir-cafe',
  ].sort());
  for (const entry of mobile.entries) {
    assert.equal(entry.status, 'accepted', `${entry.id}: technical admission missing`);
    assert.ok(entry.licenseEvidence?.license, `${entry.id}: license evidence missing`);
    assert.equal(entry.licenseEvidence.sha256, entry.sha256, `${entry.id}: rights SHA mismatch`);
    assert.match(entry.sha256, /^[0-9a-f]{64}$/);
    assert.match(entry.dimensions, /^\d+x\d+$/);
    const bytes = readFileSync(join(studio, entry.portraitPath));
    assert.equal(sha256(bytes), entry.sha256, `${entry.id}: imported PNG changed`);
    assert.deepEqual({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }, (() => {
      const [width, height] = entry.dimensions.split('x').map(Number);
      return { width, height };
    })(), `${entry.id}: dimensions changed`);
    if (entry.sourceKind.startsWith('pinned')) {
      assert.match(entry.sourceBlobSha, /^[0-9a-f]{40}$/);
      assert.equal(entry.admissionEvidence.sourceBlobSha, entry.sourceBlobSha);
    } else {
      assert.equal(entry.sourceBlobSha, null);
      assert.ok(entry.referenceSources?.length, `${entry.id}: generated source references missing`);
      assert.equal(entry.artStatus, 'pending-independent-review');
    }
  }
});

test('rejected original portraits and S39 walk fallback are explicit and never auto-connected', () => {
  assert.deepEqual(mobile.rejectedCandidates.map(entry => entry.id).sort(), [
    's03-editor-call-damir-portrait-original',
    's38-alice-nick-ordinary-day-portrait-original',
    's39-alice-damir-cafe-portrait-original',
  ].sort());
  assert.ok(mobile.rejectedCandidates.every(entry => entry.artStatus === 'rejected-crop'));
  assert.deepEqual(mobile.fallbacks, [{
    desktopMediaId: 's39-alice-damir-cafe-walk',
    portraitPath: null,
    mobileMode: 'desktop-contain',
    reason: 'No admitted vertical source exists for the transition background; keep the authored background and avoid substituting a romantic portrait',
  }]);
  assert.equal(originalCgSource('vis-s39-alice-damir-cafe-walk.png', 390), 'vis-s39-alice-damir-cafe-walk.png');
  assert.equal(originalCgMobileMode('vis-s39-alice-damir-cafe-walk.png', 390), 'desktop-fallback');
  assert.equal(originalCgComposition('vis-s39-alice-damir-cafe-walk.png'), 'mobile-fallback-s39-walk');
});

test('responsive source mapping switches without changing the authored desktop source', () => {
  const cases = [
    ['vis-s03-damir.png', 'vis-s03-damir-portrait-v2.png', 'a2-s03'],
    ['vis-s07-kitchen-pasta.png', 'vis-s07-kitchen-pasta-portrait.png', 'a1-s07'],
    ['vis-s07-kitchen-cards.png', 'vis-s07-kitchen-cards-portrait.png', 'a1-s07'],
    ['vis-s26-eric-choice.png', 'vis-s26-eric-choice-portrait.png', 'a2-s26'],
    ['vis-s26-nick-choice.png', 'vis-s26-nick-choice-portrait.png', 'a2-s26'],
    ['vis-s26-damir-choice.png', 'vis-s26-damir-choice-portrait.png', 'a2-s26'],
    ['vis-s26-alice-choice.png', 'vis-s26-alice-choice-portrait.png', 'a2-s26'],
    ['vis-s38-alice-nick-ordinary-day.png', 'vis-s38-alice-nick-ordinary-day-portrait-v2.png', 'a2-group'],
    ['vis-s39-alice-damir-cafe.png', 'vis-s39-alice-damir-cafe-portrait-v2.png', 'a2-s39'],
  ];
  for (const [desktop, portrait, composition] of cases) {
    assert.equal(originalCgSource(desktop, 390), portrait, `${desktop}: portrait mapping`);
    assert.equal(originalCgSource(desktop, 1440), desktop, `${desktop}: desktop mapping`);
    assert.equal(originalCgMobileMode(desktop, 390), 'portrait', `${desktop}: mobile mode`);
    assert.equal(originalCgMobileMode(desktop, 1440), 'desktop', `${desktop}: desktop mode`);
    assert.equal(originalCgComposition(portrait), composition, `${portrait}: composition alias`);
  }
});

test('mobile admission fails closed for missing or tampered portrait PNGs', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'm4-mobile-assets-'));
  const projectRoot = join(fixtureRoot, 'game-studio');
  const assetsRoot = join(projectRoot, 'assets');
  const docsRoot = join(fixtureRoot, 'docs', 'migration');
  mkdirSync(assetsRoot, { recursive: true });
  mkdirSync(docsRoot, { recursive: true });
  const sourceEntry = mobile.entries[0];
  const entry = structuredClone(sourceEntry);
  entry.id = 'fixture-portrait';
  entry.desktopMediaId = 'fixture-cg';
  entry.desktopPath = 'assets/vis-fixture.png';
  entry.portraitPath = 'assets/vis-fixture-portrait.png';
  const sourceFile = join(studio, sourceEntry.portraitPath);
  copyFileSync(sourceFile, join(projectRoot, entry.portraitPath));
  const fixtureManifest = {
    schemaVersion: 1,
    sourceCommit: mobile.sourceCommit,
    project: 'game-studio',
    mobileBreakpoint: 680,
    entries: [entry],
  };
  writeFileSync(join(docsRoot, 'm4-mobile-assets.json'), `${JSON.stringify(fixtureManifest)}\n`);
  const presentation = { media: { 'fixture-cg': { src: entry.desktopPath } } };
  try {
    assert.deepEqual(validateMobileAssets({ projectRoot, presentation }).ids, ['fixture-portrait']);
    rmSync(join(projectRoot, entry.portraitPath));
    assert.throws(() => validateMobileAssets({ projectRoot, presentation }), /missing regular file/);
    copyFileSync(sourceFile, join(projectRoot, entry.portraitPath));
    const tampered = { ...fixtureManifest, entries: [{ ...entry, sha256: '0'.repeat(64), licenseEvidence: { ...entry.licenseEvidence, sha256: '0'.repeat(64) } }] };
    writeFileSync(join(docsRoot, 'm4-mobile-assets.json'), `${JSON.stringify(tampered)}\n`);
    assert.throws(() => validateMobileAssets({ projectRoot, presentation }), /SHA-256 mismatch/);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
