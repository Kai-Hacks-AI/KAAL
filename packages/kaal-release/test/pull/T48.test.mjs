// Case pull/T48 tests: pull/F47
import assert from 'node:assert/strict';
import { declaration, LAYOUTS, NEW } from './declare/lib.mjs';
export const id = 'pull/T48';
export const tests = ['pull/F47'];
export const title = 'every test file of a candidate is a Case or declared other, Case ids come from the file name and are never fixed here, and PLAN evidence is found';

const res = (v) => [v].flat().filter((p) => typeof p === 'string').map((p) => new RegExp(p));

export async function run() {
  const ev = declaration.evidence;
  const caseRes = res(ev.cases.files);
  const otherRes = res(ev.cases.other);
  const plan = res(ev.plan);
  const idOf = (path) => { for (const re of caseRes) { const m = re.exec(path); if (m) return m[1]; } return null; };
  for (const deltas of LAYOUTS) {
    for (const name of NEW) {
      for (const p of deltas[name].filter((q) => /\.test\.mjs$/.test(q))) assert.ok(idOf(p) || otherRes.some((re) => re.test(p)), `${name}: ${p} is neither a Case nor declared`);
      // A .red.mjs file is a RED Case that the PLAN carries: it is never counted as a Case.
      for (const p of deltas[name].filter((q) => /\.red\.mjs$/.test(q))) assert.equal(idOf(p), null, `${name}: ${p} was counted as a Case`);
      assert.ok(deltas[name].some((p) => plan.some((re) => re.test(p))), `${name}: no PLAN evidence is found in its delta`);
    }
    // The collector-capability Cases keep the ids of their files, T268 to T279.
    const ids = deltas['kaal/engineering/collector-capability'].map(idOf).filter(Boolean).sort();
    assert.deepEqual(ids, Array.from({ length: 12 }, (_, i) => `T${268 + i}`), 'the collector-capability Cases T268 to T279 are not read as Cases with those ids');
    // The WIRE Cases are read with the id their file carries, whatever number the Change gives them: no id is fixed here.
    const wire = deltas['kaal/release/wire-operation'].filter((q) => /\/T\d+\.test\.mjs$/.test(q));
    assert.ok(wire.length > 0, 'the WIRE collector has no Case file');
    assert.deepEqual(wire.map(idOf), wire.map((q) => /\/(T\d+)\.test\.mjs$/.exec(q)[1]), 'a WIRE Case is not read under the id of its file');
    assert.equal(new Set(wire.map(idOf)).size, wire.length, 'two WIRE Cases share an id');
    // Node tests that are not Cases (the retro package, the Guard acceptance tests) are declared other and never counted as Cases.
    for (const name of ['kaal/retro/skill', 'kaal/release/githooks-split', 'kaal/guard/registration'])
      for (const p of deltas[name].filter((q) => /\.test\.mjs$/.test(q) && !/\/T\d+\.test\.mjs$/.test(q))) assert.equal(idOf(p), null, `${p} was counted as a Case`);
  }
}
