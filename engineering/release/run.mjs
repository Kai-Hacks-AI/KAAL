#!/usr/bin/env node
// Shim (F20, a temporary Delivery change requirement): the Release engine's CLI moved to engineering/release-management/05-src/release-engine/run.mjs.
// Kept because main's .github/workflows/release.yml still calls this path; removed with the workflow rename (promotion P2), once no caller is left.
import { main } from "../release-management/05-src/release-engine/run.mjs";

await main(process.argv.slice(2));
