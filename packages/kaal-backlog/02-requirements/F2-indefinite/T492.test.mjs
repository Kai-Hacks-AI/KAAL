// Case backlog/T492 tests: backlog/F2
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
export const id = 'backlog/T492';
export const tests = ['backlog/F2'];
export const title = 'an untaken item gets the same result a century later and is never stale, overdue or expired';
export async function run() {
  const check = await load();
  const items = [item('backlog/B1')];
  const now = check(items, { asOf: '2026-11-16' });
  const later = check(items, { asOf: '2126-11-16' });
  assert.equal(now.verdict, 'accepted');
  assert.deepEqual(later, now);
  assert.ok(!JSON.stringify(later).match(/stale|overdue|expire|age/i), 'a finding speaks of age');
}
test(id, () => run());
