// Case release/T1307 tests: release/A76, release/F86
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-verify-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C111-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1307';
export const tests = ['release/A76', 'release/F86'];
export const title = 'release/A76 is the judge of the form of the ACT and addresses release/F86; judgeVerifyAct says FAIL naming each retro of the carried Changes that is malformed, with its rules, and each file the finder refused, UNKNOWN, never PASS, when the form of such a retro cannot be told, and PASS when each is well formed or none reflects a carried Change';
export async function run() {
  const real = join(RM, '03-architecture/A76-judge-verify-act/A76.md');
  assert.ok(existsSync(real), 'A76.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A76.md')}\n`, 'A76.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-verify-act.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-verify-act.mjs')}\n`, 'judge-verify-act.mjs differs from the draft');
  const { judgeVerifyAct } = await import(pathToFileURL(SRC).href);
  const ok = { result: 'well-formed', problems: [] };
  const bad = (...rules) => ({ result: 'malformed', problems: rules.map((rule) => ({ section: 'retro', rule })) });
  const retro = (path, reflects, form) => ({ path, reflects, ...(form === undefined ? {} : { form }) });
  const v = (carried, retros, refused) => judgeVerifyAct({ carried, retros, ...(refused ? { refused } : {}) });
  // PASS
  assert.equal(v([], []).verdict, 'PASS', 'nothing carried');
  assert.equal(v(['x/C1'], []).verdict, 'PASS', 'no retro yet: that is demand Act, not this');
  assert.match(v(['x/C1'], []).message, /no ACT to verify/);
  assert.equal(v(['x/C1', 'x/C2'], [retro('a.md', ['x/C1', 'x/C2'], ok)]).verdict, 'PASS');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], ok), retro('b.md', ['x/C1'], ok)]).verdict, 'PASS', 'how many retros reflect a Change is demand Act\'s');
  assert.equal(v(['x/C2'], [retro('old.md', ['x/C1'], bad('account-of'))]).verdict, 'PASS', 'the retro of another collector is not judged again');
  assert.equal(v(['x/C2'], [retro('old.md', ['x/C1'], { result: 'unjudged', problems: [] })]).verdict, 'PASS');
  // applies: false only for the PASS with no retro of a carried Change to verify
  assert.equal(v(['x/C1'], []).applies, false, 'no ACT to verify: nothing to judge');
  assert.equal(v([], []).applies, false);
  assert.equal(v(['x/C2'], [retro('old.md', ['x/C1'], bad('account-of'))]).applies, false, 'the retro of another collector is nothing to judge');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], ok)]).applies, true, 'judged, and fine');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], bad('account-of'))]).applies, true, 'a FAIL always applies');
  assert.equal(v(['x/C1'], [], [{ path: 'x.md' }]).applies, true, 'a refused file is a FAIL that applies');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'])]).applies, true, 'an UNKNOWN always applies');
  assert.equal(judgeVerifyAct(null).applies, true, 'unusable input is an UNKNOWN that applies');
  // FAIL: a malformed retro of a carried Change, with its rules; and a file the finder refused
  let f = v(['x/C1'], [retro('02-learnings/retros/RT3.md', ['x/C1'], bad('account-of', 'sections-in-order', 'account-of'))]);
  assert.equal(f.verdict, 'FAIL');
  assert.deepEqual(f.malformed, ['02-learnings/retros/RT3.md']);
  assert.match(f.message, /^retro form: 02-learnings\/retros\/RT3\.md is not well formed \(account-of, sections-in-order\)$/, 'the rules are named once each');
  f = v(['x/C1'], [retro('a.md', ['x/C1'], ok), retro('b.md', ['x/C1', 'x/C9'], bad('missing-keeps'))]);
  assert.equal(f.verdict, 'FAIL', 'one malformed retro among the carried');
  assert.match(f.message, /b\.md/);
  assert.doesNotMatch(f.message, /a\.md/);
  f = v(['x/C1'], [], [{ path: 'x.md', reason: 'duplicate id' }]);
  assert.equal(f.verdict, 'FAIL', 'a file the finder refuses is not an ACT, whatever it reflects');
  assert.match(f.message, /x\.md is not a retro the finder accepts \(duplicate id\)/);
  // UNKNOWN: it cannot be told; FAIL outranks it
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], { result: 'unjudged', problems: [] })]).verdict, 'UNKNOWN', 'a format it does not know is never well formed');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'])]).verdict, 'UNKNOWN', 'no judgement, no PASS');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], { result: 'fine', problems: [] })]).verdict, 'UNKNOWN', 'an answer it does not know is not well-formed');
  assert.equal(v(['x/C1'], [retro('a.md', ['x/C1'], { result: 'unjudged' }), retro('b.md', ['x/C1'], bad('account-of'))]).verdict, 'FAIL', 'FAIL outranks UNKNOWN');
  for (const bad2 of [undefined, null, 'x', {}, [1], [''], [null]]) assert.equal(judgeVerifyAct({ carried: bad2, retros: [] }).verdict, 'UNKNOWN', `carried ${JSON.stringify(bad2)} must be UNKNOWN`);
  for (const bad2 of [undefined, null, 'RT1', [null], [{}], [{ path: 'a' }], [{ path: 'a', reflects: 'x/C1' }], [{ path: 'a', reflects: [1] }]]) assert.equal(judgeVerifyAct({ carried: ['x/C1'], retros: bad2 }).verdict, 'UNKNOWN', `retros ${JSON.stringify(bad2)} must be UNKNOWN`);
  for (const bad2 of [null, 'x', [null], [{}], [{ reason: 'r' }]]) assert.equal(judgeVerifyAct({ carried: ['x/C1'], retros: [], refused: bad2 }).verdict, 'UNKNOWN', `refused ${JSON.stringify(bad2)} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x']) assert.equal(judgeVerifyAct(nothing).verdict, 'UNKNOWN');
}
