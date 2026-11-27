// Case architecture/T15 tests: architecture/N1
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, skillText } from '../../test/lib.mjs';
export const id = 'architecture/T15';
export const tests = ['architecture/N1'];
export const title = "the Skill, router and references together, names no organization, domain, tool or technology, and the package adds no gate";
export function run() {
  const skill = skillText();
  const banned = /\b(kaal|github|git|pull request|branch|collector|promotion|gap|ledger|repository|software|code|api|server|workflow|lifecycle|hospital|bridge|kitchen|museum)\b/i;
  const hit = skill.split(/^---$/m).slice(2).join('---').match(banned);
  assert.equal(hit, null, `the Skill names ${hit && hit[0]}`);
  const found = [];
  const walk = (d) => { for (const name of readdirSync(d)) { const p = join(d, name); if (statSync(p).isDirectory()) walk(p); else found.push(p.slice(dir.length + 1)); } };
  walk(dir);
  assert.deepEqual(found.filter((f) => /(^|\/)\.github\//.test(f) || /\.ya?ml$/.test(f)), [], 'the package carries a workflow or a gate');
}
