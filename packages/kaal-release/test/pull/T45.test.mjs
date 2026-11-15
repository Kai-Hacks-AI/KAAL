// Case pull/T45 tests: pull/F43
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { registry } from './fixtures.mjs';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T45';
export const tests = ['pull/F43'];
export const title = 'FAIL is not eligible, UNKNOWN is not eligible and is reported without blocking a known eligible lower class, and judgment is asked only when no deterministic eligible choice exists';

export async function run() {
  const raw = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const mod = { ...raw, laneStep: (st) => raw.laneStep({ registry, ...st }) };
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const ok = { stock: 'PASS', in: 'PASS' };
  const hot = (name, over = {}) => ({ class: 'HOTFIX', source: `hotfix/${name}`, name, ...ok, ...over });
  const wire = (over = {}) => ({ class: 'WIRE', source: 'wire/hooks', name: 'hooks', ...ok, ...over });
  const kaal = (over = {}) => ({ class: 'KAAL', source: 'kaal/release/a', name: 'kaal/release/a', ...ok, ...over });
  const report = { qualifiers: ['kaal/release/a'], next: { collector: 'kaal/release/a' } };
  const step = (deliveries) => mod.laneStep({ seat: null, report, declaration: { collectors: [] }, deliveries, pulse: calm });

  // An UNKNOWN higher class does not block a known eligible lower class; it is reported.
  let r = step([hot('fix-a', { stock: 'UNKNOWN' }), wire()]);
  assert.deepEqual([r.action, r.class], ['select', 'WIRE'], 'an UNKNOWN HOTFIX stalled the eligible WIRE');
  assert.deepEqual(r.unknown, ['fix-a'], 'the UNKNOWN HOTFIX was not reported');
  // The destination IN is the target's merge rule and is not read by selection (pull/F61): an UNKNOWN IN neither blocks nor is reported.
  r = step([hot('fix-a', { in: 'UNKNOWN' }), kaal()]);
  assert.deepEqual([r.action, r.class, r.name], ['select', 'HOTFIX', 'fix-a'], 'an UNKNOWN IN stalled the selection');
  assert.ok(!r.unknown?.length, 'an UNKNOWN IN was reported');
  r = step([wire({ stock: 'UNKNOWN' }), hot('fix-a')]);
  assert.deepEqual([r.action, r.class], ['select', 'HOTFIX'], 'an UNKNOWN WIRE changed the eligible HOTFIX');
  // Missing, invalid and mismatched evidence is not eligible and is reported, never invented.
  for (const bad of [{ stock: undefined }, { stock: 'pass' }, { stock: true }]) {
    r = step([hot('fix-a', bad), kaal()]);
    assert.notEqual(r.action, 'select', `${JSON.stringify(bad)} was treated as eligible`);
    assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/a'], `${JSON.stringify(bad)} stalled the eligible collector`);
    assert.deepEqual(r.unknown, ['fix-a'], `${JSON.stringify(bad)} was not reported`);
  }
  // A PASSing candidate whose source its stock does not route is judge-pulled (reported, never selected), not invented as eligible.
  for (const bad of [{ source: 'wire/fix-a' }, { source: 'hotfix' }, { source: 'hotfix/' }]) {
    r = step([hot('fix-a', bad), kaal()]);
    assert.deepEqual([r.action, r.collector], ['open-promotion', 'kaal/release/a'], `${JSON.stringify(bad)} stalled the eligible collector`);
    assert.deepEqual(r.judgePulled, ['fix-a'], `${JSON.stringify(bad)} was not judge-pulled`);
  }
  r = step([hot('fix-a'), 'x']);
  assert.deepEqual([r.action, r.class], ['select', 'HOTFIX'], 'an invalid candidate stalled the eligible HOTFIX');
  assert.equal(r.unknown?.length, 1, 'an invalid candidate was not reported');
  // FAIL is known, not eligible, and not reported.
  r = step([hot('fix-a', { stock: 'FAIL' }), wire({ stock: 'FAIL' }), kaal()]);
  assert.equal(r.action, 'open-promotion', 'FAIL blocked the lower class');
  assert.ok(!r.unknown?.length, 'FAIL was reported as unknown');
  // Judgment only when no deterministic eligible choice exists.
  r = step([hot('fix-a'), hot('fix-b')]);
  assert.equal(r.action, 'judge', 'two eligible HOTFIXes were ordered');
  assert.ok(r.judged.includes('fix-a') && r.judged.includes('fix-b'), 'the eligible HOTFIXes are not named');
  r = step([hot('fix-a', { stock: 'UNKNOWN' }), wire({ stock: 'FAIL' })]);
  assert.equal(r.action, 'judge', 'no eligible candidate with an UNKNOWN one was not judged');
  assert.ok(r.judged.includes('fix-a'), 'the UNKNOWN candidate is not named');
  assert.equal(step('x').action, 'judge', 'a non-list did not fail closed');
  // Nothing eligible and nothing unknown waits; no candidates wait.
  assert.equal(step([hot('fix-a', { stock: 'FAIL' }), wire({ stock: 'FAIL' })]).action, 'wait', 'all FAIL did not wait');
  assert.equal(mod.laneStep({ seat: null, report: { qualifiers: [], next: { collector: null, reason: 'none' } }, deliveries: [], pulse: calm }).action, 'wait', 'no candidates did not wait');
}
