// Case controls/T1115 tests: controls/F35
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const script = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs');

export const id = 'controls/T1115';
export const tests = ['controls/F35'];
export const title = 'the command says UNKNOWN as JSON with exit 2 for every input it cannot judge, never a stack trace';
export async function run() {
  assert.ok(existsSync(script), 'scripts/judge-mode.mjs is absent');
  const dir = mkdtempSync(join(tmpdir(), 'jm-'));
  const ok = join(dir, 'ok.json'); writeFileSync(ok, '["a"]');
  const bad = join(dir, 'bad.json'); writeFileSync(bad, '{not json');
  const notlist = join(dir, 'notlist.json'); writeFileSync(notlist, '{"a":1}');
  const go = (args, mode = 'ratchet') => spawnSync(process.execPath, [script, ...(mode ? ['--mode', mode] : []), ...args], { encoding: 'utf8' });
  const cases = [
    ['a missing findings file', ['--findings', join(dir, 'nope.json'), '--baseline', ok, '--previous', ok], 'unreadable-input'],
    ['a missing previous file', ['--findings', ok, '--baseline', ok, '--previous', join(dir, 'nope.json')], 'unreadable-input'],
    ['a malformed findings file', ['--findings', bad, '--baseline', ok, '--previous', ok], 'malformed-input'],
    ['a malformed baseline file', ['--findings', ok, '--baseline', bad, '--previous', ok], 'malformed-input'],
    ['JSON that is not a list of names', ['--findings', ok, '--baseline', notlist, '--previous', ok], 'incompatible-reference'],
    ['no findings file', ['--baseline', ok, '--previous', ok], 'could-not-judge'],
    ['no previous file for a ratchet', ['--findings', ok, '--baseline', ok], 'no-reference'],
  ];
  for (const [what, args, reason] of cases) {
    const r = go(args);
    assert.equal(r.status, 2, what + ' did not exit 2 (exit ' + r.status + ')');
    let out; try { out = JSON.parse(r.stdout); } catch { assert.fail(what + ' did not print JSON'); }
    assert.deepEqual([out.verdict, out.blocked, out.reason], ['UNKNOWN', true, reason], what + ' was not UNKNOWN with ' + reason);
    assert.doesNotMatch(r.stderr, /at .*\(.*:\d+:\d+\)/, what + ' printed a stack trace');
  }
  for (const mode of [null, 'sometimes']) {
    const r = go(['--findings', ok], mode);
    assert.equal(r.status, 2, (mode ?? 'no mode') + ' did not exit 2');
    const out = JSON.parse(r.stdout);
    assert.deepEqual([out.verdict, out.blocked, out.reason], ['UNKNOWN', true, 'no-mode'], (mode ?? 'no mode') + ' was not UNKNOWN no-mode');
  }
}
