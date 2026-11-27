#!/usr/bin/env node
// kaal-testing run [--root dir] [--timeout ms] [--streams dir] [--expect register.json] <files…>: prints the run report as JSON.
// With --expect the report also lists how the run compares with a register of expected failures; it still decides nothing.
// Exit 0 whenever a report was produced (RED, UNKNOWN and problems included); non-zero only for invalid input. Nobody takes acceptance from this exit code.
import { join, resolve } from 'node:path';
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
// observe-at: runs the files, or reads a run report produced elsewhere (--report), and writes DIR/observation.json (kaal-testing/observation@1, testing/F175).
// Exit 0 whenever the record was written, RED, UNKNOWN and an unusable report included; 2 for invalid input, and then nothing is written.
if (argv[0] === 'observe-at') {
  const o = {};
  const files = [];
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) { o[argv[i].slice(2)] = argv[i + 1]; i += 1; } else files.push(argv[i]);
  }
  try {
    for (const k of ['revision', 'expect-revision', 'run-id', 'produced-by', 'out']) if (!o[k]) throw new Error(`--${k} is required`);
    if (files.length === 0) throw new Error('name the files that were asked to run');
    const { observeAt, assembleObservation } = await import('../lib/observation.mjs');
    const root = resolve(o.root ?? process.cwd());
    const common = { revision: o.revision, expectedRevision: o['expect-revision'], runId: o['run-id'], producedBy: o['produced-by'] };
    let record;
    if (o.report) {
      const { collectCases } = await import('../lib/cases.mjs');
      const { cases, findings } = await collectCases(root);
      let report;
      const text = (await readFile(resolve(o.report))).toString('utf8');
      try { report = JSON.parse(text); } catch { report = undefined; } // a report that is not JSON is not a run report: UNKNOWN, not an error
      record = assembleObservation({ report, requested: files, cases, findings, ...common });
    } else record = await observeAt({ root, files, ...common });
    const { mkdirSync, writeFileSync } = await import('node:fs');
    mkdirSync(resolve(o.out), { recursive: true });
    writeFileSync(join(resolve(o.out), 'observation.json'), `${JSON.stringify(record, null, 1)}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${error.message}\nusage: kaal-testing observe-at [--root dir] --revision sha --expect-revision sha --run-id id --produced-by who --out dir [--report run-report.json] <files…>`);
    process.exit(2);
  }
}
if (argv[0] === 'mutate') {
  const o = {};
  for (let i = 1; i < argv.length; i += 2) o[argv[i].replace(/^--/, '')] = argv[i + 1];
  try {
    if (!o.spec || !o.out) throw new Error('--spec and --out are required');
    const { runMutants } = await import('../lib/mutate.mjs');
    const root = resolve(o.root ?? process.cwd());
    let spec;
    try { spec = JSON.parse((await readFile(resolve(o.spec))).toString('utf8')); } catch { throw new Error('invalid input: the spec is not JSON'); }
    const record = await runMutants({ root, spec, ...(o.timeout ? { timeoutMs: Number(o.timeout) } : {}) });
    const { mkdirSync, writeFileSync } = await import('node:fs');
    mkdirSync(resolve(o.out), { recursive: true });
    writeFileSync(join(resolve(o.out), 'mutation-report.json'), `${JSON.stringify(record, null, 1)}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${error.message}\nusage: kaal-testing mutate [--root dir] --spec mutants.json --out dir [--timeout ms]`);
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
