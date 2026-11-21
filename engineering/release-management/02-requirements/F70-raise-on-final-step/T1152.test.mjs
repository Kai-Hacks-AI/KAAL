// Case release/T1152 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1152';
export const tests = ['release/F70'];
export const title = "only the final step of a class is a final step: ACT into a collector, a fix into a hotfix branch, a WIRE copy into a wire branch";
export async function run() {
  const { decideFinal } = await load('final-step.mjs');
  const r = (e) => decideFinal(e);
  const k = 'kaal/release/some-thing';
  assert.equal(r(ev({ base: k, body: ACT })).reason, 'decided-from-the-tree', 'a collector is decided from its tree (release/C116), not from the body');
  assert.equal(r(ev({ base: 'hotfix/the-fix', body: HOTFIX })).class, 'HOTFIX');
  assert.equal(r(ev({ base: 'wire/the-copy', body: WIRE })).class, 'WIRE');
  for (const [name, e] of [['plan', ev({ base: k, body: PLAN })], ['do', ev({ base: k, body: DO })], ['sync', ev({ base: k, body: SYNC })], ['unmerged', ev({ base: k, body: ACT, merged: false })], ['main', ev({ base: 'main', body: ACT })], ['feature', ev({ base: 'claude/x', body: ACT })], ['no commit', ev({ base: k, body: ACT, mergeSha: '' })], ['hotfix with an ACT', ev({ base: 'hotfix/the-fix', body: ACT })], ['collector with a WIRE', ev({ base: k, body: WIRE })], ['wire with an ACT', ev({ base: 'wire/the-copy', body: ACT })], ['wire plan', ev({ base: 'wire/the-copy', body: PLAN })], ['wire sync', ev({ base: 'wire/the-copy', body: SYNC })]]) {
    const x = r(e);
    assert.equal(x.action, 'skip', name + ' is not a final step');
    assert.ok(x.reason, name + ' says why');
  }
  assert.equal(r(ev({ base: k, body: ACT, merged: undefined })).action, 'skip', 'merged must be exactly true');
}
