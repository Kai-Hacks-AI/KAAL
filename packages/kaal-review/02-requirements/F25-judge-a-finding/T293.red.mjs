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
    assert.match(v, /inside|outside/i, `${app.name}: the Verdict does not say whether the failing element lies inside or outside the declared scope`);
    assert.match(v, /Checked:|Inferred:/, `${app.name}: the Verdict states no evidence`);
    const h = section(app, 'Handover');
    assert.match(h, /fix in this Change|prove|record|none/i, `${app.name}: the Handover states no handover and does not say none applies`);
  }
}
