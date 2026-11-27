// Case controls/T1720 tests: controls/F222
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1720';
export const tests = ['controls/F222'];
export const title = 'the ratchet that ratchets must use the library runs as controls/CTL6: a confirmed own ratchet is held by the baseline, unknown is UNKNOWN and blocked, an empty baseline ends then preventive, and CTL6 is declared detective';
const R = 'tree:aaa';
export async function run() {
  const { runRatchetUseRatchet } = await load('ratchet-use-ratchet.mjs');
  const boundary = { run: '9', sha: R, x: 'real' };
  const o = (control, usesRatchetLibrary) => ({ control, identity: R, usesRatchetLibrary });
  const base = { ratchets: ['x/CTL1', 'x/CTL2'], identity: R, boundary };
  let r = await runRatchetUseRatchet({ ...base, observed: [o('x/CTL1', false), o('x/CTL2', true)], baseline: ['own-ratchet:x/CTL1'], previous: ['own-ratchet:x/CTL1'] });
  assert.equal(r.verdict, 'PASS');
  assert.equal(r.record.control, 'controls/CTL6');
  r = await runRatchetUseRatchet({ ...base, observed: [o('x/CTL1', false), o('x/CTL2', false)], baseline: ['own-ratchet:x/CTL1'], previous: ['own-ratchet:x/CTL1'] });
  assert.equal(r.verdict, 'FAIL'); assert.equal(r.blocked, true);
  r = await runRatchetUseRatchet({ ...base, observed: [o('x/CTL1', true)], baseline: [], previous: [] });
  assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, true);
  r = await runRatchetUseRatchet({ ...base, observed: [o('x/CTL1', true), o('x/CTL2', true)], baseline: [], previous: [] });
  assert.equal(r.verdict, 'PASS'); assert.equal(r.then, 'preventive');
  r = await runRatchetUseRatchet({ ...base, identity: '  ', observed: [o('x/CTL1', true), o('x/CTL2', true)], baseline: [], previous: [] });
  assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.blocked, true);
  const dir = join(repo, 'packages/kaal-controls/14-operations/controls/CTL6-verify-ratchet-use');
  assert.ok(existsSync(join(dir, 'CTL6.md')), 'CTL6 is absent');
  const t = readFileSync(join(dir, 'CTL6.md'), 'utf8');
  assert.match(t, /^id: controls\/CTL6$/m); assert.match(t, /^type: detective$/m); assert.match(t, /^status: designed$/m);
}
