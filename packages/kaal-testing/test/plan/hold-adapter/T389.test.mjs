// Case testing/T389 tests: testing/F159, testing/F162. A catalog defect never lets an otherwise GREEN observation look complete at Hold's boundary.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PKG, REV, caseText, load, report, tree } from './lib.mjs';

export const id = 'testing/T389';
export const tests = ['testing/F159', 'testing/F162'];
export const title = 'with every other Case GREEN, a duplicate id is UNKNOWN in the map and a file with no id makes the evidence incomplete, in the library and through the command';

const ask = (observeCases, cases, findings, r) => observeCases({ report: r, cases, findings, revision: REV, expectedRevision: REV, runId: '1', producedBy: 'pull-request' });
const allGreen = (files) => report({ tests: files.map((file) => ({ file, actual: 'GREEN' })) });

export async function run() {
  const { collectCases } = await load('cases');
  const { observeCases } = await load('observe');

  // a clean catalog is complete
  const clean = collectCases(tree({ 'p/T1.test.mjs': caseText('cap/T1') }));
  const cleanResult = ask(observeCases, clean.cases, clean.findings, allGreen(['p/T1.test.mjs']));
  assert.deepEqual(cleanResult.observed, { 'cap/T1': 'GREEN' });
  assert.equal(cleanResult.evidence.catalog.complete, true, 'a catalog with no finding is complete');

  // a duplicate id: the id stays in the map and is never GREEN
  const dup = collectCases(tree({ 'p/T1.test.mjs': caseText('cap/T1'), 'p/T2.test.mjs': caseText('cap/T2'), 'q/T2.red.mjs': caseText('cap/T2') }));
  const dupResult = ask(observeCases, dup.cases, dup.findings, allGreen(['p/T1.test.mjs', 'p/T2.test.mjs', 'q/T2.red.mjs']));
  assert.equal(dupResult.observed['cap/T1'], 'GREEN', 'the other Case is GREEN');
  assert.equal(dupResult.observed['cap/T2'], 'UNKNOWN', 'a duplicate id is in the map as UNKNOWN, though every test of both files is GREEN');
  assert.match(dupResult.evidence.reasons['cap/T2'], /duplicate/i, 'and says why');
  assert.equal(dupResult.evidence.catalog.complete, false, 'the catalog is not complete');

  // a file with no id: nothing to put in the map, so the evidence must say the catalog is incomplete and name the file
  const none = collectCases(tree({ 'p/T1.test.mjs': caseText('cap/T1'), 'p/T2.test.mjs': 'export const tests = [];\nexport function run() {}\n' }));
  const noneResult = ask(observeCases, none.cases, none.findings, allGreen(['p/T1.test.mjs', 'p/T2.test.mjs']));
  assert.deepEqual(noneResult.observed, { 'cap/T1': 'GREEN' }, 'the map has no id for it');
  assert.equal(noneResult.evidence.catalog.complete, false, 'the evidence says the catalog is incomplete');
  assert.deepEqual(noneResult.evidence.catalog.unobservable, ['p/T2.test.mjs'], 'and names the file');

  // the same through the command
  const root = tree({ 'p/T1.test.mjs': caseText('cap/T1'), 'p/T2.test.mjs': 'export const tests = [];\n' });
  const out = tree({});
  writeFileSync(join(out, 'report.json'), JSON.stringify(allGreen(['p/T1.test.mjs', 'p/T2.test.mjs'])));
  const r = spawnSync(process.execPath, [join(PKG, 'bin/kaal-testing.mjs'), 'observe', '--root', root, '--report', join(out, 'report.json'), '--revision', REV, '--expect-revision', REV, '--run-id', '1', '--produced-by', 'pull-request', '--observed', join(out, 'o.json'), '--evidence', join(out, 'e.json')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(readFileSync(join(out, 'o.json'), 'utf8')), { 'cap/T1': 'GREEN' });
  const evidence = JSON.parse(readFileSync(join(out, 'e.json'), 'utf8'));
  assert.equal(evidence.catalog.complete, false, 'the command writes catalog.complete false');
  assert.deepEqual(evidence.catalog.unobservable, ['p/T2.test.mjs']);
}
