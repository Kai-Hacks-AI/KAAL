// Case release/T843 tests: release/C64
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { WORKFLOW } from './fixtures.mjs';
export const id = 'release/T843';
export const tests = ['release/C64'];
export const title = 'the workflow source runs daily and on demand, builds with read-only rights, publishes only from a successful build on the default branch, and pins every action';
export async function run() {
  assert.ok(existsSync(WORKFLOW), 'show-wip-page.yml is absent from 05-src/wiring/workflows');
  const text = readFileSync(WORKFLOW, 'utf8');
  const code = text.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  const job = (name) => (code.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, 'm')) ?? [])[1] ?? '';
  assert.match(code, /^on:\n  schedule:\n    - cron: "\d+ \d+ \* \* \*"/m, 'the job is not scheduled once a day');
  assert.match(code, /^  workflow_dispatch:/m, 'the job cannot be run on demand');
  assert.ok(!/pull_request|^  push:/m.test(code), 'the job runs on a pull request or a push');
  const top = code.split(/^jobs:/m)[0];
  assert.match(top, /^permissions:\n  contents: read\n  pull-requests: read\n/m, 'the default rights are not read-only');
  assert.ok(!/write/.test(top), 'the default rights hold a write');
  const build = job('build'), deploy = job('deploy');
  assert.ok(build && deploy, 'the build or the deploy job is absent');
  assert.ok(!/write|id-token/.test(build), 'the build job holds a write right');
  assert.match(deploy, /needs: build/, 'the deploy does not need the build');
  assert.match(deploy, /pages: write/); assert.match(deploy, /id-token: write/); assert.match(deploy, /name: github-pages/);
  for (const j of [build, deploy]) assert.match(j, /default_branch/, 'a job is not guarded by the default branch');
  assert.match(build, /show-wip\/run\.mjs[^\n]* overview/); assert.match(build, /show-wip\/run\.mjs[^\n]* settled/); assert.match(build, /build-page\.mjs/);
  assert.match(build, /upload-pages-artifact/); assert.match(deploy, /deploy-pages/);
  const uses = [...code.matchAll(/uses: (\S+)/g)].map((m) => m[1]);
  assert.ok(uses.length >= 4, 'the actions are not found');
  for (const u of uses) assert.match(u, /^[\w-]+\/[\w-]+@[0-9a-f]{40}$/, `${u} is not pinned to a commit`);
  assert.ok(!/secrets\./.test(code), 'the job reads a secret');
}
