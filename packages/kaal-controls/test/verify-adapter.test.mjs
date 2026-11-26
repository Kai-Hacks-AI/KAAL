import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findUnadapted } from '../skills/kaal-controls/scripts/verify-adapter.mjs';

const ctl = (id, stations = ['S:detective']) => ({ id, stations });
const ob = (control, adapted) => ({ control, revision: 's', adapted });
const run = (o) => findUnadapted({ controls: [ctl('a'), ctl('b')], delivered: [], observed: o, revision: 's' });

test('an unknown keeps what was confirmed on the error', () => {
  try { run([ob('a', false)]); assert.fail('did not throw'); } catch (e) {
    assert.deepEqual(e.confirmed, ['unadapted:a']);
    assert.deepEqual(e.unknown, ['unobserved:b']);
  }
});
test('a repeated identical observation is not a contradiction', () => {
  assert.deepEqual(run([ob('a', true), ob('a', true), ob('b', false)]), ['unadapted:b']);
});
test('findings are sorted', () => {
  assert.deepEqual(run([ob('b', false), ob('a', false)]), ['unadapted:a', 'unadapted:b']);
});
