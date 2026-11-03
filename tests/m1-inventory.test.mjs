import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { atomicWrite, collectTree, parseLsTree } from '../tools/m1-inventory.mjs';

const script = fileURLToPath(new URL('../tools/m1-inventory.mjs', import.meta.url));

function git(dir, ...args) {
  const result = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'm1-git-fixture-'));
  git(dir, 'init', '-q');
  git(dir, 'config', 'user.email', 'm1@example.invalid');
  git(dir, 'config', 'user.name', 'M1 Test');
  mkdirSync(join(dir, 'content'));
  writeFileSync(join(dir, 'content', 'Эпизод 1.md'), 'один\n');
  writeFileSync(join(dir, 'content', 'line\nbreak.md'), 'два\n');
  writeFileSync(join(dir, 'README.md'), 'fixture\n');
  git(dir, 'add', '.');
  git(dir, 'commit', '-qm', 'fixture');
  return { dir, commit: git(dir, 'rev-parse', 'HEAD'), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test('parses NUL-separated tree records without losing Unicode or newlines', () => {
  const input = Buffer.from('100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tcontent/Эпизод 1.md\0' +
    '100644 blob bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\tcontent/line\nbreak.md\0');
  assert.deepEqual(parseLsTree(input), [
    { path: 'content/line\nbreak.md', mode: '100644', type: 'blob', objectId: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    { path: 'content/Эпизод 1.md', mode: '100644', type: 'blob', objectId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  ]);
});

test('rejects invalid UTF-8 Git paths instead of inventing replacement characters', () => {
  const bytes = Buffer.concat([
    Buffer.from('100644 blob aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tcontent/'),
    Buffer.from([0xff, 0x2e, 0x6d, 0x64, 0]),
  ]);
  assert.throws(() => parseLsTree(bytes), /UTF-8|encoding|valid/i);
});

test('reads an exact commit, not a dirty worktree', async () => {
  const f = fixture();
  try {
    writeFileSync(join(f.dir, 'README.md'), 'uncommitted\n');
    const result = await collectTree({ dir: f.dir, ref: f.commit, role: 'source', repository: 'fixture/source' });
    assert.equal(result.commit, f.commit);
    assert.deepEqual(result.groupCounts, { 'README.md': 1, content: 2 });
    assert.equal(result.files.length, 3);
    assert.deepEqual(result.files.map(({path}) => path), ['README.md', 'content/line\nbreak.md', 'content/Эпизод 1.md']);
  } finally { f.cleanup(); }
});

test('returns byte-identical JSON for unchanged trees', async () => {
  const f = fixture();
  try {
    const first = await collectTree({ dir: f.dir, ref: f.commit, role: 'source', repository: 'fixture/source' });
    const second = await collectTree({ dir: f.dir, ref: f.commit, role: 'source', repository: 'fixture/source' });
    assert.equal(JSON.stringify(first), JSON.stringify(second));
  } finally { f.cleanup(); }
});

test('fails closed on missing commits instead of inventing an inventory', async () => {
  const f = fixture();
  try {
    await assert.rejects(() => collectTree({ dir: f.dir, ref: '0'.repeat(40), role: 'source', repository: 'fixture/source' }), /commit|object|Git/i);
  } finally { f.cleanup(); }
});

test('does not lazy-fetch a missing tree in a promisor partial clone', async () => {
  const f = fixture();
  const tmp = mkdtempSync(join(tmpdir(), 'm1-promisor-'));
  const origin = join(tmp, 'origin.git');
  const partial = join(tmp, 'partial');
  try {
    const bare = spawnSync('git', ['clone', '--bare', '-q', f.dir, origin], { encoding: 'utf8' });
    assert.equal(bare.status, 0, bare.stderr);
    git(origin, 'config', 'uploadpack.allowFilter', 'true');
    const cloned = spawnSync('git', ['clone', '-q', '--depth=1', '--filter=tree:0', '--no-checkout', `file://${origin}`, partial], { encoding: 'utf8' });
    assert.equal(cloned.status, 0, cloned.stderr);
    const treeId = git(f.dir, 'rev-parse', 'HEAD^{tree}');
    const checkMissing = () => spawnSync('git', ['-C', partial, 'cat-file', '-e', treeId], {
      encoding: 'utf8', env: { ...process.env, GIT_NO_LAZY_FETCH: '1' },
    }).status;
    assert.notEqual(checkMissing(), 0, 'Fixture must have an omitted tree object');
    await assert.rejects(() => collectTree({ dir: partial, ref: f.commit, role: 'source', repository: 'fixture/source' }), /Git|tree|object/i);
    assert.notEqual(checkMissing(), 0, 'Inventory must not populate a missing Git object');
  } finally { f.cleanup(); rmSync(tmp, { recursive: true, force: true }); }
});

test('failed CLI preflight does not overwrite an existing output', () => {
  const f = fixture();
  try {
    const output = join(f.dir, 'report.json');
    writeFileSync(output, 'sentinel\n');
    const result = spawnSync(process.execPath, [script, '--source', f.dir, '--ludory', f.dir, '--output', output], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'sentinel\n');
  } finally { f.cleanup(); }
});

test('failed atomic rename leaves existing target and no sibling temporary file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'm1-atomic-'));
  const target = join(dir, 'existing-directory');
  try {
    mkdirSync(target);
    writeFileSync(join(target, 'sentinel'), 'keep\n');
    await assert.rejects(() => atomicWrite(target, '{"complete":true}\n'));
    assert.equal(readFileSync(join(target, 'sentinel'), 'utf8'), 'keep\n');
    assert.deepEqual(readdirSync(dir), ['existing-directory']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
