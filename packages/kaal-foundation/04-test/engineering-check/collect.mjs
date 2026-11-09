// Runs the Engineering suite from the Case graph Engineering computed, so no list of files is kept by hand (foundation/F42).
// Cases with ships: true run in the installed verification (npm test); Cases whose flag is runs: external belong to another
// runner; every other Case file runs here, once. Fails closed when cases.json is not exactly the Case files on disk.
// Delivery tooling; it needs only Node and ships nowhere.
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readGraph } from "./cases.mjs";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let graph;
try { graph = readGraph(PACKAGE); } catch (e) { console.error(`collect: ${e.message}`); process.exit(1); }
const here = Object.entries(graph.files).filter(([, f]) => f.runs === "collector").map(([path]) => join(PACKAGE, path)).sort();
if (here.length === 0) { console.error("collect: no Case file runs in the collector"); process.exit(1); }
process.exit(spawnSync(process.execPath, ["--test", "--test-concurrency=1", ...here], { stdio: "inherit" }).status ?? 1);
