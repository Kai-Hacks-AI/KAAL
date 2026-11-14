// Case pull/T42 tests: pull/F42
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T42';
export const tests = ['pull/F42'];
export const title = 'the lane cannot spam PRs: one open PR per type, WIP 1 lane-wide, no re-open under the same trigger, an attempt cap, and fail closed to judge';

export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs')).href);
  assert.equal(typeof mod.laneStep, 'function', 'laneStep is not exported');
  const rep = { qualifiers: ['col-a', 'col-b'], next: { collector: 'col-b' } };
  const calm = { open: [], closed: [], trigger: 't1', attempts: 0, cap: 2 };
  const free = (pulse) => mod.laneStep({ seat: null, report: rep, pulse: { ...calm, ...pulse } });
  const behind = (pulse) => mod.laneStep({ seat: { collector: 'col-a', pr: 1 }, behind: true, report: rep, pulse: { ...calm, ...pulse } });

  assert.equal(free({}).action, 'open-promotion', 'a calm lane did not open');
  // Idempotent and WIP 1 lane-wide.
  assert.equal(free({ open: [{ type: 'PROMOTION', collector: 'col-b' }] }).action, 'wait', 'a second PROMOTION for the same collector was opened');
  assert.equal(free({ open: [{ type: 'PROMOTION', collector: 'col-c' }] }).action, 'wait', 'a second PROMOTION lane-wide was opened');
  assert.equal(behind({ open: [{ type: 'SYNC', collector: 'col-a' }] }).action, 'wait', 'a second SYNC for the same collector was opened');
  assert.equal(behind({ open: [{ type: 'SYNC', collector: 'col-c' }] }).action, 'wait', 'a second SYNC lane-wide was opened');
  assert.equal(behind({ open: [{ type: 'PROMOTION', collector: 'col-a' }] }).action, 'open-sync', 'an open PROMOTION blocked the SYNC');
  assert.equal(free({ open: [{ type: 'SYNC', collector: 'col-a' }] }).action, 'open-promotion', 'an open SYNC blocked the PROMOTION');
  // No re-open under the same trigger; a new trigger allows it.
  const closed = [{ type: 'PROMOTION', collector: 'col-b', trigger: 't1' }];
  assert.equal(free({ closed }).action, 'wait', 'a closed PR was re-opened under the same trigger');
  assert.equal(free({ closed, trigger: 't2' }).action, 'open-promotion', 'a new trigger did not allow an open');
  // The attempt cap goes to judge.
  assert.equal(free({ attempts: 1 }).action, 'open-promotion');
  const capped = free({ attempts: 2 });
  assert.equal(capped.action, 'judge', 'the cap did not stop the lane');
  assert.ok(/cap/i.test(capped.reason ?? ''), 'the reason does not say the cap is reached');
  // Fail closed.
  for (const bad of [{ open: undefined }, { open: 'x' }, { closed: undefined }, { trigger: '' }, { trigger: undefined }, { attempts: '1' }, { attempts: -1 }, { attempts: 1.5 }, { cap: 0 }, { cap: undefined }, { cap: NaN }])
    assert.equal(free(bad).action, 'judge', `an invalid pulse ${JSON.stringify(bad)} did not fail closed`);
  assert.equal(mod.laneStep({ seat: null, report: rep }).action, 'judge', 'a missing pulse did not fail closed');
  assert.equal(mod.laneStep({ seat: { collector: 'col-a', pr: 1 }, behind: true, report: rep, pulse: { ...calm, cap: 0 } }).action, 'judge', 'a SYNC was opened with an invalid cap');
}
