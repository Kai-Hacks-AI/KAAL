// Case review/T1587 tests: review/F39. The authority of the Approver is one declaration, read as data, and the two declarations together keep review/F33.
import assert from 'node:assert/strict';
import { declarationText, loadApps } from './lib.mjs';
export const id = 'review/T1587';
export const tests = ['review/F39'];
export const title = 'the declaration of the Approver is read as data with its app, name, owner, purpose and exactly its four abilities, a declaration that holds an extra ability such as post-checks or raise-pull-requests, lacks one, repeats one or names another App is a finding, the Inspector is read as before, an appId that is not a positive whole number or that two declarations share is a finding, and the two declarations together are in under F33';
export async function run() {
  const { readDeclaration, judgeApps } = await loadApps();
  const text = declarationText('approver');
  const read = readDeclaration(text, 'approver');
  assert.deepEqual(read.findings, [], 'the delivered declaration has findings');
  const d = read.declaration;
  assert.equal(d.app, 'approver');
  assert.equal(d.name, 'KAAL Approver');
  assert.equal(d.owner, 'review');
  assert.ok(typeof d.purpose === 'string' && d.purpose.length > 0, 'no purpose');
  assert.deepEqual([...d.abilities].sort(), ['approve-pull-requests', 'read-checks', 'read-contents', 'read-pull-requests']);

  const mutate = (f) => { const x = JSON.parse(text); f(x); return JSON.stringify(x); };
  const found = (t, app = 'approver') => readDeclaration(t, app).findings.map((x) => x.kind);
  assert.ok(found(mutate((x) => { x.abilities.push('post-checks'); })).includes('ability-beyond-authority'), 'an Approver that signs checks is not refused');
  assert.ok(found(mutate((x) => { x.abilities.push('raise-pull-requests'); })).includes('ability-beyond-authority'), 'an Approver that raises is not refused');
  assert.ok(found(mutate((x) => { x.abilities.push('write-contents'); })).includes('ability-beyond-authority'), 'write-contents is not refused');
  assert.ok(found(mutate((x) => { x.abilities = x.abilities.filter((a) => a !== 'approve-pull-requests'); })).includes('ability-missing'), 'an Approver that cannot approve is not refused');
  assert.ok(found(mutate((x) => { x.abilities.push('read-checks'); })).includes('ability-repeated'), 'a repeated ability is not refused');
  assert.ok(found(mutate((x) => { x.app = 'inspector'; })).includes('wrong-app'), 'another App is not refused');
  assert.ok(found(mutate((x) => { x.owner = 'release'; })).includes('wrong-owner'), 'another owner is not refused');
  assert.ok(found(mutate((x) => { delete x.purpose; })).includes('no-purpose'), 'no purpose is not refused');
  assert.ok(found(mutate((x) => { x.abilities = 'approve-pull-requests'; })).includes('abilities-not-a-list'), 'abilities that are not a list are not refused');
  assert.ok(found('{ not json').includes('unreadable'), 'unreadable text is not a finding');
  assert.ok(found(text, 'inspector').includes('wrong-app'), 'the Approver read as the Inspector is not refused');
  assert.ok(found(declarationText('inspector'), 'approver').includes('wrong-app'), 'the Inspector read as the Approver is not refused');
  assert.deepEqual(readDeclaration(declarationText('inspector')).findings, [], 'the Inspector is read as before, with the Inspector as the default');

  assert.deepEqual(readDeclaration(mutate((x) => { x.appId = '12345'; }), 'approver').findings, [], 'an appId recorded by the Owner is read, as the text of digits Hosting\'s adapter requires');
  for (const bad of [0, -1, 1.5, 12345, '0', '', '-1', '1.5', '12 3', 'abc', null, NaN]) assert.ok(found(mutate((x) => { x.appId = bad; })).includes('bad-app-id'), `appId ${bad} is not refused`);

  const inspector = readDeclaration(declarationText('inspector')).declaration;
  assert.deepEqual(judgeApps([inspector, d]), { verdict: 'in', findings: [] }, 'the two declarations together keep F33');
  assert.deepEqual(judgeApps([{ ...inspector, appId: '1' }, { ...d, appId: '2' }]), { verdict: 'in', findings: [] }, 'two ids that differ are in');
  const shared = judgeApps([{ ...inspector, appId: '7' }, { ...d, appId: '7' }]);
  assert.equal(shared.verdict, 'out', 'two Apps with one appId are out');
  assert.ok(shared.findings.some((f) => f.kind === 'shared-app-id'), 'and the finding is named');
  assert.equal(judgeApps([inspector, d]).verdict, 'in', 'declarations without an appId yet share none');
}
