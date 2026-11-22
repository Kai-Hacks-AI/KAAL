// Case controls/T1108 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

export const id = 'controls/T1108';
export const tests = ['controls/F34'];
export const title = 'the same answer is used as each mode says: detective blocks nothing, preventive blocks, an answer that could not be given is unknown';
export async function run() {
  const found = ['x is missing', 'y is too much'];
  for (const [mode, verdict] of [['detective', 'REPORT']]) {
    const r = await judge({ mode, findings: found });
    assert.equal(r.verdict, verdict, mode + ' did not say ' + verdict);
    assert.equal(r.blocked, false, mode + ' blocked');
    assert.deepEqual(r.findings, found, mode + ' did not carry the findings');
    assert.deepEqual([await judge({ mode, findings: [] })].map((x) => [x.verdict, x.blocked]), [['PASS', false]], mode + ' with nothing found was not a pass');
  }
  const p = await judge({ mode: 'preventive', findings: found });
  assert.deepEqual([p.verdict, p.blocked], ['FAIL', true], 'preventive with findings did not block');
  assert.deepEqual([(await judge({ mode: 'preventive', findings: [] })).verdict, (await judge({ mode: 'preventive', findings: [] })).blocked], ['PASS', false], 'preventive with nothing found blocked');
  for (const [mode, blocked] of [['detective', false], ['preventive', true], ['ratchet', true]]) {
    const u = await judge({ mode, findings: null, baseline: [] });
    assert.equal(u.verdict, 'UNKNOWN', mode + ' with no answer passed');
    assert.equal(u.blocked, blocked, mode + ' with no answer had the wrong effect');
  }
  const odd = await judge({ mode: 'sometimes', findings: [] });
  assert.deepEqual([odd.verdict, odd.blocked], ['UNKNOWN', true], 'a mode outside the three was taken or did not block');
}
