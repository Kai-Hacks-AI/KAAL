// Case research/T1386 tests: research/F4
import assert from 'node:assert/strict';
import { GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1386';
export const tests = ['research/F4'];
export const title = 'a rehearsal states for every run whether the treatment was verified, and no claim or verdict says more than the runs and the evidence show';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  const unchecked = swap('- run: r4\n  arm: guided\n  exposure: opened\n  excerpt: evidence/r2.excerpt.txt', '- run: r4\n  arm: guided\n  exposure: unchecked');
  await refused('Claims:unverified-exposure', unchecked);
  assert.equal((await judged(swap('demonstrated: yes', 'demonstrated: partly\n  not-shown: exposure of r4 was not checked', unchecked))).result, 'well-formed', 'an honest partly-demonstrated claim on an unchecked run is refused');
  await refused('Runs:exposure', swap('exposure: opened\n  excerpt: evidence/r2.excerpt.txt\n- run: r3', 'exposure: maybe\n- run: r3'));
  await refused('Runs:exposure-excerpt', swap('excerpt: evidence/r2.excerpt.txt\n- run: r3', 'excerpt: evidence/nowhere.txt\n- run: r3'));
  await refused('Claims:not-shown', swap('  not-shown: persistence was not asked end to end\n', ''));
  await refused('Claims:demonstrated', swap('demonstrated: no', 'demonstrated: mostly'));
  await refused('Claims:rests-on', swap('rests-on: r2, r4\n  demonstrated: no', 'rests-on: r9\n  demonstrated: no'));
  await refused('Claims:none', GOOD.replace(/## Claims[\s\S]*?## Limits/, '## Limits'));
  await refused('Limits:n-shows', swap(/n-shows: .*\n/.exec(GOOD)[0], ''));
  await refused('front:verdict-overstates', swap('verdict: inconclusive', 'verdict: favourable'));
  const allYes = swap('demonstrated: no\n  not-shown: persistence was not asked end to end', 'demonstrated: yes', swap('verdict: inconclusive', 'verdict: favourable'));
  assert.equal((await judged(allYes)).result, 'well-formed', 'a favourable verdict with every claim demonstrated and blind scoring is refused');
  await refused('front:verdict-overstates', swap('blind: yes', 'blind: no', allYes));
  assert.equal((await judged(swap('verdict: inconclusive', 'verdict: unfavourable'))).result, 'well-formed', 'an unfavourable verdict with an undemonstrated claim is refused');
  assert.equal((await judged('# not a record\n')).result, 'unjudged', 'a file that is no rehearsal is judged');
}
