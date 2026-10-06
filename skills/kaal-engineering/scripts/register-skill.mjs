#!/usr/bin/env node
// register-skill [--check] <kaal-dir> <capability> <contribution-dir>
// Registers a capability's KAAL contribution (its Nodes, and their seals in
// seals/) with an installed KAAL directory, through kaal-core's registerSkill:
// the registration is Core's, this only reads the files and calls it. With
// --check it registers into a throwaway copy and writes nothing to the
// installed KAAL. Needs the kaal-core package to be resolvable from here.
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const check = args[0] === "--check";
const [kaal, capability, dir, ...extra] = check ? args.slice(1) : args;
if (!kaal || !capability || !dir || extra.length > 0) {
  console.error("usage: register-skill [--check] <kaal-dir> <capability> <contribution-dir>");
  process.exit(2);
}
let core;
try {
  core = await import("kaal-core");
} catch {
  console.error("kaal-core is not installed: registration is kaal-core's");
  process.exit(2);
}
const contribution = {};
for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
  if (statSync(join(dir, path)).isFile()) contribution[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
}
const scratch = check ? mkdtempSync(join(tmpdir(), "kaal-register-")) : undefined;
try {
  if (scratch) cpSync(kaal, scratch, { recursive: true });
  const ids = core.registerSkill(scratch ?? kaal, capability, contribution);
  console.log(`${check ? "can register" : "registered"} ${capability}: ${ids.join(" ")}`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
} finally {
  if (scratch) rmSync(scratch, { recursive: true, force: true });
}
