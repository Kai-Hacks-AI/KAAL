// Case release/T1277 tests: release/F81, release/A72
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C105-hold-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1277';
export const tests = ['release/F81', 'release/A72'];
export const title = 'judgeHeld says PASS when non_fast_forward is among the rules in force, FAIL when it is not, and UNKNOWN when the rules are not a list of rules; the command line exits 0, 1 and 2 and treats an unreadable file as UNKNOWN';
export async function run() {
  const SRC = join(RM, '05-src/history/judge-held.mjs');
  assert.ok(existsSync(SRC), 'judge-held.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-held.mjs')}\n`, 'judge-held.mjs differs from the draft');
  const { judgeHeld } = await import(pathToFileURL(SRC).href);
  assert.equal(judgeHeld({ rules: [{ type: 'required_status_checks' }, { type: 'non_fast_forward' }] }).verdict, 'PASS');
  assert.equal(judgeHeld({ rules: [{ type: 'required_status_checks' }, { type: 'deletion' }] }).verdict, 'FAIL');
  assert.equal(judgeHeld({ rules: [] }).verdict, 'FAIL', 'no rule in force is FAIL, not UNKNOWN');
  for (const bad of [undefined, null, 'x', {}, [null], [{}], [{ type: 5 }]]) assert.equal(judgeHeld({ rules: bad }).verdict, 'UNKNOWN', `${JSON.stringify(bad)} must be UNKNOWN`);
  const dir = mkdtempSync(join(tmpdir(), 'c105-'));
  try {
    const cli = (content) => { const f = join(dir, 'rules.json'); if (content !== undefined) writeFileSync(f, content); const r = spawnSync(process.execPath, [SRC, '--rules', f], { encoding: 'utf8' }); return [r.status, r.stdout.split(':')[0].trim()]; };
    assert.deepEqual(cli('[{"type":"non_fast_forward"}]'), [0, 'PASS']);
    assert.deepEqual(cli('[{"type":"deletion"}]'), [1, 'FAIL']);
    assert.deepEqual(cli('not json'), [2, 'UNKNOWN']);
    assert.deepEqual(cli('{"type":"non_fast_forward"}'), [2, 'UNKNOWN'], 'a rule that is not in a list is UNKNOWN');
    rmSync(join(dir, 'rules.json'));
    assert.deepEqual(cli(undefined), [2, 'UNKNOWN'], 'a missing file is UNKNOWN');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
