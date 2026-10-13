// The KAAL test lane: the tests of every workspace except Hosting, then the
// acceptance suite. Hosting's conformance suite is a lane of its own, run on
// every supported OS; this lane checks KAAL's semantics on one reference host.
// A workspace joins this lane by being a workspace.
import { spawnSync } from "node:child_process";

const HOSTING = "kaal-hosting";

/** Run npm with this Node, so no shell or .cmd shim is involved on any OS. */
function npm(args, capture = false) {
  const r = spawnSync(process.execPath, [process.env.npm_execpath, ...args], { stdio: ["inherit", capture ? "pipe" : "inherit", "inherit"], encoding: "utf8" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return r.stdout;
}

if (!process.env.npm_execpath) {
  console.error("run this lane through npm: npm run test:kaal");
  process.exit(1);
}
for (const { name } of JSON.parse(npm(["query", ".workspace"], true))) {
  if (name !== HOSTING) npm(["test", "--if-present", "-w", name]);
}
npm(["run", "test:acceptance"]);
