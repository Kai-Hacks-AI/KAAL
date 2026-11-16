// Case release/T580 tests: G69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const here = join(repo, 'engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const needs = () => JSON.parse(read(join(here, 'stage-reports.json'), 'the proposed needs'));
export const id = 'release/T580';
export const tests = ['release/G69'];
export const title = 'gap release/G69 is closed: the controls table lists the control as a detective report of each stage, required by no ruleset';
export function run() {
  const text = read(join(wiring, 'rulesets/controls.md'), 'the controls table');
  for (const p of needs().per_stage) {
    assert.ok(text.includes(p.context), `controls.md lists ${p.context}`);
  }
  assert.match(text, /analyze Vulnerabilities[^\n]*detective[^\n]*required by no ruleset/i, 'the control is not listed as detective and required by no ruleset');
  {
  }
}
