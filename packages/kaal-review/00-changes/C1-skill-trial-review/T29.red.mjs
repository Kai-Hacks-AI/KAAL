// Case review/T29 tests: review/G2
import assert from 'node:assert/strict';
import { each, section, trial } from './lib.mjs';
export const id = 'review/T29';
export const tests = ['review/G2'];
export const title = "gap review/G2 is closed: a trial run by the reviewer exists";
export function run() {
  each((app) => {
    trial(app);
  });
}
