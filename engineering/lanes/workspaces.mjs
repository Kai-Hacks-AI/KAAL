// The Workspaces test lane: the tests of every workspace except Hosting.
// Hosting's conformance suite is a lane of its own, run on every supported OS;
// this lane checks KAAL's semantics on one reference host. A workspace joins
// this lane by being a workspace. Commands run through Hosting, which owns how
// the host realizes them.
//
// Usage: workspaces.mjs [--evidence <dir>]
// With --evidence, each workspace's tests run once and its coverage evidence
// is captured under <dir> as they run (see evidence.mjs); the lane passes and
// fails exactly as without it.
import { resolve } from "node:path";
import { execute } from "kaal-hosting";
import { evidenceDir, lane } from "./evidence.mjs";

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

const dir = evidenceDir(process.argv.slice(2), "usage: workspaces.mjs [--evidence <dir>]");
const names = JSON.parse(await npm(["query", ".workspace"], { quiet: true }))
  .map(({ name }) => name)
  .filter((name) => name !== HOSTING);

if (dir === undefined) {
  for (const name of names) await npm(["test", "--if-present", "-w", name]);
} else if (!(await lane(names, resolve(dir)))) process.exit(1);
