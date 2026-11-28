// Case release/T1576 tests: release/C157. The source of the plain pull_request replacement of Change Isolation (review) admission exists and is shaped as the contract says: a plain pull_request trigger, no pull_request_target, a workflow name of its own (not KAAL, not another workflow's), the job name that takes the required context, and no use of kaal-guard.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src/wiring/workflows/change-isolation-admission-plain.yml');
export const id = 'release/T1576';
export const tests = ['release/C157'];
export const title = 'the source of the plain pull_request replacement of Change Isolation (review) admission is shaped as its contract says';
export async function run() {
  assert.ok(existsSync(SRC), 'the source change-isolation-admission-plain.yml is absent');
  const text = readFileSync(SRC, 'utf8');
  assert.match(text, /^on:\s*\n\s+pull_request:/m, 'the trigger is not plain pull_request');
  assert.doesNotMatch(text, /^\s+pull_request_target:/m, 'the source must not use pull_request_target as a trigger');
  const name = /^name:\s*(.+?)\s*$/m.exec(text)?.[1];
  assert.equal(name, "Change Isolation admission on pull_request", 'the workflow name');
  const others = readdirSync(join(repo, '.github/workflows')).concat(readdirSync(join(repo, 'engineering/release-management/05-src/wiring/workflows'))).filter((f) => f !== 'change-isolation-admission-plain.yml');
  assert.ok(!others.some((f) => [join(repo, '.github/workflows', f), join(repo, 'engineering/release-management/05-src/wiring/workflows', f)].some((p) => existsSync(p) && new RegExp('^name:\\s*' + name.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') + '\\s*$', 'm').test(readFileSync(p, 'utf8')))), 'the workflow name is not unique');
  assert.match(text, /^    name: Change Isolation \(review\)$/m, 'the job takes the required context (release/C168)');
  assert.match(text, /permissions: \{\}/, 'no permission at all');
  assert.doesNotMatch(text, /actions\/checkout|secrets\./, 'no checkout and no secret');
}
