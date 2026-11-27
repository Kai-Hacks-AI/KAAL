// Case controls/T1574 tests: controls/N8
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// package-relative: the package root is the folder above this Case that holds package.json
let pkg = dirname(fileURLToPath(import.meta.url));
while (!existsSync(join(pkg, 'package.json'))) pkg = dirname(pkg);
export const id = 'controls/T1574';
export const tests = ['controls/N8'];
export const title = 'the Skill names no hosting term and no repository id form: no "pull request" and no Change id such as <capability>/C8';
const files = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : [p]; });
export async function run() {
  const skill = join(pkg, 'skills', 'kaal-controls');
  assert.ok(existsSync(skill), 'the Skill folder is absent');
  const forbidden = [
    ['a hosting term (pull request)', /pull[ _-]?requests?/i],
    ['the form of a Change id', /(<[a-z-]+>|\b[a-z][a-z-]*)\/C\d+\b/],
  ];
  const found = [];
  for (const f of files(skill).filter((p) => /\.(mjs|md|json|ya?ml)$/.test(p))) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => { for (const [what, re] of forbidden) if (re.test(l)) found.push(`${relative(pkg, f)}:${i + 1} ${what}`); });
  }
  assert.deepEqual(found, [], `the Skill names what is not its own:\n${found.join('\n')}`);
}
