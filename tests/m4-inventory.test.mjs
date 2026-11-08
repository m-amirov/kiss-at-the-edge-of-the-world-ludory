import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { inventoryAssets } from '../tools/m4-inventory.mjs';

const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');

test('pinned Git inventory is deterministic and fails closed on provenance and target collisions', () => {
  const dir = mkdtempSync(join(tmpdir(), 'm4-inventory-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const put = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  };
  try {
    git('init', '-q');
    git('config', 'user.email', 'tests@example.invalid');
    git('config', 'user.name', 'M4 Tests');
    const names = ['good', 'missing', 'wrong', 'duplicate-a', 'duplicate-b'];
    const assetRows = names.map(id => ({
      id, family: 'background', path: `assets/backgrounds/${id}.webp`,
      runtimePath: id.startsWith('duplicate') ? 'assets/generated/collision.webp' : `assets/generated/${id}.webp`,
    }));
    const rightsRows = [];
    for (const id of names) {
      const path = `assets/backgrounds/${id}.webp`;
      const data = Buffer.from(`RIFF-TEST-WEBP-${id}`);
      put(path, data);
      if (id !== 'missing') rightsRows.push({ path, sha256: id === 'wrong' ? '0'.repeat(64) : sha256(data), license: 'project-generated', method: 'test fixture' });
    }
    for (let i = 0; i < 8; i++) {
      const path = `assets/audio/music/track-${i}.ogg`;
      put(path, Buffer.from(`OggS-test-${i}`));
      assetRows.push({ id: `music-${i}`, family: 'music', path });
      rightsRows.push({ path, license: 'source-assertion-only', method: 'fixture' });
    }
    put('assets/asset-manifest.json', JSON.stringify({ assets: assetRows }));
    put('assets/provenance/rights-manifest.json', JSON.stringify({ assets: rightsRows }));
    git('add', '.');
    git('commit', '-qm', 'pin assets');
    const pin = git('rev-parse', 'HEAD');
    const request = { sourceGitDir: dir, sourceCommit: pin };
    const result = inventoryAssets(request);
    assert.equal(result.sourceCommit, pin);
    assert.equal(result.entries.length, 13);
    assert.deepEqual(result.entries.map(({ id }) => id), result.entries.map(({ id }) => id).toSorted());
    const byId = Object.fromEntries(result.entries.map(entry => [entry.id, entry]));
    assert.equal(byId.good.status, 'candidate');
    assert.equal(byId.good.sha256, sha256(Buffer.from('RIFF-TEST-WEBP-good')));
    assert.match(byId.good.sourceBlobSha, /^[\da-f]{40}$/);
    assert.equal(byId.missing.status, 'blocked');
    assert.equal(byId.missing.reason, 'rights_missing');
    assert.equal(byId.wrong.reason, 'rights_hash_mismatch');
    assert.equal(byId['duplicate-a'].reason, 'duplicate_target_path');
    assert.equal(byId['duplicate-b'].reason, 'duplicate_target_path');
    for (let i = 0; i < 8; i++) assert.equal(byId[`music-${i}`].reason, 'rights_hash_missing');
    assert.deepEqual(inventoryAssets(request), result);
    assert.equal(git('status', '--porcelain'), '');
    put('assets/backgrounds/good.webp', 'tampered in working tree');
    assert.deepEqual(inventoryAssets(request), result, 'must read pinned Git blobs, never working tree');
    git('add', '.');
    git('commit', '-qm', 'move branch');
    assert.deepEqual(inventoryAssets(request), result, 'must not follow moved HEAD');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('refuses unpinned references and unsafe manifest media paths', () => {
  const dir = mkdtempSync(join(tmpdir(), 'm4-inventory-unsafe-'));
  try {
    assert.throws(() => inventoryAssets({ sourceGitDir: dir, sourceCommit: 'HEAD' }), /40.hex|pinned|commit/i);
    assert.throws(() => inventoryAssets({ sourceGitDir: dir, sourceCommit: '1'.repeat(40), assetManifestPath: '../outside' }), /unsafe|path|manifest/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
