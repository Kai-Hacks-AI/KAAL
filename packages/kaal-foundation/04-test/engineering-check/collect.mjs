// Collects the Engineering Cases of the publisher folder and runs them, so no list of files is kept by hand
// (foundation/F42). Delivery tooling; it needs only Node and ships nowhere.
//   node collect.mjs   runs every *.test.mjs under 04-test/engineering-check/publisher/
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const folder = join(PACKAGE, "04-test", "engineering-check", "publisher");
const cases = readdirSync(folder).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(folder, f));
if (cases.length === 0) { console.error("collect: no Cases found in " + folder); process.exit(1); }
process.exit(spawnSync(process.execPath, ["--test", ...cases], { stdio: "inherit" }).status ?? 1);
