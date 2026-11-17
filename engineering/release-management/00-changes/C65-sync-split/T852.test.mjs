// Case release/T852 tests: release/C65
import assert from 'node:assert/strict';
import { pureSync, load } from './fixtures.mjs';
export const id = 'release/T852';
export const tests = ['release/C65'];
export const title = 'verify Sync judges from the event and the fetched Git objects without any API call, and says PASS for a pure SYNC, FAIL without a Reason, and UNKNOWN for a head it cannot read';
export async function run() {
  const { verify } = await load('cli.mjs');
  const w = pureSync();
  try {
    const deps = () => w.deps({ api: () => { throw new Error('verify Sync called an API'); } });
    w.reset();
    assert.equal(verify(w.env(), deps()), 0, 'a pure SYNC passes');
    const v = JSON.parse(w.outs.verdict);
    assert.equal(v.outcome, 'PASS');
    assert.equal(v.analyzed.head, w.head);
    assert.match(v.analyzed.base.tip, /^[0-9a-f]{40}$/);
    assert.equal(w.calls.length, 0, 'no API call');
    w.reset();
    assert.equal(verify(w.env({ KAAL_BODY: '## Change\n\nrelease/C1 x\n' }), deps()), 1, 'no Reason is a FAIL');
    assert.ok(JSON.parse(w.outs.verdict).reasons.some((r) => r.code === 'no-reason'));
    w.reset();
    assert.equal(verify(w.env({ KAAL_HEAD: '0'.repeat(40) }), deps()), 2, 'a head that cannot be read is UNKNOWN');
    assert.equal(JSON.parse(w.outs.verdict).outcome, 'UNKNOWN');
    assert.throws(() => verify({ ...w.env(), KAAL_HEAD: '' }, deps()), /missing environment/);
  } finally {
    w.done();
  }
}
