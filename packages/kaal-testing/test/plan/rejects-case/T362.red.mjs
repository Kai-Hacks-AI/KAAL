// Case testing/T362 tests: testing/F136
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { TRIAL, answerOf, readJson, readText, sha, trialKey, trialRuns } from './lib.mjs';
export const id = 'testing/T362';
export const tests = ['testing/F136'];
export const title = 'every difference on rejectsCase is listed with its positions, and none is settled by editing the key';
export function run() {
  const runs = trialRuns();
  const keyText = readText(join(TRIAL, 'key.json'));
  const key = trialKey();
  const c = readJson(join(TRIAL, 'comparison.json'));
  assert.ok(/judg/i.test(key.status ?? ''), "the key says it is the author's judgment");
  assert.ok(key.key.filter((k) => k.isCase).every((k) => typeof k.doubt === 'string' && k.doubt.trim()), 'every Case claim of the key states its doubt');
  assert.equal(c.keySha256, sha(keyText), 'the comparison names the key it used');
  if (c.keyRevision) assert.ok(c.keyRevision.reason && c.keyRevision.by && c.keyRevision.from, 'a changed key records its revision: from, by and reason');
  const want = {};
  for (const k of key.key.filter((x) => x.isCase)) {
    want[k.id] = { key: k.rejectsCase };
    for (const r of runs) want[k.id][`${r.arm}/${r.run}`] = answerOf(r, k.id).rejectsCase;
  }
  assert.deepEqual(c.positions, want, 'the comparison holds every position, as recomputed from the records');
  for (const [claim, at] of Object.entries(want)) {
    const distinct = new Set(Object.values(at));
    const listed = (c.disagreements ?? []).filter((d) => d.claim === claim);
    if (distinct.size > 1) assert.ok(listed.length > 0 && listed.every((d) => d.positions && Object.keys(d.positions).length > 1 && d.resolved === false), `${claim}: the difference is listed with its positions, unresolved`);
    else assert.equal(listed.length, 0, `${claim}: no difference is listed where none exists`);
  }
  assert.ok(Array.isArray(c.limits) && c.limits.length > 0 && c.limits.every((l) => typeof l === 'string' && l.trim()), 'the comparison states what the trial cannot show');
}
