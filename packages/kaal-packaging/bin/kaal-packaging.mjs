#!/usr/bin/env node
// The kaal-packaging commands (packaging/F16). They are thin (packaging/N12): each parses its
// arguments, calls the exported function, prints what it returned, and exits by its result. What is
// measured or decided stays in the library and its Requirements.
//
//   kaal-packaging measure <artifact> [--work <dir>] [--format json|text]
//   kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>] [--json]
//
// Exit statuses: 0 verified (or measured), 1 failed, 2 unknown or cannot run.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { conform } from "kaal-packaging/conformance";
import { measure, report, write } from "kaal-packaging";

const USAGE = `usage:
  kaal-packaging measure <artifact> [--work <dir>] [--format json|text]
  kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>] [--json]`;

/** Testing's results with the exit status every KAAL product pairs with them (testing/F13). */
const EXIT = { verified: 0, failed: 1, unknown: 2 };

/** The command, its one positional argument and its options, or why they cannot be read. */
function parse(argv, known) {
  const [name, ...rest] = argv;
  const options = {};
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith("--")) positional.push(a);
    else if (known.flags.includes(a)) options[a.slice(2)] = true;
    else if (known.values.includes(a)) {
      if (rest[i + 1] === undefined) return { error: `${a} needs a value` };
      options[a.slice(2)] = rest[++i];
    } else return { error: `${name} knows no option ${a}` };
  }
  if (positional.length !== 1) return { error: `${name} takes exactly one location` };
  return { name, location: resolve(positional[0]), options };
}

/** A scratch directory the command owns and removes: Packaging's tools need one that is empty. */
function scratch() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-packaging-"));
  return { dir, remove: () => rmSync(dir, { recursive: true, force: true }) };
}

function refuse(message) {
  process.stderr.write(`${message}\n${USAGE}\n`);
  process.exitCode = 2;
}

async function measureCommand(argv) {
  const p = parse(argv, { flags: [], values: ["--work", "--format"] });
  if (p.error) return refuse(p.error);
  const format = p.options.format ?? "json";
  if (format !== "json" && format !== "text") return refuse(`--format is json or text, not ${format}`);
  const own = p.options.work === undefined ? scratch() : null;
  try {
    const m = await measure(p.location, { work: own ? own.dir : resolve(p.options.work) });
    process.stdout.write(format === "json" ? `${write(m)}\n` : `${report(m, { format: "text" })}\n`);
  } catch (e) {
    process.stderr.write(`kaal-packaging measure: ${e.message}\n`);
    process.exitCode = 2;
  } finally {
    own?.remove();
  }
}

async function conformCommand(argv) {
  const p = parse(argv, { flags: ["--json"], values: ["--consumer", "--work"] });
  if (p.error) return refuse(p.error);
  const own = p.options.work === undefined ? scratch() : null;
  try {
    const r = await conform(p.location, {
      consumer: p.options.consumer === undefined ? undefined : resolve(p.options.consumer),
      work: own ? join(own.dir, "probe") : resolve(p.options.work),
    });
    if (p.options.json) process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    else for (const f of r.findings) process.stdout.write(`${f.result}: ${f.requirement}: ${f.cause}\n`);
    const causes = r.findings.filter((f) => f.result !== "verified").map((f) => `${f.requirement} ${f.result}: ${f.cause}`);
    process.stdout.write(`kaal-packaging-conformance ${JSON.stringify({ result: r.result, exit: EXIT[r.result], package: r.package, causes })}\n`);
    process.exitCode = EXIT[r.result];
  } catch (e) {
    process.stderr.write(`kaal-packaging conform: ${e.message}\n`);
    process.stdout.write(`kaal-packaging-conformance ${JSON.stringify({ result: "unknown", exit: 2, causes: [e.message] })}\n`);
    process.exitCode = 2;
  } finally {
    own?.remove();
  }
}

const [command] = process.argv.slice(2);
if (command === "measure") await measureCommand(process.argv.slice(2));
else if (command === "conform") await conformCommand(process.argv.slice(2));
else refuse(command === undefined ? "no command given" : `no command named ${command}`);
