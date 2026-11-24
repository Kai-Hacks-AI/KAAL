// Case release/T1132 tests: release/CTL20
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1132';
export const tests = ['release/CTL20'];
export const title = 'the promoting source requires verify Triggers as a third check, named as the job of the workflow source, and the integrating source is unchanged';
export async function run() {
  const real = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/promoting.json'), 'utf8'));
  const rule = (j) => j.rules.find((r) => r.type === 'required_status_checks');
  assert.deepEqual(rule(real), rule(JSON.parse(draft('promoting.json'))), 'the required checks of promoting.json differ from the draft');
  const checks = real.rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks;
  assert.deepEqual(checks.map((c) => c.context), ['verify Stages (Promoting)', 'analyze Vulnerabilities (Promoting)', 'verify Triggers']);
  assert.equal(new Set(checks.map((c) => c.integration_id)).size, 1, 'the checks come from different integrations');
  assert.equal(real.rules.find((r) => r.type === 'required_status_checks').parameters.do_not_enforce_on_create, false);
  // derived from the real workflow source, not kept by hand: the required name is the job name
  const wf = readFileSync(join(RM, '05-src/wiring/workflows/verify-triggers.yml'), 'utf8');
  const job = wf.match(/^ {4}name: (.+)$/m)?.[1];
  assert.equal(job, 'verify Triggers');
  assert.ok(checks.some((c) => c.context === job), 'no required check is named as the job');
  const integrating = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8'));
  assert.ok(!JSON.stringify(integrating).includes('verify Triggers'), 'the integrating source requires verify Triggers');
}
