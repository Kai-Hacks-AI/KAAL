// Case release/T583 tests: G71
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRC, load, NOW, hostRun, hostChecks } from '../C104-accept-analyze/fixtures.mjs';
const here = fileURLToPath(import.meta.url).replace(/[^/]+$/, '');
export const id = 'release/T583';
export const tests = ['release/G71'];
export const title = 'gap release/G71 is closed: the acceptance of analyze Vulnerabilities (Promoting) is judged from a real merge-queue run read from the host, and no record of a run is stored';
export async function run() {
  for (const f of ['acceptance.mjs', 'accept.mjs']) assert.ok(existsSync(join(SRC, f)), `${f} is absent`);
  const { readFacts } = await load('accept.mjs');
  const { judgeAcceptance } = await load('acceptance.mjs');
  const ask = (path) => (path.includes('/check-runs') ? { check_runs: hostChecks } : { workflow_runs: [hostRun] });
  const result = judgeAcceptance(readFacts('Kai-Hacks-AI/KAAL', ask), { now: NOW });
  assert.equal(result.outcome, 'PASS', result.reason);
  assert.equal(result.run.id, hostRun.id);
  assert.ok(!existsSync(join(here, 'acceptance.md')), 'a stored acceptance record exists: the evidence is read from the host, not kept');
}
