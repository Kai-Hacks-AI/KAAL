import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findUnrecorded } from '../skills/kaal-controls/scripts/verify-delivery.mjs';

const inv = (entries, o = {}) => ({ revision: 's', scope: 'p', complete: true, entries, ...o });
const run = (delivered, declarations = inv([{ id: 'a', path: 'a.md' }])) => findUnrecorded({ declarations, delivered, revision: 's', scope: 'p' });

test('a repeated undeclared entry is named once, sorted', () => assert.deepEqual(run(inv(['z', 'y', 'z'])), ['unrecorded:y', 'unrecorded:z']));
test('an entry matches a declared id or a declared path', () => assert.deepEqual(run(inv(['a', 'a.md'])), []));
test('a declaration entry missing its path throws', () => assert.throws(() => run(inv([]), inv([{ id: 'a' }]))));
test('an entry that is not a string throws', () => assert.throws(() => run(inv([{ id: 'a' }]))));
