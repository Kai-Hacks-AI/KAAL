#!/usr/bin/env node
// The repository's non-blank text lines. Lists every file Git tracks (its
// index), inside and outside packages, reads each from the working tree
// through Hosting, and has Testing (kaal-testing/inventory) count them.
//
// The metric is broad by design: any line with a non-whitespace character in
// any text file, code, Markdown, YAML, JSON or configuration alike. It is not
// executable lines of code and is never combined with coverage figures.
//
// Usage: measure.mjs [--json]
// Prints the totals, the totals per top-level area, and every binary and
// excluded file with its reason, or with --json the whole inventory as JSON.
// Exits non-zero when the files cannot be listed or read. Nothing here writes
// a file.
import { join } from "node:path";
import { execute, readFile } from "kaal-hosting";
import { inventory } from "kaal-testing/inventory";

const ROOT = process.cwd();
const json = process.argv.includes("--json");

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

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const area = (path) => (path.includes("/") ? path.slice(0, path.indexOf("/") + 1) : "(root files)");
const areas = new Map();
for (const e of result.entries) {
  const a = areas.get(area(e.path)) ?? { files: 0, lines: 0 };
  a.files += 1;
  if (e.kind === "text") a.lines += e.lines;
  areas.set(area(e.path), a);
}
console.log("area | files | non-blank text lines");
for (const [name, a] of [...areas].sort()) console.log(`${name} | ${a.files} | ${a.lines}`);
console.log(`total | ${result.files} | ${result.lines}`);
for (const e of result.entries) {
  if (e.kind === "binary") console.log(`binary, no text lines: ${e.path}`);
  if (e.kind === "excluded") console.log(`excluded, ${e.reason}: ${e.path} (${e.lines} lines)`);
}
console.log(
  `scope: ${result.files} files tracked by Git (${result.text} text, ${result.binary} binary, ${result.excluded.files} excluded); a non-blank text line is any line with a non-whitespace character in any text file, code or not; not executable lines of code; untracked and ignored files are outside it`,
);
