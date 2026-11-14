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
export const title = 'the workflow sources report their check for pull requests and the merge group under the job name a ruleset can require';

// The judgment, kept apart from the repository so that it can be shown on workflows of known shape.
export function judgeWorkflow(text, jobName) {
  const code = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l)).join('\n');
  const on = /^on:[ \t]*\n((?:[ \t]+.*\n?|\n)*)/m.exec(code)?.[1] ?? '';
  return /^ {2}pull_request:/m.test(on) && /^ {2}merge_group:/m.test(on)
    && code.includes(`name: ${jobName}`)
    && /^\s*-?\s*run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github\s*$/m.test(code)
    && /^\s*-?\s*uses: \S+@[0-9a-f]{40}\b/m.test(code);
}
const good = [
  'name: KAAL release', 'on:', '  pull_request:', '  merge_group:', 'jobs:', '  j:', '    name: analyze Vulnerabilities (Promotion)', '    steps:',
  '      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1', '      - run: npx --no kaal-guard run --check Analyze-Vulnerabilities --github', '',
].join('\n');
const fixtures = [
  ['the intended workflow', good, true],
  ['no merge group', good.replace('  merge_group:\n', ''), false],
  ['no pull request', good.replace('  pull_request:\n', ''), false],
  ['another job name', good.replace('(Promotion)', '(Other)'), false],
  ['a Guard step that is only a comment', good.replace('- run: npx', '# run: npx'), false],
  ['an action that is not pinned', good.replace(/@[0-9a-f]{40}/, '@v7'), false],
  ['a merge group named only in a comment', good.replace('  merge_group:\n', '  # merge_group:\n'), false],
];
export function run() {
  for (const [what, text, want] of fixtures) assert.equal(judgeWorkflow(text, 'analyze Vulnerabilities (Promotion)'), want, `the judgment is wrong for ${what}`);
  for (const [file, target] of [['analyze-vulnerabilities-integration.yml', 'Integration'], ['analyze-vulnerabilities-promotion.yml', 'Promotion']]) {
    const path = join(wiring, 'workflows', file);
    assert.ok(existsSync(path), `the workflow source ${file} is absent`);
    assert.ok(judgeWorkflow(readFileSync(path, 'utf8'), `analyze Vulnerabilities (${target})`), `${file} does not report for pull requests and the merge group under its job name`);
  }
}
