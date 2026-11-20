// Case review/T294 tests: review/F25 (GREEN since review/C3 DO recorded an application of the focus finding)
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { applications, section, dir } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T294';
export const tests = ['review/F25'];
export const title = 'the Handover of a finding review hands over what and under what condition, and names no package as the receiver';
export function run() {
  const found = applications().filter((a) => a.subject.focus === 'finding');
  assert.ok(found.length > 0, 'no application of the focus finding exists');
  const packages = readdirSync(join(dir, '..')).filter((n) => n.startsWith('kaal-'));
  for (const app of found) {
    const h = section(app, 'Handover');
    for (const p of packages) assert.ok(!h.includes(p), `${app.name}: the Handover names the package ${p}`);
    assert.match(h, /\b(if|because|when|since)\b/i, `${app.name}: the Handover gives no condition or reason`);
    assert.ok(!/^\s*(Verdict|Decision):\s*(approve|merge)/im.test(app.review()), `${app.name}: the record decides`);
  }
}
