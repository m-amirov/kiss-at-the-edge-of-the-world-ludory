import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { inspectStoredArchive, verifyArchiveReceipt } from '../tools/f6e-archive-verification.mjs';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function storedZip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const [name, value] of entries) {
    const nameBytes = Buffer.from(name, 'utf8');
    const bytes = Buffer.from(value);
    const crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    local.push(header, nameBytes, bytes);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0, 8);
    record.writeUInt16LE(0, 10);
    record.writeUInt32LE(crc, 16);
    record.writeUInt32LE(bytes.length, 20);
    record.writeUInt32LE(bytes.length, 24);
    record.writeUInt16LE(nameBytes.length, 28);
    record.writeUInt32LE(0, 38);
    record.writeUInt32LE(offset, 42);
    central.push(record, nameBytes);
    offset += header.length + nameBytes.length + bytes.length;
  }
  const centralBytes = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBytes.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBytes, eocd]);
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f6e-archive-verification-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourceRoot = path.join(root, 'game-studio');
  fs.mkdirSync(path.join(sourceRoot, 'assets', 'fonts'), { recursive: true });
  const sourceEntries = new Map([
    ['assets/fonts/CormorantGaramond[wght].ttf', Buffer.from('cormorant font')],
    ['assets/fonts/OFL-CormorantGaramond.txt', Buffer.from('cormorant notice')],
    ['assets/fonts/Manrope[wght].ttf', Buffer.from('manrope font')],
    ['assets/fonts/OFL-Manrope.txt', Buffer.from('manrope notice')],
  ]);
  for (const [name, bytes] of sourceEntries) {
    const filename = path.join(sourceRoot, name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, bytes);
  }
  const entries = [
    ['assets/fonts/CormorantGaramond-wght.ttf', sourceEntries.get('assets/fonts/CormorantGaramond[wght].ttf')],
    ['assets/fonts/OFL-CormorantGaramond.txt', sourceEntries.get('assets/fonts/OFL-CormorantGaramond.txt')],
    ['assets/fonts/Manrope-wght.ttf', sourceEntries.get('assets/fonts/Manrope[wght].ttf')],
    ['assets/fonts/OFL-Manrope.txt', sourceEntries.get('assets/fonts/OFL-Manrope.txt')],
    ['assets/ludory-yandex.js', Buffer.from('runtime')],
    ['index.html', Buffer.from('<!doctype html>')],
    ['ludory.project.json', Buffer.from(JSON.stringify({ schemaVersion: 1, id: 'fixture', version: '1.0.0', title: { ru: 'Fixture' }, engine: 'web', targets: ['yandex-games'] }))],
    ['src/main.js', Buffer.from('export default 1;')],
  ];
  const archivePath = path.join(root, 'yandex.zip');
  fs.writeFileSync(archivePath, storedZip(entries));
  const inspected = inspectStoredArchive(archivePath, { target: 'yandex-games' });
  const candidate = { target: 'yandex-games', archiveSha256: inspected.sha256, files: inspected.files };
  const sourceFiles = [...sourceEntries].map(([name, bytes]) => ({ path: name, sha256: sha256(bytes), size: bytes.length }));
  return { root, sourceRoot, archivePath, entries, candidate, sourceFiles };
}

function writeArchive(fixtureData, entries) {
  fs.writeFileSync(fixtureData.archivePath, storedZip(entries));
}

function receiptFor(archivePath, entries) {
  const inspected = inspectStoredArchive(archivePath, { target: 'yandex-games' });
  return { target: 'yandex-games', archiveSha256: inspected.sha256, files: inspected.files, entries };
}

function assertBlocked(run) {
  assert.throws(run, /F6E_|ZIP|archive|receipt|notice|source/i);
}

test('rejects arbitrary bytes in place of a ZIP', t => {
  const f = fixture(t);
  fs.writeFileSync(f.archivePath, Buffer.from('not a zip'));
  assertBlocked(() => verifyArchiveReceipt({ archivePath: f.archivePath, candidate: f.candidate,
    target: 'yandex-games', sourceRoot: f.sourceRoot, sourceFiles: f.sourceFiles }));
});

test('rejects a same-size byte mutation', t => {
  const f = fixture(t);
  const changed = Buffer.from(fs.readFileSync(f.archivePath));
  changed[changed.length - 1] ^= 0x01;
  assert.equal(changed.length, fs.statSync(f.archivePath).size);
  fs.writeFileSync(f.archivePath, changed);
  assertBlocked(() => verifyArchiveReceipt({ archivePath: f.archivePath, candidate: f.candidate,
    target: 'yandex-games', sourceRoot: f.sourceRoot, sourceFiles: f.sourceFiles }));
});

test('rejects a changed ZIP when receipts are unchanged', t => {
  const f = fixture(t);
  const entries = f.entries.map(([name, bytes]) => [name, name === 'src/main.js' ? Buffer.from('export default 2;') : bytes]);
  writeArchive(f, entries);
  assertBlocked(() => verifyArchiveReceipt({ archivePath: f.archivePath, candidate: f.candidate,
    target: 'yandex-games', sourceRoot: f.sourceRoot, sourceFiles: f.sourceFiles }));
});

test('rejects a ZIP and receipts changed together when source-derived bytes disagree', t => {
  const f = fixture(t);
  const entries = f.entries.map(([name, bytes]) => [name,
    name === 'assets/fonts/OFL-Manrope.txt' ? Buffer.from('tampered notice') : bytes]);
  writeArchive(f, entries);
  const candidate = receiptFor(f.archivePath, entries);
  assertBlocked(() => verifyArchiveReceipt({ archivePath: f.archivePath, candidate,
    target: 'yandex-games', sourceRoot: f.sourceRoot, sourceFiles: f.sourceFiles }));
});

test('rejects a changed or missing required OFL notice', t => {
  for (const mode of ['changed', 'missing']) {
    const f = fixture(t);
    const entries = f.entries
      .filter(([name]) => mode !== 'missing' || name !== 'assets/fonts/OFL-Manrope.txt')
      .map(([name, bytes]) => [name, mode === 'changed' && name === 'assets/fonts/OFL-Manrope.txt'
        ? Buffer.from('tampered notice') : bytes]);
    writeArchive(f, entries);
    let candidate;
    try { candidate = receiptFor(f.archivePath, entries); }
    catch { candidate = { target: 'yandex-games', archiveSha256: '0'.repeat(64), files: [] }; }
    assertBlocked(() => verifyArchiveReceipt({ archivePath: f.archivePath, candidate,
      target: 'yandex-games', sourceRoot: f.sourceRoot, sourceFiles: f.sourceFiles }), mode);
  }
});
