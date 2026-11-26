// Case release/T185 tests: A40. Amended in release/C138: DEFAULT is not a TYPE and is never registered (it was registered when a default file declared it, release/F19).
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/declarations.mjs');
export const id = 'release/T185';
export const tests = ['release/A40'];
export const title = 'the declaration reader never registers DEFAULT: a declaration of it, a TYPE named DEFAULT in the type list, or the absence of DEFAULT from the invalid list is a finding with its own reason, and the specialized TYPEs stay';
export async function run() {
  const { readDeclarations } = await import(pathToFileURL(reader).href);
  const d = (type, names) => ({ type, chapters: names.map((name) => ({ name, guidance: 'g' })) });
  const types = { types: [{ type: 'PLAN', owner: 'a' }], invalid: ['DEFAULT'] };
  const plan = d('PLAN', ['Change', 'From', 'To', 'Because']);

  const declared = readDeclarations({ types, declarations: { a: { types: [plan, d('DEFAULT', ['Change', 'Because'])] } } });
  assert.equal(declared.registry.DEFAULT, undefined, 'DEFAULT is registered');
  assert.deepEqual(declared.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the specialized TYPE is lost beside DEFAULT');
  assert.ok(declared.findings.some((f) => /DEFAULT/.test(f) && /invalid/i.test(f)), 'a declared DEFAULT is not reported as invalid');
  assert.ok(declared.invalid.includes('DEFAULT'), 'DEFAULT is not passed on as invalid');

  const listed = readDeclarations({ types: { types: [...types.types, { type: 'DEFAULT', owner: 'a' }], invalid: ['DEFAULT'] }, declarations: { a: { types: [plan] } } });
  assert.equal(listed.registry.DEFAULT, undefined, 'DEFAULT in the type list is registered');
  assert.ok(listed.findings.some((f) => /DEFAULT/.test(f)), 'DEFAULT in the type list is not a finding');

  const unnamed = readDeclarations({ types: { types: types.types }, declarations: { a: { types: [plan] } } });
  assert.ok(unnamed.findings.some((f) => /DEFAULT/.test(f) && /invalid/i.test(f)), 'a type list that does not name DEFAULT invalid is accepted');
}
