// Case controls/T1722 tests: controls/F223
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1722';
export const tests = ['controls/F223'];
export const title = 'the evidence collector counts per situation against what Release declares, says met only when every count is reached, renders a ledger with its disqualified runs, and waits for nothing';
const A = 'a'.repeat(40), MERGE = 'c'.repeat(40);
const line = (o) => `kaal-control ${JSON.stringify({ control: 'x/CTL1', x: 'real', run: '1', sha: A, verdict: 'PASS', by: 'job', ...o })}`;
export async function run() {
  const { collectEvidence, renderLedger } = await load('lib/collect-evidence.mjs');
  const situations = [{ name: 'agree', kind: 'A', required: 2 }, { name: 'na', kind: 'N', required: null }];
  const rev = (c) => c.repeat(40);
  const mkRun = (n, r, over = {}) => ({ run: String(n), situation: 'agree', judged: r, trigger: MERGE, lines: line({ sha: r }), old: { verdict: 'PASS', revision: r }, provoked: false, expect: null, ...over });
  let a = collectEvidence({ control: 'x/CTL1', situations, runs: [mkRun(1, rev('1'))] });
  assert.equal(a.met, false); assert.deepEqual(a.counts, { agree: 1 });
  a = collectEvidence({ control: 'x/CTL1', situations, runs: [mkRun(1, rev('1')), mkRun(2, rev('2')), mkRun(3, rev('3'), { lines: 'nothing' }), mkRun(4, rev('4'), { lines: line({ sha: MERGE }) })] });
  assert.equal(a.met, true); assert.equal(a.counts.agree, 2);
  assert.deepEqual(a.defects.map((d) => d.reason).sort(), ['no-record', 'recorded-is-trigger']);
  assert.deepEqual(a.disagreements, []);
  const d = collectEvidence({ control: 'x/CTL1', situations, runs: [mkRun(5, rev('5'), { old: { verdict: 'FAIL', revision: rev('5') } })] });
  assert.equal(d.disagreements.length, 1);
  const md = renderLedger({ title: 'x/CTL1', situations, rows: a.rows });
  for (const h of ['Count', 'Counted', 'Inspected and disqualified']) assert.ok(md.includes(h), `the ledger lacks ${h}`);
  assert.ok(md.includes('no-record') && md.includes('recorded-is-trigger'));
  const src = readFileSync(join(S, 'lib/collect-evidence.mjs'), 'utf8');
  for (const bad of ['setTimeout', 'setInterval', 'fetch(', 'sleep', 'poll', 'node:fs', 'node:child_process', 'process.env']) assert.ok(!src.includes(bad), `the collector contains ${bad}`);
  for (const s of specs(src)) assert.equal(s, './contract.mjs');
}
