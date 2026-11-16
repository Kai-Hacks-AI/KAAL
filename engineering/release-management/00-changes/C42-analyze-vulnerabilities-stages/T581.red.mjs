// Case release/T581 tests: G69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const here = join(repo, 'engineering/release-management/00-changes/C42-analyze-vulnerabilities-stages');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const needs = () => JSON.parse(read(join(here, 'ruleset-needs.json'), 'the proposed needs'));
export const id = 'release/T581';
export const tests = ['release/G69'];
export const title = 'gap release/G69 is closed: the integrating and promoting sources require their context, additively';
export function run() {
  for (const p of needs().per_stage) {
    const json = JSON.parse(read(join(wiring, `rulesets/${p.ruleset}.json`), `the ${p.ruleset} source`));
    const checks = json.rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks;
    const own = checks.filter((c) => c.context === p.context);
    assert.equal(own.length, 1, `${p.ruleset} requires ${p.context} exactly once`);
    assert.equal(own[0].integration_id, p.integration_id, 'the integration id is GitHub Actions');
    assert.ok(checks.some((c) => /^verify Stages \(/.test(c.context)), 'the verify Stages check is kept');
  }
}
