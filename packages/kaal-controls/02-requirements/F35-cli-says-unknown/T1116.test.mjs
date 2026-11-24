// Case controls/T1116 tests: controls/F35
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const script = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs');

export const id = 'controls/T1116';
export const tests = ['controls/F35'];
export const title = 'on valid input the command prints the verdict as JSON and exits 0 when nothing is blocked and 1 when blocked, for each mode';
export async function run() {
  assert.ok(existsSync(script), 'scripts/judge-mode.mjs is absent');
  const dir = mkdtempSync(join(tmpdir(), 'jm-'));
  const w = (n, v) => { const p = join(dir, n); writeFileSync(p, JSON.stringify(v)); return p; };
  const none = w('none.json', []), one = w('one.json', ['a']), two = w('two.json', ['a', 'b']);
  const go = (args) => { const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' }); let out; try { out = JSON.parse(r.stdout); } catch { assert.fail('no JSON for ' + args.join(' ')); } return { status: r.status, out }; };
  const table = [
    ['detective, findings', ['--mode', 'detective', '--findings', one], 0, 'REPORT', false],
    ['detective, none', ['--mode', 'detective', '--findings', none], 0, 'PASS', false],
    ['preventive, findings', ['--mode', 'preventive', '--findings', one], 1, 'FAIL', true],
    ['preventive, none', ['--mode', 'preventive', '--findings', none], 0, 'PASS', false],
    ['ratchet, known only', ['--mode', 'ratchet', '--findings', one, '--baseline', one, '--previous', one], 0, 'PASS', false],
    ['ratchet, new finding', ['--mode', 'ratchet', '--findings', two, '--baseline', one, '--previous', one], 1, 'FAIL', true],
  ];
  for (const [what, args, status, verdict, blocked] of table) {
    const r = go(args);
    assert.equal(r.status, status, what + ' exited ' + r.status + ', not ' + status);
    assert.deepEqual([r.out.verdict, r.out.blocked], [verdict, blocked], what + ' gave the wrong verdict');
  }
}
