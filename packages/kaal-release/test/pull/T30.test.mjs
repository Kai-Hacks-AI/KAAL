// Case pull/T30 tests: pull/F31
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { declaration, execution, facts, good, scriptPath, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T30';
export const tests = ['pull/F31'];
export const title = 'the qualifiers come out in the declared order with next judged while they carry no value (pull/F38 replaces the first-qualifier rule), none qualifying says why, and the Script is advisory, read-only and imports only a file reader';
export async function run() {
  const red = good('col-a', { executions: [execution('T1', 'col-a-head', 'failure'), execution('T2', 'col-a-head')] });
  const result = await walkCollectors({ collectors: [red, good('col-b'), good('col-c')] }, declaration());
  assert.equal(statusOf(result, 'col-a').status, 'does not qualify');
  assert.deepEqual(result.qualifiers, ['col-b', 'col-c'], 'the qualifiers are not those that qualify, in the declared order');
  assert.equal(result.next.collector, null, 'several qualifiers without a value must be judged, not ordered');
  assert.deepEqual(result.next.judged, ['col-b', 'col-c']);
  const reordered = await walkCollectors({ collectors: [red, good('col-b'), good('col-c')] }, declaration({ collectors: [{ name: 'col-c' }, { name: 'col-b' }, { name: 'col-a' }] }));
  assert.deepEqual(reordered.qualifiers, ['col-c', 'col-b'], 'the order is not the declaration\'s alone');
  assert.equal(reordered.next.collector, null);
  assert.deepEqual(reordered.next.judged, ['col-c', 'col-b']);
  const none = await walkCollectors({ collectors: [red] }, declaration({ collectors: [{ name: 'col-a' }] }));
  assert.equal(none.next.collector, null);
  assert.ok(none.next.reason && none.collectors[0].missing.length > 0, 'none qualifying does not say why');
  for (const r of [result, reordered, none]) {
    assert.ok(!/READY|BLOCKED|may promote|authoriz|\bOPEN\b|\bLAND\b|\bWAIT\b/.test(JSON.stringify(r)), 'the output claims readiness, an authorization or an action');
  }
  const source = readFileSync(scriptPath, 'utf8');
  const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.ok(imports.every((name) => name === 'node:fs'), `imports more than a file reader: ${imports.join(', ')}`);
  for (const forbidden of ['show-wip', 'analyze', 'process.env', 'fetch(', 'writeFile', 'spawn', 'execFile', 'pieces', 'Driven-by']) {
    assert.ok(!source.includes(forbidden), `the Script names or uses ${forbidden}`);
  }
  // the command line: two files in, the same result out
  const dir = mkdtempSync(join(tmpdir(), 'pull-state-'));
  const f = join(dir, 'facts.json'); const d = join(dir, 'declaration.json');
  writeFileSync(f, JSON.stringify(facts())); writeFileSync(d, JSON.stringify(declaration()));
  const out = spawnSync(process.execPath, [scriptPath, f, d], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.equal(out.status, 0, `the command line failed: ${out.stderr}`);
  assert.equal(JSON.stringify(JSON.parse(out.stdout)), JSON.stringify(await walkCollectors(facts(), declaration())));
}
