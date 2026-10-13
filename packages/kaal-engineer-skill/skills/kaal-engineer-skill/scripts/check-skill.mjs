#!/usr/bin/env node
// check-skill <skill-dir>
//
// The entry point of the Engineer Skill's validation. It obtains the skill's
// files through kaal-hosting's read() and hands them, with the skill's
// directory name, to validate.mjs, which judges them without touching the
// host. Obtaining the files, resolving links and host portability are
// Hosting's.
//
// Exits 0 when nothing is found, 1 when there is a standard or kaal
// violation, 2 on misuse or when Hosting refuses to read the directory.
// Warnings go to stderr and do not fail. Repairs nothing. Needs Node.js 20.1
// or later and this package's dependencies.
import { read } from "kaal-hosting";
import { basename, resolve } from "node:path";
import { checkSkill } from "./validate.mjs";

async function main(argv) {
  if (argv.length !== 1 || argv[0].startsWith("--")) {
    console.error("usage: check-skill <skill-dir>");
    return 2;
  }
  let files;
  try {
    files = await read(argv[0]);
  } catch (e) {
    console.error(`${argv[0]} could not be read: ${e.message}`);
    return 2;
  }
  const found = checkSkill(basename(resolve(argv[0])), files);
  for (const w of found.warnings) console.error(`warning: ${w}`);
  for (const kind of ["standard", "kaal"]) for (const message of found[kind]) console.error(`${kind}: ${message}`);
  if (found.standard.length + found.kaal.length > 0) return 1;
  console.log("ok");
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
