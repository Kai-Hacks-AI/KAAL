// Case review/T302 tests: review/F31, review/N5. No authority, the relation recorded, and independence of the consumer.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE, item, kinds, load, result, tree } from './lib.mjs';
export const id = 'review/T302';
export const tests = ['review/F31', 'review/N5'];
export const title = 'a result that declares an approval or a merge, or that omits the appraiser relation, is a finding; no relation is refused for itself; the navigation needs no repository and the package no unrelated dependency';
const REV = 'd'.repeat(40);
const f = (n, extra = {}) => ({ appraises: 'ns/V1', revision: REV, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion: 'satisfied', ...extra });
export async function run() {
  const navigate = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', f(1, { relation: 'author' })),
    'r/RV2.md': result('ns/RV2', f(2, { relation: 'unknown' })),
    'r/RV3.md': result('ns/RV3', f(3)),
  });
  const ok = await navigate(root, { revision: REV });
  assert.deepEqual(ok.findings, [], 'a result whose appraiser is the author, or whose relation is unknown, is recorded and is not refused for its relation');
  assert.deepEqual(ok.results.map((r) => r.relation).sort(), ['author', 'not-author', 'unknown'], 'the relation is carried on every result');

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', f(1, { relation: undefined })),
    'r/RV2.md': result('ns/RV2', f(2), { result: 'Decision: approve\nIt holds.' }),
    'r/RV3.md': result('ns/RV3', f(3), { result: 'Verdict: merge' }),
  });
  assert.deepEqual(kinds(await navigate(bad, { revision: REV })), ['authority-claim', 'authority-claim', 'no-relation']);

  const manifest = JSON.parse(readFileSync(join(PACKAGE, 'package.json'), 'utf8'));
  const permitted = new Set(['@kaihacksai/kaal-hosting', '@kaihacksai/kaal-foundation']);
  for (const name of Object.keys(manifest.dependencies ?? {})) assert.ok(permitted.has(name), `the package declares the dependency ${name}, which is not a permitted shared dependency`);
}
