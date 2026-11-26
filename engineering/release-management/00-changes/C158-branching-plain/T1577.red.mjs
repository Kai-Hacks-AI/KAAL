// Case release/T1577 tests: release/C158. The source of the plain pull_request replacement of Branching exists and is shaped as the contract says: a plain pull_request trigger, no pull_request_target, a workflow name of its own (not KAAL, not another workflow's), the detective job name, and no use of kaal-guard (it runs the entry).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src/wiring/workflows/branching-plain.yml');
export const id = 'release/T1577';
export const tests = ['release/C158'];
export const title = 'the source of the plain pull_request replacement of Branching is shaped as its contract says';
export async function run() {
  assert.ok(existsSync(SRC), 'the source branching-plain.yml is absent');
  const text = readFileSync(SRC, 'utf8');
  assert.match(text, /^on:\s*\n\s+pull_request:/m, 'the trigger is not plain pull_request');
  assert.doesNotMatch(text, /^\s+pull_request_target:/m, 'the source must not use pull_request_target as a trigger');
  const name = /^name:\s*(.+?)\s*$/m.exec(text)?.[1];
  assert.equal(name, "Branching on pull_request", 'the workflow name');
  const others = readdirSync(join(repo, '.github/workflows')).concat(readdirSync(join(repo, 'engineering/release-management/05-src/wiring/workflows')).filter((f) => f !== 'branching-plain.yml'));
  assert.ok(!others.some((f) => [join(repo, '.github/workflows', f), join(repo, 'engineering/release-management/05-src/wiring/workflows', f)].some((p) => existsSync(p) && new RegExp('^name:\\s*' + name.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') + '\\s*$', 'm').test(readFileSync(p, 'utf8')))), 'the workflow name is not unique');
  assert.match(text, /^    name: Branching \\(plain pull_request\\)$/m, 'the detective job name');
  assert.doesNotMatch(text, /^    name: Branching$/m, 'it must not take the required context before the swap');
  assert.doesNotMatch(text, /kaal-guard/, 'it must not run kaal-guard');
  assert.match(text, /node engineering\/release-management\/05-src\/lineage\/judge-branching\.mjs/, 'it must run the entry');
}
