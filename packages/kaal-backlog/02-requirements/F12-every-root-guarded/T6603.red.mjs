// Case backlog/T6603 tests: backlog/F9, backlog/F12
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
export const id = 'backlog/T6603';
export const tests = ['backlog/F9', 'backlog/F12'];
export const title = 'a table with no entry, no roots, or an unguarded root is refused whole';
export async function run() {
  const qualify = await load();
  const input = [A(IR + 'B1.md')];
  const ex = { item: [], note: [] };
  assert.equal(qualify(input, { lanes: [item, note], existing: ex }).verdict, 'qualified', 'a guarded table must work');
  const tables = {
    'no entry': [],
    'no roots': [{ ...item, roots: [] }],
    'root outside its allow pattern': [{ ...item, roots: ['packages/kaal-backlog/lib/'] }],
    'root covering rules': [{ ...note, roots: ['packages/kaal-backlog/'] }],
    'repository root': [{ ...note, roots: ['/'] }],
  };
  for (const [name, lanes] of Object.entries(tables)) {
    const r = qualify(input, { lanes, existing: ex });
    assert.equal(r.verdict, 'refused', name + ' was not refused');
    assert.ok(codes(r).includes('roots-cover-rules'), name + ' lacks roots-cover-rules');
  }
}
test(id, () => run());
