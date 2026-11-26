// Case review/T1535 tests: review/F32. The authority of the Inspector is one declaration, read as data.
import assert from 'node:assert/strict';
import { declarationText, load } from './lib.mjs';
export const id = 'review/T1535';
export const tests = ['review/F32'];
export const title = 'the declaration of the Inspector is read as data with its app, name, owner, purpose and exactly its three abilities, and a declaration that holds an extra ability, lacks one, repeats one or names another App is a finding';
export async function run() {
  const { readDeclaration } = await load();
  const text = declarationText();
  const read = readDeclaration(text);
  assert.deepEqual(read.findings, [], 'the delivered declaration has findings');
  const d = read.declaration;
  assert.equal(d.app, 'inspector');
  assert.equal(d.name, 'KAAL Inspector');
  assert.equal(d.owner, 'review');
  assert.ok(typeof d.purpose === 'string' && d.purpose.length > 0, 'no purpose');
  assert.deepEqual([...d.abilities].sort(), ['post-checks', 'read-contents', 'read-pull-requests']);

  const mutate = (f) => { const x = JSON.parse(text); f(x); return JSON.stringify(x); };
  const found = (t) => readDeclaration(t).findings.map((x) => x.kind);
  assert.ok(found(mutate((x) => { x.abilities.push('approve-pull-requests'); })).includes('ability-beyond-authority'), 'an extra ability is not refused');
  assert.ok(found(mutate((x) => { x.abilities.push('write-contents'); })).includes('ability-beyond-authority'), 'write-contents is not refused');
  assert.ok(found(mutate((x) => { x.abilities = x.abilities.filter((a) => a !== 'post-checks'); })).includes('ability-missing'), 'a missing ability is not refused');
  assert.ok(found(mutate((x) => { x.abilities.push('post-checks'); })).includes('ability-repeated'), 'a repeated ability is not refused');
  assert.ok(found(mutate((x) => { x.app = 'approver'; })).includes('wrong-app'), 'another App is not refused');
  assert.ok(found(mutate((x) => { x.owner = 'release'; })).includes('wrong-owner'), 'another owner is not refused');
  assert.ok(found(mutate((x) => { delete x.purpose; })).includes('no-purpose'), 'no purpose is not refused');
  assert.ok(found(mutate((x) => { x.abilities = 'post-checks'; })).includes('abilities-not-a-list'), 'abilities that are not a list are not refused');
  assert.ok(found('{ not json').includes('unreadable'), 'unreadable text is not a finding');
}
