// Case release/T1598 tests: release/C153. The PLAN states the evidence a check needs before enforcement and keeps its kinds apart: verification runs, agreement with the old check, provoked demonstrations, coverage of a situation that does not apply, and admission (check 3, which is not a control). It states the counts, the revision binding and where the evidence is kept in files. No time span is required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const file = join(repo, 'engineering/release-management/00-changes/C153-replace-pull-request-target/change.md');
export const id = 'release/T1598';
export const tests = ['release/C153'];
export const title = 'the PLAN keeps the kinds of evidence apart, with their counts and revision binding, and treats admission as not verification';
export async function run() {
  const text = readFileSync(file, 'utf8');
  const at = text.indexOf('## Amendment: the evidence before enforcement, per control');
  assert.ok(at >= 0, 'the evidence chapter is absent');
  const end = text.indexOf('\n## ', at + 5);
  const chapter = text.slice(at, end > 0 ? end : undefined);
  for (const c of ['release/CTL42', 'release/CTL23', 'release/CTL37', 'release/CTL38', 'release/CTL39', 'release/C157', 'release/CTL40', 'release/CTL41']) assert.ok(chapter.includes(c), `the chapter does not name ${c}`);
  for (const k of ['**1. Verification run (V).**', '**2. Agreement (A).**', '**3. Provoked demonstration (P).**', '**4. Coverage of a situation that does not apply (N).**']) assert.ok(chapter.includes(k), `the kind ${k} is not defined`);
  assert.match(chapter, /never a V, never an A, and never counts toward any total/, 'a verdict that does not apply must not count as verification');
  assert.match(chapter, /when it did not, the P counts as a demonstration only, never as an A/, 'a provoked run without the old check must not count as agreement');
  assert.match(chapter, /A V on a revision the old check did not run on is not an A and not a disagreement/, 'agreement needs the old check on the same revision');
  assert.match(chapter, /One distinct revision of one pull request counts once for each control and situation/, 'the revision binding is not stated');
  assert.match(chapter, /At least 5 comparable runs \(A\)/, 'no run count per situation');
  assert.match(chapter, /no fewer than 15 A in all/, 'no total');
  assert.match(chapter, /At least 3 P/, 'no count of provoked demonstrations');
  assert.match(chapter, /At least 1 N/, 'no count of not-applicable coverage');
  assert.match(chapter, /Check 3 is admission, not verification/, 'check 3 is not separated');
  assert.match(chapter, /not a control/, 'check 3 must be said not to be a control');
  assert.match(chapter, /supplies no PASS or FAIL record/, 'check 3 supplies no adapter record');
  assert.match(chapter, /preservation of the merge-group judgement/, 'no preservation of the merge-group judgement');
  assert.match(chapter, /evidence\/check-<n>\.md/, 'no place in files');
  assert.match(chapter, /There is no minimum span/, 'a time span must not be required');
  assert.doesNotMatch(chapter, /working days?/i, 'no working-day requirement');
}
