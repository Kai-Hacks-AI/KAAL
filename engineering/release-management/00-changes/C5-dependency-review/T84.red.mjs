// Case release/T84 tests: G24
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T84';
export const tests = ['release/G24'];
export const title = 'gap release/G24 is closed: the needed contexts are recorded and the rulesets list them';
export function run() {
  const needs = JSON.parse(read(join(cap, '00-changes/C5-dependency-review/ruleset-needs.json'), 'ruleset-needs.json'));
  assert.ok(needs.rulesets.length >= 1, 'no ruleset is named');
  for (const r of needs.rulesets) {
    const after = read(join(cap, `00-changes/C5-dependency-review/rulesets-after/${r.id}.json`), `the export of ruleset ${r.id} after the change`);
    assert.ok(after.includes(needs.context.name), `ruleset ${r.name} does not list ${needs.context.name}`);
  }
}
