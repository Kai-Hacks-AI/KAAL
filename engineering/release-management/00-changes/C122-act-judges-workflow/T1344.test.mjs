// Case release/T1344 tests: release/A101
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, RM, RUNNER, ROOT, RETROS, ACT_PATHS, makeTrees, gitMerge, retroText } from './act-fixtures.mjs';
const lib = () => import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
const runner = () => import(pathToFileURL(RUNNER).href);
const answerOf = async (name, spec, changed = ACT_PATHS) => {
  const t = makeTrees(spec);
  try { const { readTree } = await lib(); const { judgeOf } = await runner(); return judgeOf(name, await readTree({ main: t.main, collector: t.pr, changed }), t.pr); } finally { t.cleanup(); }
};
export const id = 'release/T1344';
export const tests = ['release/A101'];
export const title = "the workflow keeps the pull request as data: pull_request, never pull_request_target, no token, no installation, the judge is the default branch's, four jobs of their own flag";
export async function run() {
  const f = join(RM, '05-src/wiring/workflows/controls-act.yml');
  assert.ok(existsSync(f), 'controls-act.yml is absent');
  const t = readFileSync(f, 'utf8');
  const code = t.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /^on:\n  pull_request:/m); assert.doesNotMatch(code, /pull_request_target/);
  assert.doesNotMatch(code, /secrets\.|GH_TOKEN|GITHUB_TOKEN|create-github-app-token|permissions:\s*\n\s+(pull-requests|contents): write/);
  // release/C135 adds two jobs that produce Testing's observation (run Cases, observe Cases). They install Testing from the default branch, and only there: the judge jobs below still install
  // nothing and keep their counts, so the property of this Case is read over the judge jobs; the producer jobs have their own Case (release/T1532).
  const judges = code.replace(/\n  (run-cases|observe-cases):\n[\s\S]*?(?=\n  [a-z-]+:\n)/g, '');
  assert.notEqual(judges, code, 'the producer jobs are set apart');
  assert.doesNotMatch(judges, /npm (ci|install)|pnpm|yarn/);
  assert.equal((judges.match(/persist-credentials: false/g) ?? []).length, 10);
  assert.equal((judges.match(/ref: \$\{\{ github\.event\.repository\.default_branch \}\}/g) ?? []).length, 5);
  assert.equal((judges.match(/refs\/pull\/\$\{\{ github\.event\.pull_request\.number \}\}\/merge/g) ?? []).length, 5);
  for (const j of ['hold', 'demand', 'verify', 'limit']) {
    assert.match(code, new RegExp(`name: ${j} Act\\n`)); assert.match(code, new RegExp(`KAAL_FLAG: \\$\\{\\{ vars\\.KAAL_RELEASE_${j.toUpperCase()}_ACT \\}\\}`));
    assert.match(code, new RegExp(`run-controls-act\\.mjs ${j} --main \\. --pr pr`));
  }
}
