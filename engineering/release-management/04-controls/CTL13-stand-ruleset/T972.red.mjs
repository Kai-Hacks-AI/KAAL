// Case release/T972 tests: release/CTL13
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T972';
export const tests = ['release/CTL13'];
export const title = 'release/CTL13 and its chain, Intent release/I41, Requirement release/F58 and Architecture release/A53, are declared as drafted: each file exists and equals its draft, and the control is preventive with that one Intent';
const draft = (name) => readFileSync(join(RM, '00-changes/C76-ruleset-standing/interface.md'), 'utf8').split(new RegExp('^## Draft of ' + name + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1] + '\n';
export async function run() {
  for (const [name, rel] of [['I41.md', '01-intent/I41-ruleset-stands/I41.md'], ['CTL13.md', '04-controls/CTL13-stand-ruleset/CTL13.md'], ['F58.md', '02-requirements/F58-ruleset-standing/F58.md'], ['A53.md', '03-architecture/A53-ruleset-standing/A53.md']]) {
    assert.ok(existsSync(join(RM, rel)), name + ' is not declared');
    assert.equal(readFileSync(join(RM, rel), 'utf8'), draft(name), name + ' differs from its draft');
  }
  const control = readFileSync(join(RM, '04-controls/CTL13-stand-ruleset/CTL13.md'), 'utf8');
  assert.match(control, /^type: preventive$/m);
  assert.match(control, /^has: \[release\/I41\]$/m, 'the control does not have exactly the Intent');
}
