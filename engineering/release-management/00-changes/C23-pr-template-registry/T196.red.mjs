// Case release/T196 tests: G55
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, rmSync, cpSync, mkdtempSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const registry = join(cap, '05-src/pr-templates');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const load = async () => { assert.ok(existsSync(join(registry, 'install.mjs')), 'install.mjs is absent'); return import(join(registry, 'install.mjs')); };
const copy = () => { const root = mkdtempSync(join(tmpdir(), 'prt-')); mkdirSync(join(root, 'engineering/release-management/05-src'), { recursive: true }); cpSync(registry, join(root, 'engineering/release-management/05-src/pr-templates'), { recursive: true }); cpSync(join(repo, '.github'), join(root, '.github'), { recursive: true }); return root; };

export const id = 'release/T196';
export const tests = ['release/G55'];
export const title = 'gap release/G55 is closed: write installs the source byte for byte and then check passes';
export async function run() {
  const { write, check } = await load();
  const root = copy();
  rmSync(join(root, '.github/PULL_REQUEST_TEMPLATE/sync.md'));
  assert.equal((await write(root)).verdict, 'PASS');
  assert.ok(read(join(root, '.github/PULL_REQUEST_TEMPLATE/sync.md'), 'installed sync.md').equals(read(join(registry, 'sync.md'), 'sync.md')));
  assert.equal((await check(root)).verdict, 'PASS');
}
