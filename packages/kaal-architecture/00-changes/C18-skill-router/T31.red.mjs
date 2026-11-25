// Case architecture/T31 tests: architecture/F20
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { dir, read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T31';
export const tests = ['architecture/F20'];
export const title = 'the detail is in references: the Skill directory holds SKILL.md and references only, every reference exists, and the router names each one by its relative path';
export function run() {
  const root = join(dir, 'skills/kaal-architecture');
  assert.deepEqual(readdirSync(root).sort(), ['SKILL.md', 'references'], 'the Skill directory holds more or less than SKILL.md and references');
  const refs = join(root, 'references');
  assert.ok(existsSync(refs), 'there is no references folder');
  const files = readdirSync(refs).filter((f) => f.endsWith('.md'));
  assert.ok(files.length > 0, 'references holds no Markdown file');
  assert.deepEqual(readdirSync(refs).filter((f) => !f.endsWith('.md')), [], 'references holds a file that is not Markdown');
  const skill = read(SKILL, 'the Skill');
  for (const f of files) assert.ok(skill.includes(`references/${f}`), `the router never names references/${f}`);
  const named = [...skill.matchAll(/references\/([A-Za-z0-9._-]+\.md)/g)].map((m) => m[1]);
  for (const n of named) assert.ok(files.includes(n), `the router names references/${n}, which is absent`);
}
