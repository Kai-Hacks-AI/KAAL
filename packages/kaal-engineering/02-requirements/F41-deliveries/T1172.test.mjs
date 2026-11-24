// Case engineering/T1172 tests: engineering/F41
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1172';
export const tests = ['engineering/F41'];
export const title = 'the Skill names .agents, .claude, .github and .githooks as deliveries, installed copies placed by WIRE, and points to kaal-release for WIRE';
export async function run() {
  for (const d of ['.github', '.githooks']) assert.ok(existsSync(join(root, d)), `${d} is a delivery in this repository`);
  assert.ok(existsSync(join(root, 'packages/kaal-release')), 'kaal-release is the owner WIRE points to');
  const t = skill();
  for (const s of ['.agents', '.claude', '.github', '.githooks']) assert.ok(t.includes(s), `the Skill does not name the delivery ${s}`);
  assert.match(t, /installed cop(y|ies)/i, 'the deliveries are installed copies');
  const wire = t.split('\n').filter((l) => /\bWIRE\b/.test(l));
  assert.ok(wire.length > 0, 'the Skill says the deliveries are placed by WIRE');
  for (const l of wire) assert.match(l, /see kaal-release/, `a line names WIRE without pointing to kaal-release: ${l}`);
}
