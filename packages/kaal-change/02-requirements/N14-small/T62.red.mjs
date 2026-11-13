// Case change/T62 tests: change/N14
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T62';
export const tests = ['change/N14'];
export const title = "the Skill is small and the additions add no gate, workflow, hook or ruleset";
export function run() {
  assert.ok(read(SKILL, 'the Skill').split('\n').length <= 100, 'the Skill is longer than 100 lines');
  const found = [];
  const walk = (d) => { for (const name of readdirSync(d)) { const p = join(d, name); if (statSync(p).isDirectory()) walk(p); else found.push(p.slice(dir.length + 1)); } };
  for (const sub of ['00-changes/C10-transition', 'skills/kaal-change-transition']) if (existsSync(join(dir, sub))) walk(join(dir, sub));
  assert.deepEqual(found.filter((f) => /(^|\/)\.(github|githooks)\//.test(f) || /\.ya?ml$/.test(f) || /ruleset/i.test(f)), [], 'the package carries a workflow, hook, gate or ruleset');
}
