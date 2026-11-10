// Interim expected-RED runner for C1. Temporary migration work: removed when Testing provides expected-RED execution.
// Usage: node run-red.mjs [--judge <module>] [<case-file>...]
// Executes outer-loop Cases against a judge and reports what each execution shows.
//   RED-observed       the Case failed on an assertion about the intended behaviour
//   RED-unconditional  the Case failed through an unconditional failure, which is not meaningful evidence
//   ERROR              the Case failed before asserting (for example a missing import), which is not meaningful evidence
//   GREEN              the Case passed
// Exit code 0 when at least one RED-observed is present (accepted RED), otherwise 1.
import { readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const args = process.argv.slice(2);
let judgePath = join(here, 'baseline-judge.mjs');
const files = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--judge') judgePath = resolve(args[++i]);
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
    if (/\/02-requirements\/.*\/T\d+\.red\.mjs$/.test(path)) files.push(path);
  }
}

const { judge } = await import(pathToFileURL(judgePath).href);
const rows = [];
for (const file of files.sort()) {
  let id = file;
  let kind;
  let detail = '';
  try {
    const mod = await import(pathToFileURL(file).href);
    id = mod.id ?? file;
    await mod.run({ judge });
    kind = 'GREEN';
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') {
      kind = error.operator === 'fail' ? 'RED-unconditional' : 'RED-observed';
      detail = String(error.message).split('\n')[0];
    } else {
      kind = 'ERROR';
      detail = String(error?.message ?? error).split('\n')[0];
    }
  }
  rows.push({ id, kind, detail });
}

for (const row of rows) console.log(`${row.kind.padEnd(18)} ${row.id}  ${row.detail}`);
const observed = rows.filter((row) => row.kind === 'RED-observed').length;
console.log(`\n${rows.length} executed, ${observed} RED-observed. ${observed > 0 ? 'Accepted RED.' : 'No observed RED.'}`);
process.exitCode = observed > 0 ? 0 : 1;
