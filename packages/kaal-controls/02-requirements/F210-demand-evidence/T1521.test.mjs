// Case controls/T1521 tests: controls/F210
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1521';
export const tests = ['controls/F210'];
export const title = 'demand Evidence names each fact and the authorization that a discovered activation or enforcement transition lacks, requires proven installation and the right kind of testing, binds authorization to the exact transition and revision, and lets missing, stale or incomplete evidence never permit';
const all = { revision: 's', defined: true, implemented: true, installed: true, running: true, testedPre: true, testedOperational: true };
const t = (kind, o = {}) => ({ control: 'c/CTL1', kind, revision: 's', ...o });
const auth = (kind, o = {}) => ({ control: 'c/CTL1', kind, revision: 's', ...o });
export async function run() {
  const { findEvidenceDue } = await load('demand-evidence.mjs');
  const f = (o = {}) => findEvidenceDue({ discovery: { revision: 's', complete: true }, transitions: [t('enforcement')], facts: { 'c/CTL1': all }, authorizations: [auth('enforcement')], revision: 's', ...o });
  const D = (kind, fact) => `evidence-due:${kind}:${fact}:c/CTL1`;
  assert.deepEqual(f(), [], 'a complete, authorized enforcement was not clean');
  assert.deepEqual(f({ transitions: [t('activation')], authorizations: [auth('activation')], facts: { 'c/CTL1': { ...all, installed: false, running: false, testedOperational: false } } }), [], 'activation was asked for what only exists after a WIRE');
  assert.deepEqual(f({ transitions: [t('activation')], authorizations: [auth('activation')], facts: { 'c/CTL1': { ...all, implemented: false, testedPre: false } } }), [D('activation', 'implemented'), D('activation', 'testedPre')], 'a prerequisite before the WIRE was accepted without proof, or a finding did not name its fact');
  assert.deepEqual(f({ facts: { 'c/CTL1': { ...all, installed: false } } }), [D('enforcement', 'installed')], 'enforcement without proven installation was allowed');
  assert.deepEqual(f({ facts: { 'c/CTL1': { ...all, running: false } } }), [D('enforcement', 'running')], 'enforcement without a run was allowed');
  assert.deepEqual(f({ facts: { 'c/CTL1': { ...all, testedOperational: false, testedPre: true } } }), [D('enforcement', 'testedOperational')], 'pre-installation testing stood in for operational testing');
  assert.deepEqual(f({ transitions: [t('activation')], authorizations: [auth('activation')], facts: { 'c/CTL1': { ...all, testedPre: false, testedOperational: true } } }), [D('activation', 'testedPre')], 'operational testing stood in for pre-installation testing');
  assert.deepEqual(f({ facts: { 'c/CTL1': { ...all, running: false, testedOperational: true } } }), [D('enforcement', 'running')], 'tested was taken to imply running');
  // authorization bound to the exact transition and revision
  const unauthorized = D('enforcement', 'authorized');
  for (const [what, a] of Object.entries({ none: [], 'other kind': [auth('activation')], 'other control': [auth('enforcement', { control: 'c/CTL2' })], 'other revision': [auth('enforcement', { revision: 'other' })] })) assert.deepEqual(f({ authorizations: a }), [unauthorized], `an authorization with ${what} permitted the transition`);
  // missing, stale or incomplete evidence never permits
  const bad = {
    'discovery incomplete': { discovery: { revision: 's', complete: false } },
    'discovery missing': { discovery: undefined },
    'discovery stale': { discovery: { revision: 'other', complete: true } },
    'discovery complete not boolean true': { discovery: { revision: 's', complete: 'yes' } },
    'transition of another revision': { transitions: [t('enforcement', { revision: 'other' })] },
    'unknown kind': { transitions: [t('detective')] },
    'no facts for the control': { facts: {} },
    'null fact': { facts: { 'c/CTL1': { ...all, running: null } } },
    'missing fact': { facts: { 'c/CTL1': { ...all, installed: undefined } } },
    'stale facts': { facts: { 'c/CTL1': { ...all, revision: 'other' } } },
    'malformed authorizations': { authorizations: 'x' },
    'no revision': { revision: '' },
  };
  for (const [what, o] of Object.entries(bad)) assert.throws(() => f(o), `${what} gave a result instead of unknown`);
  assert.deepEqual(f({ transitions: [] }), [], 'a complete discovery of no transitions was not clean');
  // through the adapter: a confirmed finding can be baselined, unknown never passes even with an allowance
  const { runControl } = await load('adapter.mjs');
  const old = [D('enforcement', 'running')];
  const go = (o) => runControl({ id: 'controls/CTL5', mode: 'ratchet', check: () => f(o), input: {}, baseline: old, previous: old, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go({ facts: { 'c/CTL1': { ...all, running: false } } })).verdict, 'PASS', 'a baselined confirmed finding was not allowed');
  assert.equal((await go({ facts: { 'c/CTL1': { ...all, installed: false } } })).verdict, 'FAIL', 'a new confirmed finding passed the ratchet');
  for (const [what, o] of Object.entries(bad)) {
    const r = await go(o);
    assert.equal(r.verdict, 'UNKNOWN', `${what} passed or was filtered by an allowance`);
    assert.equal(r.blocked, true);
  }
}
