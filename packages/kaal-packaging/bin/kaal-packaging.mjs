#!/usr/bin/env node
// kaal-packaging's commands (packaging/F16). They are thin (packaging/N12): each parses its
// arguments, calls one exported function, prints what it returns, and ends on one result line in
// Testing's form (packaging/F10, testing/F13). They decide nothing the functions do not.
//
//   kaal-packaging measure <artifact> [--work <dir>]
//   kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>]
//
// Exit status: 0 verified, 1 failed, 2 unknown or cannot run.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { measure, write } from "../lib/packaging.mjs";
import { conform } from "../lib/conformance.mjs";

const NAME = "kaal-packaging";
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const USAGE = `usage: ${NAME} measure <artifact> [--work <dir>]
       ${NAME} conform <installed-dir> [--consumer <dir>] [--work <dir>]`;

/** The one result line every run ends on, and the exit status it pairs with. */
function end(result, causes) {
  const exit = EXIT[result];
  console.log(`${NAME} ${JSON.stringify({ result, exit, causes })}`);
  process.exitCode = exit;
}

/** `argv` as one positional argument and the named options `allowed`, or why it is not. */
function parse(argv, allowed) {
  const options = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const key = a.slice(2);
    if (!allowed.includes(key)) return { error: `unknown option ${a}` };
    if (i + 1 >= argv.length) return { error: `${a} needs a directory` };
    options[key] = resolve(argv[++i]);
  }
  if (positional.length !== 1) return { error: `expected one ${positional.length ? "argument" : "argument, got none"}` };
  return { subject: resolve(positional[0]), options };
}

/** A working directory: the one given, else a fresh one this run removes. */
async function within(given, fn) {
  if (given) return fn(given);
  const work = mkdtempSync(join(tmpdir(), `${NAME}-`));
  try {
    return await fn(work);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** The npm that started this run, when it names its own script (packaging/A13); else none, and npm runs by name. */
const npm = /\.[cm]?js$/.test(process.env.npm_execpath ?? "") ? process.env.npm_execpath : undefined;

const COMMANDS = {
  async measure(argv) {
    const args = parse(argv, ["work"]);
    if (args.error) return end("unknown", [`${args.error}\n${USAGE}`]);
    let m;
    try {
      m = await within(args.options.work, (work) => measure(args.subject, { work, npm }));
    } catch (e) {
      return end("unknown", [`measure refused: ${e.message}`]);
    }
    process.stdout.write(write(m));
    end("verified", []);
  },

  async conform(argv) {
    const args = parse(argv, ["consumer", "work"]);
    if (args.error) return end("unknown", [`${args.error}\n${USAGE}`]);
    let report;
    try {
      // Testing's model functions are a caller's to hand in (packaging/F13), and this command takes no
      // dependency to find them (packaging/N8): from here, F13 is unknown for a package that ships a model.
      report = await within(args.options.work, (work) => conform(args.subject, { consumer: args.options.consumer, work, npm }));
    } catch (e) {
      return end("unknown", [`conform could not run: ${e.message}`]);
    }
    console.log(`${report.package.name}@${report.package.version} at ${report.package.location}`);
    for (const f of report.findings) console.log(`${f.result} ${f.requirement}: ${f.cause}`);
    if (report.reported) console.log(`its own verification reported ${report.reported.result}, exit ${report.reported.exit}`);
    end(report.result, report.findings.filter((f) => f.result !== "verified").map((f) => `${f.requirement}: ${f.cause}`));
  },
};

const [command, ...rest] = process.argv.slice(2);
if (!(command in COMMANDS)) end("unknown", [command === undefined ? `no command\n${USAGE}` : `unknown command ${command}\n${USAGE}`]);
else await COMMANDS[command](rest);
