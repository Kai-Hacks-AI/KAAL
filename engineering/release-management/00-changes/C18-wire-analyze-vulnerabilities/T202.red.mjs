// Case release/T202 tests: F20
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);
export const id = 'release/T202';
export const tests = ['release/F20'];
export const title = 'each workflow source reports its check for the events of its own target, under the job name a ruleset can require';

// The judgment, kept apart from the repository so that it can be shown on workflows of known shape.
// Integration is the pull requests into the collectors `kaal/**`, Promotion is the pull requests into `main`.
// A target whose ruleset source has a merge queue must also report on the merge group; a target without one need not.
export function judgeWorkflow(text, target, queued) {
  const code = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  const on = /^on:[ \t]*\n((?:[ \t]+.*\n?|\n)*)/m.exec(code)?.[1] ?? '';
  const pr = /^ {2}pull_request:[ \t]*\n((?: {3,}.*\n?)*)/m.exec(on)?.[1] ?? '';
  const branches = /^\s*branches:\s*\[(.*)\]/m.exec(pr)?.[1] ?? '';
  const base = target === 'Integration' ? /"?kaal\/\*\*"?/.test(branches) && !/\bmain\b/.test(branches) : /\bmain\b/.test(branches) && !/kaal/.test(branches);
  return base
    && (!queued || /^ {2}merge_group:/m.test(on))
    && code.includes(`name: analyze Vulnerabilities (${target})`)
    && /^\s*-?\s*run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github\s*$/m.test(code)
    && /^\s*-?\s*uses: \S+@[0-9a-f]{40}\b/m.test(code);
}
const wf = (target, branches, merge) => [
  'name: KAAL release', 'on:', '  pull_request:', `    branches: [${branches}]`, ...(merge ? ['  merge_group:'] : []), 'jobs:', '  j:', `    name: analyze Vulnerabilities (${target})`, '    steps:',
  '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1', '      - run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github', '',
].join('\n');
const fixtures = [
  ['Integration on the collectors, no merge queue', wf('Integration', '"kaal/**"', false), 'Integration', false, true],
  ['Integration pointed at main', wf('Integration', 'main', false), 'Integration', false, false],
  ['Integration pointed at main and the collectors', wf('Integration', 'main, "kaal/**"', false), 'Integration', false, false],
  ['Promotion on main with its merge queue', wf('Promotion', 'main', true), 'Promotion', true, true],
  ['Promotion with a merge queue but no merge group', wf('Promotion', 'main', false), 'Promotion', true, false],
  ['Promotion pointed at the collectors', wf('Promotion', '"kaal/**"', true), 'Promotion', true, false],
  ['Promotion without a merge queue and no merge group', wf('Promotion', 'main', false), 'Promotion', false, true],
  ['a merge group named only in a comment', wf('Promotion', 'main', true).replace('  merge_group:\n', '  # merge_group:\n'), 'Promotion', true, false],
  ['another job name', wf('Promotion', 'main', true).replace('(Promotion)', '(Other)'), 'Promotion', true, false],
  ['a Guard step that is only a comment', wf('Promotion', 'main', true).replace('- run: npx', '# run: npx'), 'Promotion', true, false],
  ['an action that is not pinned', wf('Promotion', 'main', true).replace(/@[0-9a-f]{40}/, '@v7'), 'Promotion', true, false],
];
export function run() {
  for (const [what, text, target, queued, want] of fixtures) assert.equal(judgeWorkflow(text, target, queued), want, `the judgment is wrong for ${what}`);
  for (const target of ['Integration', 'Promotion']) {
    const file = `analyze-vulnerabilities-${target.toLowerCase()}.yml`;
    const path = join(wiring, 'workflows', file);
    const ruleset = join(wiring, 'rulesets', `${target.toLowerCase()}.json`);
    assert.ok(existsSync(path), `the workflow source ${file} is absent`);
    assert.ok(existsSync(ruleset), `the ruleset source of ${target} is absent, so its merge queue is not known`);
    const queued = (JSON.parse(readFileSync(ruleset, 'utf8')).rules ?? []).some((r) => r.type === 'merge_queue');
    assert.ok(judgeWorkflow(readFileSync(path, 'utf8'), target, queued), `${file} does not report for the events of ${target}${queued ? ' including the merge group' : ''}`);
  }
}
