// Case controls/T14 tests: N4
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T14';
export const tests = ['controls/N4'];
export const title = 'Controls restates no other capability, keeps no registry, and its Node and Definition name no platform';
export function run() {
  const node = read('capability/Controls.md', 'the Controls Node'); const def = read('payload/Control.md', 'the Control Definition'); const skill = read('skills/kaal-controls/SKILL.md', 'the Agent Skill');
  for (const [text, what] of [[node, 'the Controls Node'], [def, 'the Control Definition']]) assert.ok(!/github|pull request|workflow|ruleset|branch/i.test(text), `${what} names a platform`);
  for (const [text, what] of [[node, 'the Controls Node'], [skill, 'the Agent Skill']]) { has(text, ['Testing'], what); assert.ok(!/verification is|validation is/i.test(text), `${what} restates Testing`); }
  assert.ok(!/Realized by/.test(node + def + skill), 'a Realized by edge is defined');
  const files = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) walk(join(d, e.name)); else files.push(e.name); } };
  walk(pkg); assert.ok(!files.some((f) => /registry/i.test(f)), 'a registry file exists');
}
