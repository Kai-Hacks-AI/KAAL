// Case change/T1127 tests: change/F56
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1127';
export const tests = ['change/F56'];
export const title = 'the ratchet: PLAN may keep or raise RED and may not lower it; DO may keep or lower RED and may not raise RED or UNKNOWN; ACT needs RED 0 and UNKNOWN 0; counts that are missing or an unknown phase are findings, never a pass';
export async function run() {
  const c = await load();
  const k = (red, unknown = 0) => ({ red, green: 0, unknown });
  const rules = (phase, base, head) => c.ratchet({ phase, base, head }).map((f) => f.rule);
  assert.deepEqual(rules('plan', k(2), k(2)), []);
  assert.deepEqual(rules('plan', k(2), k(4)), []);
  assert.deepEqual(rules('plan', k(2), k(1)), ['plan-red-fell']);
  assert.deepEqual(rules('do', k(2), k(2)), []);
  assert.deepEqual(rules('do', k(2), k(0)), []);
  assert.deepEqual(rules('do', k(2), k(3)), ['do-red-rose']);
  assert.deepEqual(rules('do', k(2, 0), k(1, 1)), ['do-unknown-rose'], 'lowering RED by breaking a Case passed');
  assert.deepEqual(rules('act', k(0), k(0)), []);
  assert.deepEqual(rules('act', k(0), k(1)), ['act-not-green']);
  assert.deepEqual(rules('act', k(0), k(0, 1)), ['unknown-case']);
  assert.deepEqual(rules('plan', k(0), undefined), ['no-counts']);
  assert.deepEqual(rules('review', k(0), k(0)), ['unknown-phase']);
  assert.deepEqual(c.verdict({ state: 'open', counts: k(3, 1) }).map((f) => f.rule), ['unknown-case'], 'UNKNOWN passed in an open Change');
  assert.deepEqual(c.verdict({ state: 'open', counts: k(3) }), [], 'RED is expected in an open Change');
}
test(id, () => run());
