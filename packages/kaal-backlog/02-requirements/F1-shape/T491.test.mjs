// Case backlog/T491 tests: backlog/F1
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
export const id = 'backlog/T491';
export const tests = ['backlog/F1'];
export const title = 'a malformed id, a missing or empty title or a repeated id refuses the whole set';
export async function run() {
  const check = await load();
  const good = item('backlog/B1');
  for (const bad of ['backlog/b1', 'backlog/B', 'backlog/B0', 'backlog/B01', 'backlog/F1', 'B1', 'Backlog/B1', 'backlog//B1']) {
    const r = check([good, item(bad)]);
    assert.equal(r.verdict, 'refused', bad + ' was not refused');
    assert.ok(codes(r).includes('malformed-id'), bad + ' lacks the malformed-id finding');
  }
  for (const title of [undefined, '', '   ']) {
    const r = check([good, { id: 'backlog/B2', title, body: 'x' }]);
    assert.equal(r.verdict, 'refused');
    assert.ok(codes(r).includes('missing-title'));
  }
  const dup = check([good, item('backlog/B1')]);
  assert.equal(dup.verdict, 'refused');
  assert.ok(codes(dup).includes('duplicate-id'));
}
test(id, () => run());
