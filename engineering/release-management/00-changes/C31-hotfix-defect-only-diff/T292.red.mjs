// Case release/T292 tests: G66
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T292';
export const tests = ['release/G66'];
export const title = 'the HOTFIX scope judge finds a diff without the Case of its defect or across two capability roots, and never answers PASS';

export async function run() {
  const mod = join(repo, 'engineering/release-management/05-src/plan-body/hotfix-scope.mjs');
  assert.ok(existsSync(mod), 'the HOTFIX scope judge is absent');
  const { judgeHotfixScope } = await import(pathToFileURL(mod).href);
  const good = ['packages/kaal-hosting/src/read.mjs', 'packages/kaal-hosting/test/T12.test.mjs'];
  const ok = judgeHotfixScope(good);
  assert.equal(ok.verdict, 'UNKNOWN', 'a clean scope must stay UNKNOWN, never PASS');
  assert.deepEqual(ok.findings, [], 'a clean scope has no finding');
  assert.ok(ok.notJudged.some((s) => /only its defect/.test(s)), 'minimality is not listed as not judged');
  const noCase = judgeHotfixScope(['packages/kaal-hosting/src/read.mjs']);
  assert.equal(noCase.verdict, 'FAIL', 'a diff without a Case is accepted');
  assert.ok(noCase.findings.some((s) => /Case/.test(s)));
  const two = judgeHotfixScope([...good, 'engineering/guard/check.mjs']);
  assert.equal(two.verdict, 'FAIL', 'a diff across two capability roots is accepted');
  assert.ok(two.findings.some((s) => /capability root/.test(s)));
  const top = judgeHotfixScope([...good, 'package.json']);
  assert.equal(top.verdict, 'FAIL', 'a top-level path beside a capability root is accepted');
  assert.equal(judgeHotfixScope([]).verdict, 'FAIL', 'an empty diff is accepted');
}
