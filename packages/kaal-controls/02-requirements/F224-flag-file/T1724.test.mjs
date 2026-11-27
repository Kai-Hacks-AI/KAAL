// Case controls/T1724 tests: controls/F224
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1724';
export const tests = ['controls/F224'];
export const title = 'an unknown flag is a configuration error found before execution and never off or on: validateFlags fails it, toBoundary refuses it, decideOutcome pins the pipeline outcome (a preventive configuration failure is red with no verdict, a detective one is a finding with exit 0, enforcement follows an explicit flag only), the valid flags reach the adapter unchanged, and a legacy caller that blocks without a flag is shown, with the file code naming no adopter, platform or path';
export async function run() {
  const { parseFlags, flagSource, validateFlags, decideOutcome } = await load('flags.mjs');
  const { toBoundary, judgeStamp } = await load('stamp.mjs');
  const { runControl } = await load('adapter.mjs');
  const e = (control, name, value) => ({ control, place: 'p', name, value });
  const src = flagSource(parseFlags(JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [
    e('x/CTL1', 'F1', 'preventing'), e('x/CTL2', 'F2', 'advisory'), e('x/CTL4', 'F4', 'stopped'), e('x/CTL5', 'F5', 'on'), e('x/CTL6', 'F6', 'maybe'), e('x/CTL8', 'F8', null), e('x/CTL9', 'F9', 'preventing')] })));
  assert.deepEqual(toBoundary('F1', 'preventing'), { name: 'F1', value: 'on' });
  assert.deepEqual(toBoundary('F2', 'advisory'), { name: 'F2', value: 'off' });
  assert.deepEqual(toBoundary('F5', 'on'), { name: 'F5', value: 'on' }, 'the legacy on is preventing');
  assert.deepEqual(toBoundary('F2', 'off'), { name: 'F2', value: 'off' }, 'the legacy off is advisory');
  assert.equal(toBoundary('F4', 'stopped'), null, 'stopped means the adopter does not run the control');
  for (const v of ['maybe', null, '', 'ON', undefined, 1]) assert.throws(() => toBoundary('F6', v), undefined, `an unknown value (${String(v)}) is a configuration error, not off`);
  assert.throws(() => toBoundary('', 'on'));
  assert.throws(() => toBoundary(undefined, 'on'));
  const controls = [{ id: 'x/CTL1', type: 'preventive', places: ['p'] }, { id: 'x/CTL3', type: 'preventive', places: ['p'] }, { id: 'x/CTL6', type: 'detective', places: ['p'] },
    { id: 'x/CTL8', type: 'preventive', places: ['p', 'q'] }, { id: 'x/CTL7', type: 'directive', places: ['p'] }];
  const bad = validateFlags({ controls, source: src });
  assert.deepEqual(bad, { ok: false, errors: ['preventive-without-flag:x/CTL3@p', 'preventive-without-flag:x/CTL8@p', 'preventive-without-flag:x/CTL8@q', 'unrecognized-flag:x/CTL6@p'] }, 'a missing, unrecognized or unset flag fails validation, loudly as preventive-without-flag for a preventive control; orphans and directives do not');
  assert.deepEqual(validateFlags({ controls: [controls[0]], source: src }), { ok: true, errors: [] });
  assert.throws(() => validateFlags({ controls: [{ id: 'x/CTL1', type: 'preventive' }], source: src }));
  assert.throws(() => validateFlags({ controls, source: null }));
  const run = (c, flag) => runControl({ id: c, mode: 'preventive', check: () => ['a'], boundary: { x: 'real', run: '1', sha: 'tree:a', ...(flag === undefined ? {} : { flag }) } });
  const on = await run('x/CTL1', toBoundary('F1', 'preventing')), off = await run('x/CTL2', toBoundary('F2', 'advisory'));
  assert.deepEqual([on.mode, on.applied, on.verdict, on.blocked], ['preventive', true, 'FAIL', true]);
  assert.deepEqual([off.mode, off.applied, off.blocked], ['off', false, false]);
  // a legacy caller passes no flag at all: the adapter still runs it as asked, and the report cannot be fooled
  const legacy = await run('x/CTL7');
  assert.deepEqual([legacy.mode, legacy.applied, legacy.blocked], ['preventive', null, true]);
  const asRun = (r) => ({ run: r.record.run, verdict: r.verdict, applied: r.record.applied, blocked: r.blocked });
  const j = judgeStamp({ declared: 'UNKNOWN', runs: [asRun(legacy)] });
  assert.deepEqual([j.declared, j.stamp, j.blocked, j.reasons], [null, null, true, ['blocked-without-flag', 'config-error']], 'unknown is not Mute, and what blocked is shown');
  // the pipeline outcome: a configuration failure is a CI failure and never control enforcement, and enforcement follows an explicit flag only
  const one = (c) => validateFlags({ controls: [c], source: src });
  const file = { id: 'x/CTL3', type: 'preventive', places: ['p'] };
  const pv = decideOutcome({ validation: one(file), runs: [] });
  assert.deepEqual(pv, { outcome: 'CONFIG_FAILED', enforcement: 'none', exit: 1, reasons: ['preventive-without-flag:x/CTL3@p'] }, 'a preventive control without a flag: red, merge stops, no verdict');
  const pu = decideOutcome({ validation: one({ id: 'x/CTL6', type: 'preventive', places: ['p'] }), runs: [] });
  assert.deepEqual([pu.outcome, pu.exit, pu.reasons], ['CONFIG_FAILED', 1, ['preventive-without-flag:x/CTL6@p']], 'an invalid value on a preventive control is the same');
  const dm = decideOutcome({ validation: one({ id: 'x/CTL3', type: 'detective', places: ['p'] }), runs: [] });
  assert.deepEqual(dm, { outcome: 'CONFIG_FAILED', enforcement: 'none', exit: 0, reasons: ['no-flag:x/CTL3@p'] }, 'a detective control without a flag: a finding, job green');
  const du = decideOutcome({ validation: one({ id: 'x/CTL6', type: 'detective', places: ['p'] }), runs: [] });
  assert.deepEqual([du.outcome, du.enforcement, du.exit, du.reasons], ['CONFIG_FAILED', 'none', 0, ['unrecognized-flag:x/CTL6@p']]);
  const missingFile = validateFlags({ controls: [file, { id: 'x/CTL3', type: 'detective', places: ['q'] }], source: flagSource([]) });
  assert.deepEqual(decideOutcome({ validation: missingFile, runs: [] }).reasons, ['no-flag:x/CTL3@q', 'preventive-without-flag:x/CTL3@p'], 'a missing file is every entry missing');
  assert.equal(decideOutcome({ validation: missingFile, runs: [] }).exit, 1);
  assert.throws(() => decideOutcome({ validation: bad, runs: [{ control: 'x/CTL1', place: 'p', applied: true, blocked: true }] }), undefined, 'nothing runs after a failed validation');
  const ok = validateFlags({ controls: [controls[0]], source: src });
  const lr = (r, c) => ({ control: c, place: 'p', applied: r.record.applied, blocked: r.blocked });
  assert.deepEqual(decideOutcome({ validation: ok, runs: [lr(on, 'x/CTL1')] }), { outcome: 'BLOCKED', enforcement: 'authorized', exit: 1, reasons: ['blocked:x/CTL1@p'] }, 'an explicit preventing flag enforces by verdict');
  assert.deepEqual(decideOutcome({ validation: ok, runs: [lr(off, 'x/CTL2')] }), { outcome: 'PASSED', enforcement: 'none', exit: 0, reasons: [] }, 'an advisory finding does not stop');
  assert.deepEqual(decideOutcome({ runs: [lr(legacy, 'x/CTL7')] }), { outcome: 'BLOCKED', enforcement: 'legacy', exit: 1, reasons: ['blocked-without-flag:x/CTL7@p'] }, 'a legacy caller with no boundary.flag runs as asked and is shown');
  assert.deepEqual(decideOutcome({ runs: [] }), { outcome: 'PASSED', enforcement: 'none', exit: 0, reasons: [] });
  assert.throws(() => decideOutcome({ runs: 'x' }));
  assert.throws(() => decideOutcome({ validation: { ok: 'yes' }, runs: [] }));
  const text = readFileSync(join(S, 'flags.mjs'), 'utf8') + readFileSync(join(S, 'stamp.mjs'), 'utf8');
  for (const bad2 of ['node:fs', 'node:child_process', 'process.env', 'github', 'GitHub', 'engineering/', 'KAAL_', 'fetch(']) assert.ok(!text.includes(bad2), `the flag code contains ${bad2}`);
}
