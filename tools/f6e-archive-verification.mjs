import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_FILES = 10_000;
const MEDIA_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ogg', '.mp3', '.wav', '.woff2', '.ttf', '.css']);
const FONT_NOTICE_NAMES = new Set([
  'assets/fonts/OFL-CormorantGaramond.txt',
  'assets/fonts/OFL-Manrope.txt',
]);
const REQUIRED = Object.freeze({
  'yandex-games': ['assets/ludory-yandex.js', 'index.html', 'ludory.project.json', 'src/main.js'],
  'vk-games': ['assets/ludory-vk.js', 'assets/vk-bridge.js', 'index.html',
    'licenses/swc-helpers.txt', 'licenses/vk-bridge.txt', 'ludory.project.json', 'src/main.js'],
});
const FONT_PAIRS = Object.freeze([
  ['assets/fonts/CormorantGaramond-wght.ttf', 'assets/fonts/OFL-CormorantGaramond.txt'],
  ['assets/fonts/Manrope-wght.ttf', 'assets/fonts/OFL-Manrope.txt'],
]);
const FONT_MEMBER_NAMES = new Set(FONT_PAIRS.flatMap(([font]) => [font]));
const SAFE_PART = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const DEVICE = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const SHA256 = /^[a-f0-9]{64}$/;

const fail = (code, message) => { throw new Error(`F6E_${code}: ${message}`); };
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function readRegularBytes(filename) {
  const absolute = path.resolve(filename);
  let current = path.parse(absolute).root;
  for (const segment of absolute.slice(current.length).split(path.sep)) {
    if (!segment) continue;
    current = path.join(current, segment);
    let stat;
    try { stat = fs.lstatSync(current); }
    catch (error) { fail(error.code === 'ENOENT' ? 'ARCHIVE_MISSING' : 'ARCHIVE_UNREADABLE', error.message); }
    if (stat.isSymbolicLink()) fail('ARCHIVE_SYMLINK', `symbolic path component: ${current}`);
  }
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) fail('ARCHIVE_NOT_REGULAR', absolute);
  if (!stat.size || stat.size > MAX_ARCHIVE_BYTES) fail('ARCHIVE_SIZE', `invalid size: ${stat.size}`);
  return fs.readFileSync(absolute);
}

function checkRange(bytes, offset, size, end = bytes.length) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(size) || offset < 0 || size < 0 ||
      offset > end || size > end - offset) fail('ARCHIVE_TRUNCATED', 'ZIP record exceeds archive bounds');
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function safeName(name) {
  if (!name || name.includes('\\') || name.startsWith('/') || name.includes(':') ||
      name.split('/').some(part => !SAFE_PART.test(part) || part === '.' || part === '..' ||
        DEVICE.test(part) || /[. ]$/.test(part))) {
    fail('ARCHIVE_PATH', `unsafe member: ${JSON.stringify(name)}`);
  }
  return name;
}

function assertManifest(bytes, target) {
  let manifest;
  try { manifest = JSON.parse(bytes.toString('utf8')); }
  catch { fail('ARCHIVE_MANIFEST', 'ludory.project.json is not JSON'); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) ||
      manifest.schemaVersion !== 1 || typeof manifest.id !== 'string' ||
      typeof manifest.version !== 'string' || typeof manifest.engine !== 'string' ||
      !manifest.title || typeof manifest.title !== 'object' || Array.isArray(manifest.title) ||
      !Array.isArray(manifest.targets) || manifest.targets.length !== 1 || manifest.targets[0] !== target) {
    fail('ARCHIVE_MANIFEST', `invalid ${target} project manifest`);
  }
}

function assertFontNoticePairing(names, target) {
  const present = new Set(names);
  for (const [font, notice] of FONT_PAIRS) {
    if (present.has(font) !== present.has(notice)) {
      fail('FONT_NOTICE_PAIRING', `${target}: ${font} <-> ${notice}`);
    }
  }
  for (const notice of FONT_NOTICE_NAMES) {
    if (present.has(notice) && !FONT_PAIRS.some(([font, paired]) => paired === notice && present.has(font))) {
      fail('FONT_NOTICE_PAIRING', `${target}: unpaired ${notice}`);
    }
  }
}

