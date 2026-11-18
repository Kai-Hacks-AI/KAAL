// Case release/T982 tests: release/CTL14
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T982';
export const tests = ['release/CTL14'];
export const title = 'release/CTL14 and its chain, Intent release/I42, Requirement release/F59 and Architecture release/A54, are declared as drafted: each file exists and equals its draft, and the control is preventive with that one Intent';
const draft = (name) => readFileSync(join(RM, '00-changes/C77-check-policy/interface.md'), 'utf8').split(new RegExp('^## Draft of ' + name + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1] + '\n';
export async function run() {
  for (const [name, rel] of [['I42.md', '01-intent/I42-check-policy/I42.md'], ['CTL14.md', '04-controls/CTL14-settle-check-policy/CTL14.md'], ['F59.md', '02-requirements/F59-check-policy/F59.md'], ['A54.md', '03-architecture/A54-check-policy/A54.md']]) {
    assert.ok(existsSync(join(RM, rel)), name + ' is not declared');
    assert.equal(readFileSync(join(RM, rel), 'utf8'), draft(name), name + ' differs from its draft');
  }
  const control = readFileSync(join(RM, '04-controls/CTL14-settle-check-policy/CTL14.md'), 'utf8');
  assert.match(control, /^type: preventive$/m);
  assert.match(control, /^has: \[release\/I42\]$/m, 'the control does not have exactly the Intent');
}
