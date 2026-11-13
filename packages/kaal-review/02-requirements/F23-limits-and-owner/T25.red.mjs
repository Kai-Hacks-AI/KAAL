// Case review/T25 tests: review/F23
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T25';
export const tests = ['review/F23'];
export const title = "the record states what it did not check, the reviewer's limits and each decision for the Owner with its options";
export function run() {
  each((app) => {
    section(app, 'Not checked');
    const l = section(app, 'Limits');
    for (const w of [/model/i, /tool/i, /human/i]) assert.match(l, w);
    const o = section(app, 'For the Owner');
    assert.ok((o.match(/^\s*(\d+\.|[-*]) /gm) || []).length >= 2, `${app.name}: fewer than two Owner decisions are listed`);
    assert.match(o, /option/i);
  });
}
