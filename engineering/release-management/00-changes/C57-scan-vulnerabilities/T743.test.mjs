// Case release/T743 tests: release/C57
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const WORKFLOW = join(RM, '05-src/wiring/workflows/scan-vulnerabilities.yml');
export const id = 'release/T743';
export const tests = ['release/C57'];
export const title = 'the workflow source of the scan runs daily and on request, reads main, states severity low, runtime scope and no exemption, and can only read';
export async function run() {
  assert.ok(existsSync(WORKFLOW), 'the workflow source is absent');
  const y = readFileSync(WORKFLOW, 'utf8');
  const code = y.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /^on:\n {2}schedule:\n {4}- cron: '[^']+'\n {2}workflow_dispatch:\n/m, 'the triggers are not exactly schedule and workflow_dispatch');
  assert.equal([...code.matchAll(/cron:/g)].length, 1, 'there is not exactly one cron');
  assert.ok(!/pull_request|merge_group|^ {2}push:/m.test(code), 'a change or merge trigger is present');
  assert.match(code, /^permissions:\n {2}contents: read\n/m, 'permissions are not contents: read only');
  assert.ok(!/: write/.test(code), 'a write permission is present');
  assert.ok(code.includes('name: scan Vulnerabilities (main)'), 'the job is not named scan Vulnerabilities (main)');
  assert.ok(code.includes('actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1'), 'checkout is not the pinned one of the analyze workflow');
  assert.ok(code.includes('npm audit --package-lock-only --omit=dev --json'), 'the audit does not read the lockfile at runtime scope');
  assert.ok(code.includes('scan.mjs'), 'the result is not interpreted by scan.mjs');
  assert.ok(!/--ignore|audit-level|allowlist|continue-on-error|\|\| true/i.test(code), 'an exemption or a swallowed failure is present');
}
