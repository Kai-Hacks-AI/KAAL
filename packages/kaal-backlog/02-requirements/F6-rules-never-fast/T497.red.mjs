// Case backlog/T497 tests: backlog/F6
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-backlog');
const MODULE = join(dir, 'lib/qualify.mjs');
async function load() { assert.ok(existsSync(MODULE), 'lib/qualify.mjs is absent'); const m = await import(pathToFileURL(MODULE).href); assert.equal(typeof m.qualify, 'function', 'qualify is not exported'); return m.qualify; }
const ROOT = 'packages/kaal-backlog/backlog/';
const roots = [ROOT];
const add = (p) => ({ path: p, status: 'A', mode: '100644' });
const codes = (r) => r.findings.map((f) => f.code);
export const id = 'backlog/T497';
export const tests = ['backlog/F6'];
export const title = 'a declaration with no roots or with a root that covers rule paths is refused';
export async function run() {
  const qualify = await load();
  const item = [add(ROOT + 'B1.md')];
  for (const bad of [[], undefined, ['packages/kaal-backlog/'], ['packages/'], ['.github/'], ['engineering/'], [''], ['/'], ['packages/kaal-backlog/lib/'], ['packages/kaal-backlog/04-controls/']]) {
    const r = qualify(item, { roots: bad, existing: [] });
    assert.equal(r.verdict, 'refused', JSON.stringify(bad) + ' was accepted');
    assert.ok(codes(r).includes('roots-cover-rules'), JSON.stringify(bad) + ' lacks roots-cover-rules');
  }
  assert.equal(qualify(item, { roots, existing: [] }).verdict, 'qualified');
}
test(id, () => run());
