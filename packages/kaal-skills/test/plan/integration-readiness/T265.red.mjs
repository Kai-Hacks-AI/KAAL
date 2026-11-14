// Case skills/T265 tests: skills/F6. The declaration names no host trigger. The prose around it is for a reviewer, not for a word list.
import assert from 'node:assert/strict';
import { OUTCOME, THREE, check, draft, subject } from './lib.mjs';
export const id = 'skills/T265';
export const tests = ['skills/F6'];
export const title = 'a declaration naming a hook, workflow, ruleset or queue is refused; prose that merely mentions workflow files is not judged by a word list';
export async function run() {
  assert.equal((await check(draft())).v.F6, 'PASS', 'the Testing draft names no host trigger');
  for (const named of ['.githooks/pre-push', '.github/workflows/ci.yml', 'rulesets/promotion', 'merge queue']) {
    const d = draft(); d.mechanisms[0].wire = named;
    assert.equal((await check(d)).v.F6, 'FAIL', `a declaration naming ${named} must be refused`);
  }
  const s = subject({ module: `export const m = () => ({ result: 'clear' });`, fixtures: THREE, mechanism: { outcome: OUTCOME, reason: ['why'] }, docsText: '# Subject\nThis capability does not install workflow files or hooks.\n' });
  assert.equal((await check(s.declaration, s)).v.F6, 'PASS', 'a negating mention in prose is not a host trigger in the declaration');
}
