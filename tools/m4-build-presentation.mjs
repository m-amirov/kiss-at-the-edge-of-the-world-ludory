import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canonicalText = text => text.replace(/\r\n?/g, '\n');

/** Hash authored text after canonicalizing line endings, without changing the source file. */
export function canonicalTextSha256(bytesOrText) {
  const text = Buffer.isBuffer(bytesOrText) ? bytesOrText.toString('utf8') : String(bytesOrText);
  return hash(Buffer.from(canonicalText(text), 'utf8'));
}

const MEDIA_ID = /^[a-z][a-z0-9_-]{0,63}$/;
const MEDIA_PATH = /^assets\/vis-[a-z0-9_-]+\.(?:webp|png|jpg|jpeg)$/;
const VALID_KINDS = new Set(['background', 'portrait', 'cg']);

function exactKeys(value, allowed, required, context) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${context}: expected object`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${context}: unexpected ${key}`);
  for (const key of required) if (!Object.hasOwn(value, key)) throw new Error(`${context}: missing ${key}`);
}

function readJson(file) { return JSON.parse(readFileSync(file, 'utf8')); }

function pngDimensions(bytes, description) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${description}: expected PNG`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function checkRegular(file, description) {
  let stat;
  try { stat = lstatSync(file); } catch { throw new Error(`${description}: missing regular file`); }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) throw new Error(`${description}: symlink/hardlink or nonregular file`);
}

function checkDirectory(file) {
  const stat = lstatSync(file);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`unsafe symlink media directory: ${file}`);
}

export function validateMobileAssets({ projectRoot, presentation }) {
  if (basename(projectRoot) !== 'game-studio') return { ids: [], proof: {}, paths: new Set() };
  const file = join(dirname(projectRoot), 'docs/migration/m4-mobile-assets.json');
  if (!existsSync(file)) throw new Error('game-studio: mobile provenance manifest missing');
  const manifest = readJson(file);
  exactKeys(manifest, ['schemaVersion', 'sourceCommit', 'project', 'mobileBreakpoint', 'entries', 'rejectedCandidates', 'fallbacks'],
    ['schemaVersion', 'sourceCommit', 'project', 'mobileBreakpoint', 'entries'], 'mobile provenance');
  if (manifest.schemaVersion !== 1 || manifest.project !== 'game-studio' || manifest.mobileBreakpoint !== 680) {
    throw new Error('mobile provenance: unsupported schema/project/breakpoint');
  }
  if (!/^[0-9a-f]{40}$/i.test(manifest.sourceCommit)) throw new Error('mobile provenance: sourceCommit must be pinned');
  const seen = new Set();
  const ids = [];
  const proof = {};
  const paths = new Set();
  for (const entry of manifest.entries) {
    exactKeys(entry, ['id', 'desktopMediaId', 'desktopPath', 'portraitPath', 'sourceKind', 'status', 'artStatus', 'useOnMobile',
      'sha256', 'dimensions', 'sourceBlobSha', 'licenseEvidence', 'referenceSources', 'admissionEvidence'],
    ['id', 'desktopMediaId', 'desktopPath', 'portraitPath', 'sourceKind', 'status', 'artStatus', 'useOnMobile', 'sha256', 'dimensions',
      'licenseEvidence', 'admissionEvidence'], `mobile entry ${entry.id}`);
    if (seen.has(entry.id)) throw new Error(`mobile provenance: duplicate entry ${entry.id}`);
    seen.add(entry.id);
    if (!entry.useOnMobile || entry.status !== 'accepted') throw new Error(`mobile entry ${entry.id}: not admitted for mobile use`);
    const desktop = presentation.media[entry.desktopMediaId];
    if (!desktop || desktop.src !== entry.desktopPath) throw new Error(`mobile entry ${entry.id}: desktop media mismatch`);
    if (!MEDIA_PATH.test(entry.portraitPath) || !entry.portraitPath.endsWith('.png')) {
      throw new Error(`mobile entry ${entry.id}: unsafe portrait path`);
    }
    const portraitFile = join(projectRoot, entry.portraitPath);
    checkRegular(portraitFile, `mobile entry ${entry.id}`);
    const bytes = readFileSync(portraitFile);
    const dimensions = pngDimensions(bytes, `mobile entry ${entry.id}`);
    const blobHash = hash(bytes);
    if (blobHash !== entry.sha256) throw new Error(`mobile entry ${entry.id}: SHA-256 mismatch`);
    if (`${dimensions.width}x${dimensions.height}` !== entry.dimensions) throw new Error(`mobile entry ${entry.id}: dimensions mismatch`);
    if (entry.licenseEvidence?.sha256?.toLowerCase() !== blobHash || !entry.licenseEvidence?.license || !entry.licenseEvidence?.method) {
      throw new Error(`mobile entry ${entry.id}: incomplete rights evidence`);
    }
    if (entry.sourceKind.startsWith('pinned') && !/^[0-9a-f]{40}$/i.test(entry.sourceBlobSha ?? '')) {
      throw new Error(`mobile entry ${entry.id}: pinned source blob evidence missing`);
    }
    if (entry.sourceKind.startsWith('generated') && !entry.referenceSources?.length) {
      throw new Error(`mobile entry ${entry.id}: generated source references missing`);
    }
    ids.push(entry.id);
    paths.add(entry.portraitPath);
    proof[entry.id] = {
      desktopMediaId: entry.desktopMediaId,
      desktopPath: entry.desktopPath,
      portraitPath: entry.portraitPath,
      sha256: blobHash,
      dimensions: entry.dimensions,
      sourceKind: entry.sourceKind,
      artStatus: entry.artStatus,
    };
  }
  return { ids, proof, paths };
}

function validateManifest(manifest, sourceMap) {
  exactKeys(manifest, ['schemaVersion', 'media', 'beats'], ['schemaVersion', 'media', 'beats'], 'presentation');
  if (manifest.schemaVersion !== 1) throw new Error('unsupported presentation schemaVersion');
  exactKeys(manifest.media, Object.keys(manifest.media), [], 'media');
  exactKeys(manifest.beats, Object.keys(manifest.beats), [], 'beats');
  for (const [id, media] of Object.entries(manifest.media)) {
    if (!MEDIA_ID.test(id)) throw new Error(`unsafe media ID: ${id}`);
    exactKeys(media, ['kind', 'src', 'alt'], ['kind', 'src'], `media ${id}`);
    if (!VALID_KINDS.has(media.kind)) throw new Error(`invalid media kind: ${id}`);
    if (!MEDIA_PATH.test(media.src)) throw new Error(`unsafe src path: ${id}`);
    if (media.alt !== undefined) {
      exactKeys(media.alt, ['ru', 'en'], ['ru', 'en'], `media ${id} alt`);
      if (!media.alt.ru?.trim() || !media.alt.en?.trim()) throw new Error(`invalid localized alt: ${id}`);
    }
  }
  for (const [beatId, variants] of Object.entries(manifest.beats)) {
    if (!MEDIA_ID.test(beatId) || !Array.isArray(variants) || variants.length === 0) throw new Error(`invalid beat variants: ${beatId}`);
    const ids = new Set();
    for (const variant of variants) {
      exactKeys(variant, ['id', 'when', 'background', 'portraits', 'cg', 'speaker', 'neutral'], ['id'], `variant ${beatId}`);
      if (!MEDIA_ID.test(variant.id) || ids.has(variant.id)) throw new Error(`invalid/duplicate variant ID in ${beatId}`);
      ids.add(variant.id);
      if (variant.neutral !== undefined) {
        exactKeys(variant.neutral, ['reason'], ['reason'], `neutral ${beatId}`);
        if (!variant.neutral.reason?.trim() || variant.background !== undefined || variant.portraits !== undefined || variant.cg !== undefined) {
          throw new Error(`neutral stage must not borrow image layers: ${beatId}`);
        }
      } else if (variant.background === undefined && !variant.portraits?.length && variant.cg === undefined) {
        throw new Error(`no media or neutral stage: ${beatId}`);
      }
      if (variant.background && manifest.media[variant.background]?.kind !== 'background') throw new Error(`unbound background: ${beatId}`);
      if (variant.cg && manifest.media[variant.cg.mediaId]?.kind !== 'cg') throw new Error(`unbound CG: ${beatId}`);
      for (const portrait of variant.portraits ?? []) {
        if (manifest.media[portrait.mediaId]?.kind !== 'portrait') throw new Error(`unbound portrait: ${beatId}`);
      }
    }
  }
  for (const { graphBeatId, when } of [...sourceMap.entries.filter(item => item.status === 'mapped'), ...sourceMap.openingStages]) {
    const candidates = manifest.beats[graphBeatId];
    if (!Array.isArray(candidates) || !candidates.some(variant => JSON.stringify(variant.when ?? null) === JSON.stringify(when ?? null))) {
      throw new Error(`unrepresented source cue or route condition: ${graphBeatId}`);
    }
  }
  for (const id of sourceMap.neutralResets) {
    if (!manifest.beats[id]?.some(variant => variant.neutral)) throw new Error(`missing neutral reset: ${id}`);
  }
}

/** Deterministic author-only compilation. Never fetches remote artwork or changes managed Studio files. */
export function buildPresentation({ projectRoot, write = false }) {
  if (typeof projectRoot !== 'string' || !projectRoot) throw new TypeError('projectRoot must be an absolute game directory');
  const root = resolve(projectRoot);
  const presentationPath = join(root, 'visuals/presentation.json');
  const sourceMap = readJson(join(root, 'visuals/source-map.json'));
  const raw = readFileSync(presentationPath);
  const manifest = JSON.parse(raw.toString('utf8'));
  validateManifest(manifest, sourceMap);
  const inventory = readJson(join(dirname(root), 'docs/migration/m4-assets-inventory.json'));
  const assets = {};
  checkDirectory(join(root, 'assets'));
  for (const [mediaId, media] of Object.entries(manifest.media).sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    const assetFile = join(root, media.src);
    checkRegular(assetFile, `media ${mediaId}`);
    const blobHash = hash(readFileSync(assetFile));
    const matching = inventory.entries.filter(entry => entry.status === 'accepted' && entry.admittedPath === media.src && entry.sha256 === blobHash);
    if (matching.length !== 1) throw new Error(`media ${mediaId}: missing accepted admission or SHA256 hash mismatch`);
    assets[mediaId] = { path: media.src, sha256: blobHash };
  }
  const mobile = validateMobileAssets({ projectRoot: root, presentation: manifest });
  const raster = readdirSync(join(root, 'assets')).filter(name => /\.(?:png|webp|jpe?g)$/i.test(name));
  const proved = new Set([...Object.values(assets).map(asset => asset.path), ...mobile.paths]);
  for (const name of raster) if (!proved.has(`assets/${name}`)) throw new Error(`unproved raster asset: ${name}`);

  const storyFile = join(root, 'src/story.js');
  const storyBytes = readFileSync(storyFile);
  if (!storyBytes.toString('utf8').includes("export { presentationData } from './presentation.js';")) {
    throw new Error('story.js must re-export native presentationData without editing prose');
  }
  const storySha256 = canonicalTextSha256(storyBytes);
  const presentationSha256 = hash(raw);
  // The Studio-managed entrypoint cannot be edited. Only the new Studio game's
  // author-owned presentation export installs the reader UI; legacy game/ is immutable.
  const readerAdapter = basename(root) === 'game-studio' ? "import './ui/original-game-ui.js';\n" : '';
  const generated = `// Generated from visuals/presentation.json by tools/m4-build-presentation.mjs. Do not edit.\n${readerAdapter}export const presentationData = ${JSON.stringify(manifest, null, 2)};\n`;
  const proofObject = { schemaVersion: 1, storySha256, assets };
  if (mobile.ids.length) proofObject.mobileAssets = mobile.proof;
  const proof = `${JSON.stringify(proofObject, null, 2)}\n`;
  const generatedPath = join(root, 'src/presentation.js');
  const proofPath = join(root, 'narrative-assets.json');
  if (write) {
    writeFileSync(generatedPath, generated);
    writeFileSync(proofPath, proof);
  } else {
    if (readFileSync(generatedPath, 'utf8') !== generated || readFileSync(proofPath, 'utf8') !== proof) {
      throw new Error('Generated presentation/proof is stale; run --write');
    }
  }
  const blocked = [...sourceMap.entries, ...sourceMap.openingStages]
    .filter(cue => cue.sourceArt && !cue.admittedMediaId).length;
  return { presentationSha256, storySha256, assetIds: Object.keys(assets), mobileAssetIds: mobile.ids, blocked };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const action = args[0] ?? '--check';
  if (!['--check', '--write'].includes(action)) throw new Error('Usage: node tools/m4-build-presentation.mjs [--check|--write] [--project game|game-studio]');
  const projectName = args.length === 1 && args[0] === action
    ? 'game'
    : args.length === 3 && args[1] === '--project' ? args[2] : undefined;
  if (!['game', 'game-studio'].includes(projectName)) {
    throw new Error('Usage: node tools/m4-build-presentation.mjs [--check|--write] [--project game|game-studio]');
  }
  const result = buildPresentation({ projectRoot: resolve(projectName), write: action === '--write' });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
