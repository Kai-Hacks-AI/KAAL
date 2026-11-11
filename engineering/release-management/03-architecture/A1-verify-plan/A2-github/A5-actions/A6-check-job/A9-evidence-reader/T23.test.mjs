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

  // The runner that Testing stands in for writes one row per Case and target, and the reader takes it as evidence.
  const scratch = mkdtempSync(join(tmpdir(), 'verify-plan-evidence-'));
  const caseFile = (name, id, body) => { const file = join(scratch, name); writeFileSync(file, `export const id = '${id}';\nexport const tests = ['release/I1', 'release/I2'];\nexport function run() { ${body} }\n`); return file; };
  const observed = caseFile('T1.red.mjs', 'release/T1', "throw Object.assign(new Error('the intended behaviour is absent'), { code: 'ERR_ASSERTION', operator: 'strictEqual' });");
  const stub = caseFile('T2.red.mjs', 'release/T2', "throw Object.assign(new Error('red'), { code: 'ERR_ASSERTION', operator: 'fail' });");
  const runner = join(dirname(fileURLToPath(import.meta.url)), '../../../../../../00-changes/C1-verify-plan/run-red.mjs');
  const out = join(scratch, 'evidence.json');
  spawnSync('node', [runner, '--evidence', out, observed, stub], { encoding: 'utf8' });
  const rows = readEvidence(readFileSync(out, 'utf8'));
  assert.deepEqual(rows.filter((r) => r.case === 'release/T1').map((r) => [r.target, r.result, r.reason]), [['release/I1', 'failed', 'assertion'], ['release/I2', 'failed', 'assertion']]);
  assert.deepEqual(rows.filter((r) => r.case === 'release/T2').map((r) => r.reason), ['unconditional', 'unconditional']);
});
