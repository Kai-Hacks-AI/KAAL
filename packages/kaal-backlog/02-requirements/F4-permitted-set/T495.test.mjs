// Case backlog/T495 tests: backlog/I2, backlog/F4
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
export const id = 'backlog/T495';
export const tests = ['backlog/I2', 'backlog/F4'];
export const title = 'only added or modified item files in a root qualify; anything else refuses the whole change';
export async function run() {
  const qualify = await load();
  const ok = qualify([add(ROOT + 'B1.md'), { path: ROOT + 'B2-show-wip.md', status: 'M', mode: '100644' }], { roots, existing: [ROOT + 'B2-show-wip.md'] });
  assert.equal(ok.verdict, 'qualified');
  assert.deepEqual(ok.findings, []);
  const bad = [
    [add('.github/workflows/x.yml'), 'outside-roots'],
    [add('packages/kaal-backlog/lib/check.mjs'), 'outside-roots'],
    [add(ROOT + 'README.md'), 'not-an-item'],
    [add(ROOT + 'b3.md'), 'not-an-item'],
    [add(ROOT + 'sub/B3.md'), 'not-an-item'],
    [{ path: ROOT + 'B3.md', status: 'D' }, 'deletion'],
    [{ path: ROOT + 'B3.md', status: 'R', oldPath: ROOT + 'B4.md', mode: '100644' }, 'rename'],
    [{ path: ROOT + 'B3.md', status: 'T', mode: '120000' }, 'mode'],
    [{ path: ROOT + 'B3.md', status: 'A', mode: '160000' }, 'mode'],
    [{ path: ROOT + 'B3.md', status: 'A', mode: '100755' }, 'mode'],
    [{ path: ROOT + 'B3.md', status: 'C', mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', status: 'X', mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', status: 'a', mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', status: 'AM', mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', status: null, mode: '100644' }, 'status'],
    [{ path: ROOT + 'B3.md', status: 1, mode: '100644' }, 'status'],
  ];
  for (const [entry, code] of bad) {
    const r = qualify([add(ROOT + 'B1.md'), entry], { roots, existing: [] });
    assert.equal(r.verdict, 'refused', JSON.stringify(entry) + ' was not refused');
    assert.ok(codes(r).includes(code), JSON.stringify(entry) + ' lacks ' + code);
  }
}
test(id, () => run());
