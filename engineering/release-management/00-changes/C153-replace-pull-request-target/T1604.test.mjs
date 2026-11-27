// Case release/T1604 tests: release/C153. The evidence chapter keeps to what the checks can show: admission (check 3) refuses nothing and so asks for no refused pull request, and check 1 requires no not-applicable coverage.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const dir = join(repo, 'engineering/release-management/00-changes');
export const id = 'release/T1604';
export const tests = ['release/C153'];
export const title = 'the evidence chapter asks for no refused pull request of admission and no N of check 1';
export async function run() {
  const text = readFileSync(join(dir, 'C153-replace-pull-request-target/change.md'), 'utf8');
  const at = text.indexOf('## Amendment: the evidence before enforcement, per control');
  assert.ok(at >= 0, 'the evidence chapter is absent');
  const end = text.indexOf('\n## ', at + 5);
  const chapter = text.slice(at, end > 0 ? end : undefined);
  assert.match(chapter, /Admission refuses nothing by design/, 'the chapter does not say that admission refuses nothing');
  assert.doesNotMatch(chapter, /shown refused/, 'the chapter asks for a refused pull request');
  assert.match(chapter, /Check 1 requires no N/, 'the chapter still asks for an N of check 1');
  assert.doesNotMatch(chapter, /shown by the Case release\/T1590/, 'the chapter ties an N to T1590');
}
