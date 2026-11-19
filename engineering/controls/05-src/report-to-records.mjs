#!/usr/bin/env node
// Turns a kaal-testing report into records of control runs (controls/F28). It copies what the runner reported and holds no rule:
// each test of the report becomes { case, x, run, outcome }. Given a base report, a test that was RED there and is GREEN here carries
// base: { run, outcome: 'RED' }, the base/head comparison that shows a `:fail` X (compareReports); a test absent from the base or
// not RED there gets no base.
//
//   node report-to-records.mjs <report.json> --x <kind> --run <id> [--base <report.json> [--base-run <id>]] [--out <file>]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function reportToRecords(report, { x, run, base = null, baseRun = `${run}-base` }) {
  const before = new Map((base?.tests ?? []).map((t) => [t.id, t.actual]));
  return report.tests.map((t) => ({
    case: t.id, x, run, outcome: t.actual,
    ...(base && before.get(t.id) === 'RED' && t.actual === 'GREEN' ? { base: { run: baseRun, outcome: 'RED' } } : {}),
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  const file = a.find((v, i) => !v.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
  const x = opt('--x'); const run = opt('--run');
  if (!file || !x || !run) { console.error('usage: report-to-records.mjs <report.json> --x <kind> --run <id> [--base <report.json> [--base-run <id>]] [--out <file>]'); process.exit(2); }
  const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
  const records = reportToRecords(read(file), { x, run, base: opt('--base') ? read(opt('--base')) : null, baseRun: opt('--base-run') ?? `${run}-base` });
  const text = `${JSON.stringify(records, null, 2)}\n`;
  if (opt('--out')) writeFileSync(opt('--out'), text); else process.stdout.write(text);
}
