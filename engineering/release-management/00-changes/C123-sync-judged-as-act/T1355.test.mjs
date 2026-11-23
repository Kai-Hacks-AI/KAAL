// Case release/T1355 tests: release/C123
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { RUNNER, makeFolders } from './isolation-fixtures.mjs';
export const id = 'release/T1355';
export const tests = ['release/C123'];
export const title = 'main moving after the SYNC changes nothing: the reference is main as the result contains it, so a path main changed afterwards is not read as the collector\'s own';
export async function run() {
  const f = makeFolders([{ path: 'engineering/cap/00-changes/C2-first-thing/C2.md', before: null, after: 'from main at the SYNC\n' }]);
  try {
    writeFileSync(join(f.main, 'engineering/cap/00-changes/C2-first-thing.md'), 'main moved\n');   // the default branch now holds more than the result contains
    const r = spawnSync('node', [RUNNER, 'limit', '--main', f.main, '--pr', f.after, '--before', f.before, '--contained', f.contained], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: 'on' } });
    assert.match(r.stdout, /^PASS: limit Act: not an ACT/, r.stdout + r.stderr); assert.equal(r.status, 0);
  } finally { f.cleanup(); }
}
