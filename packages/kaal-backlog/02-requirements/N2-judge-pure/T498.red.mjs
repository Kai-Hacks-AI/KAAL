// Case backlog/T498 tests: backlog/F7, backlog/N2
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
export const id = 'backlog/T498';
export const tests = ['backlog/F7', 'backlog/N2'];
export const title = 'an empty diff is a clean no-op, the result does not depend on order, and the module is pure';
export async function run() {
  const qualify = await load();
  const empty = qualify([], { roots, existing: [] });
  assert.equal(empty.verdict, 'nothing-to-land');
  assert.deepEqual(empty.findings, []);
  const a = [add(ROOT + 'B1.md'), add(ROOT + 'B2.md'), add('.github/x.yml')];
  const first = qualify(a, { roots, existing: [] });
  assert.deepEqual(qualify([...a].reverse(), { roots, existing: [] }), first);
  assert.deepEqual(qualify(a, { roots, existing: [] }), first);
  const src = readFileSync(MODULE, 'utf8');
  assert.doesNotMatch(src, /\b(import|require)\b|\bDate\b|\bprocess\b|\bperformance\b|\bfetch\b|\.kaal|node:/, 'the module is not pure');
}
test(id, () => run());
