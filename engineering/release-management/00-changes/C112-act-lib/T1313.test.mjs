// Case release/T1313 tests: release/F87
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const LIB = join(RM, '05-src/phase/lib');
const use = (name) => { const f = join(LIB, name); assert.ok(existsSync(f), `lib/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1313';
export const tests = ['release/F87'];
export const title = 'the library matches a path against the write map relative to the capability roots: Given a row, roots and paths, When asked, Then a path lies in the route only in its folders and files under a root, * standing for one segment';
export async function run() {
  const { inFolder, isFile, relativeToRoot, inRoute } = await use('write-map.mjs');
  const row = { route: 'act', folders: ['02-learnings/retros/'], files: ['00-changes/*/act.md'] };
  const roots = ['engineering/release-management', 'packages/kaal-retro'];
  assert.ok(inFolder('02-learnings/retros/RT1.md', '02-learnings/retros/'));
  assert.ok(inFolder('02-learnings/retros/a/b.md', '02-learnings/retros/'));
  assert.ok(!inFolder('02-learnings/retros', '02-learnings/retros/'), 'the folder itself is not in it');
  assert.ok(!inFolder('02-learnings/other/RT1.md', '02-learnings/retros/'));
  assert.ok(isFile('00-changes/C1-x/act.md', '00-changes/*/act.md'));
  assert.ok(!isFile('00-changes/C1-x/y/act.md', '00-changes/*/act.md'), '* is exactly one segment');
  assert.ok(!isFile('00-changes/C1-x/act.md/more', '00-changes/*/act.md'), 'a file is the whole path, not its prefix');
  assert.ok(!isFile('00-changes/act.md', '00-changes/*/act.md'), '* is not nothing');
  assert.equal(relativeToRoot('engineering/release-management/02-learnings/retros/RT1.md', roots), '02-learnings/retros/RT1.md');
  assert.equal(relativeToRoot('engineering/other/02-learnings/retros/RT1.md', roots), undefined, 'a path under no root is in no capability');
  assert.ok(inRoute('packages/kaal-retro/02-learnings/retros/RT1.md', row, roots), 'it must not matter where a capability stands');
  assert.ok(inRoute('engineering/release-management/00-changes/C1-x/act.md', row, roots));
  assert.ok(!inRoute('engineering/release-management/05-src/x.mjs', row, roots));
  assert.ok(!inRoute('02-learnings/retros/RT1.md', row, roots), 'a path under no root is outside');
}
