// Case backlog/T6602 tests: backlog/F10
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
export const id = 'backlog/T6602';
export const tests = ['backlog/F10'];
export const title = 'collisions are judged per kind on the resulting set';
export async function run() {
  const qualify = await load();
  const lanes = [item, note];
  const same = qualify([A(IR + 'B4.md'), A(NR + 'N-b4.json')], { lanes, existing: { item: [], note: [] } });
  assert.equal(same.verdict, 'qualified');
  const clash = qualify([A(NR + 'N-first.json')], { lanes, existing: { item: [], note: [NR + 'N-first.json'] } });
  assert.equal(clash.verdict, 'qualified', 'adding a file that already exists is not a second key');
  const taken = qualify([A(IR + 'B3-second.md')], { lanes, existing: { item: [IR + 'B3-first.md'], note: [] } });
  assert.equal(taken.verdict, 'refused');
  assert.ok(codes(taken).includes('duplicate-number'));
  assert.ok(taken.findings.some((f) => f.kind === 'item'), 'a finding carries the kind of its file');
  const edit = qualify([{ path: IR + 'B3-first.md', status: 'M', mode: '100644' }], { lanes, existing: { item: [IR + 'B3-first.md'], note: [] } });
  assert.equal(edit.verdict, 'qualified');
}
test(id, () => run());
