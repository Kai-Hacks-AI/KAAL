// Unit tests of lib/expectations.mjs (testing/C68): what an incomplete observation does and does not allow the comparison to conclude (the CPO's gate on testing/C67).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkRegister, compareExpectations } from '../lib/expectations.mjs';

const register = (ids) => ({ schema: 'kaal-testing/expected-failures@1', expected: ids.map((id) => ({ id })) });
const report = (tests, execution) => ({ schema: 'kaal-testing/run-report@1', counts: {}, tests, diagnostics: [], execution: { complete: true, files: ['f.test.mjs'], problems: [], ...execution } });
const t = (id, actual) => ({ id, file: id.split(' > ')[0], actual });

describe('compareExpectations on an incomplete observation', () => {
  it('marks an id missing from a file with execution problems provisional, with the reason', () => {
    const r = report([], { complete: false, problems: [{ file: 'f.test.mjs', kind: 'timeout', detail: 'stopped' }] });
    const out = compareExpectations(r, register(['f.test.mjs > a']));
    assert.deepEqual(out.absent, [{ id: 'f.test.mjs > a', provisional: true, reason: 'file had execution problems' }]);
    assert.equal(out.complete, false, 'the comparison does not say the run was incomplete');
  });

  it('marks an id of a file that was not run provisional, and an id missing from a complete file not', () => {
    const out = compareExpectations(report([], {}), register(['f.test.mjs > a', 'g.test.mjs > b']));
    assert.deepEqual(out.absent.map((e) => [e.id, e.provisional]), [['f.test.mjs > a', false], ['g.test.mjs > b', true]]);
  });

  it('still lists what was observed in an incomplete run, as observed', () => {
    const r = report([t('f.test.mjs > a', 'RED'), t('f.test.mjs > b', 'GREEN'), t('f.test.mjs > c', 'UNKNOWN')], { complete: false, problems: [{ file: 'f.test.mjs', kind: 'timeout', detail: 'stopped' }] });
    const out = compareExpectations(r, register(['f.test.mjs > a', 'f.test.mjs > b', 'f.test.mjs > c']));
    assert.deepEqual([out.held.length, out.notHolding.length, out.unconfirmed.length], [1, 1, 1]);
    assert.equal(out.complete, false);
  });

  it('does not change its inputs and gives equal output for equal input', () => {
    const r = report([t('f.test.mjs > a', 'RED')], {});
    const reg = register(['f.test.mjs > a']);
    const before = JSON.stringify([r, reg]);
    const one = compareExpectations(r, reg);
    assert.equal(JSON.stringify([r, reg]), before);
    assert.deepEqual(compareExpectations(r, reg), one);
  });

  it('rejects an invalid register', () => {
    for (const bad of [null, {}, { schema: 'x', expected: [] }, { schema: 'kaal-testing/expected-failures@1' }, register(['a', 'a']), { schema: 'kaal-testing/expected-failures@1', expected: [{ id: 'a', reference: 1 }] }]) assert.throws(() => checkRegister(bad), /invalid register/);
  });
});
