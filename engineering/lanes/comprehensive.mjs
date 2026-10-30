// The comprehensive lane, `npm test` at the repository root: every
// workspace's own `npm test` (its Embedded Tests, in its own directory), then
// Engineering's own suites (its Engineering Tests). Each suite runs to its end
// whatever the others did, and the lane prints each with its owner, location
// and outcome. It passes only when every one passed; a workspace with no test
// entrypoint is reported and fails it (engineering/C6, see suites.mjs).
import { comprehensive, describe } from "./suites.mjs";

const result = await comprehensive(process.cwd());
for (const r of result.results) {
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}
console.log(describe(result));
process.exit(result.passed ? 0 : 1);
