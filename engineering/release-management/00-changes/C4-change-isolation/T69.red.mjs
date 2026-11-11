// Case release/T69 tests: release/G18
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const judgeFile = join(repo, 'engineering/change-isolation/check.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const frontmatter = (path, what) => read(path, what).split('---')[1] ?? '';
const judge = async () => { const m = await import(pathToFileURL(judgeFile).href); assert.equal(typeof m.judge, 'function', 'the judge is not exported'); return m.judge; };
export const id = 'release/T69';
export const tests = ['release/G18'];
export const title = 'gap release/G18 is closed: the judge emits a verdict record';
export async function run() {
  const run = spawnSync(process.execPath, [judgeFile, '--json', '--place', 'integration-in'], { input: 'packages/kaal-core/x.mjs\nREADME.md\n', encoding: 'utf8' });
  let record;
  try { record = JSON.parse(run.stdout); } catch { assert.fail('the judge prints no machine-readable record'); }
  assert.equal(record.control, 'release/I3');
  assert.equal(record.place, 'integration-in');
  assert.equal(record.verdict, 'FAIL');
  assert.deepEqual(record.violations.map((v) => v.path ?? v), ['README.md']);
}
