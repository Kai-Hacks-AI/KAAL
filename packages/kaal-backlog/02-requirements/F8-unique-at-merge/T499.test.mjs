// Case backlog/T499 tests: backlog/F8
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
export const id = 'backlog/T499';
export const tests = ['backlog/F8'];
export const title = 'a new item that takes an existing number is refused, and editing the same item is not a collision';
export async function run() {
  const qualify = await load();
  const existing = [ROOT + 'B3-first.md'];
  const clash = qualify([add(ROOT + 'B3-second.md')], { roots, existing });
  assert.equal(clash.verdict, 'refused');
  assert.ok(codes(clash).includes('duplicate-number'));
  const twice = qualify([add(ROOT + 'B7.md'), add(ROOT + 'B7-again.md')], { roots, existing });
  assert.equal(twice.verdict, 'refused');
  assert.ok(codes(twice).includes('duplicate-number'));
  const edit = qualify([{ path: ROOT + 'B3-first.md', status: 'M', mode: '100644' }], { roots, existing });
  assert.equal(edit.verdict, 'qualified');
}
test(id, () => run());
