// Case release/T614 tests: release/CTL3
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { declaration, directory, manifest, registry, judge } from './fixtures.mjs';
export const id = 'release/T614';
export const tests = ['release/CTL3'];
export const title = 'the judge is pure and host-neutral: it imports nothing, calls no network, process or write API, and holds no scope or repository of its own, so another declaration gives another judgment';
const JUDGE = new URL('../../05-src/publishing/readiness/judge.mjs', import.meta.url);
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const source = readFileSync(fileURLToPath(JUDGE), 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(!/\bimport\b/.test(source), 'the judge imports something');
  assert.ok(!/\b(fetch|child_process|spawn|writeFile|appendFile|mkdir|process\.env)\b/.test(source), 'the judge touches the network, a process, a write or the environment');
  assert.ok(!/kaihacksai|Kai-Hacks-AI/.test(source), 'the judge holds a scope or a repository');
  const other = { scope: '@other/', repository: 'git+https://example.org/other.git' };
  const input = { manifest: manifest(), directory, registry: registry() };
  assert.equal(mod.judgeReadiness(input, declaration).result, 'verified');
  const rules = mod.judgeReadiness(input, other).findings.map((f) => f.rule);
  assert.ok(rules.includes('scope') && rules.includes('repository-url'), 'another declaration does not change the judgment');
  assert.deepEqual(mod.judgeReadiness(input, declaration), mod.judgeReadiness(JSON.parse(JSON.stringify(input)), declaration), 'the judgment is not deterministic');
}
