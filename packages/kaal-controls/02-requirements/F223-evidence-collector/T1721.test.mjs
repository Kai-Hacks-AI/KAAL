// Case controls/T1721 tests: controls/F223
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1721';
export const tests = ['controls/F223'];
export const title = 'the evidence collector reads kaal-control lines and classifies each run in rule order: counted as agreement or provoked, not counted as valid-only, and disqualified with a reason for every defect, UNKNOWN never counting';
const A = 'tree:aaa', B = 'tree:bbb', MERGE = 'tree:merge';
const line = (o) => `kaal-control ${JSON.stringify({ control: 'x/CTL1', x: 'real', run: '1', sha: A, verdict: 'PASS', by: 'job', ...o })}`;
export async function run() {
  const { parseControlLines, collectEvidence } = await load('lib/collect-evidence.mjs');
  const parsed = parseControlLines(`noise\n${line({})}\nkaal-control {broken\n${line({ verdict: 'FAIL' })}\n`);
  assert.equal(parsed.length, 2); assert.equal(parsed[0].verdict, 'PASS'); assert.equal(parsed[1].verdict, 'FAIL');
  assert.deepEqual(parseControlLines(''), []);
  const situations = [{ name: 'agree', kind: 'A', required: 5 }, { name: 'break', kind: 'P', required: 3 }, { name: 'na', kind: 'N', required: null }];
  const base = { situation: 'agree', examined: A, lines: line({}), old: { conclusion: 'success', identity: A }, provoked: false, expect: null };
  const row = (over) => collectEvidence({ control: 'x/CTL1', situations, runs: [{ run: '1', ...base, ...over }] }).rows[0];
  const rr = (over) => [row(over).kind, row(over).reason];
  assert.deepEqual(rr({}), ['A', 'agrees']);
  // the old conclusion maps: success is PASS, failure is REPORT or FAIL
  assert.deepEqual(rr({ lines: line({ verdict: 'REPORT' }), old: { conclusion: 'failure', identity: A } }), ['A', 'agrees']);
  assert.deepEqual(rr({ lines: line({ verdict: 'FAIL' }), old: { conclusion: 'failure', identity: A } }), ['A', 'agrees']);
  assert.deepEqual(rr({ old: { conclusion: 'failure', identity: A } }), [null, 'disagrees']);
  assert.deepEqual(rr({ lines: line({ verdict: 'REPORT' }) }), [null, 'disagrees']);
  assert.deepEqual(rr({ old: null }), ['V', 'old-not-run-on-identity']);
  assert.deepEqual(rr({ old: { conclusion: 'success', identity: B } }), ['V', 'old-not-run-on-identity']);
  assert.deepEqual(rr({ situation: 'break', provoked: true, expect: 'FAIL', lines: line({ verdict: 'FAIL' }), old: null }), ['P', 'provoked-as-expected']);
  assert.deepEqual(rr({ situation: 'break', provoked: true, expect: 'FAIL', lines: line({ verdict: 'PASS' }), old: null }), [null, 'provoked-not-expected']);
  // UNKNOWN is never counted: not an A, not a P, not an agreement of two unknowns
  assert.deepEqual(rr({ lines: line({ verdict: 'UNKNOWN' }), old: { conclusion: 'failure', identity: A } }), [null, 'unknown-verdict']);
  assert.deepEqual(rr({ lines: line({ verdict: 'UNKNOWN' }), old: { conclusion: 'unknown', identity: A } }), [null, 'unknown-verdict']);
  assert.deepEqual(rr({ situation: 'break', provoked: true, expect: 'UNKNOWN', lines: line({ verdict: 'UNKNOWN' }), old: null }), [null, 'unknown-verdict']);
  assert.deepEqual(rr({ lines: line({ verdict: 'MAYBE' }) }), [null, 'unknown-verdict']);
  assert.deepEqual(rr({ situation: 'na' }), [null, 'not-required']);
  assert.deepEqual(rr({ situation: 'zz' }), [null, 'unknown-situation']);
  assert.deepEqual(rr({ examined: '  ' }), [null, 'examined-identity-missing']);
  assert.deepEqual(rr({ lines: 'nothing' }), [null, 'no-record']);
  assert.deepEqual(rr({ lines: `${line({})}\n${line({ verdict: 'FAIL' })}` }), [null, 'contradictory-records']);
  assert.deepEqual(rr({ lines: line({ sha: '' }) }), [null, 'recorded-identity-missing']);
  assert.deepEqual(rr({ lines: line({ sha: MERGE }) }), [null, 'recorded-not-examined']);
  assert.deepEqual(rr({ lines: line({ sha: 'TREE:AAA' }) }), [null, 'recorded-not-examined']);
  // the verdict comes from the record line, not from the job
  assert.equal(row({ lines: line({ verdict: 'FAIL' }), old: { conclusion: 'failure', identity: A } }).verdict, 'FAIL');
  // one identity counts once per control and situation
  const a = collectEvidence({ control: 'x/CTL1', situations, runs: [{ run: '1', ...base }, { run: '2', ...base }] });
  assert.deepEqual(a.rows.map((r) => [r.kind, r.reason]), [['A', 'agrees'], [null, 'duplicate']]);
}
