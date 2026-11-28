// Case backlog/T6600 tests: backlog/F9, backlog/F10
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-backlog');
const MODULE = join(dir, 'lib/qualify.mjs');
async function load() { assert.ok(existsSync(MODULE), 'lib/qualify.mjs is absent'); const m = await import(pathToFileURL(MODULE).href); assert.equal(typeof m.qualify, 'function', 'qualify is not exported'); return m.qualify; }
const IR = 'packages/kaal-backlog/00-backlog/';
const NR = 'packages/kaal-backlog/13-notes/';
const item = { kind: 'item', roots: [IR], name: '^B([1-9][0-9]*)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\\.md$', allow: '^packages/[a-z0-9]+(?:-[a-z0-9]+)*/00-backlog/$' };
const note = { kind: 'note', roots: [NR], name: '^N-([a-z0-9]+(?:-[a-z0-9]+)*)\\.json$', allow: '^packages/[a-z0-9]+(?:-[a-z0-9]+)*/13-notes/$' };
const A = (p) => ({ path: p, status: 'A', mode: '100644' });
const codes = (r) => r.findings.map((f) => f.code);
export const id = 'backlog/T6600';
export const tests = ['backlog/F9', 'backlog/F10'];
export const title = 'a change carrying items and a second kind qualifies when every file fits its own entry';
export async function run() {
  const qualify = await load();
  const lanes = [item, note];
  const mixed = qualify([A(IR + 'B1.md'), A(NR + 'N-first.json')], { lanes, existing: { item: [], note: [] } });
  assert.equal(mixed.verdict, 'qualified');
  assert.deepEqual(mixed.findings, []);
  const alone = qualify([A(NR + 'N-first.json')], { lanes, existing: { item: [], note: [] } });
  assert.equal(alone.verdict, 'qualified');
  const swapped = qualify([A(IR + 'N-first.json')], { lanes, existing: { item: [], note: [] } });
  assert.equal(swapped.verdict, 'refused', 'a note file in the item root is not an item');
}
test(id, () => run());
