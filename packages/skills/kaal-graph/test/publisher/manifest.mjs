// Writes the shipped manifest, test/verify.json: the embedded cases, each by name, and
// the SHA-256 of every other shipped file. A case is declared only after it ran and passed here.
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, hashes, MANIFEST, PACKAGE } from "../verify.mjs";

const embedded = join(PACKAGE, "test", "embedded");
const files = readdirSync(embedded).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(embedded, f));
const outcomes = await execute(files);
const failed = outcomes.filter((o) => o.status !== "passed");
if (failed.length) {
  for (const o of failed) console.error(`${o.status}: ${o.name}${o.message ? `: ${o.message}` : ""}`);
  process.exit(1);
}
const cases = outcomes.map((o) => o.name).sort();
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify({ cases, files: hashes() }, null, 2)}\n`);
console.log(`${MANIFEST}: ${cases.length} cases`);
