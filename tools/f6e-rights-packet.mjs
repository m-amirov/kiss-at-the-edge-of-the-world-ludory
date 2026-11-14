import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const readJson = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));
const sha = filename => sha256(fs.readFileSync(filename));
const usage = () => {
  throw new TypeError('Usage: f6e-rights-packet.mjs --project <game-studio> --receipts <dir> --output <file> --game-commit <sha> --ludory-commit <sha>');
};

function argumentsOf(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || !value || values.has(key)) usage();
    values.set(key, value);
  }
  const required = ['--project', '--receipts', '--output', '--game-commit', '--ludory-commit'];
  if (required.some(key => !values.has(key))) usage();
  return values;
}

function evidence(pathname, fragment, note) {
  return { path: pathname, ...(fragment ? { fragment } : {}), ...(note ? { note } : {}) };
}

const args = argumentsOf(process.argv.slice(2));
const project = path.resolve(args.get('--project'));
const repo = path.dirname(project);
const receiptRoot = path.resolve(args.get('--receipts'));
const output = path.resolve(args.get('--output'));
const gameCommit = args.get('--game-commit');
const ludoryCommit = args.get('--ludory-commit');
const mobilePath = path.join(repo, 'docs', 'migration', 'm4-mobile-assets.json');
const inventoryPath = path.join(repo, 'docs', 'migration', 'm4-assets-inventory.json');
const narrativePath = path.join(project, 'narrative-assets.json');
const paired = readJson(path.join(receiptRoot, 'paired.export.json'));
const narrative = readJson(narrativePath);
const mobile = readJson(mobilePath);
const inventory = readJson(inventoryPath);

const fourPortraitPaths = new Set([
  'assets/vis-s03-damir-portrait-v2.png',
  'assets/vis-s38-alice-nick-ordinary-day-portrait-v2.png',
  'assets/vis-s39-alice-damir-cafe-portrait-v2.png',
  'assets/vis-s39-alice-damir-cafe-walk-portrait.png',
]);
const mobileByPath = new Map(mobile.entries.map(entry => [entry.portraitPath, entry]));
const inventoryByPath = new Map(inventory.entries.map(entry => [entry.path, entry]));
const narrativeByPath = new Map();
for (const [id, item] of Object.entries(narrative.assets ?? {})) narrativeByPath.set(item.path, { id, item, kind: 'narrative-art' });
for (const [id, item] of Object.entries(narrative.mobileAssets ?? {})) narrativeByPath.set(item.portraitPath, { id, item, kind: 'mobile-art' });
for (const [id, item] of Object.entries(narrative.brandingAssets ?? {})) narrativeByPath.set(item.path, { id, item, kind: 'branding' });

const sourceFiles = new Map(paired.sourceFiles.map(file => [file.path, file]));
const targetRows = new Map(paired.candidates.map(candidate => [candidate.target, candidate]));
const derivations = new Map([...targetRows].map(([target, candidate]) => [
  target, new Map(candidate.assetDerivations.map(item => [item.derivedPath, item])),
]));
const targetFiles = new Map([...targetRows].map(([target, candidate]) => [
  target, new Map(candidate.files.map(file => [file.path, file])),
]));

function sourceForTarget(target, targetPath) {
  const derivation = derivations.get(target)?.get(targetPath);
  if (derivation) {
    return {
      path: derivation.sourcePath,
      sha256: derivation.sourceSha256,
      bytes: derivation.sourceSize,
    };
  }
  const sourceRenames = new Map([
    ['assets/fonts/CormorantGaramond-wght.ttf', 'assets/fonts/CormorantGaramond[wght].ttf'],
    ['assets/fonts/Manrope-wght.ttf', 'assets/fonts/Manrope[wght].ttf'],
  ]);
  const sourcePath = sourceRenames.get(targetPath) ??
    (targetPath.startsWith('assets/ui/') ? `src/ui/${targetPath.slice('assets/ui/'.length)}` : targetPath);
  const source = sourceFiles.get(sourcePath);
  if (source && !['index.html', 'ludory.project.json', 'src/main.js'].includes(targetPath)) {
    return { path: sourcePath, sha256: source.sha256, bytes: source.size };
  }
  return null;
}

