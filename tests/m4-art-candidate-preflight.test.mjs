import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { decodePng, inspectCandidate } from '../tools/m4-art-candidate-preflight.mjs';

const original = new URL('../game-studio/assets/vis-s38-alice-nick-ordinary-day-portrait-v2.png', import.meta.url);
const expectedSha = 'fa2b4e6aad5d2a5a482f9b2ca8e2954dfad76b6b188729f1411d6ad9de9dfd2e';
const sha256 = v => createHash('sha256').update(v).digest('hex');
const table = Uint32Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = data => {
  let c = 0xffffffff;
  for (const b of data) c = table[(c ^ b) & 255] ^ c >>> 8;
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(tag, data) {
  const head = Buffer.from(tag, 'ascii');
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([head, data])));
  return Buffer.concat([size, head, data, crc]);
}
function encodeRgba({ width, height, rgba }) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width); head.writeUInt32BE(height, 4);
  head[8] = 8; head[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[(width * 4 + 1) * y] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR', head),chunk('IDAT', deflateSync(raw, { level: 1 })),chunk('IEND', Buffer.alloc(0))]);
}

test('Issue #6 source-bound candidate accepts only native pixel changes inside the mask', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'm4-art-gate-'));
  try {
    const bytes = await readFile(original);
    assert.equal(sha256(bytes), expectedSha);
    const source = decodePng(bytes);
    assert.equal(source.width, 1024);
    assert.equal(source.height, 1536);
    const candidate = { ...source, rgba: Buffer.from(source.rgba) };
    const mask = { ...source, rgba: Buffer.alloc(source.rgba.length, 0) };
    const point = (760 * source.width + 550) * 4;
    for (let dy = -10; dy < 10; dy++) {
      for (let dx = -10; dx < 10; dx++) {
        const j = ((760 + dy) * source.width + 550 + dx) * 4;
        mask.rgba.fill(255, j, j + 4);
      }
    }
    candidate.rgba[point] ^= 1;
    const sourcePath = join(dir, 'source.png');
    const candidatePath = join(dir, 'candidate.png');
    const maskPath = join(dir, 'mask.png');
    await Promise.all([
      writeFile(sourcePath, bytes), writeFile(candidatePath, encodeRgba(candidate)),
      writeFile(maskPath, encodeRgba(mask)),
    ]);
    const args = { sourcePath, candidatePath, maskPath, expectedSourceSha256: expectedSha };
    const result = await inspectCandidate(args);
    assert.equal(result.status, 'CANDIDATE_ONLY_NOT_ART_APPROVED');
    assert.equal(result.changedInsideMask, 1);
    assert.equal(result.changedOutsideMask, 0);
    assert.equal(result.sourceSha256, expectedSha);

    candidate.rgba[point + 40 * 4] ^= 1; // unmasked neighbor: identity is not preserved.
    await writeFile(candidatePath, encodeRgba(candidate));
    await assert.rejects(inspectCandidate(args), /outside mask were modified/);
    await writeFile(candidatePath, bytes);
    await assert.rejects(inspectCandidate(args), /No edited pixels/);
    await assert.rejects(inspectCandidate({ ...args, expectedSourceSha256: '0'.repeat(64) }), /do not match pinned/);

    const broken = Buffer.from(encodeRgba(candidate));
    broken[45] ^= 1; // corrupt the IDAT body: CRC gate
    await writeFile(candidatePath, broken);
    await assert.rejects(inspectCandidate(args), /Invalid CRC|Incomplete PNG|Truncated PNG/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
