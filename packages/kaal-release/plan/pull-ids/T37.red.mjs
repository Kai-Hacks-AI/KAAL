// Case pull/T37 tests: pull/F37
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T37';
export const tests = ['pull/F37'];
export const title = 'the Show WIP Cases and pull/T34 sit at the path their id names and are logged under that id as successes';

// The shape of an execution line in a job log: timestamp, mark, scoped id (self-contained; the gatherer is not loaded).
const LINE = /^(\d{4}-\d\d-\d\dT[\d:.]+Z)\s+\s*(✔|✖|√|×)\s+([a-z][a-z-]*\/T\d+)\b/u;
const SUBJECTS = [...Array.from({ length: 12 }, (_, i) => `coordination/T${33 + i}`), 'pull/T34'];

export async function run() {
  for (const subject of SUBJECTS) {
    const [scope, name] = subject.split('/');
    const file = join(repo, 'packages/kaal-release/test', scope, `${name}.test.mjs`);
    assert.ok(existsSync(file), `${subject} is not at ${file.slice(repo.length + 1)}`);
  }
  // A child of a node:test run must not inherit its context, or it reports to the parent instead of printing the log lines.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const tests = ['packages/kaal-release/test/show-wip.test.mjs', 'packages/kaal-release/test/wire.test.mjs'];
  const ran = spawnSync(process.execPath, ['--test', '--test-reporter=spec', ...tests], { cwd: repo, encoding: 'utf8', env });
  const logged = (ran.stdout + ran.stderr).split('\n').map((l) => LINE.exec(`2026-01-01T00:00:00.0000000Z ${l}`)).filter(Boolean).map((m) => ({ id: m[3], ok: m[2] === '✔' || m[2] === '√' }));
  for (const subject of SUBJECTS) {
    const hit = logged.find((l) => l.id === subject);
    assert.ok(hit, `${subject} has no logged execution`);
    assert.ok(hit.ok, `${subject} is logged but not as a success`);
  }
  assert.equal(ran.status, 0, 'the Show WIP and wiring tests do not all pass');
}
