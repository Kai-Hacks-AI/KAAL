// Case backlog/T496 tests: backlog/F5
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-backlog');
const MODULE = join(dir, 'lib/qualify.mjs');
async function load() { assert.ok(existsSync(MODULE), 'lib/qualify.mjs is absent'); const m = await import(pathToFileURL(MODULE).href); assert.equal(typeof m.qualify, 'function', 'qualify is not exported'); return m.qualify; }
const ROOT = 'packages/kaal-backlog/00-backlog/';
const roots = [ROOT];
const add = (p) => ({ path: p, status: 'A', mode: '100644' });
const codes = (r) => r.findings.map((f) => f.code);
export const id = 'backlog/T496';
export const tests = ['backlog/F5'];
export const title = 'both sides of a rename and tricky paths are judged, and a missing diff is unknown';
export async function run() {
  const qualify = await load();
  const moved = qualify([{ path: ROOT + 'B1.md', status: 'R', oldPath: 'packages/kaal-backlog/lib/check.mjs', mode: '100644' }], { roots, existing: [] });
  assert.equal(moved.verdict, 'refused');
  assert.ok(codes(moved).includes('outside-roots'), 'the old path of a rename was not judged');
  for (const p of [ROOT + '../lib/B1.md', ROOT + '..\\B1.md', '/' + ROOT + 'B1.md', ROOT.replace('/', '//') + 'B1.md', ROOT + './B1.md']) {
    const r = qualify([add(p)], { roots, existing: [] });
    assert.equal(r.verdict, 'refused', p + ' was not refused');
  }
  for (const missing of [undefined, null, 'diff', { length: 1 }]) {
    const r = qualify(missing, { roots, existing: [] });
    assert.equal(r.verdict, 'unknown');
    assert.notEqual(r.verdict, 'qualified');
  }
}
test(id, () => run());