function assertFileArray(files, label) {
  if (!Array.isArray(files)) fail('RECEIPT_FILES', `${label} files must be an array`);
  const names = new Set();
  for (const file of files) {
    if (!file || typeof file.path !== 'string' || !SHA256.test(file.sha256) ||
        !Number.isSafeInteger(file.size) || file.size < 0 || names.has(file.path)) {
      fail('RECEIPT_FILES', `invalid or duplicate ${label} member`);
    }
    names.add(file.path);
  }
}

function sameFiles(expected, actual, label) {
  assertFileArray(expected, `${label} receipt`);
  const normalize = files => [...files].sort((a, b) => a.path.localeCompare(b.path));
  if (JSON.stringify(normalize(expected)) !== JSON.stringify(normalize(actual))) {
    fail('RECEIPT_MEMBER_MISMATCH', `${label} receipt does not match inspected ZIP members`);
  }
}

/** Inspect actual stored ZIP bytes and return independently hashed members. */
export function inspectStoredArchive(archivePath, { target } = {}) {
  if (!REQUIRED[target]) fail('TARGET', `unsupported target: ${target}`);
  const bytes = readRegularBytes(archivePath);
  if (bytes.length < 22 || bytes.readUInt32LE(bytes.length - 22) !== 0x06054b50) {
    fail('ARCHIVE_EOCD', 'ZIP end-of-central-directory is missing or unsupported');
  }
  const eocd = bytes.length - 22;
  const disk = bytes.readUInt16LE(eocd + 4);
  const centralDisk = bytes.readUInt16LE(eocd + 6);
  const diskEntries = bytes.readUInt16LE(eocd + 8);
  const count = bytes.readUInt16LE(eocd + 10);
  const centralLength = bytes.readUInt32LE(eocd + 12);
  const centralOffset = bytes.readUInt32LE(eocd + 16);
  if (disk || centralDisk || diskEntries !== count || count === 0 || count === 0xffff ||
      centralLength === 0xffffffff || centralOffset === 0xffffffff || bytes.readUInt16LE(eocd + 20)) {
    fail('ARCHIVE_UNSUPPORTED', 'multipart, ZIP64, empty ZIP or ZIP comment is unsupported');
  }
  if (count > MAX_FILES) fail('ARCHIVE_FILES', 'too many ZIP members');
  checkRange(bytes, centralOffset, centralLength, eocd);
  if (centralOffset + centralLength !== eocd) fail('ARCHIVE_LAYOUT', 'unexpected bytes after central directory');

  const records = [];
  const names = new Set();
  let cursor = centralOffset;
  let expanded = 0;
  for (let index = 0; index < count; index += 1) {
    checkRange(bytes, cursor, 46, eocd);
    if (bytes.readUInt32LE(cursor) !== 0x02014b50) fail('ARCHIVE_CENTRAL', 'invalid central-directory record');
    const flags = bytes.readUInt16LE(cursor + 8);
    const method = bytes.readUInt16LE(cursor + 10);
    const crc = bytes.readUInt32LE(cursor + 16);
    const compressed = bytes.readUInt32LE(cursor + 20);
    const size = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const entryDisk = bytes.readUInt16LE(cursor + 34);
    const external = bytes.readUInt32LE(cursor + 38);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    checkRange(bytes, cursor + 46, nameLength + extraLength + commentLength, eocd);
    if (flags || method || entryDisk || extraLength || commentLength || compressed !== size ||
        size === 0xffffffff || localOffset === 0xffffffff) {
      fail('ARCHIVE_UNSUPPORTED', 'only plain stored ZIP members are accepted');
    }
    if ((external & 0x10) !== 0 || ((external >>> 16) & 0xf000) === 0xa000) {
      fail('ARCHIVE_ATTRIBUTES', 'directory, symlink or special member is forbidden');
    }
    const name = safeName(bytes.toString('utf8', cursor + 46, cursor + 46 + nameLength));
    if (Buffer.byteLength(name, 'utf8') !== nameLength || !/^[\x20-\x7e]+$/.test(name)) {
      fail('ARCHIVE_PATH', `non-canonical member name: ${name}`);
    }
    const folded = name.toLowerCase();
    if (names.has(folded)) fail('ARCHIVE_DUPLICATE', `duplicate or case-ambiguous member: ${name}`);
    names.add(folded);
    expanded += size;
    if (expanded > MAX_ARCHIVE_BYTES) fail('ARCHIVE_SIZE', 'expanded ZIP exceeds limit');
    records.push({ name, crc, size, localOffset });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== eocd) fail('ARCHIVE_LAYOUT', 'central-directory length mismatch');

  const files = [];
  const contents = new Map();
  let localEnd = 0;
  for (const record of records.sort((left, right) => left.localOffset - right.localOffset)) {
    const at = record.localOffset;
    if (at !== localEnd) fail('ARCHIVE_LAYOUT', 'ZIP local entries overlap or contain gaps');
    checkRange(bytes, at, 30, centralOffset);
    if (bytes.readUInt32LE(at) !== 0x04034b50 || bytes.readUInt16LE(at + 6) || bytes.readUInt16LE(at + 8) ||
        bytes.readUInt32LE(at + 14) !== record.crc || bytes.readUInt32LE(at + 18) !== record.size ||
        bytes.readUInt32LE(at + 22) !== record.size || bytes.readUInt16LE(at + 28)) {
      fail('ARCHIVE_LOCAL', `local header disagrees for ${record.name}`);
    }
    const nameLength = bytes.readUInt16LE(at + 26);
    checkRange(bytes, at + 30, nameLength + record.size, centralOffset);
    if (bytes.toString('utf8', at + 30, at + 30 + nameLength) !== record.name) {
      fail('ARCHIVE_LOCAL', `local and central names disagree for ${record.name}`);
    }
    const content = Buffer.from(bytes.subarray(at + 30 + nameLength, at + 30 + nameLength + record.size));
    if (crc32(content) !== record.crc) fail('ARCHIVE_CRC', `CRC mismatch for ${record.name}`);
    files.push({ path: record.name, sha256: sha256(content), size: record.size });
    contents.set(record.name, content);
    localEnd = at + 30 + nameLength + record.size;
  }
  if (localEnd !== centralOffset) fail('ARCHIVE_LAYOUT', 'ZIP local data does not end at central directory');

  const present = new Set(contents.keys());
  for (const required of REQUIRED[target]) if (!present.has(required)) fail('ARCHIVE_REQUIRED', `missing ${required}`);
  for (const name of present) {
    if (name.toLowerCase().split('/').at(-1) === 'sdk.js') fail('ARCHIVE_SDK', `forbidden SDK member: ${name}`);
    if (!REQUIRED[target].includes(name) && (!name.startsWith('assets/') ||
        (!MEDIA_EXTENSIONS.has(path.posix.extname(name).toLowerCase()) && !FONT_NOTICE_NAMES.has(name)))) {
      if (!(target === 'vk-games' && name.startsWith('licenses/'))) {
        fail('ARCHIVE_UNEXPECTED', `unexpected ${target} member: ${name}`);
      }
    }
  }
  assertFontNoticePairing(present, target);
  assertManifest(contents.get('ludory.project.json'), target);
  files.sort((left, right) => left.path.localeCompare(right.path));
  return { sha256: sha256(bytes), bytes: bytes.length, files, contents };
}

