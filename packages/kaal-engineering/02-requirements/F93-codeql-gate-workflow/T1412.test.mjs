// Case engineering/T1412 tests: engineering/F93
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, gateJobs } from './fixture.mjs';
export const id = 'engineering/T1412';
export const tests = ['engineering/F93'];
export const title = 'each gate job runs its judge on the result of analyze and then judge-mode in preventive mode on the findings file, the judge step first';
export async function run() {
  const judges = { 'verify CodeQL analysis': 'judge-codeql-analysis.mjs', 'verify CodeQL findings': 'judge-codeql-findings.mjs' };
  for (const { name, job } of gateJobs(readFileSync(src, 'utf8'))) {
    assert.ok(job, `no job named ${name}`);
    const runs = [...job.matchAll(/^\s*run: (.+)$/gm)].map((m) => m[1]);
    assert.equal(runs.length, 2, `${name} does not have exactly the two steps that run`);
    assert.match(runs[0], new RegExp(`^node engineering/release-management/05-src/codeql-gate/${judges[name]} --out "\\$RUNNER_TEMP/findings\\.json"$`), `${name}: the first step is not its judge`);
    assert.match(runs[1], /^node packages\/kaal-controls\/skills\/kaal-controls\/scripts\/judge-mode\.mjs --mode preventive --findings "\$RUNNER_TEMP\/findings\.json"$/, `${name}: the second step is not judge-mode in preventive mode`);
    assert.match(job, /CODEQL_ANALYZE_RESULT:\s*\$\{\{\s*needs\.analyze\.result\s*\}\}/, `${name} does not pass the result of analyze`);
    assert.match(job, /GITHUB_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/, `${name} does not pass the token`);
  }
}
