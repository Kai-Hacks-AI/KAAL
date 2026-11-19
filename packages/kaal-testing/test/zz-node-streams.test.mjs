// TEMPORARY diagnostic for testing/C64: prints the reporter streams of every fixture on the CI runtime. Removed once read.
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCases } from '../lib/run.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
it('prints the streams', async () => {
  const fx = 'test/plan/run-cases/fixtures';
  const files = readdirSync(join(pkg, fx)).filter((n) => n.endsWith('.fixture.mjs') && n !== 'block.fixture.mjs' && n !== 'hang.fixture.mjs').map((n) => `${fx}/${n}`);
  const dir = join(mkdtempSync(join(tmpdir(), 'kaal-diag-')), 's');
  const report = await runCases({ files, root: pkg, streamsDir: dir, timeoutMs: 60000 });
  console.log(`NODE ${process.version}`);
  for (const n of readdirSync(dir).sort()) console.log(`STREAM ${n}\n${readFileSync(join(dir, n), 'utf8')}`);
  console.log('REPORT', JSON.stringify(report.tests.map((t) => [t.id.split('fixtures/')[1], t.actual, t.reason ?? '']), null, 0), JSON.stringify(report.execution.problems));
});
