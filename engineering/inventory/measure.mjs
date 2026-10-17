#!/usr/bin/env node
// Repository lines of code. Lists every file Git tracks (its index), inside and
// outside packages, reads each from the working tree through Hosting, and has Testing
// (kaal-testing/inventory) count them. Writes engineering/out/inventory.json
// and prints the totals, the totals per top-level area, and every binary and
// excluded file with its reason. Exits non-zero when the files cannot be
// listed or read. Lines of code say how much text is tracked, not what runs.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, readFile } from "kaal-hosting";
import { inventory } from "kaal-testing/inventory";

const ROOT = process.cwd();
const OUT = join(ROOT, "engineering", "out");

const listed = await execute("git", ["ls-files", "-z", "--full-name"], { cwd: ROOT });
if (listed.status !== 0) {
  console.error(`inventory: listing the tracked files failed (git ls-files exited ${listed.status})\n${listed.stderr}`);
  process.exit(1);
}
const paths = listed.stdout.split("\0").filter(Boolean);
const files = [];
for (const path of paths) {
  try {
    files.push({ path, bytes: await readFile(join(ROOT, path)) });
  } catch (e) {
    console.error(`inventory: ${path} is tracked but could not be read (${e.code ?? e.message})`);
    process.exit(1);
  }
}
const result = inventory(files);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "inventory.json"), JSON.stringify(result, null, 2) + "\n");

const area = (path) => (path.includes("/") ? path.slice(0, path.indexOf("/") + 1) : "(root files)");
const areas = new Map();
for (const e of result.entries) {
  const a = areas.get(area(e.path)) ?? { files: 0, loc: 0 };
  a.files += 1;
  if (e.kind === "text") a.loc += e.loc;
  areas.set(area(e.path), a);
}
console.log("area | files | lines of code");
for (const [name, a] of [...areas].sort()) console.log(`${name} | ${a.files} | ${a.loc}`);
console.log(`total | ${result.files} | ${result.loc}`);
for (const e of result.entries) {
  if (e.kind === "binary") console.log(`binary, no lines of code: ${e.path}`);
  if (e.kind === "excluded") console.log(`excluded, ${e.reason}: ${e.path} (${e.loc} lines)`);
}
console.log(
  `scope: ${result.files} files tracked by Git (${result.text} text, ${result.binary} binary, ${result.excluded.files} excluded); a line of code is a non-blank line of a text file; untracked and ignored files are outside it`,
);
