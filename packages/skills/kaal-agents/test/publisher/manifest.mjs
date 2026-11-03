// Writes the shipped manifest, test/verify.json: the delivered consumer cases, each by name, the
// coverage of every identifier the documents define, and the SHA-256 of every other shipped file.
// A case is declared only after it ran and passed here. An identifier is covered by the passing
// cases that cite it, otherwise allocated to the publisher or verified by no Test Case where
// docs/testing.md says so; one that is none of these stops the manifest from being written.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defined, execute, hashes, MANIFEST, PACKAGE } from "../verify.mjs";

/** The identifiers a text cites, a range such as agents/A5–agents/A7 included. */
function cited(text) {
  const ids = new Set();
  for (const [, kind, from, to] of text.matchAll(/agents\/([IFNAT])(\d+)(?:–agents\/\1(\d+))?/g)) {
    for (let n = Number(from); n <= Number(to ?? from); n++) ids.add(`agents/${kind}${n}`);
  }
  return ids;
}

const consumer = join(PACKAGE, "test", "consumer");
const files = readdirSync(consumer).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(consumer, f));
const outcomes = await execute(files);
const failed = outcomes.filter((o) => o.outcome !== "pass");
if (failed.length) {
  for (const o of failed) console.error(`${o.outcome}: ${o.name}${o.message ? `: ${o.message}` : ""}`);
  process.exit(1);
}
const cases = outcomes.map((o) => o.name).sort();

const testing = readFileSync(join(PACKAGE, "docs", "testing.md"), "utf8");
const section = (heading) => testing.split(/^## /m).find((s) => s.startsWith(heading)) ?? "";
const allocated = cited(section("Allocated to the publisher"));
const unverified = cited(section("Verified by no Test Case"));
const coverage = {};
const missing = [];
for (const id of defined()) {
  const by = cases.filter((c) => cited(c.split(" > ").at(-1)).has(id));
  if (by.length) coverage[id] = { status: "covered", cases: by };
  else if (allocated.has(id)) coverage[id] = { status: "allocated" };
  else if (unverified.has(id)) coverage[id] = { status: "unverified" };
  else missing.push(id);
}
if (missing.length) {
  console.error(`no case, allocation or reason in docs/testing.md for: ${missing.join(", ")}`);
  process.exit(1);
}
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify({ cases, coverage, files: hashes() }, null, 2)}\n`);
console.log(`${MANIFEST}: ${cases.length} cases, ${Object.keys(coverage).length} identifiers`);