function resolveSource(sourceRoot, sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath || path.posix.isAbsolute(sourcePath) || sourcePath.includes('\\')) {
    fail('SOURCE_PATH', `unsafe source path: ${sourcePath}`);
  }
  const root = path.resolve(sourceRoot);
  const filename = path.resolve(root, ...sourcePath.split('/'));
  if (filename !== root && !filename.startsWith(`${root}${path.sep}`)) fail('SOURCE_PATH', sourcePath);
  return filename;
}

function readSource(sourceRoot, sourcePath) {
  const filename = resolveSource(sourceRoot, sourcePath);
  let stat;
  try { stat = fs.lstatSync(filename); }
  catch (error) { fail('SOURCE_MISSING', `${sourcePath}: ${error.message}`); }
  if (!stat.isFile() || stat.isSymbolicLink()) fail('SOURCE_NOT_REGULAR', sourcePath);
  const bytes = fs.readFileSync(filename);
  return { bytes, sha256: sha256(bytes), size: bytes.length };
}

function sourcePathForMember(memberPath, candidate, sourceMap) {
  if ((candidate.derivedFiles ?? []).some(file => file.path === memberPath) &&
      !FONT_MEMBER_NAMES.has(memberPath) && !FONT_NOTICE_NAMES.has(memberPath)) {
    return null;
  }
  const derivation = new Map((candidate.assetDerivations ?? []).map(item => [item.derivedPath, item])).get(memberPath);
  if (derivation) return { sourcePath: derivation.sourcePath, exact: false };
  const renames = new Map([
    ['assets/fonts/CormorantGaramond-wght.ttf', 'assets/fonts/CormorantGaramond[wght].ttf'],
    ['assets/fonts/Manrope-wght.ttf', 'assets/fonts/Manrope[wght].ttf'],
  ]);
  const sourcePath = renames.get(memberPath) ?? (memberPath.startsWith('assets/ui/')
    ? `src/ui/${memberPath.slice('assets/ui/'.length)}` : memberPath);
  if (!sourceMap.has(sourcePath)) return null;
  return { sourcePath, exact: !memberPath.endsWith('.css') };
}

