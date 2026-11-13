// Case pull/T22 tests: pull/F24
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bad, collector, declaration, facts, lifecycle, ok, scriptPath, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T22';
export const tests = ['pull/F24'];
export const title = 'the Script reports and decides nothing beyond PDCA: it never says ready or that a promotion may happen, reads no review, no distance to the target and nothing of Show WIP, imports only a file reader, and its command line reads two files and prints the same result';
export async function run() {
  const results = [
    await walkCollectors(facts(), declaration()),
    await walkCollectors(facts({ collectors: [collector('col-a', [bad('build'), ok('suite')]), collector('col-b'), collector('col-c')] }), declaration()),
    await walkCollectors(facts({ pieces: lifecycle('col-a').slice(0, 1) }), declaration()),
  ];
  for (const result of results) {
    const text = JSON.stringify(result);
    assert.ok(!/READY|BLOCKED|may promote|authoriz|escalate|\bOPEN\b|\bREVIEW\b|\bLAND\b|\bWAIT\b|\bREVISE\b/.test(text), `the output claims readiness, an authorization or an action: ${text.slice(0, 200)}`);
  }
  const source = readFileSync(scriptPath, 'utf8');
  const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.ok(imports.every((name) => name === 'node:fs'), `imports more than a file reader: ${imports.join(', ')}`);
  for (const forbidden of ['analyze', 'show-wip', 'lane', 'behindTarget', 'review', 'process.env', 'fetch(', 'writeFile', 'spawn', 'execFile']) {
    assert.ok(!source.includes(forbidden), `the Script names or uses ${forbidden}`);
  }
  // the command line: two files in, the same result out, exit 0 whenever it printed a result
  const dir = mkdtempSync(join(tmpdir(), 'pull-v1-'));
  const f = join(dir, 'facts.json'); const d = join(dir, 'declaration.json');
  writeFileSync(f, JSON.stringify(facts())); writeFileSync(d, JSON.stringify(declaration()));
  const run1 = spawnSync(process.execPath, [scriptPath, f, d], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.equal(run1.status, 0, `the command line failed: ${run1.stderr}`);
  assert.equal(JSON.stringify(JSON.parse(run1.stdout)), JSON.stringify(await walkCollectors(facts(), declaration())), 'the command line prints another result');
  const missing = spawnSync(process.execPath, [scriptPath, join(dir, 'nope.json'), d], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /nope\.json/, 'an unreadable file is not named');
}
