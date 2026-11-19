// testing/F145 on Hosting itself: a file that blocks the event loop is stopped by the bound and no process of it survives.
// Not a planned Case (those are immutable to DO); it answers the CPO's acceptance condition for C64.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCases } from '../lib/run.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

it('stops a blocked file through Hosting and leaves no process behind', async () => {
  const pidFile = join(mkdtempSync(join(tmpdir(), 'kaal-term-')), 'pid');
  process.env.KAAL_TERMINATION_PID_FILE = pidFile;
  const started = Date.now();
  const report = await runCases({ files: ['test/run-termination/blocked.fixture.mjs'], root: pkg, timeoutMs: 3000 });
  assert.ok(Date.now() - started < 60000, 'the run returned');
  assert.equal(report.execution.complete, false);
  assert.ok(report.execution.problems.some((p) => p.kind === 'timeout'));
  assert.ok(existsSync(pidFile), 'the blocked test started');
  const pid = Number(readFileSync(pidFile, 'utf8'));
  for (let i = 0; i < 50 && alive(pid); i += 1) await new Promise((r) => setTimeout(r, 100));
  assert.equal(alive(pid), false, `process ${pid} of the stopped file survived`);
});
