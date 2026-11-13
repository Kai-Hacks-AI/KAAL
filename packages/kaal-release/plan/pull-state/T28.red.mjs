// Case pull/T28 tests: pull/F28
import assert from 'node:assert/strict';
import { declaration, file, good, retro, statusOf, t0, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T28';
export const tests = ['pull/F28'];
export const title = 'ACT is exactly one concluding 4L retrospective in the delta, changed no earlier than any PLAN or DO file: none, two, an incomplete one or one that came first does not qualify, and an unread one is not judged';
const only = async (over) => statusOf(await walkCollectors({ collectors: [good('col-a', over)] }, declaration({ collectors: [{ name: 'col-a' }] })), 'col-a');
const base = () => good('col-a');
export async function run() {
  assert.equal((await only({})).status, 'qualifies');
  // no ACT in the delta
  const none = await only({ delta: base().delta.filter((f) => f.path !== 'plan/x/00-changes.md') });
  assert.equal(none.status, 'does not qualify');
  assert.ok(none.missing.some((m) => /ACT/.test(m)), 'the missing ACT is not named');
  // a file that matches but is not a 4L retrospective is not an ACT
  const incomplete = await only({ texts: { 'plan/x/00-changes.md': retro(['Liked', 'Learned']) } });
  assert.equal(incomplete.status, 'does not qualify', 'an incomplete retrospective counted as the ACT');
  // exactly one: a second retrospective is not a conclusion
  const two = await only({ delta: [...base().delta, file('plan/y/00-changes.md', t0(5), 'added')], texts: { 'plan/x/00-changes.md': retro(), 'plan/y/00-changes.md': retro() } });
  assert.equal(two.status, 'does not qualify');
  assert.ok(two.missing.some((m) => /plan\/x\/00-changes\.md/.test(m) && /plan\/y\/00-changes\.md/.test(m)), 'the two retrospectives are not named');
  // the ACT after PLAN and DO: a DO file changed after the ACT breaks the order
  const late = await only({ delta: base().delta.map((f) => (f.path === 'src/script.mjs' ? { ...f, changedAt: t0(5) } : f)) });
  assert.equal(late.status, 'does not qualify', 'an ACT that came before the last DO file qualified');
  assert.ok(late.missing.some((m) => /src\/script\.mjs/.test(m)), 'the file that came after the ACT is not named');
  const latePlan = await only({ delta: base().delta.map((f) => (f.path === 'plan/x/testing.md' ? { ...f, changedAt: t0(5) } : f)) });
  assert.equal(latePlan.status, 'does not qualify', 'an ACT that came before the last PLAN file qualified');
  // the same time is not "before"
  const same = await only({ delta: base().delta.map((f) => (f.path === 'src/script.mjs' ? { ...f, changedAt: t0(4) } : f)) });
  assert.equal(same.status, 'qualifies');
  // the text of a candidate was not read
  const unread = await only({ texts: {} });
  assert.equal(unread.status, 'not judged');
  assert.ok(unread.missing.some((m) => /plan\/x\/00-changes\.md/.test(m)), 'the unread candidate is not named');
}
