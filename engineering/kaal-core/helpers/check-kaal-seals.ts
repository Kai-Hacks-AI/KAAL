// check-kaal-seals
// Verifies that every KAAL seal in this checkout matches the exact artifact or
// identity it claims. Exits 0 if all are valid, 1 otherwise. It knows nothing of
// Git, branches, pull requests, GitHub, hooks or change isolation: those
// controls live outside Core and call this command.
import { checkBootstrap } from "./bootstrap.js";

if (process.argv.length > 2) {
  console.error("usage: check-kaal-seals (no arguments)");
  process.exit(2);
}
const problems = checkBootstrap();
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);
