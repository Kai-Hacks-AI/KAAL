// Case release/T23 tests: release/A9
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { judge } from '../../../../../../05-src/plan/judge.mjs';
import { readEvidence } from '../../../../../../05-src/plan/evidence.mjs';
export const id = 'release/T23';
export const tests = ['release/A9'];
export const title = 'the evidence reader reports a meaningful observed RED from current evidence, rejects an unconditional failure as proof, and reports missing evidence as UNKNOWN';
const plan = {
  intents: [{ id: 'release/I1' }],
  cases: [{ id: 'release/T1', found: 'release/I1', tests: ['release/I1'] }],
};
const row = (over) => ({ case: 'release/T1', target: 'release/I1', result: 'failed', reason: 'assertion', ...over });
test(`${id} ${title}`, async () => {
  const red = await judge({ ...plan, evidence: readEvidence(JSON.stringify([row({})])) });
  assert.equal(red.verdict, 'PASS');

  const unconditional = await judge({ ...plan, evidence: readEvidence(JSON.stringify([row({ reason: 'unconditional' })])) });
  assert.equal(unconditional.verdict, 'FAIL');
  assert.ok(unconditional.findings.some((f) => f.rule === 'F1/6'));

  for (const missing of [undefined, '', 'not json', '{}', '[1]']) {
    const result = await judge({ ...plan, evidence: readEvidence(missing) });
    assert.equal(result.verdict, 'UNKNOWN', `evidence ${JSON.stringify(missing)}`);
    assert.ok(result.findings.some((f) => f.rule === 'F1/6' && f.status === 'unknown'));
  }

  // The runner that Testing stands in for records what one execution shows. A failure is attributed to a target only when the Case names it or declares just one.
  const scratch = mkdtempSync(join(tmpdir(), 'verify-plan-evidence-'));
  const caseFile = (name, id, body, targets = "['release/I1', 'release/I2']") => { const file = join(scratch, name); writeFileSync(file, `export const id = '${id}';\nexport const tests = ${targets};\nexport function run() { ${body} }\n`); return file; };
  const fail = (extra = '', operator = 'strictEqual') => `throw Object.assign(new Error('the intended behaviour is absent'), { code: 'ERR_ASSERTION', operator: '${operator}'${extra} });`;
  const unnamed = caseFile('T1.red.mjs', 'release/T1', fail());
  const named = caseFile('T2.red.mjs', 'release/T2', fail(", target: 'release/I2'"));
  const single = caseFile('T3.red.mjs', 'release/T3', fail(), "['release/I1']");
  const stub = caseFile('T4.red.mjs', 'release/T4', fail('', 'fail'), "['release/I1']");
  const green = caseFile('T5.red.mjs', 'release/T5', '');
  const runner = join(dirname(fileURLToPath(import.meta.url)), '../../../../../../00-changes/C1-verify-plan/run-red.mjs');
  const out = join(scratch, 'evidence.json');
  spawnSync('node', [runner, '--evidence', out, unnamed, named, single, stub, green], { encoding: 'utf8' });
  const rows = readEvidence(readFileSync(out, 'utf8'));
  const of = (c) => rows.filter((r) => r.case === c).map((r) => [r.target, r.result, r.reason]);
  assert.deepEqual(of('release/T1'), [[undefined, 'failed', 'assertion']], 'a multi-target failure that names no target invents no per-target evidence');
  assert.deepEqual(of('release/T2'), [['release/I2', 'failed', 'assertion']], 'a failure that names its target is attributed to that target only');
  assert.deepEqual(of('release/T3'), [['release/I1', 'failed', 'assertion']]);
  assert.deepEqual(of('release/T4'), [['release/I1', 'failed', 'unconditional']]);
  assert.deepEqual(of('release/T5'), [['release/I1', 'passed', undefined], ['release/I2', 'passed', undefined]]);
  // The judge cannot take the unattributed row as observed RED for any target.
  const twoTargets = { intents: [{ id: 'release/I1' }, { id: 'release/I2' }], cases: [{ id: 'release/T1', found: 'release/I1', tests: ['release/I1', 'release/I2'] }] };
  const unattributed = await judge({ ...twoTargets, evidence: rows.filter((r) => r.case === 'release/T1') });
  assert.ok(unattributed.findings.some((f) => f.rule === 'F1/6' && f.status === 'fail'));
  // The C1 baseline stand-in accepts every plan. It is opt-in, so a Case of any other capability never fails against it and qualifies as RED.
  const usesJudge = join(scratch, 'T6.red.mjs');
  writeFileSync(usesJudge, "export const id = 'release/T6';\nexport const tests = ['release/I1'];\nexport async function run({ judge }) { const result = await judge({}); if (result.verdict !== 'FAIL') throw Object.assign(new Error('accepted by the stand-in'), { code: 'ERR_ASSERTION', operator: 'strictEqual' }); }\n");
  const reasonsOf = (flags) => { const file = join(scratch, `ev-${flags.length}.json`); spawnSync('node', [runner, ...flags, '--evidence', file, usesJudge], { encoding: 'utf8' }); return readEvidence(readFileSync(file, 'utf8')).map((r) => r.reason); };
  assert.deepEqual(reasonsOf([]), ['error'], 'no stand-in is passed to a Case unless asked for');
  assert.deepEqual(reasonsOf(['--baseline']), ['assertion'], 'the C1 baseline is opt-in');
});
