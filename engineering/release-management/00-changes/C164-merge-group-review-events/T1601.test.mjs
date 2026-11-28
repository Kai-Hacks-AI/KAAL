// Case release/T1601 tests: release/C164. The wait of the merge-group review treats a refused read as transient and a read that keeps failing as unreadable: a refusal for rate limit twice, then a readable answer, goes on; a read that keeps failing ends in exit 2; a red required check ends in exit 1 at once. It never exits 0 for a group that is not green.
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FILE = join(repo, 'engineering/release-management/05-src/merge-group/wait-for-checks.mjs');
export const id = 'release/T1601';
export const tests = ['release/C164'];
export const title = 'the wait of the merge-group review retries a refused read, fails closed on one that keeps failing, and fails at once on a red required check';
export async function run() {
  assert.ok(existsSync(FILE), 'wait-for-checks.mjs is absent');
  const dir = mkdtempSync(join(tmpdir(), 'wait-'));
  try {
    // A stub gh: the script of the case says what each call answers, in order; a call past the list repeats the last.
    const stub = (answers) => {
      writeFileSync(join(dir, 'answers.json'), JSON.stringify(answers));
      writeFileSync(join(dir, 'n'), '0');
      writeFileSync(join(dir, 'gh'), `#!/usr/bin/env node
const fs = require('node:fs');
const a = JSON.parse(fs.readFileSync(${JSON.stringify(join(dir, 'answers.json'))}, 'utf8'));
const n = Number(fs.readFileSync(${JSON.stringify(join(dir, 'n'))}, 'utf8'));
fs.writeFileSync(${JSON.stringify(join(dir, 'n'))}, String(n + 1));
const r = a[Math.min(n, a.length - 1)];
if (r.refused) { console.error('HTTP 403: API rate limit exceeded'); process.exit(1); }
console.log(r.out);
`);
      chmodSync(join(dir, 'gh'), 0o755);
    };
    const runs = (...rs) => rs.map((r) => JSON.stringify(r)).join('\n');
    const ok = { name: 'Engineering', status: 'completed', conclusion: 'success' };
    const go = () => spawnSync(process.execPath, [FILE, '--required', 'Engineering', '--head', 'abc'], { encoding: 'utf8', env: { ...process.env, KAAL_GH: join(dir, 'gh'), KAAL_REPO: 'o/r', KAAL_INTERVAL: '0', KAAL_ATTEMPTS: '5' } });
    stub([{ refused: true }, { refused: true }, { out: runs(ok) }]);
    assert.equal(go().status, 0, 'a refusal twice and then a readable green group goes on to green');
    stub([{ refused: true }]);
    assert.equal(go().status, 2, 'a read that keeps failing is exit 2');
    stub([{ out: runs({ ...ok, conclusion: 'failure' }) }]);
    assert.equal(go().status, 1, 'a red required check is exit 1 at once');
    stub([{ out: runs({ ...ok, status: 'in_progress', conclusion: null }) }]);
    assert.notEqual(go().status, 0, 'a group that never finishes is never exit 0');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
