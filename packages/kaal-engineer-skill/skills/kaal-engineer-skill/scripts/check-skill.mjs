#!/usr/bin/env node
// check-skill <skill-dir>
//
// The filesystem-facing entry point of the Engineer Skill's validation. It
// obtains the skill's directory name and files and hands them to
// validate.mjs, which judges them without touching the host. Nothing else in
// this Skill reads the host.
//
// Exits 0 when nothing is found, 1 when there is a standard or kaal
// violation, 3 when the only findings are unsupported, 2 on misuse.
// Warnings go to stderr and do not fail. Repairs nothing. Needs Node.js 20.1
// or later.
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSkill } from "./validate.mjs";

/**
 * The host operation this Skill needs: every file of a directory, keyed by
 * "/"-separated relative path, as kaal-hosting's `read(dir)` provides it.
 * Interim, until that contract is approved; nothing here goes beyond it.
 */
async function read(dir) {
  const files = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path));
  }
  return files;
}

async function main(argv) {
  if (argv.length !== 1 || argv[0].startsWith("--")) {
    console.error("usage: check-skill <skill-dir>");
    return 2;
  }
  const dir = resolve(argv[0]);
  let files;
  try {
    files = await read(dir);
  } catch (e) {
    console.error(`${argv[0]} could not be read: ${e.message}`);
    return 2;
  }
  const found = checkSkill(basename(dir), files);
  for (const w of found.warnings) console.error(`warning: ${w}`);
  for (const kind of ["standard", "kaal", "unsupported"]) for (const message of found[kind]) console.error(`${kind}: ${message}`);
  if (found.standard.length + found.kaal.length > 0) return 1;
  if (found.unsupported.length > 0) {
    console.error("undecided: the frontmatter could not be read completely");
    return 3;
  }
  console.log("ok");
  return 0;
}

function invoked() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invoked()) process.exitCode = await main(process.argv.slice(2));
