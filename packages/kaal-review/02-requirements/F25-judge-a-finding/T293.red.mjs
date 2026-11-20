// Case review/T293 tests: review/F25 (RED until review/C3 DO records an application of the focus finding)
import assert from 'node:assert/strict';
import { applications, section } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T293';
export const tests = ['review/F25', 'review/G4'];
export const title = 'a review with the focus finding states its verdict with the challenge and evidence, where the failing element lies, and which handovers apply';
export function run() {
  const found = applications().filter((a) => a.subject.focus === 'finding');
  assert.ok(found.length > 0, 'no application of the focus finding exists');
  for (const app of found) {
    const v = section(app, 'Verdict');
    assert.match(v, /\b(valid|invalid|unknown)\b/i, `${app.name}: the Verdict states none of valid, invalid or unknown`);
    assert.match(v, /Proven|Judged|Testable, not tested/, `${app.name}: the Verdict carries none of the three marks`);
    const at = v.match(/^\s*[-*]?\s*Found at:\s*(.+)$/im);
    assert.ok(at && at[1].trim().length > 0, `${app.name}: the Verdict does not say where the finding was found`);
    assert.doesNotMatch(v, /^\s*[-*]?\s*Belongs to be fixed:/im, `${app.name}: the Verdict decides where the fix belongs, which is not Review's`);
    assert.match(v, /Checked:|Inferred:/, `${app.name}: the Verdict states no evidence`);
    if (/Proven/.test(v)) assert.match(v, /Result:\s*\S+/i, `${app.name}: a Proven finding states no result of a run that reproduced the failure`);
    if (/\binvalid\b/i.test(v)) assert.match(v, /Closed:\s*\S+/i, `${app.name}: an invalid finding is not closed with a reason`);
    if (/\bunknown\b/i.test(v) && !/\b(valid|invalid)\b/i.test(v.replace(/\bunknown\b/gi, ''))) assert.match(v, /Missing evidence:\s*\S+/i, `${app.name}: an unknown finding does not name the missing evidence`);
    const h = section(app, 'Handover');
    assert.match(h, /to prove|to record|to place|none/i, `${app.name}: the Handover states no handover and does not say none applies`);
  }
}
