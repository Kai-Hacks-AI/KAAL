// Case release/T186 tests: F17. Amended in release/C138: a title DEFAULT: <description> is not judged by DEFAULT chapters, it is a finding (an invalid route, release/F19).
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const src = join(repo, 'engineering/release-management/05-src/plan-body');
export const id = 'release/T186';
export const tests = ['release/F17'];
export const title = 'a title DEFAULT: <description> is a finding whose reason names DEFAULT as an invalid route, whatever its body and with or without a registry entry; a specialized TYPE is judged by its own declared chapters; a TYPE nobody declared is not judged and is never a pass';
export async function run() {
  const { readDeclarations } = await import(pathToFileURL(join(src, 'declarations.mjs')).href);
  const { verifyEnvelope } = await import(pathToFileURL(join(src, 'envelope.mjs')).href);
  const d = (type, names) => ({ type, chapters: names.map((name) => ({ name, guidance: 'g' })) });
  const types = { types: [{ type: 'PLAN', owner: 'a' }, { type: 'DO', owner: 'a' }], invalid: ['DEFAULT'] };
  const { registry, invalid, unknown } = readDeclarations({ types, declarations: { a: { types: [d('PLAN', ['Change', 'From', 'To', 'Because'])] } } });
  const options = { invalid, unknown };
  const defaultBody = '## Change\n\nSpelling of the readme.\n\n## Because\n\nIt reads better.\n';
  const planBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const facts = { title: 'DEFAULT: Fix the spelling of the readme', body: defaultBody, base: 'main', head: 'claude/x' };

  for (const body of [defaultBody, planBody]) {
    const judged = verifyEnvelope({ ...facts, body }, registry, options);
    assert.equal(judged.ok, false, 'a DEFAULT title is accepted');
    assert.ok(judged.problems.some((p) => /DEFAULT/.test(p) && /invalid/i.test(p) && /route/i.test(p)), 'the finding does not name DEFAULT as an invalid route');
  }
  assert.equal(verifyEnvelope(facts, { ...registry, DEFAULT: ['Change', 'Because'] }, options).ok, false, 'a registry entry for DEFAULT makes DEFAULT valid');
  assert.equal(verifyEnvelope(facts, registry).ok, false, 'a DEFAULT title is accepted when the invalid list is not passed on');

  // a declared specialized TYPE is judged; the DEFAULT chapters never judge it
  const plan = verifyEnvelope({ title: 'PLAN: Create a sample', body: planBody, base: 'kaal/release/sample', head: 'claude/x', commits: [] }, registry, options);
  assert.ok(!plan.problems?.some((p) => /DEFAULT/.test(p)), 'a PLAN is judged as DEFAULT');
  assert.equal(verifyEnvelope({ title: 'PLAN: Create a sample', body: defaultBody, base: 'kaal/release/sample', head: 'claude/x', commits: [] }, registry, options).ok, false, 'a PLAN written to the DEFAULT chapters is accepted');

  // a TYPE nobody declared is UNKNOWN: not judged, complete is false, never a pass
  const undeclared = verifyEnvelope({ title: 'DO: Do a sample', body: planBody, base: 'kaal/release/sample', head: 'claude/x', commits: [] }, registry, options);
  assert.equal(undeclared.complete, false, 'a TYPE without a declaration is reported as completely judged');
  assert.ok(undeclared.notJudged.some((n) => /DO/.test(n) && /unknown|no declaration/i.test(n)), 'a TYPE without a declaration is not reported as UNKNOWN');
}
