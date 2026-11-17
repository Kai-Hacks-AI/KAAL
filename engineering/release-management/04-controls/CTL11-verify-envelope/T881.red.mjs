// Case release/T881 tests: release/CTL11
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const real = join(repo, 'engineering/release-management/04-controls/CTL11-verify-envelope/CTL11.md');
export const id = 'release/T881';
export const tests = ['release/CTL11'];
export const title = 'release/CTL11 states that it judges the envelope and not the truth of what is written, that PASS authorizes nothing, and names its three instances with their stages';
export async function run() {
  assert.ok(existsSync(real), 'CTL11.md is absent');
  const text = readFileSync(real, 'utf8').replace(/\s+/g, ' ');
  assert.match(text, /judges the envelope only/, 'the scope is not stated');
  assert.match(text, /never judges whether what is written is true/, 'content truth is not excluded');
  assert.match(text, /PASS is not an approval and not a merge decision/, 'PASS is not limited');
  assert.match(text, /UNKNOWN when a fact could not be read, which never passes/, 'UNKNOWN is not stated');
  for (const instance of ['the command line', 'the pre-push hook', 'CI on the pull request']) assert.ok(text.includes(instance), `the instance "${instance}" is not named`);
  assert.match(text, /Only the CI run can later be required by a ruleset/, 'the gate boundary is not stated');
  assert.ok(!/^status:/m.test(readFileSync(real, 'utf8')), 'a status line is declared before the finder knows it');
}
