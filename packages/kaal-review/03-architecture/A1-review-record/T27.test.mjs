// Case review/T27 tests: review/A1
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T27';
export const tests = ['review/A1'];
export const title = "each application has the chapters of A1, and the focuses promotion and capability are defined";
export function run() {
  each((app) => {
    for (const h of ['Focus', 'Reference', 'Actual', 'Comparison', 'Evidence', 'Not checked', 'Limits', 'For the Owner', 'No authority']) section(app, h);
    assert.ok(FOCI.promotion && FOCI.capability);
  });
}
