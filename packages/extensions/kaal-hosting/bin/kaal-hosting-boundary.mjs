#!/usr/bin/env node
// kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]...
// Prints one `kaal-hosting-boundary {…}` line (hosting/F31) and exits 0 when
// verified with no review requested, 1 when failed, 2 when unknown, and 3 when
// verified with a review requested.
import { boundary, LINE } from "../dist/boundary-core.js";

const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const name = value("--name");
const root = value("--root");
if (!name || !root) {
  console.error("usage: kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]...");
  process.exit(2);
}
const builtins = args.flatMap((a, i) => (a === "--builtin" ? [args[i + 1]] : []));
const result = await boundary({ name, root, builtins });
console.log(`${LINE} ${JSON.stringify(result)}`);
process.exitCode = result.result === "failed" ? 1 : result.result === "unknown" ? 2 : result.review === "requested" ? 3 : 0;
