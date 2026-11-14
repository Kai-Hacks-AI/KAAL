// Case pull/T45 tests: pull/F43, pull/F44
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T45';
export const tests = ['pull/F43', 'pull/F44'];
export const title = 'unavailable and UNKNOWN candidates are not eligible, an UNKNOWN higher class with an eligible lower one is judged, and eligibility is never invented';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const ok = { out: 'PASS', in: 'PASS' };
  const hot = (name, over = {}) => ({ class: 'HOTFIX', source: `hotfix/${name}`, name, ...ok, ...over });
  const wire = (over = {}) => ({ class: 'WIRE', source: 'wire/hooks', name: 'hooks', ...ok, ...over });
  const kaal = (over = {}) => ({ class: 'KAAL', source: 'kaal/release/a', name: 'kaal/release/a', ...ok, ...over });
  const report = { qualifiers: ['kaal/release/a'], next: { collector: 'kaal/release/a' } };
  const step = (deliveries) => mod.laneStep({ seat: null, report, declaration: { collectors: [] }, deliveries, pulse: calm });
  const judged = (r, names, why) => {
    assert.equal(r.action, 'judge', `${why}: not judged`);
    for (const n of names) assert.ok(r.judged?.includes(n), `${why}: ${n} is not named`);
  };

  // An UNKNOWN higher class with an eligible lower one is judged naming both.
  judged(step([hot('fix-a', { out: 'UNKNOWN' }), wire()]), ['fix-a', 'hooks'], 'an UNKNOWN HOTFIX');
  judged(step([hot('fix-a', { in: 'UNKNOWN' }), kaal()]), ['fix-a', 'kaal/release/a'], 'an UNKNOWN IN');
  judged(step([wire({ out: 'UNKNOWN' }), kaal()]), ['hooks', 'kaal/release/a'], 'an UNKNOWN WIRE');
  // Missing, invalid and mismatched evidence is UNKNOWN, never eligible.
  for (const bad of [{ out: undefined }, { in: undefined }, { out: 'pass' }, { out: true }, { source: 'wire/fix-a' }, { source: 'hotfix' }, { class: 'OTHER' }]) {
    const r = step([hot('fix-a', bad), kaal()]);
    assert.notEqual(r.action, 'select', `${JSON.stringify(bad)} was treated as eligible`);
    judged(r, ['fix-a'], JSON.stringify(bad));
  }
  assert.equal(step([hot('fix-a'), 'x']).action, 'judge', 'an invalid candidate did not fail closed');
  assert.equal(step('x').action, 'judge', 'an invalid list did not fail closed');
  // FAIL is known and never blocks.
  assert.equal(step([hot('fix-a', { out: 'FAIL' }), wire({ in: 'FAIL' }), kaal()]).action, 'open-promotion', 'FAIL blocked the lower class');
  // Two eligible HOTFIXes are judged, not ordered.
  judged(step([hot('fix-a'), hot('fix-b')]), ['fix-a', 'fix-b'], 'two HOTFIXes');
  // Nothing eligible and nothing unknown waits; no candidates wait.
  assert.equal(step([hot('fix-a', { out: 'FAIL' }), wire({ in: 'FAIL' })]).action, 'wait', 'all FAIL did not wait');
  assert.equal(mod.laneStep({ seat: null, report: { qualifiers: [], next: { collector: null, reason: 'none' } }, deliveries: [], pulse: calm }).action, 'wait', 'no candidates did not wait');
}
