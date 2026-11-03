#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const SOURCE_SHA = '1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c';
const LUDORY_SHA = '0d034f1ab7e559b07080c00f6386a453e0e398b2';

function byteCompare(a, b) {
  return Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

/** Parse git ls-tree -r -z output without treating newlines as record separators. */
export function parseLsTree(output) {
  if (!Buffer.isBuffer(output)) throw new TypeError('Expected Buffer from git ls-tree');
  if (output.length === 0) return [];
  if (output[output.length - 1] !== 0) throw new Error('Truncated git ls-tree output');
  const records = new TextDecoder('utf-8', { fatal: true }).decode(output).split('\0').slice(0, -1);
  const files = records.map((record) => {
    const match = /^(\d{6}) (blob|commit) ([0-9a-f]{40,64})\t([\s\S]+)$/.exec(record);
    if (!match) throw new Error('Malformed git ls-tree record');
    const [, mode, type, objectId, path] = match;
    if (path.startsWith('/') || path.split('/').includes('..')) throw new Error('Unsafe repository-relative path');
    return { path, mode, type, objectId };
  });
  files.sort((a, b) => byteCompare(a.path, b.path));
  for (let index = 1; index < files.length; index++) {
    if (files[index - 1].path === files[index].path) throw new Error('Duplicate path in git tree');
  }
  return files;
}

async function git(dir, args, encoding = 'utf8') {
  try {
    const { stdout } = await execFileAsync('git', ['-C', dir, ...args], {
      encoding, maxBuffer: 64 * 1024 * 1024, windowsHide: true,
      env: { ...process.env, GIT_NO_LAZY_FETCH: '1' },
    });
    return stdout;
  } catch (error) {
    throw new Error(`Git command failed in ${dir}: ${error.message}`);
  }
}

export async function collectTree({ dir, ref, role, repository }) {
  if (!/^[0-9a-f]{40}$/.test(ref)) throw new Error('Expected full 40-character commit SHA');
  const type = (await git(dir, ['cat-file', '-t', ref])).trim();
  if (type !== 'commit') throw new Error(`Expected commit object at ${ref}, found ${type}`);
  const output = await git(dir, ['ls-tree', '-r', '-z', ref], 'buffer');
  const files = parseLsTree(output);
  const counts = new Map();
  for (const file of files) {
    const group = file.path.split('/', 1)[0];
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  const groupCounts = Object.fromEntries([...counts].sort(([a], [b]) => byteCompare(a, b)));
  return { role, repository, commit: ref, files, groupCounts };
}

export async function collectInventory({ sourceDir, ludoryDir }) {
  const source = await collectTree({
    dir: sourceDir, ref: SOURCE_SHA, role: 'source',
    repository: 'm-amirov/kiss-at-the-edge-of-the-world',
  });
  const ludory = await collectTree({
    dir: ludoryDir, ref: LUDORY_SHA, role: 'framework', repository: 'm-amirov/ludory',
  });
  return { schemaVersion: 1, repositories: [source, ludory] };
}

export async function atomicWrite(path, contents) {
  const target = resolve(path);
  const temporary = resolve(dirname(target), `.${basename(target)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporary, contents, { flag: 'wx' });
    await fs.rename(temporary, target);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

async function main(args) {
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--source', '--ludory', '--output'].includes(args[i]) || !args[i + 1] || options.has(args[i])) {
      throw new Error('Usage: m1-inventory --source <checkout> --ludory <checkout> --output <file>');
    }
    options.set(args[i], args[i + 1]);
  }
  if (options.size !== 3) throw new Error('Missing required CLI arguments');
  const result = await collectInventory({ sourceDir: options.get('--source'), ludoryDir: options.get('--ludory') });
  await atomicWrite(options.get('--output'), `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(JSON.stringify({
    output: resolve(options.get('--output')),
    repositories: result.repositories.map(({ repository, commit, files }) => ({ repository, commit, fileCount: files.length })),
  }) + '\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
