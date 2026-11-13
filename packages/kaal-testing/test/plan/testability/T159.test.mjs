// Case testing/T159 tests: testing/F132
import assert from 'node:assert/strict';
import { doRuns, readJson, sha, readText, DO_TRIAL, PLAN } from './lib.mjs';
import { join } from 'node:path';
export const id = 'testing/T159';
export const tests = ['testing/F132'];
export const title = 'every disagreement is listed with its positions, and none is settled by editing the key';
/** The positions each claim has: the key, and each arm's runs. A claim's difference is any two positions that are not equal. */
function positions(key, runs) {
  const out = {};
  for (const k of key.key) {
    const at = { key: `${k.approach}${k.owner ? ':' + k.owner : ''}` };
    for (const { run, arm, dir } of runs) {
      const a = readJson(join(dir, `${arm}.json`)).answers.find((x) => x.id === k.id);
      at[`${arm}/${run}`] = `${a.approach}${a.owner ? ':' + a.owner : ''}`;
    }
    out[k.id] = at;
  }
  return out;
}
export function run() {
  const runs = doRuns();
  const key = readJson(join(DO_TRIAL, 'key.json'));
  const c = readJson(join(DO_TRIAL, 'comparison.json'));
  assert.ok(/judg/i.test(key.status ?? ''), 'the key says it is the author\'s judgment');
  assert.ok(key.key.every((k) => typeof k.doubt === 'string' && k.doubt.trim()), 'every key entry states its doubt');
  if (sha(readText(join(DO_TRIAL, 'key.json'))) !== sha(readText(join(PLAN, 'trial/pilot2/key.json'))))
    assert.ok(c.keyRevision?.reason && c.keyRevision?.by && c.keyRevision?.from === sha(readText(join(PLAN, 'trial/pilot2/key.json'))), 'a changed key records its revision: from (the pilot key hash), by and reason');
  assert.equal(c.keySha256, sha(readText(join(DO_TRIAL, 'key.json'))), 'the comparison names the key it used');
  const want = positions(key, runs);
  assert.deepEqual(c.positions, want, 'the comparison holds every position, as recomputed from the records');
  for (const [claim, at] of Object.entries(want)) {
    const distinct = new Set(Object.values(at));
    const listed = (c.disagreements ?? []).filter((d) => d.claim === claim);
    if (distinct.size > 1) assert.ok(listed.length > 0 && listed.every((d) => d.positions && Object.keys(d.positions).length > 1 && d.resolved === false), `${claim}: the disagreement is listed with its positions, unresolved`);
    else assert.equal(listed.length, 0, `${claim}: no disagreement is listed where none exists`);
  }
  assert.ok(Array.isArray(c.limits) && c.limits.length > 0 && c.limits.every((l) => typeof l === 'string' && l.trim()), 'the comparison states what the trial cannot show');
}
