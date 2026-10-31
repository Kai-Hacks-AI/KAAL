#!/usr/bin/env node
// The kaal-packaging commands (packaging/F16). They are thin (packaging/N12): each parses its
// arguments, calls the exported function, prints what it returned, and exits by its result. What is
// measured or decided stays in the library and its Requirements.
//
//   kaal-packaging measure <artifact> [--work <dir>] [--format json|text]
//   kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>] [--testing <module>] [--json]
//
// Exit statuses: 0 verified (or measured), 1 failed, 2 unknown or cannot run.
//
// Run it by its path, `node <package>/bin/kaal-packaging.mjs`, never through a registry lookup such
// as a bare `npx kaal-packaging`: the package is private, and its unscoped name is not Packaging's
// on any registry.
//
// packaging/F13 reads a shipped model only through Testing's model functions, which Packaging does
// not depend on (packaging/N8). `--testing` names a module file the caller provides that exports
// them as `check` and `tested`; without it, a package that ships a model is unknown for F13, and the
// command says that its run is not a complete conformance judgement.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { conform } from "kaal-packaging/conformance";
import { measure, report, write } from "kaal-packaging";

const USAGE = `usage:
  kaal-packaging measure <artifact> [--work <dir>] [--format json|text]
  kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>] [--testing <module>] [--json]`;

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
  const p = parse(argv, { flags: ["--json"], values: ["--consumer", "--work", "--testing"] });
  if (p.error) return refuse(p.error);
  let testing;
  if (p.options.testing !== undefined) {
    try {
      const m = await import(pathToFileURL(resolve(p.options.testing)).href);
      if (typeof m.check !== "function" || typeof m.tested !== "function") return refuse(`--testing ${p.options.testing} exports no check and tested functions`);
      testing = { check: m.check, tested: m.tested };
    } catch (e) {
      return refuse(`--testing ${p.options.testing} cannot be imported: ${e.message}`);
    }
  }
  const own = p.options.work === undefined ? scratch() : null;
  try {
    const r = await conform(p.location, {
      consumer: p.options.consumer === undefined ? undefined : resolve(p.options.consumer),
      work: own ? join(own.dir, "probe") : resolve(p.options.work),
      testing,
    });
    if (p.options.json) process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    else for (const f of r.findings) process.stdout.write(`${f.result}: ${f.requirement}: ${f.cause}\n`);
    const f13 = r.findings.find((f) => f.requirement === "packaging/F13");
    if (testing === undefined && f13?.result === "unknown") {
      process.stdout.write("note: packaging/F13 was not judged: no Testing model functions were given. Pass --testing <module>, or call conform from kaal-packaging/conformance with { testing }. This run is not a complete conformance judgement.\n");
    }
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
