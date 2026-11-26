#!/usr/bin/env node
// kaal-testing run [--root dir] [--timeout ms] [--streams dir] <files…>: prints the run report as JSON.
// Exit 0 whenever a report was produced (RED, UNKNOWN and problems included); non-zero only for invalid input. Nobody takes acceptance from this exit code.
import { resolve } from 'node:path';
import { runCases } from '../lib/run.mjs';

const usage = 'usage: kaal-testing run [--root dir] [--timeout ms] [--streams dir] <files…>';
const argv = process.argv.slice(2);
if (argv[0] !== 'run') {
  console.error(usage);
  process.exit(2);
}
let root = process.cwd();
let timeoutMs;
let streamsDir;
const files = [];
for (let i = 1; i < argv.length; i += 1) {
  if (argv[i] === '--root') root = resolve(argv[++i] ?? '');
  else if (argv[i] === '--timeout') timeoutMs = Number(argv[++i]);
  else if (argv[i] === '--streams') streamsDir = resolve(argv[++i] ?? '');
  else files.push(argv[i]);
}
try {
  const report = await runCases({ files, root, ...(timeoutMs === undefined ? {} : { timeoutMs }), streamsDir });
  process.stdout.write(`${JSON.stringify(report, null, 1)}\n`);
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exit(2);
}
