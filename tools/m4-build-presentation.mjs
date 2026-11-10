import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync, readdirSync } from 'node:fs';
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

function checkRegular(file, description) {
  let stat;
  try { stat = lstatSync(file); } catch { throw new Error(`${description}: missing regular file`); }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) throw new Error(`${description}: symlink/hardlink or nonregular file`);
}

function checkDirectory(file) {
  const stat = lstatSync(file);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`unsafe symlink media directory: ${file}`);
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
  const raster = readdirSync(join(root, 'assets')).filter(name => /\.(?:png|webp|jpe?g)$/i.test(name));
  const proved = new Set(Object.values(assets).map(asset => asset.path));
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
  const proof = `${JSON.stringify({ schemaVersion: 1, storySha256, assets }, null, 2)}\n`;
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
  return { presentationSha256, storySha256, assetIds: Object.keys(assets), blocked };
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
