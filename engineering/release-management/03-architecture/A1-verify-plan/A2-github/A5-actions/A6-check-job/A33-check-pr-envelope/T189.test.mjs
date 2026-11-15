// Case release/T189 tests: A33
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const runner = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T189';
export const tests = ['release/A33'];
export const title = 'the command line prints the verdict first and exits 0 for PASS, 1 for FAIL and 3 for UNKNOWN, and an UNKNOWN run lists what was not judged and never prints PASS';
export function run() {
  const dir = mkdtempSync(join(tmpdir(), 'envelope-'));
  const registry = { PLAN: ['Change', 'From', 'To', 'Because'], HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'] };
  const planBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const hotfixBody = '## Change\n\nrelease/C99 sample\n\n## Defect\n\nIt fails.\n\n## Urgency\n\nNow.\n\n## Approach\n\nFix it.\n';
  const plan = { registry, title: 'PLAN: Create a sample', body: planBody, base: 'kaal/release/sample', head: 'claude/x', commits: [{ subject: 'x', message: 'x\n\nDriven-by: release/C99\n' }] };
  const hotfix = { registry, title: 'HOTFIX: Restore a sample', body: hotfixBody, base: 'main', head: 'hotfix/restore-sample' };
  let n = 0;
  const call = (facts) => { const file = join(dir, `f${n++}.json`); writeFileSync(file, JSON.stringify(facts)); return spawnSync(process.execPath, [runner, file], { encoding: 'utf8' }); };

  const pass = call(plan);
  assert.equal(pass.status, 0, `a fully judged clean envelope does not exit 0: ${pass.stderr}${pass.stdout}`);
  assert.match(pass.stdout.split('\n')[0], /^PASS/, 'a PASS run does not open with PASS');

  const unknown = call(hotfix);
  assert.equal(unknown.status, 3, `an envelope with unjudged parts does not exit 3: ${unknown.stderr}${unknown.stdout}`);
  assert.match(unknown.stdout.split('\n')[0], /^UNKNOWN/, 'an UNKNOWN run does not open with UNKNOWN');
  assert.doesNotMatch(unknown.stdout, /PASS/, 'an UNKNOWN run prints PASS');
  assert.doesNotMatch(unknown.stdout, /\bok\b/i, 'an UNKNOWN run reports ok, which could be mistaken for a pass');
  assert.match(unknown.stdout, /Not judged/, 'an UNKNOWN run does not list what was not judged');
  assert.match(unknown.stdout, /base/i, 'an UNKNOWN run does not name the unjudged base');

  const fail = call({ ...hotfix, head: 'claude/x' });
  assert.equal(fail.status, 1, 'a finding does not exit 1');
  assert.match(fail.stdout.split('\n')[0], /^FAIL/, 'a FAIL run does not open with FAIL');
  assert.match(fail.stdout, /hotfix\//, 'the finding does not name the head rule');
  assert.match(fail.stdout, /Not judged/, 'a FAIL run hides what was not judged');
}
