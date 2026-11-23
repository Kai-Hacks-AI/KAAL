// The Case catalog: which Case files a tree holds, and what each declares. Pure over a tree read as text: no file is imported or run,
// and nothing about where a Case lives, which Change it belongs to or what its path says is assumed (testing/F158).
// The tree is listed and read through Hosting alone (list with skip and links, then readFile): Hosting owns the filesystem walk and
// Testing owns what a Case file means. No host module is read here.
import { list, readFile } from '@kaihacksai/kaal-hosting';
import { join } from 'node:path';

const CASE_FILE = /(^|\/)T(\d+)\.(red|test)\.mjs$/;
const SKIPPED = new Set(['node_modules', '.git']);
const ID = /^export const id = (['"])([^'"]+)\1/gm;
const TESTS = /^export const tests = \[([^\]]*)\]/m;

const strings = (text) => [...text.matchAll(/(['"])([^'"]*)\1/g)].map((m) => m[2]).filter(Boolean);

/** The ids and claims one Case file declares, read as text, in either quote form. A file may declare no id, or more than one. */
export function readCase(text) {
  return { ids: [...text.matchAll(ID)].map((m) => m[2]), tests: strings(text.match(TESTS)?.[1] ?? '') };
}

/**
 * Every Case file under root, sorted: { cases: [{ id, file, tests, parked }], findings }.
 * A finding makes a file unusable and is never dropped silently: `no-id` (the file declares none) and `duplicate-id`
 * (the id is declared by several files, and none of them is listed; the finding carries the id so a consumer can hold it at UNKNOWN).
 */
export async function collectCases(root) {
  const found = [];
  const findings = [];
  for (const entry of await list(root, { skip: [...SKIPPED], links: 'skip' })) {
    const file = entry.path;
    if (entry.kind !== 'file' || !CASE_FILE.test(file)) continue;
    const { ids, tests } = readCase((await readFile(join(root, file))).toString('utf8'));
    if (ids.length === 0) findings.push({ kind: 'no-id', files: [file], detail: 'the file declares no export const id' });
    else found.push({ id: ids[0], file, tests, parked: file.endsWith('.red.mjs') });
  }
  const filesOf = new Map();
  for (const c of found) filesOf.set(c.id, [...(filesOf.get(c.id) ?? []), c.file]);
  for (const [id, same] of filesOf) {
    if (same.length > 1) findings.push({ kind: 'duplicate-id', id, files: same, detail: `duplicate id: ${id} is declared by ${same.length} files` });
  }
  const number = (c) => Number(c.id.match(/T(\d+)$/)?.[1] ?? Infinity);
  const cases = found
    .filter((c) => filesOf.get(c.id).length === 1)
    .sort((a, b) => number(a) - number(b) || a.id.localeCompare(b.id) || a.file.localeCompare(b.file));
  findings.sort((a, b) => a.kind.localeCompare(b.kind) || a.files[0].localeCompare(b.files[0]));
  return { cases, findings };
}
