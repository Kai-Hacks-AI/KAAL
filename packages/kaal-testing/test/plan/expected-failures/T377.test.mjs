// Case testing/T377 tests: testing/N33. Abstract and without a verdict.
import { FULL, assert, existsSync, fixture, install, join, readFileSync, runCommand, writeFileSync } from './lib.mjs';
export const id = 'testing/T377';
export const tests = ['testing/N33'];
export const title = 'the expectations module and the text about them name no concrete owner or consumer, and the output decides nothing';
const OUTSIDE = /\b(defects?|review|guard|kaal-change|change|hotfix|merge|release|inspector|dispatcher|cpo|promotion)\b/i;
const VERDICT = /^(pass|passed|fail|failed|blocked|allowed|verdict|ok|accepted|rejected|mergeable)$/i;
function keys(value, out = []) {
  if (Array.isArray(value)) value.forEach((v) => keys(v, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) { out.push(k); keys(v, out); }
  return out;
}
export function run() {
  const { root } = install();
  const file = join(root, 'lib/expectations.mjs');
  assert.ok(existsSync(file), 'lib/expectations.mjs is absent from the installed package');
  const code = readFileSync(file, 'utf8');
  assert.ok(!OUTSIDE.test(code), `lib/expectations.mjs names a concrete owner or consumer: ${code.match(OUTSIDE)?.[0]}`);
  assert.ok(!/\bfrom\s+'[^']*'/.test(code) && !/\bimport\s*\(/.test(code), 'lib/expectations.mjs imports something');
  const dir = fixture();
  writeFileSync(join(dir, 'register.json'), JSON.stringify(FULL));
  const r = runCommand(dir, ['--expect', join(dir, 'register.json')]);
  assert.equal(r.status, 0, r.stderr);
  const decided = keys(r.report.expectations).filter((k) => VERDICT.test(k));
  assert.deepEqual(decided, [], `the output has deciding fields: ${decided}`);
  for (const name of ['skills/kaal-testing/SKILL.md', 'README.md']) {
    const text = readFileSync(join(root, name), 'utf8');
    const near = text.split('\n').filter((l) => /expected failure|--expect|register of expected/i.test(l));
    assert.ok(near.length > 0, `${name} says nothing about expected failures`);
    assert.ok(!OUTSIDE.test(near.join('\n')), `${name} names a concrete owner or consumer where it speaks of expected failures: ${near.join('\n').match(OUTSIDE)?.[0]}`);
  }
}
