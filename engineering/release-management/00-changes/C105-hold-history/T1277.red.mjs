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
export const title = 'judgeHeld says PASS when every entry the station declares for the control is in force with its declared settings and checks, whatever else is in force or declared for other controls, FAIL naming each entry that is not, and UNKNOWN when a list is not a list of rules, the station declares nothing for the control or no control is given; the command line exits 0, 1 and 2 and treats an unreadable file as UNKNOWN';
export async function run() {
  const SRC = join(RM, '05-src/history/judge-held.mjs');
  assert.ok(existsSync(SRC), 'judge-held.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-held.mjs')}\n`, 'judge-held.mjs differs from the draft');
  const { judgeHeld } = await import(pathToFileURL(SRC).href);
  const CTL = 'release/CTL25';
  // the declaration as stages.json holds it, and the rules in force as GitHub lists them
  const declared = JSON.parse(readFileSync(join(RM, '05-src/stages/stages.json'), 'utf8')).stages.find((s) => s.name === 'Promoting').rules;
  const status = { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, do_not_enforce_on_create: false, required_status_checks: declared.find((r) => r.type === 'required_status_checks').checks.map((c) => ({ context: c.name, integration_id: c.integration_id })) } };
  assert.ok(declared.some((d) => d.control === CTL && d.type === 'non_fast_forward'), 'the station declares no entry for hold History');
  const held = (live, control = CTL) => judgeHeld({ declared, live, control });
  assert.equal(held([{ type: 'non_fast_forward' }]).verdict, 'PASS');
  assert.equal(held([status, { type: 'non_fast_forward' }, { type: 'deletion' }]).verdict, 'PASS', 'a rule in force that is not declared is no finding');
  assert.equal(held([{ type: 'non_fast_forward' }, { type: 'required_status_checks', parameters: { do_not_enforce_on_create: true } }]).verdict, 'PASS', 'an entry of another control is not its business');
  const fail = (live, what) => { const r = held(live); assert.equal(r.verdict, 'FAIL', `${what} must FAIL`); assert.ok(r.missing.some((m) => m.includes(what)), `${what} is not named`); };
  fail([status], 'non_fast_forward');
  fail([status, { type: 'deletion' }], 'non_fast_forward');
  fail([], 'non_fast_forward');
  // an entry with settings and checks is held to them (the judge serves any control implemented as a rule): here the status-check entry of its own control
  const own = declared.find((d) => d.type === 'required_status_checks').control;
  assert.equal(held([status], own).verdict, 'PASS');
  assert.equal(held([{ ...status, parameters: { ...status.parameters, required_status_checks: status.parameters.required_status_checks.slice(1) } }], own).verdict, 'FAIL', 'a missing declared check must FAIL');
  assert.equal(held([{ ...status, parameters: { ...status.parameters, do_not_enforce_on_create: true } }], own).verdict, 'FAIL', 'a changed setting must FAIL');
  for (const bad of [undefined, null, 'x', {}, [null], [{}], [{ type: 5 }]]) { assert.equal(held(bad).verdict, 'UNKNOWN', `live ${JSON.stringify(bad)} must be UNKNOWN`); assert.equal(judgeHeld({ declared: bad, live: [{ type: 'non_fast_forward' }], control: CTL }).verdict, 'UNKNOWN', `declared ${JSON.stringify(bad)} must be UNKNOWN`); }
  assert.equal(held([{ type: 'non_fast_forward' }], 'release/CTL99').verdict, 'UNKNOWN', 'a control the station declares nothing for must not pass');
  assert.equal(judgeHeld({ declared, live: [{ type: 'non_fast_forward' }] }).verdict, 'UNKNOWN', 'no control must not pass');
  const dir = mkdtempSync(join(tmpdir(), 'c105-'));
  try {
    const cli = (l, control = CTL) => { const fd = join(dir, 'declared.json'), fl = join(dir, 'live.json'); writeFileSync(fd, JSON.stringify(declared)); if (l !== undefined) writeFileSync(fl, l); const r = spawnSync(process.execPath, [SRC, '--declared', fd, '--live', fl, '--control', control], { encoding: 'utf8' }); return [r.status, r.stdout.split(':')[0].trim()]; };
    assert.deepEqual(cli('[{"type":"non_fast_forward"}]'), [0, 'PASS']);
    assert.deepEqual(cli('[{"type":"deletion"}]'), [1, 'FAIL']);
    assert.deepEqual(cli('not json'), [2, 'UNKNOWN']);
    assert.deepEqual(cli('{"type":"non_fast_forward"}'), [2, 'UNKNOWN'], 'a rule that is not in a list is UNKNOWN');
    assert.deepEqual(cli('[{"type":"non_fast_forward"}]', 'release/CTL99'), [2, 'UNKNOWN']);
    rmSync(join(dir, 'live.json'));
    assert.deepEqual(cli(undefined), [2, 'UNKNOWN'], 'a missing file is UNKNOWN');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
