// Case release/T1267 tests: release/C104
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const here = join(repo, 'engineering/release-management/00-changes/C104-accept-analyze');
const WF = join(repo, '.github/workflows');
const pin = (y) => (y.match(/actions\/dependency-review-action@([0-9a-f]{40})/) || [])[1];
export const id = 'release/T1267';
export const tests = ['release/C104'];
export const title = 'the equivalence of release/CTL2 to Dependency Review is stated, equal to its draft, and the facts it states hold in the workflows';
export function run() {
  const real = join(here, 'equivalence.md');
  assert.ok(existsSync(real), 'equivalence.md is absent');
  const draft = readFileSync(join(here, 'interface.md'), 'utf8').split(/^## Draft of equivalence\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const text = readFileSync(real, 'utf8');
  assert.equal(text, `${draft}\n`, 'equivalence.md differs from the draft');
  const analyze = readFileSync(join(WF, 'analyze-vulnerabilities.yml'), 'utf8');
  assert.ok(pin(analyze), 'the analyze workflow has no pinned dependency review action');
  assert.ok(text.includes(pin(analyze).slice(0, 8)), 'the stated pin is not the pin of the analyze workflow');
  for (const base of ['main', 'kaal/**', 'hotfix/**', 'wire/**']) assert.ok(analyze.includes(base), `the analyze workflow does not cover ${base}`);
  assert.match(analyze, /merge_group:/, 'the analyze workflow does not run in the merge queue');
  const promoting = analyze.split(/^ {2}promoting:/m)[1];
  assert.ok(/fail-on-severity: low/.test(promoting) && /fail-on-scopes: runtime/.test(promoting), 'the Promoting job does not state severity low and scope runtime');
  const legacy = join(WF, 'dependency-review.yml');
  if (existsSync(legacy)) {
    const old = readFileSync(legacy, 'utf8');
    assert.equal(pin(old), pin(analyze), 'the legacy workflow uses another pin than the analyze workflow');
    assert.match(old, /branches: \[main, "kaal\/\*\*"\]/, 'the legacy workflow covers other bases than the statement says');
  }
}