function generatedSource(targetPath, target) {
  if (targetPath.startsWith('licenses/')) {
    return {
      path: `generated://ludory/${targetPath}`,
      repository: 'm-amirov/ludory',
      commit: ludoryCommit,
      basis: 'Vendored platform/library license text admitted by the target builder',
    };
  }
  return {
    path: `generated://ludory/${target}/${targetPath}`,
    repository: 'm-amirov/ludory',
    commit: ludoryCommit,
    basis: 'Generated or managed Ludory platform export bytes; source code provenance is not a game asset rights grant',
  };
}

function rightsFor(sourcePath, targetPath, target) {
  if (!sourcePath) {
    const generated = generatedSource(targetPath, target);
    return {
      resourceClass: targetPath.startsWith('licenses/') ? 'platform-license' : 'ludory-framework',
      rightsStatus: targetPath.startsWith('licenses/') ? 'SDK_LICENSE_PRESENT_UNVERIFIED' : 'FRAMEWORK_PROVENANCE_ONLY',
      provenance: generated,
      statedBasis: generated.basis,
      evidence: [evidence('m-amirov/ludory:packages/studio/src/narrative-platform-export.mjs', null,
        'Generated by the Ludory exporter; not an independent legal rights attestation')],
      attribution: { required: true, status: 'UNVERIFIED', notices: targetPath.startsWith('licenses/') ? [targetPath] : [] },
    };
  }
  if (sourcePath.endsWith('.ttf')) {
    return {
      resourceClass: 'font',
      rightsStatus: 'MECHANICAL_NOTICE_PRESENT_UNVERIFIED',
      provenance: { repository: 'm-amirov/kiss-at-the-edge-of-the-world-ludory', commit: gameCommit, path: sourcePath },
      statedBasis: 'SIL Open Font License 1.1 stated by the paired OFL notice; applicability to these exact font bytes is not independently attested',
      evidence: [
        evidence('game-studio/assets/fonts/OFL-CormorantGaramond.txt', null, 'Retained byte-for-byte in both ZIPs'),
        evidence('game-studio/assets/fonts/OFL-Manrope.txt', null, 'Retained byte-for-byte in both ZIPs'),
      ],
      attribution: { required: true, status: 'NOTICE_REQUIRED', notices: ['assets/fonts/OFL-CormorantGaramond.txt', 'assets/fonts/OFL-Manrope.txt'] },
    };
  }
  if (sourcePath.endsWith('.txt') && sourcePath.includes('/fonts/')) {
    return {
      resourceClass: 'font-license-notice',
      rightsStatus: 'NOTICE_PRESENT_UNVERIFIED',
      provenance: { repository: 'm-amirov/kiss-at-the-edge-of-the-world-ludory', commit: gameCommit, path: sourcePath },
      statedBasis: 'The corresponding OFL notice is shipped with its corresponding redistributed font',
      evidence: [evidence(`game-studio/${sourcePath}`, null, 'Source notice SHA and ZIP member SHA are equal')],
      attribution: { required: true, status: 'NOTICE_PRESENT', notices: [sourcePath] },
    };
  }
  if (sourcePath.startsWith('src/ui/')) {
    return {
      resourceClass: 'game-ui',
      rightsStatus: 'UI_PROVENANCE_ONLY',
      provenance: { repository: 'm-amirov/kiss-at-the-edge-of-the-world-ludory', commit: gameCommit, path: sourcePath },
      statedBasis: 'Author-owned UI source path; owner confirmation of distribution authority remains required',
      evidence: [evidence(`game-studio/${sourcePath}`, null, 'Source-derived CSS exported under assets/ui/')],
      attribution: { required: true, status: 'OWNER_CONFIRMATION_REQUIRED', notices: [] },
    };
  }
  const manifest = narrativeByPath.get(sourcePath);
  const mobileEntry = mobileByPath.get(sourcePath);
  const inventoryEntry = inventoryByPath.get(sourcePath) ?? inventoryByPath.get(targetPath.replace(/\.webp$/i, '.png'));
  const portrait = fourPortraitPaths.has(sourcePath);
  const refs = [evidence('game-studio/narrative-assets.json', manifest ? `$.${manifest.kind === 'branding' ? 'brandingAssets' : manifest.kind === 'mobile-art' ? 'mobileAssets' : 'assets'}.${manifest.id}` : undefined,
    'Project asset declaration')];
  if (mobileEntry) refs.push(evidence('docs/migration/m4-mobile-assets.json', `$.entries[?(@.portraitPath=="${sourcePath}")]`,
    'Generation, reference and admission evidence is technical provenance, not independent legal proof'));
  if (inventoryEntry) refs.push(evidence('docs/migration/m4-assets-inventory.json', `$.entries[?(@.path=="${inventoryEntry.path}")]`,
    inventoryEntry.licenseEvidence ? 'Canonical inventory row retained' : 'Inventory row records missing legal evidence'));
  return {
    resourceClass: manifest?.kind === 'branding' ? 'branding-art' : portrait ? 'generated-portrait' : 'game-art',
    rightsStatus: portrait ? 'UNVERIFIED' : 'PROVENANCE_DECLARED_ONLY',
    provenance: {
      repository: 'm-amirov/kiss-at-the-edge-of-the-world-ludory',
      commit: gameCommit,
      path: sourcePath,
      sourceKind: mobileEntry?.sourceKind ?? 'declared-in-project-asset-manifest',
      ...(mobileEntry ? { referenceSources: mobileEntry.referenceSources ?? [], admissionEvidence: mobileEntry.admissionEvidence } : {}),
    },
    statedBasis: mobileEntry?.licenseEvidence?.license ?? 'Declared project provenance; no owner-signed legal grant supplied',
    evidence: refs,
    attribution: { required: true, status: 'OWNER_CONFIRMATION_REQUIRED', notices: [] },
    ...(portrait ? { blocker: 'No exact row for this current generated portrait in canonical assets/provenance/rights-manifest.json; existing m4 evidence does not establish a legal grant' } : {}),
  };
}

