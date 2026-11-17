// Case release/T581 tests: G69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const here = join(repo, 'engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const needs = () => JSON.parse(read(join(here, 'stage-reports.json'), 'the proposed needs'));
export const id = 'release/T581';
export const tests = ['release/G69'];
export const title = 'gap release/G69 is closed: the detective report is stated per stage and no ruleset source requires it';
export function run() {
  const text = read(join(wiring, 'rulesets/controls.md'), 'the controls table');
  assert.match(text, /detective reports/i, 'controls.md has no section of detective reports');
  for (const p of needs().per_stage) {
    assert.ok(text.split('\n').some((line) => line.includes(p.stage) && line.includes(p.context)), `controls.md does not tie ${p.context} to ${p.stage}`);
  }
  for (const name of ['integrating', 'collecting', 'hotfixing', 'wiring', 'promoting', 'publishing']) {
    const file = join(wiring, `rulesets/${name}.json`);
    if (!existsSync(file)) continue;
    assert.ok(!/analyze Vulnerabilities/.test(readFileSync(file, 'utf8')), `${name} requires a detective report: that is enforcement, a separate control`);
  }
}
