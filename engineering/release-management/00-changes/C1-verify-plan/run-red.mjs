// Interim expected-RED runner for C1. Temporary migration work: removed when Testing provides expected-RED execution.
// Usage: node run-red.mjs [--root <capability folder>] [--complete] [--judge <module>] [--evidence <file>] [<case-file>...]
// With --evidence, every T<n>.red.mjs under the capability runs and one execution is recorded per Case and written to <file> for the verify Plan check.
// A failure is attributed to a target only when the Case declares exactly one target or its assertion error names the failed target (error.target). Otherwise one row without a target is written, which the judge cannot count as observed RED for any target.
// A passing run executed every assertion, so it is recorded as passed for each declared target.
// Executes outer-loop Cases against a judge and reports what each execution shows.
//   RED-observed       the Case failed on an assertion about the intended behaviour
//   RED-unconditional  the Case failed through an unconditional failure, which is not meaningful evidence
//   ERROR              the Case failed before asserting (for example a missing import), which is not meaningful evidence
//   GREEN              the Case passed
// A Case stops at its first failing assertion. The report gives the line where it stopped, and the assertions after it are not executed.
// Exit code 0 when at least one RED-observed is present (accepted RED, the minimum for a PLAN), otherwise 1.
// With --complete, exit code 0 only when every executed Case is RED-observed, so no Case is ERROR, unconditional or GREEN. Even then, only each Case's first failing assertion is executed.
import { readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
let root = resolve(here, '../..');
const args = process.argv.slice(2);
let judgePath = join(here, 'baseline-judge.mjs');
let complete = false;
let evidenceFile;
const files = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--judge') judgePath = resolve(args[++i]);
  else if (args[i] === '--complete') complete = true;
  else if (args[i] === '--root') root = resolve(args[++i]);
  else if (args[i] === '--evidence') evidenceFile = resolve(args[++i]);
  else files.push(resolve(args[i]));
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

if (files.length === 0) {
  for await (const path of walk(root)) {
    if (evidenceFile ? /\/T\d+\.red\.mjs$/.test(path) : /\/02-requirements\/.*\/T\d+\.red\.mjs$/.test(path)) files.push(path);
  }
}

function stoppedAt(error, file) {
  const url = pathToFileURL(file).href;
  const hit = String(error?.stack ?? '').split('\n').find((line) => line.includes(url));
  const line = hit?.match(/:(\d+):\d+\)?$/)?.[1];
  return line ? `stopped at line ${line}` : '';
}

const { judge } = await import(pathToFileURL(judgePath).href);
const rows = [];
for (const file of files.sort()) {
  let id = file;
  let targets = [];
  let kind;
  let detail = '';
  let failedTarget;
  try {
    const mod = await import(pathToFileURL(file).href);
    id = mod.id ?? file;
    targets = Array.isArray(mod.tests) ? mod.tests : [];
    await mod.run({ judge });
    kind = 'GREEN';
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') {
      failedTarget = typeof error.target === 'string' ? error.target : undefined;
      kind = error.operator === 'fail' ? 'RED-unconditional' : 'RED-observed';
      detail = `${stoppedAt(error, file)}: ${String(error.message).split('\n')[0]}`;
    } else {
      kind = 'ERROR';
      detail = String(error?.message ?? error).split('\n')[0];
    }
  }
  rows.push({ id, kind, detail, targets, failedTarget });
}

if (evidenceFile) {
  const reason = { 'RED-observed': 'assertion', 'RED-unconditional': 'unconditional', ERROR: 'error' };
  const failure = (row, target) => ({ case: row.id, ...(target === undefined ? {} : { target }), result: 'failed', reason: reason[row.kind] });
  const attributed = (row) => (row.targets.length === 1 ? row.targets[0] : row.targets.includes(row.failedTarget) ? row.failedTarget : undefined);
  const evidence = rows.flatMap((row) => (row.kind === 'GREEN' ? row.targets.map((target) => ({ case: row.id, target, result: 'passed' })) : [failure(row, attributed(row))]));
  await writeFile(evidenceFile, `${JSON.stringify(evidence, null, 1)}
`);
}
for (const row of rows) console.log(`${row.kind.padEnd(18)} ${row.id}  ${row.detail}`);
const count = (kind) => rows.filter((row) => row.kind === kind).length;
const observed = count('RED-observed');
const others = rows.length - observed;
console.log(`\n${rows.length} executed: ${observed} RED-observed, ${count('RED-unconditional')} RED-unconditional, ${count('ERROR')} ERROR, ${count('GREEN')} GREEN.`);
console.log('Each Case stops at its first failing assertion; later assertions and scenarios in a Case are not executed.');
console.log(observed > 0 ? 'Accepted RED: at least one meaningful observed RED.' : 'No observed RED.');
console.log(others === 0 ? 'All executed Cases produced observed RED. This does not mean every assertion or scenario inside them was executed.' : `Incomplete: ${others} executed Case(s) did not produce observed RED and are not validated.`);
process.exitCode = complete ? (others === 0 && observed > 0 ? 0 : 1) : (observed > 0 ? 0 : 1);
