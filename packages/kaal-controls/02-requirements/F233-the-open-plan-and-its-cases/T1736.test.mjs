// Case controls/T1736 tests: controls/F233
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'packages/kaal-controls/test/lib/changes-of.mjs');
export const id = 'controls/T1736';
export const tests = ['controls/F233'];
export const title = 'changesOf lists each Change as open or closed with the Cases that belong to it through its Intents and Requirements, and reads nothing';
const f = (path, text) => ({ path, text });
export async function run() {
  assert.ok(existsSync(FILE), 'test/lib/changes-of.mjs is absent');
  assert.doesNotMatch(readFileSync(FILE, 'utf8'), /from ['"]/, 'the function imports something, so it is not pure');
  const { changesOf } = await import(pathToFileURL(FILE).href);
  const files = [
    f('00-changes/C900-a/C900.md', '---\nid: controls/C900\nimplements: [controls/I9]\n---\n'),
    f('00-changes/C901-b/C901.md', '---\nid: controls/C901\nimplements: [controls/I8]\n---\n'),
    f('00-changes/C901-b/act.md', 'done\n'),
    f('02-requirements/F9-x/F9.md', '---\nid: controls/F9\nserves: [controls/I9]\n---\n'),
    f('02-requirements/F9-x/T9.test.mjs', "export const tests = ['controls/F9'];\n"),
    f('02-requirements/F8-y/F8.md', '---\nid: controls/F8\nserves: [controls/I8]\n---\n'),
    f('02-requirements/F8-y/T8.test.mjs', "export const tests = ['controls/F8', 'controls/F9'];\n"),
  ];
  assert.deepEqual(changesOf(files), [
    { id: 'controls/C900', open: true, cases: ['02-requirements/F8-y/T8.test.mjs', '02-requirements/F9-x/T9.test.mjs'] },
    { id: 'controls/C901', open: false, cases: ['02-requirements/F8-y/T8.test.mjs'] },
  ]);
  assert.deepEqual(changesOf([]), [], 'no Change files, no Changes');
}
