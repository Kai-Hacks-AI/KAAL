// Case controls/T1575 tests: controls/N8
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// package-relative: the package root is the folder above this Case that holds package.json
let pkg = dirname(fileURLToPath(import.meta.url));
while (!existsSync(join(pkg, 'package.json'))) pkg = dirname(pkg);
export const id = 'controls/T1575';
export const tests = ['controls/N8'];
export const title = 'the Skill scripts do no platform work: no file system, process, operating-system or line-ending code of their own';
const files = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : [p]; });
export async function run() {
  const scripts = join(pkg, 'skills', 'kaal-controls', 'scripts');
  assert.ok(existsSync(scripts), 'the scripts folder is absent');
  const forbidden = [
    ['a file system import', /from\s+['"](?:node:)?fs(?:\/promises)?['"]/],
    ['a process import', /from\s+['"](?:node:)?child_process['"]/],
    ['an operating system import', /from\s+['"](?:node:)?os['"]/],
    ['a path import other than posix', /import\s*\{(?![^}]*\bposix\b[^}]*\})[^}]*\}\s*from\s+['"](?:node:)?path['"]/],
    ['line-ending handling', /\\r\\n|\\r\b|\bEOL\b/],
  ];
  const found = [];
  for (const f of files(scripts).filter((p) => /\.mjs$/.test(p))) {
    readFileSync(f, 'utf8').split('\n').forEach((l, i) => { for (const [what, re] of forbidden) if (re.test(l)) found.push(`${relative(pkg, f)}:${i + 1} ${what}`); });
  }
  assert.deepEqual(found, [], `the Skill does platform work that belongs to hosting:\n${found.join('\n')}`);
}
