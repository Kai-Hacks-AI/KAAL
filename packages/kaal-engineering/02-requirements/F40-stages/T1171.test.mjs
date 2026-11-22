// Case engineering/T1171 tests: engineering/F40
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1171';
export const tests = ['engineering/F40'];
export const title = 'the Skill names the four stages and the role of each, and says engineering/<cap> is optional';
export async function run() {
  for (const d of ['packages', 'engineering', '.kaal']) assert.ok(existsSync(join(root, d)), `${d} is a root of this repository and the Skill may name it`);
  const t = skill();
  for (const s of ['packages/<cap>', 'engineering/<cap>', 'npmjs', '.kaal/<cap>']) assert.ok(t.includes(s), `the Skill does not name the stage ${s}`);
  assert.match(t, /packages\/<cap>[^\n]*develop/i, 'packages/<cap> is where the capability is developed');
  assert.match(t, /engineering\/<cap>[^\n]*(unpublished|N\+1)/i, 'engineering/<cap> uses the unpublished N+1');
  assert.match(t, /npmjs[^\n]*publish/i, 'npmjs publishes N');
  assert.match(t, /\.kaal\/<cap>[^\n]*\bN\b/, '.kaal/<cap> uses the published N');
  assert.match(t, /engineering\/<cap>[^\n]*optional|optional[^\n]*engineering\/<cap>/i, 'the Skill says engineering/<cap> is optional');
}
