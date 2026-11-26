// Case research/T1384 tests: research/F2
import assert from 'node:assert/strict';
import { FILES, GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1384';
export const tests = ['research/F2'];
export const title = 'a rehearsal is well-formed only if its prompt, answers and scores are named, and every file it names is held, unchanged, inside the record\'s own folder; optional evidence may be absent';
export async function run() {
  const ok = await judged(GOOD);
  assert.equal(ok.result, 'well-formed', `a record with only the essentials is not well-formed: ${problems(ok)}`);
  for (const role of ['prompt', 'answers', 'scores']) {
    const r = await judged(GOOD.replace(new RegExp(`- role: ${role}\\n  path: .*\\n  sha256: .*\\n`), ''));
    assert.ok(problems(r).includes('Evidence:role-missing'), `no ${role} named: not refused`);
  }
  const temp = await judged(swap('path: evidence/prompt.txt', 'path: /tmp/trial3/prompt.txt'), [...FILES, { path: '/tmp/trial3/prompt.txt', sha256: 'a'.repeat(64) }]);
  assert.ok(problems(temp).includes('Evidence:evidence-outside'), 'a temporary location outside the record is accepted');
  assert.ok(problems(await judged(swap('path: evidence/prompt.txt', 'path: ../elsewhere/prompt.txt'))).includes('Evidence:evidence-outside'), 'a path that climbs out is accepted');
  assert.ok(problems(await judged(GOOD, FILES.filter((f) => f.path !== 'evidence/scores.txt'))).includes('Evidence:evidence-missing'), 'a named file the caller does not hold is accepted');
  assert.ok(problems(await judged(GOOD, FILES.map((f) => (f.path === 'evidence/answers.txt' ? { ...f, sha256: 'f'.repeat(64) } : f)))).includes('Evidence:evidence-changed'), 'a file that no longer matches its digest is accepted');
}
