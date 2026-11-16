// Case release/T562 tests: C40 (the references and the size)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const file = join(repo, 'engineering/release-management/HOW-TO-WORK.md');
const read = () => { assert.ok(existsSync(file), 'HOW-TO-WORK.md is absent from engineering/release-management'); return readFileSync(file, 'utf8'); };
const draft = () => {
  const after = readFileSync(join(repo, 'engineering/release-management/00-changes/C40-how-to-work-concept/interface.md'), 'utf8').split(/^## Draft of HOW-TO-WORK\.md$/m)[1];
  const m = after?.match(/^````\n([\s\S]*?)\n````$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export const id = 'release/T562';
export const tests = ['release/C40'];
export const title = 'the Definition states the resolution rule once, every path it names exists, none points into packages, and it stays small';
export function run() {
  const text = read();
  assert.equal((text.match(/^## Resolution$/gm) ?? []).length, 1, 'the resolution rule is not stated exactly once');
  const paths = [...text.matchAll(/(?<![\w/.-])((?:engineering|packages|\.kaal)\/[\w./#-]*[\w/])/g)].map((m) => m[1]);
  assert.ok(paths.length > 0, 'the Definition names no path');
  for (const p of paths) {
    assert.ok(!p.startsWith('packages/'), `the Definition points into packages/: ${p}`);
    assert.ok(existsSync(join(repo, p.split('#')[0])), `the Definition points at a path that does not exist: ${p}`);
  }
  assert.ok(text.split('\n').length <= 30, 'the Definition is longer than 30 lines');
}
