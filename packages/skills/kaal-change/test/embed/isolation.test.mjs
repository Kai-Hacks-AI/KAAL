import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isolate } from '@kaihacksai/kaal-change/isolation';
import { example, cyclic, charge, driver, subjectCase, providerContract, RateProvider } from '../fixtures/model.mjs';

const assessed = options => { const { proposal, model } = example(options); return isolate(proposal, model); };
test('change/T41 [change/F38]: refuse malformed statements whole', () => {
  const { proposal, model } = example();
  assert.equal(isolate(proposal, model).assessment, 'isolated');
  for (const alters of [[], ['shop/I1', 'shop/I1'], ['path/file.js'], null])
    assert.equal(isolate({ ...proposal, alters }, model).assessment, 'violated');
  for (const scope of [[], ['shop', 'shop'], ['packages/shop'], ['shop/C1'], null])
    assert.equal(isolate({ ...proposal, scope }, model).assessment, 'violated');
});
test('change/T42 [change/F39]: include nonfunctional and Defect regression paths', () => {
  const r = assessed();
  for (const identity of ['shop/I1', 'shop/F1', 'shop/N1', 'shop/D1', 'shop/A1', 'shop/T1', 'shop/R1'])
    assert.ok(r.impact.some(e => e.identity === identity), identity);
  assert.ok(r.obligations.some(o => o.kind === 'regression' && o.target === 'shop/D1'));
  assert.ok(r.obligations.some(o => o.target === 'shop/N1'));
  for (const omitElement of ['shop/D1', 'shop/N1'])
    assert.equal(assessed({ omitElement }).assessment, 'unknown');
});
test('change/T43 [change/F39, change/F43]: discover a new dependent without editing Change', () => {
  assert.equal(assessed().impact.some(e => e.identity === 'audit/A1'), false);
  const r = assessed({ extraDependent: true });
  assert.equal(r.assessment, 'isolated');
  assert.ok(r.impact.some(e => e.identity === 'audit/A1'));
  assert.ok(r.affectedOutside.some(e => e.identity === 'audit/A1'));
  const cycle = cyclic();
  assert.equal(isolate(cycle.proposal, cycle.model).assessment, 'isolated');
  assert.equal(isolate(cycle.proposal, cycle.model).impact.length, 2);
});
test('change/T44 [change/F40]: retain both interface directions and detect either missing inventory', () => {
  const r = assessed();
  assert.deepEqual(r.boundaries.map(b => b.direction).sort(), ['incoming', 'outgoing']);
  for (const omitInterface of ['web/A2', 'shop/A2'])
    assert.equal(assessed({ omitInterface }).assessment, 'unknown');
  assert.ok(r.obligations.some(o => o.kind === 'driver'));
  assert.ok(r.obligations.some(o => o.kind === 'controlled-collaborator'));
});
test('change/T45 [change/F41]: incoming driver exercises real subject; replacing subject loses discrimination', () => {
  assert.deepEqual(driver(charge, { basisPoints: () => 2500 }), [0, 1250, 2500]);
  assert.equal(subjectCase(charge), true);
  assert.equal(subjectCase(() => 1250), false);
  assert.equal(subjectCase(amount => amount), false);
  const r = assessed();
  assert.ok(r.obligations.some(o => o.kind === 'real-subject' && o.target === 'shop/R1'));
  assert.ok(r.obligations.every(o => o.status === 'not-assessed'));
});
test('change/T46 [change/F42]: passing doubles do not establish real provider compatibility', () => {
  const double = { basisPoints: () => 2500 }, realProvider = new RateProvider(0.25);
  assert.equal(subjectCase(charge), true);
  assert.equal(providerContract(double), true);
  assert.equal(providerContract(new RateProvider(25)), true);
  assert.equal(providerContract(realProvider), false);
  assert.notDeepEqual(driver(charge, realProvider), driver(charge, double));
  const r = assessed();
  for (const kind of ['contract', 'real-integration'])
    assert.ok(r.obligations.some(o => o.kind === kind && o.status === 'not-assessed'));
  assert.deepEqual([...new Set(r.obligations.map(o => o.loop))].sort(),
    ['architecture-conformance', 'capability-acceptance', 'implementation']);
});
test('change/T47 [change/F43, change/F44]: missing owner/trace facts and authority flags cannot establish authority', () => {
  const { proposal, model, graph } = example();
  assert.equal(isolate(proposal, { ...model, sources: model.sources.slice(1) }).assessment, 'unknown');
  const incomplete = { ...model, graph: { resolve: graph.resolve.bind(graph), check: () => [],
    out: () => [], traverse: graph.traverse.bind(graph) } };
  assert.equal(isolate(proposal, incomplete).assessment, 'unknown');
  assert.equal(isolate(proposal, { ...model, complete: true, authoritative: true }).authority.status, 'unestablished');
  assert.equal(isolate(proposal, { ...model, graph: undefined }).assessment, 'unknown');
  assert.equal(isolate(proposal, { ...model, sources: [] }).assessment, 'unknown');
  assert.equal(isolate(proposal, { ...model, owners: [] }).assessment, 'unknown');
});
test('change/T49 [change/F44, change/N10]: deterministic immutable facts and stale proposal binding', () => {
  const { proposal, model } = example();
  const before = JSON.stringify({ proposal, owners: model.owners, sources: model.sources });
  const r = isolate(proposal, model);
  assert.deepEqual(isolate(proposal, { ...model, owners: [...model.owners].reverse(), sources: [...model.sources].reverse() }), r);
  assert.equal(JSON.stringify({ proposal, owners: model.owners, sources: model.sources }), before);
  assert.equal(isolate({ ...proposal, ref: { ...proposal.ref, id: '0'.repeat(64) } }, model).assessment, 'unknown');
  assert.ok(r.modelDigest.match(/^[0-9a-f]{64}$/));
  assert.equal(r.execution.status, 'not-assessed');
  assert.deepEqual(r.proposal, proposal.ref);
  assert.equal(r.sources.length, model.sources.length);
});
