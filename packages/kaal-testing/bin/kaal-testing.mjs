#!/usr/bin/env node
// kaal-testing run [--root dir] [--timeout ms] [--streams dir] [--expect register.json] <files…>: prints the run report as JSON.
// With --expect the report also lists how the run compares with a register of expected failures; it still decides nothing.
// Exit 0 whenever a report was produced (RED, UNKNOWN and problems included); non-zero only for invalid input. Nobody takes acceptance from this exit code.
import { resolve } from 'node:path';
import { readFile } from '@kaihacksai/kaal-hosting';
import { checkRegister, compareExpectations } from '../lib/expectations.mjs';
import { runCases } from '../lib/run.mjs';

const usage = 'usage: kaal-testing run [--root dir] [--timeout ms] [--streams dir] [--expect register.json] <files…>';
const argv = process.argv.slice(2);
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
