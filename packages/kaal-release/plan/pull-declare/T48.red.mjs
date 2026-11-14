// Case pull/T48 tests: pull/F47
import assert from 'node:assert/strict';
import { declaration, deltas, NEW } from './lib.mjs';
export const id = 'pull/T48';
export const tests = ['pull/F47'];
export const title = 'every test file of a candidate is a Case or declared other, the collector-capability Cases keep their ids, and PLAN evidence is found';

const res = (v) => [v].flat().filter((p) => typeof p === 'string').map((p) => new RegExp(p));

export async function run() {
  const ev = declaration.evidence;
  const caseRes = res(ev.cases.files);
  const otherRes = res(ev.cases.other);
  const plan = res(ev.plan);
  const idOf = (path) => { for (const re of caseRes) { const m = re.exec(path); if (m) return m[1]; } return null; };
  for (const name of NEW) {
    const tests = deltas[name].filter((p) => /\.test\.mjs$/.test(p));
    for (const p of tests) assert.ok(idOf(p) || otherRes.some((re) => re.test(p)), `${name}: ${p} is neither a Case nor declared`);
    if (name !== 'kaal/guard/registration') continue;
    // Guard registration holds a PLAN only: its Cases are .red.mjs, which the patterns must not count as Cases.
    for (const p of deltas[name].filter((q) => /\.red\.mjs$/.test(q))) assert.equal(idOf(p), null, `${p} was counted as a Case`);
  }
  const ids = deltas['kaal/engineering/collector-capability'].map(idOf).filter(Boolean).sort();
  const want = Array.from({ length: 12 }, (_, i) => `T${268 + i}`);
  assert.deepEqual(ids, want, 'the collector-capability Cases T268 to T279 are not read as Cases with those ids');
  const wireIds = deltas['kaal/release/wire-operation'].map(idOf).filter(Boolean).sort();
  assert.deepEqual(wireIds, ['T209', 'T210'], 'the WIRE Cases T209 and T210 are not read as Cases with those ids');
  for (const p of deltas['kaal/release/githooks-split'].filter((q) => /\.red\.mjs$/.test(q))) assert.equal(idOf(p), null, `${p} was counted as a Case`);
  for (const p of deltas['kaal/retro/skill'].filter((q) => /\.test\.mjs$/.test(q))) assert.equal(idOf(p), null, `${p} was counted as a Case`);
  for (const name of NEW) assert.ok(deltas[name].some((p) => plan.some((re) => re.test(p))), `${name}: no PLAN evidence is found in its delta`);
}
