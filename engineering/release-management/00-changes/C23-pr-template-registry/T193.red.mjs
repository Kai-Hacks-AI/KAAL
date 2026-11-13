// Case release/T193 tests: G55
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

export const id = 'release/T193';
export const tests = ['release/G55'];
export const title = 'gap release/G55 is closed: the registry holds SYNC and its manifest records the hash of the source';
export function run() {
  const manifest = JSON.parse(read(join(registry, 'manifest.json'), 'manifest.json'));
  assert.equal(manifest.version, 1);
  const entry = manifest.templates.find((t) => t.type === 'SYNC');
  assert.ok(entry, 'SYNC is not registered');
  assert.equal(entry.target, '.github/PULL_REQUEST_TEMPLATE/sync.md');
  assert.equal(entry.sha256, sha(read(join(registry, entry.source), 'the SYNC source')));
}
