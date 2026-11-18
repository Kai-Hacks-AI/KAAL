// Case release/T992 tests: release/CTL15
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T992';
export const tests = ['release/CTL15'];
export const title = 'release/CTL15 and its chain, Intent release/I43, Requirement release/F60 and Architecture release/A55, are declared as drafted: each file exists and equals its draft, and the control is preventive with that one Intent';
const draft = (name) => readFileSync(join(RM, '00-changes/C78-tag-immutable/interface.md'), 'utf8').split(new RegExp('^## Draft of ' + name + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1] + '\n';
export async function run() {
  for (const [name, rel] of [['I43.md', '01-intent/I43-published-tag-immutable/I43.md'], ['CTL15.md', '04-controls/CTL15-hold-published-tag/CTL15.md'], ['F60.md', '02-requirements/F60-published-tag/F60.md'], ['A55.md', '03-architecture/A55-published-tag/A55.md']]) {
    assert.ok(existsSync(join(RM, rel)), name + ' is not declared');
    assert.equal(readFileSync(join(RM, rel), 'utf8'), draft(name), name + ' differs from its draft');
  }
  const control = readFileSync(join(RM, '04-controls/CTL15-hold-published-tag/CTL15.md'), 'utf8');
  assert.match(control, /^type: preventive$/m);
  assert.match(control, /^status: implemented$/m, 'the control does not declare the status it has on main (DIRT: Implemented)');
  assert.match(control, /^has: \[release\/I43\]$/m, 'the control does not have exactly the Intent');
}
