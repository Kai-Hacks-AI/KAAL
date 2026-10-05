#!/usr/bin/env node
// seal write <seals-dir> <id> | check <seals-dir> <id> | list <seals-dir>
// A seal is an empty marker file named by the ID it seals, kept in a seals
// directory that the caller names. This establishes and verifies the marker and
// nothing else: it does not compute an ID, and it does not know what the ID is
// of. Which seals directory an artifact class uses is its own domain's decision.
// `write` records the seal, `check` exits 0 only if it is there, `list` prints
// the sealed IDs. A seal is never removed here.
import { existsSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ID = /^[0-9a-f]{64}$/;

/** Whether `id` is sealed in `dir`: an empty regular file named by it. */
export function isSealed(dir, id) {
  const file = join(dir, id);
  return ID.test(id) && existsSync(file) && lstatSync(file).isFile() && lstatSync(file).size === 0;
}

/** The IDs sealed in `dir`, in order. Anything else in the directory is not a seal. */
export function sealed(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((n) => isSealed(dir, n)).sort() : [];
}

/** Seal `id` in `dir`; sealing again changes nothing. */
export function seal(dir, id) {
  if (!ID.test(id)) throw new Error(`${id} is not an ID: 64 lowercase hex digits`);
  mkdirSync(dir, { recursive: true });
  if (!existsSync(join(dir, id))) writeFileSync(join(dir, id), "");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir, id, ...extra] = process.argv.slice(2);
  const usage = "usage: seal write <seals-dir> <id> | check <seals-dir> <id> | list <seals-dir>";
  try {
    if (command === "write" && dir && id && extra.length === 0) {
      seal(dir, id);
      console.log(id);
    } else if (command === "check" && dir && id && extra.length === 0) {
      process.exitCode = isSealed(dir, id) ? 0 : 1;
    } else if (command === "list" && dir && !id) {
      for (const s of sealed(dir)) console.log(s);
    } else {
      console.error(usage);
      process.exitCode = 2;
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
