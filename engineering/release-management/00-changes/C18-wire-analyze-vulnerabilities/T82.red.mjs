// Case release/T82 tests: G22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T82';
export const tests = ['release/G22'];
export const title = 'gap release/G22 is closed: Guard declares analyze Vulnerabilities for ci, running its adapter';

// The judgment, kept apart from the repository so that it can be shown on declarations of known shape.
export function declaresForCi(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return false;
  const field = (name) => new RegExp(`^${name}:[ \\t]*(.*?)[ \\t]*$`, 'm').exec(m[1])?.[1];
  const runs = /^\[(.*)\]$/.exec(field('runs') ?? '');
  return field('type') === 'Guard/Check'
    && /(^|\s)node\s+\S*vulnerability-analysis\/analyze\.mjs(\s|$)/.test(field('command') ?? '')
    && runs !== null && runs[1].split(',').map((s) => s.trim()).includes('ci');
}

const valid = '---\ntype: Guard/Check\ncommand: node engineering/release-management/05-src/vulnerability-analysis/analyze.mjs\nruns: [ci]\n---\n\nBody.\n';
const fixtures = [
  ['a valid declaration', valid, true],
  ['ci among other places', valid.replace('[ci]', '[development, ci]'), true],
  ['no ci place', valid.replace('[ci]', '[development]'), false],
  ['a runs list that is not a list', valid.replace('[ci]', 'ci'), false],
  ['a name that only contains ci', valid.replace('[ci]', '[cinema]'), false],
  ['another type', valid.replace('Guard/Check', 'Guard/Other'), false],
  ['another command', valid.replace(/command: .*/, 'command: node other.mjs'), false],
  ['no frontmatter', 'runs: [ci]\n', false],
];

export function run() {
  for (const [what, text, want] of fixtures) assert.equal(declaresForCi(text), want, `the judgment is wrong for ${what}`);
  const file = join(repo, '.kaal/config/guard/Analyze-Vulnerabilities.md');
  assert.ok(existsSync(file), 'no Guard declaration Analyze-Vulnerabilities is present');
  assert.ok(declaresForCi(readFileSync(file, 'utf8')), 'the Guard declaration does not run the adapter in ci');
}
