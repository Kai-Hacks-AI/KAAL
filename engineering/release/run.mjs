// Shim (F20, a temporary Delivery change requirement): see release.mjs in this folder. A full facade of the old interface
// (every export and the command line); .github/workflows/release.yml still calls this path until its own .github-only Change,
// which removes this shim.
import { fileURLToPath } from "node:url";
import { main } from "../release-management/05-src/release-engine/run.mjs";

export * from "../release-management/05-src/release-engine/run.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
