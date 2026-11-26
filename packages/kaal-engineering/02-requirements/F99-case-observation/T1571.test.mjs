// Case engineering/T1571 tests: engineering/F99
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1571';
export const tests = ['engineering/F99'];
export const title = 'two jobs: run-cases runs the Cases, observe-cases needs it, runs no candidate code and calls observe-at --report';
export async function run() {
  const y = load();
  const job = (name) => { const m = y.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, 'm')); assert.ok(m, `job ${name}`); return m[1]; };
  const runJob = job('run-cases'), obsJob = job('observe-cases');
  assert.ok(/kaal-testing(\.mjs)?\s+run\b/.test(runJob) && !/observe-at/.test(runJob), 'run-cases runs the Cases and does not observe');
  assert.ok(/needs:\s*run-cases/.test(obsJob), 'observe-cases needs run-cases');
  assert.ok(!/kaal-testing(\.mjs)?\s+run\b/.test(obsJob), 'observe-cases runs no Case');
  const call = obsJob.match(/observe-at[^\n]*(\\\n[^\n]*)*/);
  assert.ok(call, 'observe-cases calls observe-at');
  for (const f of ['--report', '--root', '--revision', '--expect-revision', '--run-id', '--produced-by pull-request', '--out']) assert.ok(call[0].includes(f), `observe-at needs ${f}`);
}
