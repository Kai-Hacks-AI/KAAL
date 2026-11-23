// Case research/T1386 tests: research/F4
import assert from 'node:assert/strict';
import { EFFECT, EFFECT_FILES, GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1386';
export const tests = ['research/F4'];
export const title = 'every claim states its scope, what it rests on and how far it is shown; an effect claim marked shown needs an untreated arm, blind scoring, a key before the treatment and opened exposure; a verdict says what it is about and rests only on claims it names';
export async function run() {
  const refused = async (rule, text, files) => assert.ok(problems(await judged(text, files)).includes(rule), `${rule}: not refused`);
  const fine = async (why, text, files) => { const r = await judged(text, files); assert.equal(r.result, 'well-formed', `${why}: refused (${problems(r)})`); };
  await fine('an effect claim with the conditions met', EFFECT, EFFECT_FILES);
  const effect = (from, to) => swap(from, to, EFFECT);
  await refused('Claims:effect-needs-blind', effect('blind: yes\nblind-how: scorer saw run labels only', 'blind: no'), EFFECT_FILES);
  await refused('Claims:effect-needs-untreated', effect('rests-on: r1, r2, r3, r4', 'rests-on: r2, r4'), EFFECT_FILES);
  await refused('Claims:effect-needs-untreated', effect('untreated: bare', 'untreated: none').replace(/exposure: none/g, 'exposure: delivered'), EFFECT_FILES);
  await refused('Claims:effect-needs-key', effect('key-frozen: 2026-11-20T10:00:00Z\ntreatment-fixed: 2026-11-20T11:00:00Z\n', ''), EFFECT_FILES);
  await refused('Claims:effect-needs-key', EFFECT.replace(/- role: key\n.*\n.*\n/, ''), FILES_WITHOUT_KEY(EFFECT_FILES));
  await refused('Claims:effect-needs-exposure', effect('- run: r4\n  arm: guided\n  exposure: opened\n  excerpt: evidence/r2.excerpt.txt', '- run: r4\n  arm: guided\n  exposure: unchecked'), EFFECT_FILES);
  await fine('an honest partly-shown effect claim on an unchecked run', effect('demonstrated: yes\n## Limits', 'demonstrated: partly\n  not-shown: exposure of r4 was not checked\n## Limits').replace('exposure: opened\n  excerpt: evidence/r2.excerpt.txt\n## Claims', 'exposure: unchecked\n## Claims'), EFFECT_FILES);
  await refused('Claims:comparison-needs-two-arms', swap('scope: description\n  rests-on: r2, r4', 'scope: comparison\n  rests-on: r2, r4'));
  await refused('Runs:exposure', swap('exposure: opened\n  excerpt: evidence/r2.excerpt.txt\n- run: r3', 'exposure: maybe\n- run: r3'));
  await refused('Runs:exposure-excerpt', swap('excerpt: evidence/r2.excerpt.txt\n- run: r3', 'excerpt: evidence/nowhere.txt\n- run: r3'));
  await refused('Claims:not-shown', swap('\n  not-shown: unblinded, and no key was frozen before the guidance was fixed', ''));
  await refused('Claims:demonstrated', swap('demonstrated: no', 'demonstrated: mostly'));
  await refused('Claims:scope', swap('scope: effect', 'scope: truth'));
  await refused('Claims:rests-on', swap('rests-on: r2, r4', 'rests-on: r9'));
  await refused('Claims:none', GOOD.replace(/## Claims[\s\S]*?## Limits/, '## Limits'));
  await refused('Limits:n-shows', swap(/n-shows: .*\n/.exec(GOOD)[0], ''));
  // What a verdict is about, and what it may rest on.
  await refused('front:verdict-rests-on', swap('verdict-rests-on: c1\n', ''));
  await refused('front:verdict-rests-on', swap('verdict-rests-on: c1', 'verdict-rests-on: c7'));
  await refused('front:verdict-about', swap('verdict-about: description\n', ''));
  await refused('front:verdict-about-mismatch', swap('verdict-about: description', 'verdict-about: effect'));
  await refused('front:verdict-overstates', swap('verdict-rests-on: c1', 'verdict-rests-on: c2').replace('verdict-about: description', 'verdict-about: effect'));
  await fine('a narrow favourable verdict while another claim stays unresolved', GOOD);
  await fine('an unfavourable verdict on an undemonstrated claim', swap('verdict: favourable', 'verdict: unfavourable').replace('verdict-rests-on: c1', 'verdict-rests-on: c2').replace('verdict-about: description', 'verdict-about: effect'));
  const r = await judged(GOOD);
  assert.ok(typeof r.says === 'string' && r.says.length > 0, 'the result does not say what it is not');
  assert.equal(r.result, 'well-formed');
  assert.equal((await judged('# not a record\n')).result, 'unjudged', 'a file that is no rehearsal is judged');
}
const FILES_WITHOUT_KEY = (files) => files.filter((f) => f.path !== 'evidence/key.txt');
