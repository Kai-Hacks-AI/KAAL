// Case backlog/T490 tests: backlog/I1, backlog/F1
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-backlog');
const CHECK = join(dir, 'lib/check.mjs');
async function load() { assert.ok(existsSync(CHECK), 'lib/check.mjs is absent'); const m = await import(pathToFileURL(CHECK).href); assert.equal(typeof m.check, 'function', 'check is not exported'); return m.check; }
const item = (id, extra = {}) => ({ id, title: 'a wish', body: 'why it matters', ...extra });
const codes = (r) => r.findings.map((f) => f.code);
export const id = 'backlog/T490';
export const tests = ['backlog/I1', 'backlog/F1'];
export const title = 'a set of well-formed items in any namespace is accepted with no findings';
export async function run() {
  const check = await load();
  const r = check([item('backlog/B1'), item('change/B12', { owner: 'change' }), item('engineering/hosting/B3', { tests: ['backlog/T1'] })]);
  assert.equal(r.verdict, 'accepted');
  assert.deepEqual(r.findings, []);
}
test(id, () => run());
