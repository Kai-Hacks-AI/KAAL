import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCollectors } from './projection.mjs';
import { collectorCatalog } from './catalog.mjs';
import { reportFullAssurance } from './report.mjs';
import { fullExpected } from '../full-policy.mjs';
import { judgeFullMatrix } from '../full-gate.mjs';
import { fixture } from '../full-fixtures.mjs';
const report = f => reportFullAssurance(f.authority, f.manifest, f.evidence, f.context, f.now);
const roots = ['capabilities', 'governance', 'security'];
const project = (f, catalog = collectorCatalog) => projectCollectors(fullExpected(f.authority).workflows, catalog, roots);
for (const [label, change, pattern] of [
  ['missing collector', c => { c.groups = c.groups.filter(g => g.id !== 'guard'); }, /unknown collector/],
  ['cycle', c => { c.groups.find(g => g.id === 'capabilities').children.push('capabilities'); }, /cycle/],
  ['omitted matrix family', c => { c.groups.find(g => g.id === 'capabilities').children.pop(); c.groups = c.groups.filter(g => g.id !== 'guard'); }, /unassigned obligation/],
  ['duplicate owner', c => { c.groups.find(g => g.id === 'hosting').selectors.push({workflow: '.github/workflows/ci.yml', jobKeys: ['guard']}); }, /multiple collectors/],
  ['duplicate identity', c => { c.groups.push(structuredClone(c.groups[0])); }, /duplicate collector/],
]) test(`N1 projection refuses ${label}`, () => {
  const f = fixture(), c = structuredClone(collectorCatalog); change(c);
  assert.throws(() => project(f, c), pattern);
});
test('N1 projection refuses an unknown added obligation instead of reducing the inventory', () => {
  const f = fixture(), workflows = structuredClone(fullExpected(f.authority).workflows);
  workflows[0].jobs.push({job: 'new-capability', check: 'New Capability', os: 'Linux'});
  assert.throws(() => projectCollectors(workflows, collectorCatalog, roots), /unassigned obligation/);
});
test('N1 projection is descriptive, deterministic and leaves caller inputs unchanged', () => {
  const f = fixture(), workflows = fullExpected(f.authority).workflows;
  const before = JSON.stringify(workflows), a = project(f), b = project(f);
  assert.deepEqual(a, b); assert.equal(JSON.stringify(workflows), before);
  assert.equal(a.verdict, undefined); assert.equal(a.leaves.length, 17);
  assert.deepEqual(new Set(a.groups.filter(g => roots.includes(g.id)).flatMap(g => g.leafIds)), new Set(a.leaves.map(l => l.id)));
});
for (const [label, change] of [
  ['failed leaf', f => { f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].conclusion = 'failure'; }],
  ['skipped leaf', f => { f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].conclusion = 'skipped'; }],
  ['cancelled leaf', f => { f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].conclusion = 'cancelled'; }],
  ['missing OS', f => { const page = f.evidence.runPages[0].runs[0].jobsPages[0]; page.jobs.pop(); page.total_count--; }],
  ['competing run', f => { const page = f.evidence.runPages[0]; const run = structuredClone(page.runs[0]); run.runId++; page.runs.push(run); page.total_count++; }],
  ['partial rerun', f => { const run = f.evidence.runPages[0].runs[0]; run.attempt++; run.jobsPages[0].jobs.forEach(j => j.attempt++); run.jobsPages[0].jobs.pop(); run.jobsPages[0].total_count--; }],
  ['stale target', f => { f.context.baseRef = 'main'; }],
  ['stale head', f => { f.context.headSha = 'f'.repeat(40); }],
  ['same-App wrong workflow', f => { f.evidence.runPages[0].runs[0].path = '.github/workflows/forged.yml'; }],
  ['truncated page', f => { f.evidence.runPages[0].total_count++; }],
]) test(`N1 report preserves the sole evaluator's refusal: ${label}`, () => {
  const f = fixture(); change(f);
  const expected = judgeFullMatrix(f.authority, f.manifest, f.evidence, f.context, f.now), r = report(f);
  assert.notEqual(expected.verdict, 'passed');
  assert.equal(r.verdict, expected.verdict);
  assert.deepEqual(r.errors, expected.errors);
  assert.ok(r.groups.every(g => g.assurance !== 'certified-by-full-matrix'));
});
test('N1 report refuses copied authority and has no Hotfix admission or selective mode', () => {
  const f = fixture();
  const r = reportFullAssurance({...f.authority}, f.manifest, f.evidence, f.context, f.now);
  assert.equal(r.verdict, 'unresolved');
  assert.equal(r.profile, null);
  assert.throws(() => fixture('pull_request', 'hotfix/urgent'));
  f.manifest.mode = 'impact-aware'; f.manifest.selected.pop();
  assert.notEqual(report(f).verdict, 'passed');
});
