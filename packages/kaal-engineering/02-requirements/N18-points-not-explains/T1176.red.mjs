// Case engineering/T1176 tests: engineering/N18
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1176';
export const tests = ['engineering/N18'];
export const title = 'the Skill names a term another capability owns only on a line that points to the owner, and never has a section for it';
export async function run() {
  const owners = { WIRE: 'kaal-release', 'Test Case': 'kaal-testing', DIRT: 'kaal-controls', registration: 'kaal-core' };
  const t = skill();
  for (const [term, owner] of Object.entries(owners)) {
    assert.ok(existsSync(join(root, 'packages', owner)), `${owner} owns ${term} and must exist`);
    for (const l of t.split('\n').filter((x) => x.includes(term))) {
      assert.ok(l.includes(`see ${owner}`), `a line names ${term} without pointing to ${owner}: ${l}`);
      assert.ok(!/^#+\s/.test(l), `${term} has a section of its own in the Skill: ${l}`);
    }
  }
  assert.ok(t.split('\n').some((l) => /see kaal-/.test(l)), 'the Skill points to at least one owner');
}
