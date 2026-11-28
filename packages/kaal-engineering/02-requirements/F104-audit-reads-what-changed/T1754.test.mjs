// Case engineering/T1754 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1754';
export const tests = ['engineering/F104'];
export const title = 'every audit says how many GitHub calls it made, and the number is the real one';
export async function run() {
  for (const e of [{ event: 'push', ref: 'main' }, { event: 'push', ref: 'kaal/x', created: 'true' }, { event: 'schedule' }]) {
    const { calls, out } = audit(e);
    const m = out.match(/^API calls: (\d+)$/m);
    assert.ok(m, `no "API calls: n" line for ${JSON.stringify(e)}`);
    assert.equal(Number(m[1]), calls.length, `the audit says ${m[1]} calls and made ${calls.length}`);
  }
}
