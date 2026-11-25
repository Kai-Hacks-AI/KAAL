// Case backlog/T493 tests: backlog/F3
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
export const id = 'backlog/T493';
export const tests = ['backlog/F3'];
export const title = 'an item that stores a state is refused whole';
export async function run() {
  const check = await load();
  for (const state of ['open', 'done', '']) {
    const r = check([item('backlog/B1'), item('backlog/B2', { state })]);
    assert.equal(r.verdict, 'refused', 'state ' + JSON.stringify(state) + ' was accepted');
    assert.ok(codes(r).includes('stored-state'));
  }
  assert.equal(check([item('backlog/B1')]).verdict, 'accepted');
}
test(id, () => run());
