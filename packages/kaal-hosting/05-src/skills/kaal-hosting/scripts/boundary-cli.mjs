#!/usr/bin/env node
// kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]... [--applicability <file>]
//   The gating run: prints one `kaal-hosting-boundary {…}` line with mode "gate" (hosting/F31) and exits 0 when
//   verified with no review requested, 1 when failed, 2 when unknown, and 3 when verified with a review
//   requested. With --applicability, a JSON file of the capability's declarations, it runs the portability
//   audit (hosting/F40).
// kaal-hosting-boundary --target <path>... [--base <dir>] [--name <name>]
//   The Boundary Check scan (hosting/F64–hosting/F69): findings only, one per source line, mode "scan". It exits
//   0 when every target was read, including with no finding, and 2 when one was not; never 1 or 3. --root is
//   the gating run and is refused together with --target.
import { readFileSync } from "node:fs";
import { boundary, LINE, portability, scan } from "./boundary-core.js";

const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const many = (flag) => args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const targets = many("--target");
const name = value("--name");
const root = value("--root");
const usage = () => {
  console.error("usage: kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]... [--applicability <file>]\n       kaal-hosting-boundary --target <path>... [--base <dir>] [--name <name>]");
  process.exit(2);
};
if (args.includes("--target")) {
  if (root || targets.some((t) => t === undefined || t.startsWith("--"))) usage();
  const result = await scan({ targets, ...(value("--base") ? { base: value("--base") } : {}), ...(name ? { name } : {}) });
  console.log(`${LINE} ${JSON.stringify(result)}`);
  process.exitCode = result.result === "complete" ? 0 : 2;
} else {
  if (!name || !root) usage();
  const builtins = many("--builtin");
  const declarations = value("--applicability");
  const result = declarations ? await portability({ name, root, builtins, applicability: JSON.parse(readFileSync(declarations, "utf8")) }) : await boundary({ name, root, builtins });
  console.log(`${LINE} ${JSON.stringify({ ...result, mode: "gate" })}`);
  process.exitCode = result.result === "failed" ? 1 : result.result === "unknown" ? 2 : result.review === "requested" ? 3 : 0;
}
