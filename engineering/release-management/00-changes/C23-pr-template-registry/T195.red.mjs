// Case release/T195 tests: G55
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

export const id = 'release/T195';
export const tests = ['release/G55'];
export const title = 'gap release/G55 is closed: check fails on a differing copy or an unregistered template and is unknown on a missing source or manifest';
export async function run() {
  const { check } = await load();
  let root = copy();
  writeFileSync(join(root, '.github/PULL_REQUEST_TEMPLATE/sync.md'), Buffer.concat([read(join(registry, 'sync.md'), 'sync.md'), Buffer.from('x')]));
  assert.equal((await check(root)).verdict, 'FAIL', 'a differing installed copy must FAIL');
  root = copy();
  const mf = join(root, 'engineering/release-management/05-src/pr-templates/manifest.json');
  writeFileSync(join(root, '.github/PULL_REQUEST_TEMPLATE/extra.md'), 'extra\n');
  writeFileSync(mf, JSON.stringify({ ...JSON.parse(readFileSync(mf, 'utf8')), closed: false }));
  const open = await check(root);
  assert.equal(open.verdict, 'PASS', 'an unregistered template is only reported while the registry is not closed');
  assert.ok(open.findings.some((f) => f.includes('extra.md')), 'the unregistered template must be reported');
  writeFileSync(mf, JSON.stringify({ ...JSON.parse(readFileSync(mf, 'utf8')), closed: true }));
  assert.equal((await check(root)).verdict, 'FAIL', 'an unregistered template must FAIL once the registry is closed');
  root = copy();
  rmSync(join(root, 'engineering/release-management/05-src/pr-templates/sync.md'));
  assert.equal((await check(root)).verdict, 'UNKNOWN', 'a missing source must be UNKNOWN');
  root = copy();
  rmSync(join(root, 'engineering/release-management/05-src/pr-templates/manifest.json'));
  assert.equal((await check(root)).verdict, 'UNKNOWN', 'a missing manifest must be UNKNOWN');
}
