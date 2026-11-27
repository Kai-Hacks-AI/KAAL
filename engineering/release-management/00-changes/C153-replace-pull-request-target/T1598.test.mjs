// Case release/T1598 tests: release/C153. The PLAN states the evidence a check needs before enforcement: the situations of each of the four checks, the run counts, the agreement with the old check, and where it is kept in files. No time span is required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const file = join(repo, 'engineering/release-management/00-changes/C153-replace-pull-request-target/change.md');
export const id = 'release/T1598';
export const tests = ['release/C153'];
export const title = 'the PLAN states the evidence each check needs before enforcement, by situation and run count, and where it is kept';
export async function run() {
  const text = readFileSync(file, 'utf8');
  const at = text.indexOf('## Amendment: the evidence before enforcement, per control');
  assert.ok(at >= 0, 'the evidence chapter is absent');
  const chapter = text.slice(at, text.indexOf('\n## ', at + 5) > 0 ? text.indexOf('\n## ', at + 5) : undefined);
  for (const c of ['release/CTL42', 'release/CTL23', 'release/CTL37', 'release/CTL38', 'release/CTL39', 'release/C157', 'release/CTL40', 'release/CTL41']) assert.ok(chapter.includes(c), `the chapter does not name ${c}`);
  assert.match(chapter, /[Aa]t least 5 comparable runs for each situation/, 'no run count per situation');
  assert.match(chapter, /no fewer than 15 comparable runs in all/, 'no total run count');
  assert.match(chapter, /agree with the old check on the same revision/, 'no agreement rule');
  assert.match(chapter, /evidence\/check-<n>\.md/, 'no place in files');
  assert.match(chapter, /no minimum span/, 'a time span must not be required');
  for (const s of ['provoked', 'not applicable', 'x: real']) assert.ok(chapter.includes(s), `the chapter does not say ${s}`);
  assert.doesNotMatch(chapter, /working days?/i, 'no working-day requirement');
}
