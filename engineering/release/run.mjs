// Shim: see release.mjs in this folder. release.yml still calls this path until its own .github-only Change.
import { main } from "../release-management/05-src/release-engine/run.mjs";

await main(process.argv.slice(2));
