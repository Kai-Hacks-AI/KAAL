#!/usr/bin/env node
// seal-node <node-file> <seals-dir>
// Seals a Node by its bytes: a Node's ID is the SHA-256 of its exact bytes, and
// it is sealed when an empty marker named by that ID exists in the seals
// directory. Prints the ID. It reads bytes only; whether the file is a valid
// Node is for registration to decide (register-skill --check).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [file, seals, ...extra] = process.argv.slice(2);
if (!file || !seals || extra.length > 0) {
  console.error("usage: seal-node <node-file> <seals-dir>");
  process.exit(2);
}
const id = createHash("sha256").update(readFileSync(file)).digest("hex");
mkdirSync(seals, { recursive: true });
writeFileSync(join(seals, id), "");
console.log(id);
