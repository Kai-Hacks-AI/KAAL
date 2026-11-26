// Case release/T164 tests: A40. Amended in release/C138: the reader reads the owners' declarations, not templates; it replaces readTemplates.
// The seven-TYPE reader Case is release/T1541; this one pins the parts of the old Case that stay true, in the declaration form.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/declarations.mjs');
export const id = 'release/T164';
export const tests = ['release/A40'];
export const title = 'the declaration reader registers the chapters its owners declared, reports malformed, duplicate, foreign and chapterless declarations as findings without registering them, reads no template and no comment syntax, and takes DEFAULT as invalid';
export async function run() {
  const mod = await import(pathToFileURL(reader).href);
  assert.equal(mod.readTemplates, undefined, 'the template parser is still exported');
  const { readDeclarations } = mod;
  const d = (type, names) => ({ type, chapters: names.map((name) => ({ name, guidance: 'g' })) });
  const types = { types: [{ type: 'PLAN', owner: 'a' }, { type: 'SYNC', owner: 'b' }], invalid: ['DEFAULT'] };

  const ok = readDeclarations({ types, declarations: { a: { types: [d('PLAN', ['Change', 'From', 'To', 'Because'])] }, b: { types: [d('SYNC', ['Reason'])] } } });
  assert.deepEqual(ok.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the chapters of a declaration are not kept');
  assert.deepEqual(ok.registry.SYNC, ['Reason'], 'a second owner is not read');
  assert.equal(ok.findings.length, 0);
  assert.equal(ok.registry.DEFAULT, undefined, 'DEFAULT is registered');

  // findings, each unregistered
  const one = (decl) => readDeclarations({ types, declarations: { a: { types: decl }, b: { types: [d('SYNC', ['Reason'])] } } });
  assert.ok(one([d('plan', ['Change'])]).findings.length > 0, 'a lower-case TYPE is accepted');
  assert.ok(one([{ type: '', chapters: [] }]).findings.length > 0, 'an empty TYPE is accepted');
  const dup = one([d('PLAN', ['Change']), d('PLAN', ['Change', 'From'])]);
  assert.ok(dup.findings.some((f) => /duplicate|ambiguous/i.test(f)), 'a duplicate TYPE is not reported');
  assert.equal(dup.registry.PLAN, undefined, 'an ambiguous TYPE is in the registry');
  assert.ok(one([d('PLAN', [])]).findings.length > 0, 'a TYPE without chapters is accepted');
  assert.ok(one([d('SYNC', ['Reason'])]).findings.some((f) => /SYNC/.test(f)), 'a declaration by a capability that does not own the TYPE is accepted');

  // DEFAULT is invalid
  assert.ok(one([d('DEFAULT', ['Change', 'Because'])]).findings.some((f) => /DEFAULT/.test(f) && /invalid/i.test(f)), 'a declaration of DEFAULT is accepted');

  // no recognition by text: a comment, a heading or a declaration line in a chapter is only a name
  const odd = one([d('PLAN', ['<!-- KAAL-PR-template: DEFAULT -->'])]);
  assert.equal(odd.registry.DEFAULT, undefined, 'a comment declaration is read as a template declaration');
}
