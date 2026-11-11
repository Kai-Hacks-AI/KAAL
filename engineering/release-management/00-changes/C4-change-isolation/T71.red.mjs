// Case release/T71 tests: release/G20
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
export const id = 'release/T71';
export const tests = ['release/G20'];
export const title = 'gap release/G20 is closed: a replay shows the judge agrees with the observed verdicts';
export async function run() {
  const replay = join(cap, '00-changes/C4-change-isolation/replay.mjs');
  assert.ok(existsSync(replay), 'the replay is absent');
  const r = spawnSync(process.execPath, [replay], { cwd: repo, encoding: 'utf8' });
  assert.equal(r.status, 0, 'the replay does not agree with the observed verdicts');
}
