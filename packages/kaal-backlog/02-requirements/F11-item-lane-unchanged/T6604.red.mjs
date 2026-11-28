// Case backlog/T6604 tests: backlog/F11, backlog/N2
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
export const id = 'backlog/T6604';
export const tests = ['backlog/F11', 'backlog/N2'];
export const title = 'the old call and the one-entry table give the same answer, and the module stays pure';
export async function run() {
  const qualify = await load();
  const inputs = [
    [[A(IR + 'B1.md'), { path: IR + 'B2-show-wip.md', status: 'M', mode: '100644' }], [IR + 'B2-show-wip.md']],
    [[A(IR + 'B3-second.md')], [IR + 'B3-first.md']],
    [[A(IR + 'README.md')], []],
    [[], []],
  ];
  for (const [diff, existing] of inputs) {
    const old = qualify(diff, { roots: [IR], existing });
    const table = qualify(diff, { lanes: [item], existing: { item: existing } });
    assert.equal(table.verdict, old.verdict);
    assert.deepEqual(table.findings.map(({ code, path }) => ({ code, path })), old.findings.map(({ code, path }) => ({ code, path })));
  }
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(MODULE, 'utf8');
  assert.ok(!/\bimport\b|\bDate\b|\bprocess\b|\brequire\b|\bfetch\b/.test(source.replace(/\/\/.*$/gm, '')), 'qualify must stay pure');
}
test(id, () => run());
