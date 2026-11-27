// Case controls/T1715 tests: controls/F219
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1715';
export const tests = ['controls/F219'];
export const title = 'runControl in the controls library runs the fixed steps with a handed-in strategy, and the public adapter still accepts mode ratchet with the same answers as the old path';
export async function run() {
  const lib = await load('lib/run-control.mjs');
  const pub = await load('adapter.mjs');
  const boundary = { run: '7', sha: 'a'.repeat(40), x: 'real' };
  const check = () => ['a'];
  const strategies = { ratchet: { judge: ({ findings }) => ({ mode: 'preventive', verdict: findings.length ? 'FAIL' : 'PASS', blocked: findings.length > 0 }) } };
  let r = await lib.runControl({ id: 'x/CTL1', mode: 'preventive', strategy: 'ratchet', strategies, check, boundary });
  assert.equal(r.verdict, 'FAIL'); assert.equal(r.blocked, true);
  r = await lib.runControl({ id: 'x/CTL1', mode: 'ratchet', check, baseline: ['a'], previous: ['a'], boundary });
  assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, true);
  for (const [baseline, previous, verdict] of [[['a'], ['a'], 'PASS'], [[], [], 'FAIL']]) {
    r = await pub.runControl({ id: 'x/CTL1', mode: 'ratchet', check, baseline, previous, boundary });
    assert.equal(r.verdict, verdict);
  }
  r = await pub.runControl({ id: 'x/CTL1', mode: 'preventive', check, boundary });
  assert.equal(r.verdict, 'FAIL');
}
