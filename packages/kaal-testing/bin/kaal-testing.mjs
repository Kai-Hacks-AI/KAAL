#!/usr/bin/env node
// kaal-testing run [--root dir] [--timeout ms] [--streams dir] [--expect register.json] <files…>: prints the run report as JSON.
// With --expect the report also lists how the run compares with a register of expected failures; it still decides nothing.
// Exit 0 whenever a report was produced (RED, UNKNOWN and problems included); non-zero only for invalid input. Nobody takes acceptance from this exit code.
import { resolve } from 'node:path';
import { readFile } from '@kaihacksai/kaal-hosting';
import { checkRegister, compareExpectations } from '../lib/expectations.mjs';
import { runCases } from '../lib/run.mjs';

const observeUsage = 'usage: kaal-testing observe [--root dir] --report run-report.json [--form-report case-form.json] --revision sha --expect-revision sha --run-id id --produced-by who --observed file --evidence file';
const usage = 'usage: kaal-testing run [--root dir] [--timeout ms] [--streams dir] [--expect register.json] <files…>';
const argv = process.argv.slice(2);
// observe: the Case catalog and a run report become the { id: GREEN | RED | UNKNOWN } map a hold judge reads, plus its evidence (testing/F162).
// Exit 0 whenever both files were written, RED and UNKNOWN included; non-zero only for invalid input. Nobody takes a verdict from the exit code.
if (argv[0] === 'observe') {
  const o = {};
  for (let i = 1; i < argv.length; i += 2) o[argv[i].replace(/^--/, '')] = argv[i + 1];
  try {
    if (!o.report || !o.observed || !o.evidence) throw new Error('--report, --observed and --evidence are required');
    const { collectCases } = await import('../lib/cases.mjs');
    const { observeCases } = await import('../lib/observe.mjs');
    const { cases, findings } = await collectCases(resolve(o.root ?? process.cwd()));
    const read = async (path) => JSON.parse((await readFile(resolve(path))).toString('utf8'));
    const result = observeCases({
      report: await read(o.report),
      cases, findings,
      form: o['form-report'] ? await read(o['form-report']) : undefined,
      revision: o.revision, expectedRevision: o['expect-revision'], runId: o['run-id'], producedBy: o['produced-by'],
    });
    const { writeFileSync } = await import('node:fs');
    writeFileSync(resolve(o.observed), `${JSON.stringify(result.observed, null, 1)}\n`);
    writeFileSync(resolve(o.evidence), `${JSON.stringify(result.evidence, null, 1)}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${error.message}\n${observeUsage}`);
    process.exit(2);
  }
}
if (argv[0] !== 'run') {
  console.error(usage);
  process.exit(2);
}
let root = process.cwd();
let timeoutMs;
let streamsDir;
let expect;
const files = [];
for (let i = 1; i < argv.length; i += 1) {
  if (argv[i] === '--root') root = resolve(argv[++i] ?? '');
  else if (argv[i] === '--timeout') timeoutMs = Number(argv[++i]);
  else if (argv[i] === '--expect') expect = resolve(argv[++i] ?? '');
  else if (argv[i] === '--streams') streamsDir = resolve(argv[++i] ?? '');
  else files.push(argv[i]);
}
try {
  const register = expect ? JSON.parse((await readFile(expect)).toString('utf8')) : undefined;
  if (register) checkRegister(register);
  const report = await runCases({ files, root, ...(timeoutMs === undefined ? {} : { timeoutMs }), streamsDir });
  if (register) report.expectations = compareExpectations(report, register);
  process.stdout.write(`${JSON.stringify(report, null, 1)}\n`);
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exit(2);
}
