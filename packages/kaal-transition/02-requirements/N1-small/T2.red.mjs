// Case transition/T2 tests: transition/N1
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T2';
export const tests = ['transition/N1'];
export const title = "the Skill is small and the package adds no gate, workflow, hook or ruleset";
export function run() {
  assert.ok(read(SKILL, 'the Skill').split('\n').length <= 100, 'the Skill is longer than 100 lines');
  const found = [];
  const walk = (d) => { for (const name of readdirSync(d)) { const p = join(d, name); if (statSync(p).isDirectory()) walk(p); else found.push(p.slice(dir.length + 1)); } };
  walk(dir);
  assert.deepEqual(found.filter((f) => /(^|\/)\.(github|githooks)\//.test(f) || /\.ya?ml$/.test(f) || /ruleset/i.test(f)), [], 'the package carries a workflow, hook, gate or ruleset');
}
