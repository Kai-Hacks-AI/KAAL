// Case pull/T10 tests: pull/F3
import assert from 'node:assert/strict';
import { collector, declaration, facts, flow, landed, promotion, pullPromotion, delivery, ok, lifecycle } from './fixtures.mjs';
export const id = 'pull/T10';
export const tests = ['pull/F3'];
export const title = 'the Script models no collector state of its own: it reads only the fields of analyze Flow\'s facts, plus the three optional additions, and only the fields of its output and lane';
export async function run() {
  // coordination/F2 names these; landedAt (piece and delivery) and collector checks are the only additions (pull/F3)
  const allowed = new Set([
    'target', 'from', 'collectors', 'name', 'at', 'behindTarget', 'checks', 'pieces', 'ref', 'type', 'change', 'into', 'state', 'review', 'landedAt',
    'deliveries', 'collector', 'delivered', 'gaps', 'conclusion', 'subject', 'missing', 'actions', 'notJudged', 'lane', 'active',
    'action', 'kind', 'pair', 'layer', 'status', 'authority', 'reason', 'dependency', 'rank', 'evidence', 'purpose', 'class',
  ]);
  const seen = new Set();
  const watch = (value) => {
    if (value === null || typeof value !== 'object') return value;
    return new Proxy(value, {
      get(target, key, receiver) {
        if (typeof key === 'string' && !Array.isArray(target) && key !== 'toJSON' && key !== 'then') seen.add(key);
        return watch(Reflect.get(target, key, receiver));
      },
    });
  };
  const finding = { rank: 1, action: 'REVIEW', target: '#20', layer: 'promotion', kind: 'promotion', pair: 'col-a', status: 'ready', authority: 'reviewer', reason: 'x' };
  const state = facts({
    collectors: [collector('col-a', { checks: [ok('build')] })],
    pieces: [...lifecycle(), landed(30, 'PLAN', { into: 'main', change: 'c/C9' }), promotion(20)],
    deliveries: [delivery('col-a', 'older', { landedAt: '2026-11-12T00:00:00Z' })],
    gaps: [{ subject: '#10', missing: 'x' }],
  });
  const result = await pullPromotion(watch(state), declaration(), watch(flow({ actions: [finding] })));
  assert.ok(result.verdict, 'no verdict came out');
  const stray = [...seen].filter((key) => !allowed.has(key) && key !== 'target');
  assert.deepEqual(stray, [], `the Script reads fields that analyze Flow's contract does not name: ${stray.join(', ')}`);
}
