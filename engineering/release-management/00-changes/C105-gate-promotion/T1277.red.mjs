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
const draft = (name) => readFileSync(join(RM, '00-changes/C105-gate-promotion/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1277';
export const tests = ['release/F81', 'release/A72'];
export const title = 'judgeGate says PASS when every declared rule and required check is in force with its declared settings, whatever else is in force, FAIL naming each declared rule, check or setting that is not, and UNKNOWN when a list is not a list of rules or the station declares nothing; the command line exits 0, 1 and 2 and treats an unreadable file as UNKNOWN';
export async function run() {
  const SRC = join(RM, '05-src/history/judge-held.mjs');
  assert.ok(existsSync(SRC), 'judge-held.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-held.mjs')}\n`, 'judge-held.mjs differs from the draft');
  const { judgeGate } = await import(pathToFileURL(SRC).href);
  // the declaration as stages.json holds it, and the rules in force as GitHub lists them
  const declared = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')).stages.find((s) => s.name === 'Promoting').rules;
  const status = { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, do_not_enforce_on_create: false, required_status_checks: declared.find((r) => r.type === 'required_status_checks').checks.map((c) => ({ context: c.name, integration_id: c.integration_id })) } };
  const live = [status, { type: 'non_fast_forward' }];
  assert.equal(judgeGate({ declared, live }).verdict, 'PASS', 'the real declaration is not held by its own mirror');
  assert.equal(judgeGate({ declared, live: [...live, { type: 'deletion' }, { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, do_not_enforce_on_create: true, required_status_checks: [{ context: 'other', integration_id: 1 }] } }] }).verdict, 'PASS', 'a rule in force that is not declared is no finding');
  const fail = (liveRules, what) => { const r = judgeGate({ declared, live: liveRules }); assert.equal(r.verdict, 'FAIL', `${what} must FAIL`); assert.ok(r.missing.some((m) => m.includes(what)), `${what} is not named`); };
  fail([status], 'non_fast_forward');
  fail([status, { type: 'deletion' }], 'non_fast_forward');
  fail([{ type: 'non_fast_forward' }], 'required_status_checks');
  fail([{ ...status, parameters: { ...status.parameters, required_status_checks: status.parameters.required_status_checks.slice(1) } }, { type: 'non_fast_forward' }], 'verify Stages (Promoting)');
  fail([{ ...status, parameters: { ...status.parameters, do_not_enforce_on_create: true } }, { type: 'non_fast_forward' }], 'required_status_checks');
  assert.equal(judgeGate({ declared, live: [] }).verdict, 'FAIL', 'nothing in force is FAIL, not UNKNOWN');
  for (const bad of [undefined, null, 'x', {}, [null], [{}], [{ type: 5 }]]) { assert.equal(judgeGate({ declared, live: bad }).verdict, 'UNKNOWN', `live ${JSON.stringify(bad)} must be UNKNOWN`); assert.equal(judgeGate({ declared: bad, live }).verdict, 'UNKNOWN', `declared ${JSON.stringify(bad)} must be UNKNOWN`); }
  assert.equal(judgeGate({ declared: [], live }).verdict, 'UNKNOWN', 'a station that declares nothing must not pass');
  const dir = mkdtempSync(join(tmpdir(), 'c105-'));
  try {
    const cli = (d, l) => { const fd = join(dir, 'declared.json'), fl = join(dir, 'live.json'); if (d !== undefined) writeFileSync(fd, d); if (l !== undefined) writeFileSync(fl, l); const r = spawnSync(process.execPath, [SRC, '--declared', fd, '--live', fl], { encoding: 'utf8' }); return [r.status, r.stdout.split(':')[0].trim()]; };
    assert.deepEqual(cli(JSON.stringify(declared), JSON.stringify(live)), [0, 'PASS']);
    assert.deepEqual(cli(JSON.stringify(declared), JSON.stringify([status])), [1, 'FAIL']);
    assert.deepEqual(cli(JSON.stringify(declared), 'not json'), [2, 'UNKNOWN']);
    assert.deepEqual(cli(JSON.stringify(declared), '{"type":"non_fast_forward"}'), [2, 'UNKNOWN'], 'a rule that is not in a list is UNKNOWN');
    rmSync(join(dir, 'live.json'));
    assert.deepEqual(cli(JSON.stringify(declared), undefined), [2, 'UNKNOWN'], 'a missing file is UNKNOWN');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
