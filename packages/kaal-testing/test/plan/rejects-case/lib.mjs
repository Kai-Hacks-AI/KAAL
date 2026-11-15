// Helpers for the testing/C61 planned Cases. Read-only: they read the repository and nothing else.
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PKG, answerProblems, readJson, readText, sha, skillParts } from '../testability/lib.mjs';

export { PKG, answerProblems, readJson, readText, sha, skillParts };
export const TRIAL = join(PKG, 'plan/rejects-case/trial/do');
export const OWN_CASES = ['test/plan/rejects-case'];

/** The trial's runs: [{ run, arm, dir }]. */
export function trialRuns() {
  assert.ok(existsSync(TRIAL), 'missing: plan/rejects-case/trial/do (the DO trial records)');
  const runs = [];
  for (const d of readdirSync(TRIAL).filter((n) => /^run\d+$/.test(n)).sort())
    for (const arm of ['baseline', 'skill']) runs.push({ run: d, arm, dir: join(TRIAL, d) });
  return runs;
}

export const trialKey = () => readJson(join(TRIAL, 'key.json'));
export const answerOf = ({ arm, dir }, id) => readJson(join(dir, `${arm}.json`)).answers.find((a) => a.id === id);
