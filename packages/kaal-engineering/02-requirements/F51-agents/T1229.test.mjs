// Case engineering/T1229 tests: engineering/F51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
export const id = 'engineering/T1229';
export const tests = ['engineering/F51'];
export const title = 'four AGENTS.md, root on top, each with its purpose and verification, and only the one in dist ships and points to a Skill';
export async function run() {
  const t = template();
  assert.equal(t.agents.length, 4, 'four AGENTS.md');
  assert.equal(new Set(t.agents.map((a) => a.path)).size, 4, 'the four paths differ');
  for (const a of t.agents) { assert.ok(a.serves, `${a.path} does not say what it serves`); assert.ok(a.verifiedBy, `${a.path} does not say what verifies it`); }
  assert.equal(t.agents[0].path, 'AGENTS.md', 'the repository root AGENTS.md is not on top');
  assert.ok(t.agents.some((a) => a.path === 'packages/AGENTS.md'), 'the cross-package AGENTS.md is absent');
  const shipped = t.agents.filter((a) => a.ships);
  assert.equal(shipped.length, 1, 'exactly one AGENTS.md ships');
  const d = shipped[0];
  assert.ok(d.path.includes('/dist/'), 'the shipped AGENTS.md is not under dist');
  assert.equal(d.from, '13-source', 'the shipped AGENTS.md is not built from the source');
  assert.equal(d.verifiedBy, 'build');
  assert.ok(/SKILL\.md$/.test(d.pointsTo), 'the shipped AGENTS.md does not point to a Skill');
  assert.equal(d.repeatsSkill, false);
  assert.ok(t.agents.filter((a) => !a.ships).every((a) => a.verifiedBy === 'review'), 'the AGENTS.md that guide work are verified by review');
}
