// Case engineering/T1761 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1761';
export const tests = ['engineering/F104'];
export const title = 'an error from GitHub says the audit cannot judge, and a pass is never printed';
export async function run() {
  for (const e of [{ event: 'push', ref: 'kaal/x' }, { event: 'push', ref: 'main' }, { event: 'push', ref: 'kaal/x', created: 'true' }]) {
    const { status, out } = audit({ ...e, ghFail: true });
    assert.equal(status, 2, `${JSON.stringify(e)} did not say it cannot judge (exit ${status}): ${out}`);
    assert.doesNotMatch(out, /^pass:|: pass/m, `${JSON.stringify(e)} printed a pass: ${out}`);
  }
}
