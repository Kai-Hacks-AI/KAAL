// Case backlog/T6601 tests: backlog/F9
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
export const id = 'backlog/T6601';
export const tests = ['backlog/F9'];
export const title = 'a file that fits no entry, or has a status other than A and M, refuses the whole change';
export async function run() {
  const qualify = await load();
  const lanes = [item, note];
  const ex = { item: [], note: [] };
  const bad = [
    [A('.github/workflows/x.yml'), 'outside-roots'],
    [A(IR + 'README.md'), 'not-an-item'],
    [A(NR + 'B2.md'), 'not-an-item'],
    [A(NR + 'sub/N-x.json'), 'not-an-item'],
    [{ path: NR + 'N-x.json', status: 'C', mode: '100644' }, 'status'],
    [{ path: NR + 'N-x.json', mode: '100644' }, 'status'],
    [{ path: NR + 'N-x.json', status: 'D' }, 'deletion'],
  ];
  for (const [entry, code] of bad) {
    const r = qualify([A(IR + 'B1.md'), entry], { lanes, existing: ex });
    assert.equal(r.verdict, 'refused', JSON.stringify(entry) + ' was not refused');
    assert.ok(codes(r).includes(code), JSON.stringify(entry) + ' lacks ' + code);
  }
}
test(id, () => run());
