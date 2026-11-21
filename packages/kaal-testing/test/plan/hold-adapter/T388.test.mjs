// Case testing/T388 tests: testing/F162, testing/N36. The command writes the map the hold judge reads, decides nothing, and stays within its boundary.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PKG, REV, caseText, report, tree } from './lib.mjs';

export const id = 'testing/T388';
export const tests = ['testing/F162', 'testing/N36'];
export const title = 'kaal-testing observe writes the {id: state} map and an evidence file, exits 0 for RED and UNKNOWN, 2 for invalid input, and leaves root alone';

export function run() {
  const bin = join(PKG, 'bin/kaal-testing.mjs');
  assert.ok(existsSync(bin), 'the bin exists');
  const root = tree({ 'p/T1.test.mjs': caseText('cap/T1'), 'p/T2.test.mjs': caseText('cap/T2') });
  const out = tree({});
  const rep = join(out, 'report.json');
  writeFileSync(rep, JSON.stringify(report({ tests: [{ file: 'p/T1.test.mjs', actual: 'GREEN' }, { file: 'p/T2.test.mjs', actual: 'RED' }] })));
  const before = readdirSync(root, { recursive: true }).sort();
  const args = ['observe', '--root', root, '--report', rep, '--revision', REV, '--expect-revision', REV, '--run-id', '7', '--produced-by', 'pull-request', '--observed', join(out, 'observed.json'), '--evidence', join(out, 'evidence.json')];
  const go = () => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });
  const r = go();
  assert.equal(r.status, 0, `exit 0 although a Case is RED: ${r.stderr}`);
  assert.deepEqual(JSON.parse(readFileSync(join(out, 'observed.json'), 'utf8')), { 'cap/T1': 'GREEN', 'cap/T2': 'RED' }, 'exactly the map judge-act --observed reads');
  const evidence = JSON.parse(readFileSync(join(out, 'evidence.json'), 'utf8'));
  assert.equal(evidence.runId, '7');
  assert.equal(evidence.producedBy, 'pull-request');
  assert.deepEqual(readdirSync(root, { recursive: true }).sort(), before, 'nothing is written under root');
  const first = readFileSync(join(out, 'observed.json'), 'utf8') + readFileSync(join(out, 'evidence.json'), 'utf8');
  go();
  assert.equal(readFileSync(join(out, 'observed.json'), 'utf8') + readFileSync(join(out, 'evidence.json'), 'utf8'), first, 'the same inputs give the same files, byte for byte');

  const bad = spawnSync(process.execPath, [bin, 'observe', '--root', root, '--report', join(out, 'missing.json')], { encoding: 'utf8' });
  assert.equal(bad.status, 2, 'invalid input exits 2');
  assert.equal(spawnSync(process.execPath, [bin, 'observe'], { encoding: 'utf8' }).status, 2, 'no arguments exits 2');

  const pkg = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'));
  assert.equal(pkg.exports['./cases'], './lib/cases.mjs');
  assert.equal(pkg.exports['./observe'], './lib/observe.mjs');
  assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), ['@kaihacksai/kaal-hosting', 'c8'], 'no new dependency');
  assert.ok(Number(process.versions.node.split('.')[0]) >= 24, 'Node 24 or later');
}
