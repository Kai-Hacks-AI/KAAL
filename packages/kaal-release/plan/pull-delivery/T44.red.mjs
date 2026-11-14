// Case pull/T44 tests: pull/F44
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T44';
export const tests = ['pull/F44', 'pull/F45'];
export const title = 'what is in stays in: an eligible higher class never preempts the holder, and is selected once the seat is free';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const hot = { class: 'HOTFIX', source: 'hotfix/fix-a', name: 'fix-a', out: 'PASS', in: 'PASS' };
  const report = { qualifiers: ['kaal/release/a', 'kaal/release/b'], next: { collector: 'kaal/release/a' } };
  const holder = { collector: 'kaal/release/a', pr: 1 };
  const base = { seat: holder, report, declaration: { collectors: [] }, pulse: calm };
  const same = (extra, expected) => {
    const withHotfix = mod.laneStep({ ...base, ...extra, deliveries: [hot] });
    const without = mod.laneStep({ ...base, ...extra });
    assert.deepEqual(withHotfix, without, 'an eligible HOTFIX changed the holder step');
    assert.equal(withHotfix.action, expected);
    assert.notEqual(withHotfix.action, 'select', 'the holder was preempted');
  };
  same({ behind: true }, 'open-sync');
  same({ behind: false }, 'wait');
  same({ behind: false, requalification: 'UNKNOWN' }, 'wait');
  same({ behind: false, requalification: 'PASS' }, 'ready-for-cpo');
  // A failed holder is replaced inside KAAL by the C9 rule, never by the HOTFIX.
  const failed = mod.laneStep({ ...base, behind: false, requalification: 'FAIL', deliveries: [hot] });
  assert.notEqual(failed.action, 'select', 'a failed KAAL holder was replaced by a HOTFIX');
  // Once the seat is free the HOTFIX is selected.
  const free = mod.laneStep({ ...base, seat: null, deliveries: [hot] });
  assert.deepEqual([free.action, free.class], ['select', 'HOTFIX'], 'the HOTFIX was not selected once the seat was free');
  // Selected only when the lane is not occupied: an open WIRE keeps the HOTFIX waiting.
  const busy = mod.laneStep({ ...base, seat: null, deliveries: [hot], pulse: { ...calm, open: [{ type: 'WIRE', collector: 'wire/hooks' }] } });
  assert.equal(busy.action, 'wait', 'a HOTFIX was selected while a WIRE was open');
}
