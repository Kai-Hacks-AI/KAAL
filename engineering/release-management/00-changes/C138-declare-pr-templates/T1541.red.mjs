// Case release/T1541 tests: release/A40. The reader of the owners' declarations (release/C138). Its id is confirmed with the release thread at the DO.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/declarations.mjs');
export const id = 'release/T1541';
export const tests = ['release/A40'];
export const title = 'the reader returns the registry of the seven TYPEs from the declarations it is given; a TYPE nobody declared is UNKNOWN; DEFAULT is invalid, never registered; the WIRE chapters keep their order; a first chapter other than Change is accepted';
const OWNERS = { PLAN: 'kaal-change', DO: 'kaal-change', ACT: 'kaal-change', HOTFIX: 'kaal-change', SYNC: 'kaal-release', PROMOTION: 'kaal-release', WIRE: 'kaal-release' };
const types = { types: Object.entries(OWNERS).map(([type, owner]) => ({ type, owner })), invalid: ['DEFAULT'] };
const decl = (type, names) => ({ type, chapters: names.map((name) => ({ name, guidance: 'g' })) });
const release = { types: [decl('SYNC', ['Reason']), decl('PROMOTION', ['Promotion']), decl('WIRE', ['Source', 'Target', 'Verification'])] };
const change = { types: [decl('PLAN', ['Change', 'From', 'To', 'Because']), decl('DO', ['Change', 'Implement']), decl('ACT', ['Change', 'Check']), decl('HOTFIX', ['Change', 'Defect', 'Urgency', 'Approach'])] };
export async function run() {
  const { readDeclarations } = await import(pathToFileURL(reader).href);

  // all seven TYPEs, the chapters as declared, in order
  const all = readDeclarations({ types, declarations: { 'kaal-release': release, 'kaal-change': change } });
  assert.deepEqual(Object.keys(all.registry).sort(), ['ACT', 'DO', 'HOTFIX', 'PLAN', 'PROMOTION', 'SYNC', 'WIRE']);
  assert.deepEqual(all.registry.WIRE, ['Source', 'Target', 'Verification'], 'the WIRE chapters are not kept in order');
  assert.deepEqual(all.registry.PLAN, ['Change', 'From', 'To', 'Because']);
  assert.deepEqual(all.unknown, []);
  assert.equal(all.findings.length, 0, 'a complete, valid set has findings');
  assert.deepEqual(all.invalid, ['DEFAULT'], 'the invalid routes are not passed on');

  // a first chapter other than Change is accepted
  assert.deepEqual(all.registry.SYNC, ['Reason']);
  assert.deepEqual(all.registry.PROMOTION, ['Promotion']);

  // a TYPE without a declaration is UNKNOWN, never registered, never a pass
  const partial = readDeclarations({ types, declarations: { 'kaal-release': release } });
  assert.deepEqual(partial.unknown.sort(), ['ACT', 'DO', 'HOTFIX', 'PLAN'], 'the four types of an owner that declared nothing are not UNKNOWN');
  assert.equal(partial.registry.PLAN, undefined, 'an undeclared TYPE is registered');
  assert.equal(partial.findings.length, 0, 'a missing declaration is a finding; it is UNKNOWN');
  const none = readDeclarations({ types, declarations: {} });
  assert.equal(Object.keys(none.registry).length, 0);
  assert.equal(none.unknown.length, 7, 'no declaration at all leaves fewer than seven UNKNOWN');
  const gap = readDeclarations({ types, declarations: { 'kaal-release': { types: [decl('SYNC', ['Reason'])] }, 'kaal-change': change } });
  assert.deepEqual(gap.unknown.sort(), ['PROMOTION', 'WIRE'], 'a type its owner left out of its file is not UNKNOWN');

  // DEFAULT is invalid: a declaration of it is a finding and is never registered; so is DEFAULT in the type list
  const dflt = readDeclarations({ types, declarations: { 'kaal-release': { types: [...release.types, decl('DEFAULT', ['Change', 'Because'])] }, 'kaal-change': change } });
  assert.equal(dflt.registry.DEFAULT, undefined, 'DEFAULT is registered');
  assert.ok(dflt.findings.some((f) => /DEFAULT/.test(f) && /invalid/i.test(f)), 'a declaration of DEFAULT is not a finding with its own reason');
  assert.equal(Object.keys(dflt.registry).length, 7, 'the seven TYPEs are lost beside the finding');
  const listed = readDeclarations({ types: { ...types, types: [...types.types, { type: 'DEFAULT', owner: 'kaal-release' }] }, declarations: { 'kaal-release': release, 'kaal-change': change } });
  assert.equal(listed.registry.DEFAULT, undefined, 'DEFAULT in the type list is registered');
  assert.ok(listed.findings.some((f) => /DEFAULT/.test(f)), 'DEFAULT in the type list is not a finding');
  const none2 = readDeclarations({ types: { types: types.types }, declarations: { 'kaal-release': release, 'kaal-change': change } });
  assert.ok(none2.findings.some((f) => /invalid/i.test(f) && /DEFAULT/.test(f)), 'a type list that does not name DEFAULT invalid is not a finding');

  // a declaration of a TYPE its owner does not own, a duplicate and a malformed chapter are findings and are not registered
  const foreign = readDeclarations({ types, declarations: { 'kaal-release': { types: [...release.types, decl('PLAN', ['Change'])] }, 'kaal-change': change } });
  assert.ok(foreign.findings.some((f) => /PLAN/.test(f) && /kaal-release/.test(f)), 'a declaration by a capability that does not own the TYPE is accepted');
  assert.deepEqual(foreign.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the owner\'s declaration lost to the foreign one');
  const dup = readDeclarations({ types, declarations: { 'kaal-release': { types: [...release.types, decl('SYNC', ['Other'])] }, 'kaal-change': change } });
  assert.ok(dup.findings.some((f) => /SYNC/.test(f) && /duplicate/i.test(f)), 'a duplicate declaration is not reported');
  assert.equal(dup.registry.SYNC, undefined, 'a duplicated TYPE is registered');
  assert.ok(dup.unknown.includes('SYNC'), 'a duplicated TYPE is not UNKNOWN');
  const bad = readDeclarations({ types, declarations: { 'kaal-release': { types: [{ type: 'SYNC', chapters: [{ name: '', guidance: 'g' }] }, ...release.types.slice(1)] }, 'kaal-change': change } });
  assert.ok(bad.findings.some((f) => /SYNC/.test(f)), 'a chapter without a name is accepted');
  assert.equal(bad.registry.SYNC, undefined);
  const empty = readDeclarations({ types, declarations: { 'kaal-release': { types: [{ type: 'SYNC', chapters: [] }, ...release.types.slice(1)] }, 'kaal-change': change } });
  assert.ok(empty.findings.some((f) => /SYNC/.test(f) && /chapter/i.test(f)), 'a TYPE without chapters is accepted');

  // the WIRE chapters are those declared: another order or another set is what was declared, not a rule of the reader
  const reordered = readDeclarations({ types, declarations: { 'kaal-release': { types: [...release.types.slice(0, 2), decl('WIRE', ['Target', 'Source'])] }, 'kaal-change': change } });
  assert.deepEqual(reordered.registry.WIRE, ['Target', 'Source'], 'the reader holds its own chapter list for WIRE');
}
