// check-kaal-seal [<artifact> <seal>]
// Verifies SHA-256 seals against exact bytes and exits 0 or 1. With an artifact
// and a seal it checks that pair; with none it checks KAAL's own seals as set
// by the bootstrap policy. It knows nothing of Git, GitHub or Node semantics.
import { checkSeal } from "./seal.js";
import { checkBootstrap } from "./bootstrap.js";

const args = process.argv.slice(2);
if (args.length !== 0 && args.length !== 2) {
  console.error("usage: check-kaal-seal [<artifact> <seal>]");
  process.exit(2);
}
const problems = args.length === 2 ? [checkSeal(args[0], args[1])].filter((p) => p !== undefined) : checkBootstrap();
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);
