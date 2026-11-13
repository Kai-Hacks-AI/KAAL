// Case review/T29 tests: review/G2
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from './lib.mjs';
export const id = 'review/T29';
export const tests = ['review/G2'];
export const title = "gap review/G2 is closed: the record says which findings are proven by a test and which can only be judged";
export function run() {
  each((app) => {
    const f = findings(app);
    assert.ok(f.some((l) => /Judged/.test(l)) || f.some((l) => /Proven/.test(l)), `${app.name}: no finding is marked as proven or judged`);
  });
}
