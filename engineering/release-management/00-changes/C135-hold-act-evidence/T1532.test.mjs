// Case release/T1532 tests: release/C135
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1532';
export const tests = ['release/C135'];
export const title = 'in the workflow source, the job that runs candidate Cases holds no write permission, no secret and no kept credential and uploads the run report only, the job that observes runs nothing from the merge result, both revisions are the SHA of the merge result, and hold Act waits for the observation and passes it';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const wf = readFileSync(join(repo, 'engineering/release-management/05-src/wiring/workflows/controls-act.yml'), 'utf8');
  const job = (name) => {
    const at = wf.indexOf(`\n  ${name}:`); assert.ok(at >= 0, `job ${name} is absent`);
    const rest = wf.slice(at + 1); const cut = rest.slice(1).search(/\n  [a-z-]+:\n/);
    return cut < 0 ? rest : rest.slice(0, cut + 1);
  };
  const runC = job('run-cases'), observe = job('observe-cases'), hold = job('hold-act');
  assert.match(wf, /^permissions:\n  contents: read\n/m, 'the workflow grants contents read only');
  assert.doesNotMatch(wf, /secrets\.|permissions:\s*\n\s+(contents|pull-requests|issues|actions): write/, 'no secret and no write permission anywhere');
  let checkouts = 0;
  for (const j of [runC, observe, hold]) for (const m of j.matchAll(/uses: actions\/checkout@[^\n]*\n((?: {8,}.*\n)+)/g)) { checkouts += 1; assert.match(m[1], /persist-credentials: false/, 'every checkout keeps no credential'); }
  assert.equal(checkouts, 6, 'the six checkouts of the three jobs were all read');
  assert.match(runC, /kaal-testing\.mjs run --root "\$GITHUB_WORKSPACE\/pr"/, 'run Cases runs Testing of the default branch over the merge result as its root');
  assert.doesNotMatch(runC, /node pr\/|working-directory: pr|npm [a-z]* .*pr\//, 'run Cases does not run Testing or the judge from the merge result');
  assert.match(runC, /upload-artifact[\s\S]*name: run-report\n\s+path: run-report\.json/, 'run Cases uploads the run report and nothing else');
  assert.ok((runC.match(/upload-artifact/g) ?? []).length === 1, 'one upload');
  for (const [name, j] of [['run Cases', runC], ['observe Cases', observe]]) {
    for (const m of j.matchAll(/npm [^\n]*/g)) assert.match(m[0], /^npm (ci --ignore-scripts|run build -w kaal-core -w @kaihacksai\/kaal-hosting)$/, `${name}: the only installation is trusted Testing's, without lifecycle scripts`);
    assert.doesNotMatch(j, /--prefix|working-directory|cd pr|npm [^\n]* pr\b/, `${name}: nothing is installed in or from the merge result`);
  }
  assert.match(observe, /needs: run-cases/, 'observe Cases waits for the run');
  assert.doesNotMatch(observe, /node pr\/|working-directory: pr|cd pr|npm [a-z]* .*pr\/|\.\/pr\//, 'observe Cases runs nothing from the merge result');
  assert.match(observe, /--revision "\$OBSERVED_REVISION" --expect-revision "\$OBSERVED_REVISION"/, 'both revisions are the SHA of the merge result');
  assert.match(hold, /needs: observe-cases/, 'hold Act waits for the observation');
  assert.match(hold, /if \[ -s observation\.json \]; then evidence="--evidence observation\.json"; fi\n\s+node [^\n]*run-controls-act\.mjs hold [^\n]*--contained contained \$evidence\n/, 'hold Act passes the observation when it was handed one and still runs, saying UNKNOWN, when it was not');
  assert.match(wf, /OBSERVED_REVISION: \$\{\{ github\.sha \}\}/, 'the revision is the merge result');
}
