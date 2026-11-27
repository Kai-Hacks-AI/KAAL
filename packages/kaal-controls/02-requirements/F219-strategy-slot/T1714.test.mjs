// Case controls/T1714 tests: controls/F219
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1714';
export const tests = ['controls/F219'];
export const title = 'the controls library judges detective and preventive and hands a named strategy the findings: an invalid answer, an unknown name, a strategy on another mode and mode ratchet are UNKNOWN, blocked, and the library imports no strategy';
export async function run() {
  const { judgeMode } = await load('lib/judge-mode.mjs');
  const seen = [];
  const good = { judge: (i) => { seen.push(i); return { mode: 'preventive', verdict: 'PASS', blocked: false, note: 'mine' }; } };
  const bad = { judge: () => ({ verdict: 'MAYBE' }) };
  const strategies = { good, bad };
  const q = (r) => [r.verdict, r.blocked, r.reason];
  let r = judgeMode({ mode: 'preventive', findings: ['a'], strategy: 'good', strategies, baseline: ['a'], previous: ['a'] });
  assert.equal(r.verdict, 'PASS'); assert.equal(r.note, 'mine');
  assert.deepEqual(seen[0], { findings: ['a'], baseline: ['a'], previous: ['a'] });
  assert.deepEqual(q(judgeMode({ mode: 'preventive', findings: ['a'], strategy: 'bad', strategies })), ['UNKNOWN', true, 'strategy-invalid']);
  assert.deepEqual(q(judgeMode({ mode: 'preventive', findings: ['a'], strategy: 'nope', strategies })), ['UNKNOWN', true, 'no-strategy']);
  assert.deepEqual(q(judgeMode({ mode: 'preventive', findings: ['a'], strategy: 'good' })), ['UNKNOWN', true, 'no-strategy']);
  assert.deepEqual(q(judgeMode({ mode: 'detective', findings: ['a'], strategy: 'good', strategies })), ['UNKNOWN', true, 'strategy-not-preventive']);
  assert.deepEqual(q(judgeMode({ mode: 'ratchet', findings: ['a'], strategies })), ['UNKNOWN', true, 'no-mode']);
  assert.equal(judgeMode({ mode: 'preventive', findings: ['a'] }).verdict, 'FAIL');
  assert.equal(judgeMode({ mode: 'preventive', findings: [] }).verdict, 'PASS');
  assert.equal(judgeMode({ mode: 'detective', findings: ['a'] }).verdict, 'REPORT');
  assert.equal(judgeMode({ mode: 'preventive', findings: null }).verdict, 'UNKNOWN');
  for (const s of specs(readFileSync(join(S, 'lib/judge-mode.mjs'), 'utf8'))) assert.ok(!/ratchet/.test(s), `the controls library imports ${s}`);
}