const resources = new Map();
for (const [target, files] of targetFiles) {
  for (const [targetPath, file] of files) {
    const source = sourceForTarget(target, targetPath);
    const key = source?.path ?? `${target}:${targetPath}`;
    let row = resources.get(key);
    if (!row) {
      const rights = rightsFor(source?.path, targetPath, target);
      row = {
        id: `f6e-${resources.size + 1}`,
        sourcePath: source?.path ?? rights.provenance.path,
        sourceSha256: source?.sha256 ?? null,
        sourceBytes: source?.bytes ?? null,
        ...rights,
        exports: {},
      };
      resources.set(key, row);
    }
    row.exports[target] = { path: targetPath, sha256: file.sha256, bytes: file.size };
  }
}

const finalResources = [...resources.values()].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
const ownerConfirmation = finalResources.filter(row => row.rightsStatus === 'PROVENANCE_DECLARED_ONLY' &&
  ['game-art', 'branding-art'].includes(row.resourceClass));
const portraits = finalResources.filter(row => row.resourceClass === 'generated-portrait');
if (ownerConfirmation.length !== 69) {
  throw new Error(`Expected 69 declarative-provenance resources, got ${ownerConfirmation.length}; art=${finalResources.filter(row => ['game-art', 'branding-art'].includes(row.resourceClass)).length}; portraits=${finalResources.filter(row => row.resourceClass === 'generated-portrait').map(row => row.sourcePath).join(', ')}; game-art=${finalResources.filter(row => row.resourceClass === 'game-art').map(row => row.sourcePath).join(', ')}`);
}
if (portraits.length !== 4) throw new Error(`Expected four unverified portraits, got ${portraits.length}`);

const targets = {};
for (const [target, candidate] of targetRows) {
  const zipPath = path.join(receiptRoot, target.startsWith('yandex') ? 'yandex.zip' : 'vk.zip');
  const members = candidate.files.map(file => ({ path: file.path, sha256: file.sha256, bytes: file.size }));
  targets[target] = {
    artifactPath: path.relative(repo, zipPath).replaceAll(path.sep, '/'),
    archiveSha256: candidate.archiveSha256,
    archiveBytes: fs.statSync(zipPath).size,
    expandedBytes: members.reduce((total, item) => total + item.bytes, 0),
    memberCount: members.length,
    members,
  };
}

