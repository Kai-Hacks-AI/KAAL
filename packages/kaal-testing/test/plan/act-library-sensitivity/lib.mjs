// Helpers for the testing/C78 planned Cases. Read-only: they parse the pilot record and the claims of requirements.md.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const PLAN = process.env.KAAL_TESTING_PLAN_DIR ? resolve(process.env.KAAL_TESTING_PLAN_DIR) : join(PKG, 'plan/act-library-sensitivity');
export const KINDS = ['killed by', 'survived', 'invalid', 'unresolved'];
export const JUDGMENTS = ['required invariant', 'equivalent change', 'unknown', 'architectural concern', 'potential defect', 'proposed clarification', 'out of scope'];

export const read = (p) => {
  assert.ok(existsSync(p), `missing: ${p}`);
  return readFileSync(p, 'utf8');
};

/** The claim ids K<n> that requirements.md registers. */
export const claims = () => [...read(join(PLAN, 'requirements.md')).matchAll(/^\| (K\d+) \|/gm)].map((m) => m[1]);

/** The pilot record: { text, sha, rows } where each row is { id, claim, mutation, witness, observation, judgment }. */
export function pilot() {
  const text = read(join(PLAN, 'pilot.md'));
  const sha = text.match(/\b[0-9a-f]{40}\b/)?.[0];
  const rows = [...text.matchAll(/^\| (M\d+) \|(.+)\|\s*$/gm)].map((m) => {
    const cells = m[2].split('|').map((c) => c.trim());
    return { id: m[1], cells, claim: cells[0], mutation: cells[1], witness: cells[2], observation: cells[3], judgment: cells[4] };
  });
  return { text, sha, rows };
}
