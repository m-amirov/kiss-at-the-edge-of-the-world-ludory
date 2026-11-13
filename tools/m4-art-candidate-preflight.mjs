#!/usr/bin/env node
// Validates source-bound retouch candidates without touching game assets.
// Usage: node tools/m4-art-candidate-preflight.mjs --source SRC.png --candidate NEW.png --mask MASK.png --source-sha256 EXPECTED [--report report.json]
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  return c >>> 0;
});
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function decodePng(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.subarray(0, 8).equals(SIGNATURE)) throw Error('Not a PNG file');
  let offset = 8, info, ended = false;
  const idats = [];
  while (offset + 12 <= bytes.length) {
    const len = bytes.readUInt32BE(offset);
    if (len > bytes.length - offset - 12) throw Error('Truncated PNG chunk');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + len);
    const actual = bytes.readUInt32BE(offset + 8 + len);
    if (crc32(bytes.subarray(offset + 4, offset + 8 + len)) !== actual) throw Error(`Invalid CRC in PNG ${type} chunk`);
    offset += 12 + len;
    if (type === 'IHDR') {
      if (info || len !== 13) throw Error('Invalid or repeated PNG IHDR');
      info = {
        width: data.readUInt32BE(0), height: data.readUInt32BE(4), bitDepth: data[8],
        colorType: data[9], compression: data[10], filterMethod: data[11], interlace: data[12],
      };
    } else if (type === 'IDAT') idats.push(data);
    else if (type === 'IEND') { ended = true; break; }
  }
  if (!info || !ended || offset !== bytes.length || !idats.length) throw Error('Incomplete PNG structure');
  const { width, height, bitDepth, colorType, compression, filterMethod, interlace } = info;
  if (!width || !height || width > 8192 || height > 8192 || width * height > 30000000) throw Error('Invalid PNG dimensions');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels || bitDepth !== 8 || compression !== 0 || filterMethod !== 0 || interlace !== 0) {
    throw Error('Use 8-bit non-interlaced grayscale/RGB/RGBA PNG; no indexed colors');
  }
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idats), { maxOutputLength: (stride + 1) * height + 1 });
  if (raw.length !== (stride + 1) * height) throw Error('Invalid PNG decompressed scanline length');
  const rgba = Buffer.alloc(width * height * 4);
  let last = Buffer.alloc(stride), pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++], row = Buffer.from(raw.subarray(pos, pos + stride));
    pos += stride;
    if (filter > 4) throw Error(`Invalid PNG filter ${filter}`);
    for (let x = 0; x < stride; x++) {
      const left = x < channels ? 0 : row[x - channels];
      const up = last[x];
      const upperLeft = x < channels ? 0 : last[x - channels];
      let pred = 0;
      if (filter === 1) pred = left;
      else if (filter === 2) pred = up;
      else if (filter === 3) pred = (left + up) >>> 1;
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - upperLeft);
        pred = a <= b && a <= c ? left : b <= c ? up : upperLeft;
      }
      row[x] = (row[x] + pred) & 255;
    }
    for (let x = 0; x < width; x++) {
      const i = x * channels, j = (y * width + x) * 4;
      if (colorType === 0) {
        rgba[j] = rgba[j + 1] = rgba[j + 2] = row[i]; rgba[j + 3] = 255;
      } else if (colorType === 2) {
        rgba[j] = row[i]; rgba[j + 1] = row[i + 1]; rgba[j + 2] = row[i + 2]; rgba[j + 3] = 255;
      } else if (colorType === 4) {
        rgba[j] = rgba[j + 1] = rgba[j + 2] = row[i]; rgba[j + 3] = row[i + 1];
      } else {
        rgba[j] = row[i]; rgba[j + 1] = row[i + 1]; rgba[j + 2] = row[i + 2]; rgba[j + 3] = row[i + 3];
      }
    }
    last = row;
  }
  return { width, height, rgba };
}

export async function inspectCandidate({ sourcePath, candidatePath, maskPath, expectedSourceSha256 }) {
  for (const p of [sourcePath, candidatePath, maskPath]) {
    if (typeof p !== 'string' || !p.toLowerCase().endsWith('.png') || !(await stat(p)).isFile()) {
      throw Error(`Expected an existing regular .png file: ${p}`);
    }
  }
  if (sourcePath === candidatePath || sourcePath === maskPath || candidatePath === maskPath) throw Error('Use distinct paths');
  if (!/^[a-f0-9]{64}$/i.test(expectedSourceSha256 || '')) throw Error('Supply expected source SHA-256 from the pinned manifest');
  const [srcBytes, candBytes, maskBytes] = await Promise.all([readFile(sourcePath), readFile(candidatePath), readFile(maskPath)]);
  if (sha256(srcBytes) !== expectedSourceSha256.toLowerCase()) throw Error('Source bytes do not match pinned provenance SHA-256');
  const source = decodePng(srcBytes), candidate = decodePng(candBytes), mask = decodePng(maskBytes);
  if (source.width !== candidate.width || source.height !== candidate.height ||
      source.width !== mask.width || source.height !== mask.height) throw Error('Source/candidate/mask PNG dimensions differ');
  if (source.width < 1024 || source.height < 1536) throw Error('Source is below required native 1024x1536 size');
  let inside = 0, outside = 0, masked = 0;
  const total = source.width * source.height;
  for (let i = 0; i < total; i++) {
    const j = i * 4;
    const allowed = mask.rgba[j] > 127 && mask.rgba[j + 1] > 127 && mask.rgba[j + 2] > 127 && mask.rgba[j + 3] > 127;
    const changed = source.rgba[j] !== candidate.rgba[j] || source.rgba[j + 1] !== candidate.rgba[j + 1] ||
      source.rgba[j + 2] !== candidate.rgba[j + 2] || source.rgba[j + 3] !== candidate.rgba[j + 3];
    if (allowed) { masked++; if (changed) inside++; }
    else if (changed) outside++;
  }
  if (masked < total / 10000 || masked > total / 4) throw Error('Unsafe mask: must cover 0.01% to 25% of canvas');
  if (inside < 1) throw Error('No edited pixels within the permitted mask');
  if (outside > 0) throw Error(`${outside} pixels outside mask were modified; preserve unmasked source bytes`);
  return {
    status: 'CANDIDATE_ONLY_NOT_ART_APPROVED',
    sourceSha256: sha256(srcBytes), candidateSha256: sha256(candBytes), maskSha256: sha256(maskBytes),
    width: source.width, height: source.height, maskedPixels: masked, changedInsideMask: inside,
    changedOutsideMask: outside, maskFraction: Number((masked / total).toFixed(5)),
    note: 'Outside-mask pixel identity and PNG integrity passed. Human art, rights, continuity and browser QA remain required.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = Object.fromEntries(process.argv.slice(2).reduce((acc, x, i, a) => {
    if (x.startsWith('--') && i + 1 < a.length) acc.push([x.slice(2), a[i + 1]]);
    return acc;
  }, []));
  inspectCandidate({ sourcePath: args.source, candidatePath: args.candidate, maskPath: args.mask,
    expectedSourceSha256: args['source-sha256'] })
    .then(async report => {
      if (args.report) await writeFile(args.report, JSON.stringify(report, null, 2) + '\n');
      console.log(JSON.stringify(report, null, 2));
    })
    .catch(error => { console.error(`M4_ART_PREFLIGHT_FAIL: ${error.message}`); process.exitCode = 1; });
}
