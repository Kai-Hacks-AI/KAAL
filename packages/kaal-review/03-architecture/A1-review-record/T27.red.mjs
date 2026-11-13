// Case review/T27 tests: review/A1
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T27';
export const tests = ['review/A1'];
export const title = "each application has the chapters of A1 and a trial folder next to its record";
export function run() {
  each((app) => {
    for (const h of ['Inspected', 'Findings', 'Skill versus baseline', 'Not checked', 'Limits', 'For the Owner', 'No authority']) section(app, h);
  });
}
