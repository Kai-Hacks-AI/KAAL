// Case release/T83 tests: G23
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T83';
export const tests = ['release/G23'];
export const title = 'gap release/G23 is closed: a workflow classifies the analysis through Guard for pull requests and the merge group';

// The judgment, kept apart from the repository so that it can be shown on workflows of known shape.
// Comments are removed first, so a step that is only described cannot count as wired.
export function wiresMergeGroup(text) {
  const code = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  return /^on:[\s\S]*?^\s{2}merge_group:/m.test(code)
    && /^\s*-?\s*run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github\s*$/m.test(code);
}

const wired = [
  'name: KAAL release', 'on:', '  pull_request:', '    branches: [main]', '  merge_group:', 'jobs:', '  analyze-vulnerabilities:',
  '    steps:', '      - id: analysis', '        uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294',
  '      - name: Classify the result', '        run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github', '',
].join('\n');
const old = 'name: Dependency Review\non:\n  pull_request:\n    branches: [main, "kaal/**"]\njobs:\n  dependency-review:\n    steps:\n      - uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294\n';
const fixtures = [
  ['the intended workflow', wired, true],
  ['the old Dependency Review workflow', old, false],
  ['the old workflow with a merge group added', old.replace('  pull_request:', '  merge_group:\n  pull_request:'), false],
  ['the intended workflow without the merge group', wired.replace('  merge_group:\n', ''), false],
  ['the intended workflow without the Guard step', wired.replace(/.*kaal-guard.*\n/, ''), false],
  ['a Guard step that is only a comment', wired.replace('        run: npx', '        # run: npx'), false],
  ['a Guard step for another check', wired.replace('Analyze-Vulnerabilities', 'Other'), false],
];

export function run() {
  for (const [what, text, want] of fixtures) assert.equal(wiresMergeGroup(text), want, `the judgment is wrong for ${what}`);
  const dir = join(repo, '.github/workflows');
  const files = existsSync(dir) ? readdirSync(dir) : [];
  const hit = files.filter((f) => wiresMergeGroup(readFileSync(join(dir, f), 'utf8')));
  assert.ok(hit.length > 0, 'no workflow classifies the analysis through Guard for the merge group');
  assert.ok(!hit.includes('dependency-review.yml'), 'the old Dependency Review workflow is taken for the new wiring');
}
