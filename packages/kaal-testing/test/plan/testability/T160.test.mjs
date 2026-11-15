// Case testing/T160 tests: testing/N27
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { HEADING, PKG, readJson, skillParts } from './lib.mjs';
export const id = 'testing/T160';
export const tests = ['testing/N27'];
export const title = 'the Change stays inside its boundary: one new section in the Skill, no new export, Node, Skill or workflow, and no dependency on kaal-review';
export function run() {
  const { headings } = skillParts();
  assert.deepEqual(headings, ['Before writing a test', 'Assessing a test against its claim', 'The three loops', 'Running acceptance', 'Measuring coverage', 'Reporting', 'Rules'].map((h) => h === HEADING ? HEADING : h), 'the Skill has exactly one new section, in place');
  assert.deepEqual(Object.keys(readJson(join(PKG, 'package.json')).exports).sort(), ['./acceptance', './attribution', './contracts', './coverage', './duplicates', './inventory', './package.json', './report'], 'no export is added or removed');
  assert.deepEqual(readdirSync(join(PKG, 'skills')), ['kaal-testing'], 'no Skill is added');
  assert.deepEqual(readdirSync(join(PKG, 'skills/kaal-testing')).sort(), ['SKILL.md', 'references'], 'the Skill folder holds the same files');
  assert.deepEqual(readdirSync(join(PKG, 'capability')), ['Testing.md'], 'no capability Node is added');
  assert.deepEqual(readdirSync(join(PKG, 'payload')), ['Testing.md'], 'no Skill Node is added');
  const pkg = readJson(join(PKG, 'package.json'));
  for (const d of [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies, pkg.optionalDependencies]) assert.ok(!Object.keys(d ?? {}).some((n) => /kaal-review/.test(n)), 'no dependency on kaal-review');
  assert.ok(!existsSync(join(PKG, '.github')) && !existsSync(join(PKG, 'lib/testability.mjs')), 'no workflow, and no new module');
}
