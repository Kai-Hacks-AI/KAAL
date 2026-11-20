// Case release/T1269 tests: release/C104
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, load, hostRun, hostChecks } from './fixtures.mjs';
export const id = 'release/T1269';
export const tests = ['release/C104'];
export const title = 'the acceptance command only reads: it asks the host with GET, picks the newest merge-queue run into main, and writes nothing';
export async function run() {
  const file = join(SRC, 'accept.mjs');
  assert.ok(existsSync(file), 'the acceptance command is absent');
  const src = readFileSync(file, 'utf8');
  const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.ok(code.includes("'-X', 'GET'"), 'the command does not ask with GET');
  assert.ok(!/POST|PATCH|PUT|DELETE|writeFile|appendFile|mkdir|unlink|rmSync/.test(code), 'the command can write or change something');
  const { readFacts } = await load('accept.mjs');
  const asked = [];
  const other = { ...hostRun, id: 1, head_branch: 'gh-readonly-queue/kaal/release/x/pr-1-abc' };
  const ask = (path) => { asked.push(path); return path.includes('/check-runs') ? { check_runs: hostChecks } : { workflow_runs: [other, hostRun] }; };
  const facts = readFacts('Kai-Hacks-AI/KAAL', ask);
  assert.equal(facts.run.id, hostRun.id, 'a queue run into another branch was picked');
  assert.ok(asked[0].startsWith('repos/Kai-Hacks-AI/KAAL/actions/workflows/analyze-vulnerabilities.yml/runs'), 'the runs of the analyze workflow were not asked for');
  assert.ok(asked[1].includes(hostRun.head_sha) && asked[1].includes('/check-runs'), 'the check runs of the run commit were not asked for');
  assert.deepEqual(facts.checks.map((c) => c.appId), [15368, 15368]);
  assert.deepEqual(readFacts('Kai-Hacks-AI/KAAL', () => ({ workflow_runs: [] })), { run: null, checks: [] });
}