/** Verify actual archive bytes, editable receipts, and source-bound direct members. */
export function verifyArchiveReceipt({ archivePath, candidate, buildReceipt, target, sourceRoot, sourceFiles }) {
  const inspected = inspectStoredArchive(archivePath, { target });
  if (!candidate || candidate.target !== target || path.resolve(candidate.archivePath ?? archivePath) !== path.resolve(archivePath) ||
      candidate.archiveSha256 !== inspected.sha256) {
    fail('ARCHIVE_RECEIPT_MISMATCH', `${target} paired receipt does not bind the actual archive`);
  }
  if (candidate.archiveBytes !== undefined && candidate.archiveBytes !== inspected.bytes) {
    fail('ARCHIVE_RECEIPT_MISMATCH', `${target} byte count differs`);
  }
  sameFiles(candidate.files, inspected.files, target);
  if (buildReceipt) {
    if (path.resolve(buildReceipt.archivePath ?? archivePath) !== path.resolve(archivePath) ||
        buildReceipt.sha256 !== inspected.sha256) fail('BUILD_RECEIPT_MISMATCH', `${target} build receipt mismatch`);
    sameFiles(buildReceipt.files, inspected.files, `${target} build`);
  }

  assertFileArray(sourceFiles, 'source');
  const sourceMap = new Map();
  for (const expected of sourceFiles) {
    if (sourceMap.has(expected.path)) fail('SOURCE_RECEIPT', `duplicate source: ${expected.path}`);
    const actual = readSource(sourceRoot, expected.path);
    if (expected.sha256 !== actual.sha256 || expected.size !== actual.size) {
      fail('SOURCE_RECEIPT_MISMATCH', `source bytes changed: ${expected.path}`);
    }
    sourceMap.set(expected.path, actual);
  }

  for (const derivation of candidate.assetDerivations ?? []) {
    const source = sourceMap.get(derivation.sourcePath);
    if (!source || derivation.sourceSha256 !== source.sha256 || derivation.sourceSize !== source.size) {
      fail('SOURCE_DERIVATION_MISMATCH', `derived member source is not current: ${derivation.sourcePath}`);
    }
  }
  for (const member of inspected.files) {
    const binding = sourcePathForMember(member.path, candidate, sourceMap);
    if (!binding || !binding.exact) continue;
    const source = sourceMap.get(binding.sourcePath);
    const actual = inspected.contents.get(member.path);
    if (!source || !actual || !actual.equals(source.bytes)) {
      fail('SOURCE_MEMBER_MISMATCH', `${member.path} is not the source-derived byte sequence`);
    }
  }
  return inspected;
}
