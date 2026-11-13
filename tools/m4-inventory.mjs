import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const DEFAULT_MANIFEST = 'assets/asset-manifest.json';
const DEFAULT_RIGHTS = 'assets/provenance/rights-manifest.json';
const pinPattern = /^[0-9a-f]{40}$/i;
const safeMediaPath = value => typeof value === 'string'
  && /^(?:assets|game)\/[\w./-]+$/.test(value)
  && !value.split('/').includes('..')
  && !value.split('/').includes('.')
  && !value.includes('//');

function command(sourceGitDir, args, binary = false) {
  return execFileSync('git', args, {
    cwd: sourceGitDir,
    encoding: binary ? 'buffer' : 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function gitObject(sourceGitDir, commit, path) {
  const treeRow = command(sourceGitDir, ['ls-tree', commit, '--', path]);
  const match = /^([0-9]{6}) blob ([0-9a-f]{40})\t(.+)\n?$/.exec(treeRow);
  if (!match || match[3] !== path || !['100644', '100755'].includes(match[1])) {
    throw new Error(`Missing or unsafe Git media blob: ${path}`);
  }
  return { sourceBlobSha: match[2], bytes: command(sourceGitDir, ['cat-file', 'blob', match[2]], true) };
}

function gitJson(sourceGitDir, sourceCommit, path) {
  if (!safeMediaPath(path)) throw new Error(`Unsafe manifest path: ${path}`);
  const { bytes } = gitObject(sourceGitDir, sourceCommit, path);
  const object = JSON.parse(bytes.toString('utf8'));
  if (!Array.isArray(object.assets)) throw new Error(`Missing assets array: ${path}`);
  return object.assets;
}

/**
 * Audits immutable, pinned Git media blobs without checking out, copying or admitting
 * any asset. "candidate" is a provenance match, never authorization to ship.
 */
export function inventoryAssets({ sourceGitDir, sourceCommit, assetManifestPath = DEFAULT_MANIFEST, rightsManifestPath = DEFAULT_RIGHTS }) {
  if (!pinPattern.test(sourceCommit ?? '')) throw new Error('A pinned 40-hex source commit is required');
  if (!safeMediaPath(assetManifestPath) || !safeMediaPath(rightsManifestPath)) throw new Error('Unsafe manifest path');
  const actualCommit = command(sourceGitDir, ['rev-parse', '--verify', `${sourceCommit}^{commit}`]).trim();
  if (actualCommit.toLowerCase() !== sourceCommit.toLowerCase()) throw new Error('Source must be an exact pinned commit');

  const manifest = gitJson(sourceGitDir, actualCommit, assetManifestPath);
  const rights = gitJson(sourceGitDir, actualCommit, rightsManifestPath);
  const rightsByPath = new Map();
  for (const entry of rights) {
    if (!safeMediaPath(entry.path)) continue;
    const siblings = rightsByPath.get(entry.path) ?? [];
    siblings.push(entry);
    rightsByPath.set(entry.path, siblings);
  }

  const targetCounts = new Map();
  const idCounts = new Map();
  for (const asset of manifest) {
    const target = asset.runtimePath ?? asset.path;
    targetCounts.set(target, (targetCounts.get(target) ?? 0) + 1);
    idCounts.set(asset.id, (idCounts.get(asset.id) ?? 0) + 1);
  }

  const entries = manifest.map(asset => {
    const targetPath = asset.runtimePath ?? asset.path;
    const result = {
      id: asset.id ?? null, role: asset.family ?? null, path: asset.path ?? null,
      targetPath, sourceBlobSha: null, sha256: null,
      status: 'blocked', reason: null,
      licenseEvidence: null,
      sourceVariants: [asset.runtimePath, asset.portraitAsset, asset.runtimePortraitAsset].filter(Boolean),
    };
    if (!safeMediaPath(asset.path) || !safeMediaPath(targetPath)) {
      result.reason = 'unsafe_asset_path';
      return result;
    }
    if (idCounts.get(asset.id) > 1) {
      result.reason = 'duplicate_asset_id';
      return result;
    }
    if (targetCounts.get(targetPath) > 1) {
      result.reason = 'duplicate_target_path';
      return result;
    }
    let bytes;
    try {
      ({ bytes, sourceBlobSha: result.sourceBlobSha } = gitObject(sourceGitDir, actualCommit, asset.path));
    } catch {
      result.reason = 'source_blob_missing';
      return result;
    }
    result.sha256 = createHash('sha256').update(bytes).digest('hex');
    const evidence = rightsByPath.get(asset.path) ?? [];
    if (evidence.length === 0) {
      result.reason = 'rights_missing';
      return result;
    }
    if (evidence.length !== 1) {
      result.reason = 'rights_ambiguous';
      return result;
    }
    const row = evidence[0];
    result.licenseEvidence = {
      manifestPath: rightsManifestPath,
      path: row.path, license: row.license ?? null,
      method: row.method ?? null, source: row.source ?? null,
      sha256: row.sha256 ?? null,
    };
    if (!/^[0-9a-f]{64}$/i.test(row.sha256 ?? '')) {
      result.reason = 'rights_hash_missing';
      return result;
    }
    if (row.sha256.toLowerCase() !== result.sha256) {
      result.reason = 'rights_hash_mismatch';
      return result;
    }
    if (!row.license || !row.method) {
      result.reason = 'rights_evidence_incomplete';
      return result;
    }
    result.status = 'candidate';
    result.reason = 'provenance_matched_admission_pending';
    return result;
  }).sort((left, right) => String(left.id).localeCompare(String(right.id), 'en'));

  const byStatus = { candidate: 0, accepted: 0, blocked: 0 };
  const byFamily = {};
  const blockedReasons = {};
  for (const entry of entries) {
    byStatus[entry.status]++;
    byFamily[entry.role] = (byFamily[entry.role] ?? 0) + 1;
    if (entry.status === 'blocked') blockedReasons[entry.reason] = (blockedReasons[entry.reason] ?? 0) + 1;
  }
  return {
    sourceCommit: actualCommit,
    assetManifestPath,
    rightsManifestPath,
    entries,
    summary: { total: entries.length, byStatus, byFamily, blockedReasons },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [sourceGitDir, sourceCommit] = process.argv.slice(2);
  if (!sourceGitDir || !sourceCommit) {
    process.stderr.write('Usage: node tools/m4-inventory.mjs SOURCE_GIT_DIR SOURCE_COMMIT\n');
    process.exitCode = 2;
  } else {
    process.stdout.write(`${JSON.stringify(inventoryAssets({ sourceGitDir, sourceCommit }), null, 2)}\n`);
  }
}
