// Case review/T29 tests: review/G2
import assert from 'node:assert/strict';
import { each, section, findings } from './lib.mjs';
export const id = 'review/T29';
export const tests = ['review/G2'];
export const title = "gap review/G2 is closed: the record states the three marks and every finding carries one of them";
export function run() {
  each((app) => {
    const c = section(app, 'Comparison');
    for (const m of ['Proven', 'Judged', 'Testable, not tested']) assert.ok(c.includes(m), `${app.name}: the Comparison does not state the mark ${m}`);
    for (const l of findings(app)) assert.equal(['Proven', 'Judged', 'Testable, not tested'].filter((m) => l.includes(m)).length, 1, `${app.name}: a finding does not carry exactly one mark: ${l.slice(0, 60)}`);
  });
}
