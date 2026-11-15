// Case release/T330 tests: F53
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T330';
export const tests = ['release/F53'];
export const title = 'the release judge keeps delivery-scope completeness, the Intent contract, product verification and publication readiness apart, and has no single ready answer';

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/scope/scope-judge.mjs');
  assert.ok(existsSync(src), 'the release judge is absent from the Engineering sources');
  const { judge } = await import(pathToFileURL(src).href);
  const manifest = {
    package: 'p', version: '0.0.1',
    contract: { intents: [{ id: 'release/I1', status: 'retained' }, { id: 'release/I2', status: 'new' }, { id: 'release/I3', status: 'new' }] },
    delivery: { changes: [{ id: 'release/C1', capability: 'release', role: 'required' }, { id: 'release/C2', capability: 'release', role: 'optional' }] },
  };
  const serves = (c) => (c === 'release/C1' ? ['release/I2'] : []);
  const r = judge(manifest, new Set(['release/C1']), serves);
  assert.deepEqual(r.deliveryScope, { complete: true, delivered: ['release/C1'], missing: ['release/C2'] });
  assert.deepEqual(r.contract.unserved, ['release/I3'], 'a new Intent no Change serves is not found, or a retained one is counted');
  assert.equal(r.productVerification, 'UNKNOWN', 'a complete scope is taken for a verified product');
  assert.equal(r.publicationReadiness, 'UNKNOWN', 'a complete scope is taken for publication readiness');
  assert.ok(!('ready' in r), 'a single ready answer is given');
  assert.equal(judge(manifest, new Set(['release/C2']), serves).deliveryScope.complete, false, 'a missing required Change is accepted');
  assert.equal(judge(manifest, new Set(['release/C1'])).contract.unserved, 'UNKNOWN', 'unserved Intents are claimed without traceability');
  const bad = (m) => assert.throws(() => judge(m, new Set()));
  bad({ ...manifest, version: undefined });
  bad({ ...manifest, contract: { intents: [{ id: 'release/I1', status: 'maybe' }] } });
  bad({ ...manifest, contract: { intents: [manifest.contract.intents[0], manifest.contract.intents[0]] } });
  bad({ ...manifest, delivery: { changes: [{ id: 'release/C1', role: 'maybe' }] } });
  bad({ ...manifest, delivery: { changes: [manifest.delivery.changes[0], manifest.delivery.changes[0]] } });
}
