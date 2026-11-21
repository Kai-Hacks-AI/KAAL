// The Case catalog: which Case files a tree holds, and what each declares. Pure over a tree read as text: no file is imported or run,
// and nothing about where a Case lives, which Change it belongs to or what its path says is assumed (testing/F158).
// This is the one place in the package that reads the host directly (node:fs, read-only): Hosting reads a tree asynchronously
// and refuses a link to a directory, which every node_modules holds, so it cannot walk a checkout. The exception is declared in
// test/boundary.test.mjs and is meant to end when Hosting can list a tree without them (testing/A54).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const CASE_FILE = /(^|\/)T(\d+)\.(red|test)\.mjs$/;
const SKIPPED = new Set(['node_modules', '.git']);
const ID = /^export const id = (['"])([^'"]+)\1/gm;
const TESTS = /^export const tests = \[([^\]]*)\]/m;

const strings = (text) => [...text.matchAll(/(['"])([^'"]*)\1/g)].map((m) => m[2]).filter(Boolean);

/** The ids and claims one Case file declares, read as text, in either quote form. A file may declare no id, or more than one. */
export function readCase(text) {
  return { ids: [...text.matchAll(ID)].map((m) => m[2]), tests: strings(text.match(TESTS)?.[1] ?? '') };
}

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (SKIPPED.has(e.name) ? [] : e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));

/**
 * Every Case file under root, sorted: { cases: [{ id, file, tests, parked }], findings }.
 * A finding makes a file unusable and is never dropped silently: `no-id` (the file declares none) and `duplicate-id`
 * (the id is declared by several files, and none of them is listed; the finding carries the id so a consumer can hold it at UNKNOWN).
 */
export function collectCases(root) {
  const found = [];
  const findings = [];
  for (const abs of files(root)) {
    const file = relative(root, abs).split(sep).join('/');
    if (!CASE_FILE.test(file)) continue;
    const { ids, tests } = readCase(readFileSync(abs, 'utf8'));
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
