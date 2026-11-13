// Case review/T29 tests: review/G2
import assert from 'node:assert/strict';
import { each, section, trial, FOCI } from './lib.mjs';
export const id = 'review/T29';
export const tests = ['review/G2'];
export const title = "gap review/G2 is closed: where the evidence is an agent trial, a trial run by the reviewer exists";
export function run() {
  each((app) => {
    if (app.subject.trial) trial(app);
    else assert.match(section(app, 'Evidence'), /no trial/i);
  });
}
