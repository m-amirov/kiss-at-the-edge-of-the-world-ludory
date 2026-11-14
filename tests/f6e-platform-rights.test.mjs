import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const repo = path.resolve(import.meta.dirname, '..');
const packetPath = path.join(repo, 'docs/evidence/f6e-platform-rights-packet.json');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('F6E rights packet is source-bound, complete for both ZIP receipts, and keeps legal status unverified', () => {
  const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  assert.equal(packet.schemaVersion, 1);
  assert.equal(packet.independentLegalReview, false);
  assert.equal(packet.resources.length, 89);
  assert.equal(packet.ownerConfirmation.registryBinding.resourceCount, 69);
  assert.equal(packet.ownerConfirmation.declarativeProvenanceResources.length, 69);
  assert.equal(packet.ownerConfirmation.additionalPortraitEvidenceRequired.length, 4);
  assert.equal(packet.gateRecommendation.RIGHTS_PASS, 'BLOCKED_UNVERIFIED_OWNER_AND_PORTRAIT_EVIDENCE');
  assert.equal(packet.gateRecommendation.RELEASE_READY, 'NOT_DECLARED');

  const portraitPaths = new Set(packet.ownerConfirmation.additionalPortraitEvidenceRequired.map(item => item.sourcePath));
  assert.deepEqual([...portraitPaths].sort(), [
    'assets/vis-s03-damir-portrait-v2.png',
    'assets/vis-s38-alice-nick-ordinary-day-portrait-v2.png',
    'assets/vis-s39-alice-damir-cafe-portrait-v2.png',
    'assets/vis-s39-alice-damir-cafe-walk-portrait.png',
  ]);
  for (const resource of packet.resources) {
    assert.ok(resource.sourcePath);
    assert.ok(resource.rightsStatus !== 'PASS');
    assert.ok(Object.keys(resource.exports).length >= 1);
    for (const exported of Object.values(resource.exports)) {
      assert.ok(/^[a-f0-9]{64}$/.test(exported.sha256));
    }
    if (!resource.sourcePath.startsWith('generated://')) {
      if (resource.sourcePath.startsWith('assets/fonts/OFL-')) {
        assert.equal(resource.exports['yandex-games'].sha256, resource.sourceSha256);
        assert.equal(resource.exports['vk-games'].sha256, resource.sourceSha256);
        continue;
      }
      const source = fs.readFileSync(path.join(repo, 'game-studio', resource.sourcePath));
      assert.equal(sha256(source), resource.sourceSha256, resource.sourcePath);
      assert.equal(source.length, resource.sourceBytes, resource.sourcePath);
    }
  }

  for (const [target, archive] of Object.entries(packet.targets)) {
    assert.equal(archive.members.length, archive.memberCount);
    const names = archive.members.map(member => member.path);
    assert.equal(new Set(names).size, names.length);
    assert.deepEqual(names.filter(name => name.endsWith('.txt')), [
      'assets/fonts/OFL-CormorantGaramond.txt',
      'assets/fonts/OFL-Manrope.txt',
      ...(target === 'vk-games' ? ['licenses/swc-helpers.txt', 'licenses/vk-bridge.txt'] : []),
    ]);
    assert.equal(names.some(name => /lighthouse\.svg|shoreline\.svg|web-helper|web_helper|node_modules/i.test(name)), false);
    for (const name of ['assets/fonts/CormorantGaramond-wght.ttf', 'assets/fonts/Manrope-wght.ttf',
      'assets/fonts/OFL-CormorantGaramond.txt', 'assets/fonts/OFL-Manrope.txt']) {
      assert.ok(names.includes(name), `${target} missing ${name}`);
    }
  }
});