const packet = {
  schemaVersion: 1,
  packetKind: 'f6e-platform-rights',
  generatedOn: '2026-11-14',
  independentLegalReview: false,
  source: {
    repository: 'm-amirov/kiss-at-the-edge-of-the-world-ludory',
    commit: gameCommit,
    projectPath: 'game-studio',
    narrativeManifest: 'game-studio/narrative-assets.json',
    mobileManifest: 'docs/migration/m4-mobile-assets.json',
    buildObservation: {
      sourceWorktree: 'host-bound QA worktree at the exact source commit',
      noticesCopiedByteForByte: true,
      note: 'The trusted QA checkout uses CRLF for the OFL notices while the clean closure worktree uses LF; the packet records the bytes actually admitted to the verified ZIPs and does not normalize them.',
    },
    canonicalRightsManifest: {
      path: 'assets/provenance/rights-manifest.json',
      status: 'NO_EXACT_ROWS_FOR_FOUR_CURRENT_PORTRAITS',
      note: 'The manifest path is referenced by the migration inventory; the current game repository does not carry a matching row for the four generated portraits.',
    },
  },
  scopeSplit: {
    gameDistributable: { status: 'BLOCKED', reason: 'Resource-level legal confirmation is incomplete; mechanical package integrity is separate.' },
    ludoryFrameworkDistribution: { status: 'BLOCKED', reason: 'lighthouse.svg and shoreline.svg are framework/template rights items and are not game ZIP members; framework rights remain a separate Ludory decision.' },
    developmentOnlyDependencies: { status: 'NOT_IN_GAME_ZIP', reason: 'Vendored Web Helper is not present in either game archive; its provenance remains a Ludory/development-only obligation.' },
  },
  targets,
  resources: finalResources,
  ownerConfirmation: {
    mode: 'BATCH_ATTESTATION_ALLOWED',
    independentLegalOpinion: false,
    registryBinding: {
      sourceCommit: gameCommit,
      resourceCount: ownerConfirmation.length,
      registrySha256: sha(narrativePath),
      statement: 'Owner must confirm actual authority to distribute every listed SHA-256 and all required attribution/notice obligations; this packet is not a legal opinion.',
    },
    declarativeProvenanceResources: ownerConfirmation.map(row => ({ id: row.id, sourcePath: row.sourcePath, sourceSha256: row.sourceSha256 })),
    additionalPortraitEvidenceRequired: portraits.map(row => ({ id: row.id, sourcePath: row.sourcePath, sourceSha256: row.sourceSha256, missing: row.blocker })),
  },
  mechanicalChecks: {
    packageVerification: 'LOCAL_ARCHIVES_VERIFIED',
    noticePaths: ['assets/fonts/OFL-CormorantGaramond.txt', 'assets/fonts/OFL-Manrope.txt'],
    noticePolicy: 'ONLY_EXACT_FONT_NOTICE_PATHS_ALLOWED; ARBITRARY_TXT_REJECTED_OR_NOT_LISTED',
    forbiddenGameZipMembers: ['lighthouse.svg', 'shoreline.svg', 'Web Helper vendored dependency'],
  },
  gateRecommendation: {
    PACKAGE_PASS: 'ELIGIBLE_AFTER_THIS_PACKET_AND_ARCHIVE_RECEIPTS_ARE_REVIEWED',
    RIGHTS_PASS: 'BLOCKED_UNVERIFIED_OWNER_AND_PORTRAIT_EVIDENCE',
    SECURITY_ADVISORIES_PASS: 'REUSE_ONLY_IF_DEPENDENCY_SNAPSHOT_IS_UNCHANGED',
    RELEASE_READY: 'NOT_DECLARED',
  },
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
console.log(JSON.stringify({ output, resourceCount: finalResources.length, declarativeProvenanceCount: ownerConfirmation.length, portraitCount: portraits.length }, null, 2));
