// The Workspaces test lane: the tests of every workspace except Hosting.
// Hosting's conformance suite is a lane of its own, run on every supported OS;
// this lane checks KAAL's semantics on one reference host. A workspace joins
// this lane by being a workspace. Commands run through Hosting, which owns how
// the host realizes them.
import { execute } from "kaal-hosting";

const HOSTING = "kaal-hosting";

async function npm(args, { quiet = false } = {}) {
  const r = await execute("npm", args, { cwd: process.cwd() });
  if (!quiet || r.status !== 0) {
    process.stdout.write(r.stdout);
    process.stderr.write(r.stderr);
  }
  if (r.status !== 0) process.exit(r.status);
  return r.stdout;
}

for (const { name } of JSON.parse(await npm(["query", ".workspace"], { quiet: true }))) {
  if (name !== HOSTING) await npm(["test", "--if-present", "-w", name]);
}
