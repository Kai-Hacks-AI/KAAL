#!/usr/bin/env node
// kaal-foundation (foundation/F14, foundation/A10): Foundation's command. It is thin: digests are
// lib/sha256.mjs's and verify is test/verify.mjs (foundation/N8). The library loads only for sha256, so verify still
// reports cannot verify when the installed library is changed or broken (foundation/C9). It reads files with node:fs only,
// starts the verification under this Node without a shell, and makes no platform decision (foundation/N7).
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const USAGE = `usage: kaal-foundation sha256 [<file>…]   print each file's SHA-256 as "<digest>  <file>"; no file or - reads standard input
       kaal-foundation verify             verify this installed copy: verified (0), failed (1) or cannot verify (2)
       kaal-foundation check [<list>…]    compare "<digest>  <file>" lines with Foundation's digests; no list or - reads standard input
       kaal-foundation boundary <consumer> [<list>…]   verify the Foundation a consumer resolves, and its digest lists if given`;

function refuse(why) {
  console.error(`kaal-foundation: ${why}`);
  console.error(USAGE);
  process.exit(2);
}

const [command, ...args] = process.argv.slice(2);
if (command === "sha256") {
  const option = args.find((a) => a.startsWith("-") && a !== "-");
  if (option) refuse(`unknown option ${option}`);
  const names = args.length ? args : ["-"];
  const read = [];
  for (const name of names) {
    try {
      read.push([name, readFileSync(name === "-" ? 0 : name)]);
    } catch (e) {
      refuse(`cannot read ${name}: ${e?.code ?? e?.message ?? e}`);
    }
  }
  const { sha256 } = await import("../lib/sha256.mjs");
  for (const [name, bytes] of read) console.log(`${sha256(bytes)}  ${name}`);
} else if (command === "verify") {
  if (args.length) refuse(`verify takes no argument: ${args.join(" ")}`);
  const verify = join(dirname(fileURLToPath(import.meta.url)), "..", "test", "verify.mjs");
  process.exit(spawnSync(process.execPath, [verify], { stdio: "inherit" }).status ?? 2);
} else if (command === "check" || command === "boundary") {
  // foundation/F22, foundation/F23: outer loop only. The boundary library loads only here, so sha256 and verify do not depend on it.
  const option = args.find((a) => a.startsWith("-") && a !== "-");
  if (option) refuse(`unknown option ${option}`);
  const readList = (name, base = process.cwd()) => {
    try {
      return { name, text: readFileSync(name === "-" ? 0 : resolve(base, name), "utf8") };
    } catch (e) {
      return { name, error: e?.code ?? e?.message ?? String(e) };
    }
  };
  const { check, boundary, summary } = await import("../lib/boundary.mjs");
  let report;
  if (command === "check") {
    report = check((args.length ? args : ["-"]).map((l) => readList(l)), process.cwd());
    for (const c of report.causes) console.log(`${c.cause}: ${c.file}`);
    console.log(`check: ${report.result} (${report.checked} compared)`);
    console.log(`kaal-foundation-check ${JSON.stringify(report)}`);
  } else {
    if (!args.length) refuse("boundary needs a consumer directory");
    const [consumer, ...lists] = args;
    report = boundary(consumer, lists.map((l) => readList(l, resolve(consumer))));
    for (const line of summary(report)) console.log(line);
    for (const c of report.causes) console.log(`${c.cause}${c.detail ? `: ${typeof c.detail === "string" ? c.detail : JSON.stringify(c.detail)}` : ""}`);
    console.log(`kaal-foundation-boundary ${JSON.stringify(report)}`);
  }
  process.exit(report.exit);
} else {
  refuse(command === undefined ? "no command" : `unknown command ${command}`);
}
