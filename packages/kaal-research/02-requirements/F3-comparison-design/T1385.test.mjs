// Case research/T1385 tests: research/F3
import assert from 'node:assert/strict';
import { GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1385';
export const tests = ['research/F3'];
export const title = 'a rehearsal states its arms, run counts, what fresh meant, model, settings and blinding, and is well-formed whatever the design; a missing untreated arm or blinding limits only the claims that need them';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  const fine = async (why, text, files) => { const r = await judged(text, files); assert.equal(r.result, 'well-formed', `${why}: refused (${problems(r)})`); };
  await refused('Design:arms', swap('arms: bare, guided', 'arms:'));
  await refused('Design:untreated', swap('untreated: bare', 'untreated: older'));
  await refused('Design:n', swap('n: bare=2, guided=2', 'n: bare=2'));
  await refused('Runs:runs-differ-from-n', swap('n: bare=2, guided=2', 'n: bare=2, guided=3'));
  for (const k of ['fresh-means', 'model', 'settings']) await refused(`Design:${k}`, swap(new RegExp(`${k}: .*\\n`).exec(GOOD)[0], ''));
  await refused('Design:blind', swap('blind: no\n', ''));
  await refused('Design:blind-how', swap('blind: no', 'blind: yes'));
  await refused('Runs:untreated-arm-exposed', swap('- run: r1\n  arm: bare\n  exposure: none', '- run: r1\n  arm: bare\n  exposure: delivered'));
  await refused('Runs:treated-arm-unexposed', swap('- run: r4\n  arm: guided\n  exposure: opened\n  excerpt: evidence/r2.excerpt.txt', '- run: r4\n  arm: guided\n  exposure: none'));
  await refused('Design:key-times', swap('blind: no', 'blind: no\nkey-frozen: 2026-11-20T10:00:00Z'));
  await refused('Design:key-after-treatment', swap('blind: no', 'blind: no\nkey-frozen: 2026-11-20T12:00:00Z\ntreatment-fixed: 2026-11-20T11:00:00Z'));
  // The same honest record is well-formed without an untreated arm, with unequal counts, and with one arm only.
  await fine('no untreated arm, a version comparison', swap('untreated: bare', 'untreated: none').replace('exposure: none', 'exposure: delivered').replace('exposure: none', 'exposure: delivered'));
  await fine('unequal run counts', swap('n: bare=2, guided=2', 'n: bare=1, guided=2').replace('- run: r3\n  arm: bare\n  exposure: none\n', '').replace('rests-on: r1, r2, r3, r4', 'rests-on: r1, r2, r4'));
  await fine('unblinded', GOOD);
}
