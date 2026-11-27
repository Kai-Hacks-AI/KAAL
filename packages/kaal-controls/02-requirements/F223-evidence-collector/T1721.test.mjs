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
export const title = 'the evidence collector reads kaal-control lines and classifies each run in rule order: counted as agreement or provoked, not counted as valid-only, and disqualified with a reason for every defect';
const A = 'a'.repeat(40), B = 'b'.repeat(40), MERGE = 'c'.repeat(40);
const line = (o) => `kaal-control ${JSON.stringify({ control: 'x/CTL1', x: 'real', run: '1', sha: A, verdict: 'PASS', by: 'job', ...o })}`;
export async function run() {
  const { parseControlLines, collectEvidence } = await load('lib/collect-evidence.mjs');
  const parsed = parseControlLines(`noise\n${line({})}\nkaal-control {broken\n${line({ verdict: 'FAIL' })}\n`);
  assert.equal(parsed.length, 2); assert.equal(parsed[0].verdict, 'PASS'); assert.equal(parsed[1].verdict, 'FAIL');
  assert.deepEqual(parseControlLines(''), []);
  const situations = [{ name: 'agree', kind: 'A', required: 5 }, { name: 'break', kind: 'P', required: 3 }, { name: 'na', kind: 'N', required: null }];
  const base = { situation: 'agree', judged: A, trigger: MERGE, lines: line({}), old: { verdict: 'PASS', revision: A }, provoked: false, expect: null };
  const row = (over) => { const a = collectEvidence({ control: 'x/CTL1', situations, runs: [{ run: '1', ...base, ...over }] }); return a.rows[0]; };
  assert.deepEqual([row({}).kind, row({}).reason], ['A', 'agrees']);
  assert.equal(row({ old: { verdict: 'FAIL', revision: A } }).kind, null);
  assert.equal(row({ old: { verdict: 'FAIL', revision: A } }).reason, 'disagrees');
  assert.deepEqual([row({ old: null }).kind, row({ old: null }).reason], ['V', 'old-not-run-on-revision']);
  assert.deepEqual([row({ old: { verdict: 'PASS', revision: B } }).kind, row({ old: { verdict: 'PASS', revision: B } }).reason], ['V', 'old-not-run-on-revision']);
  assert.equal(row({ situation: 'break', provoked: true, expect: 'FAIL', lines: line({ verdict: 'FAIL' }), old: null }).kind, 'P');
  assert.equal(row({ situation: 'break', provoked: true, expect: 'FAIL', lines: line({ verdict: 'PASS' }), old: null }).reason, 'provoked-not-expected');
  assert.equal(row({ situation: 'na' }).reason, 'not-required');
  assert.equal(row({ situation: 'zz' }).reason, 'unknown-situation');
  assert.equal(row({ judged: 'abc' }).reason, 'judged-not-a-revision');
  assert.equal(row({ lines: 'nothing' }).reason, 'no-record');
  assert.equal(row({ lines: `${line({})}\n${line({ verdict: 'FAIL' })}` }).reason, 'contradictory-records');
  assert.equal(row({ lines: line({ sha: 'r1' }) }).reason, 'recorded-not-a-revision');
  assert.equal(row({ lines: line({ sha: MERGE }) }).reason, 'recorded-is-trigger');
  assert.equal(row({ lines: line({ sha: B }) }).reason, 'recorded-not-judged');
  for (const r of ['unknown-situation', 'judged-not-a-revision', 'no-record']) assert.equal(row(r === 'no-record' ? { lines: 'x' } : r === 'judged-not-a-revision' ? { judged: 'abc' } : { situation: 'zz' }).kind, null);
  // the verdict comes from the record line, not from the job
  assert.equal(row({ lines: line({ verdict: 'FAIL' }), old: { verdict: 'FAIL', revision: A } }).verdict, 'FAIL');
  // one revision counts once per control and situation
  const a = collectEvidence({ control: 'x/CTL1', situations, runs: [{ run: '1', ...base }, { run: '2', ...base }] });
  assert.deepEqual(a.rows.map((r) => [r.kind, r.reason]), [['A', 'agrees'], [null, 'duplicate']]);
}
