// The comprehensive lane, `npm test` at the repository root. It follows the
// declared Test Plan (engineering/lanes/plan.json): Engineering's own suites,
// every workspace's own suites in its directory, and the External suites the
// plan declares. Each suite runs to its end whatever the others did, and the
// lane prints each with its owner, context, location and outcome. It exits 0
// when every applicable suite passed, 1 when any failed or has no entrypoint,
// and 2 when something is unresolved (engineering/C6, see suites.mjs).
import { comprehensive, describe } from "./suites.mjs";

const result = await comprehensive(process.cwd());
for (const r of result.results) {
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}
console.log(describe(result));
process.exit({ passed: 0, failed: 1, unresolved: 2 }[result.result]);
