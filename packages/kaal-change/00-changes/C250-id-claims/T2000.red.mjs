// Case change/T2000 tests: change/G21
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { checkIdClaim } from '../../lib/id-claims.mjs';
export const id = 'change/T2000';
export const tests = ['change/G21'];
export const closes = ['change/G21'];
export const title = 'the delivered claims do not overlap within a kind, and check Id Claim finds an overlap';
export const DIR = new URL('../../13-source/ids/claims/', import.meta.url);
export const load = () => {
  assert.ok(existsSync(DIR), 'the claims are absent');
  return readdirSync(DIR).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(new URL(f, DIR), 'utf8')));
};
export function run() {
  const claims = load();
  assert.equal(checkIdClaim({ claims, owned: [] }).verdict, 'pass', 'the delivered claims overlap or are malformed');
  for (const kind of ['change', 'case']) assert.ok(claims.some(c => c.kind === kind), 'no ' + kind + ' claim');
  const found = checkIdClaim({ claims: [
    { capability: 'a', kind: 'change', from: 1000, to: 1099 },
    { capability: 'b', kind: 'change', from: 1099, to: 1199 },
  ], owned: [] });
  assert.equal(found.verdict, 'fail');
  assert.ok(found.findings.some(f => f.kind === 'overlap'));
  assert.equal(checkIdClaim({ claims: [
    { capability: 'a', kind: 'change', from: 1000, to: 1099 },
    { capability: 'b', kind: 'case', from: 1000, to: 1099 },
  ], owned: [] }).verdict, 'pass', 'a change claim and a case claim of the same numbers clashed');
  assert.equal(checkIdClaim({ claims: [
    { capability: 'a', kind: 'change', from: 1000, to: 1000 },
    { capability: 'b', kind: 'change', from: 1001, to: 1001 },
  ], owned: [] }).verdict, 'pass', 'two claims of one number each, side by side, clashed');
}
test(id, () => run());
