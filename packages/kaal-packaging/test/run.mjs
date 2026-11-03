// test:all, what `npm test` runs (packaging/F14, packaging/F15, packaging/A11). In the source
// workspace it runs every declared suite, test:embedded then test:publisher, and ends on one result.
// Installed, it runs test:embedded only, and that suite's own last line is the result. Which context
// applies is detected explicitly, and a layout it cannot tell apart is refused as cannot verify
// before any suite runs.
//
// Each suite runs through the package manager's own script under this Node, which npm names in
// npm_execpath for every script it runs, through Hosting's `execute`. No shell is chosen and no
// platform is consulted (packaging/N11).
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const ROOT = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const parent = dirname(ROOT);
// Installed: the package's real path sits directly in node_modules. A workspace link resolves to source.
const installed = basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
// Source markers: neither ships.
const markers = ["plan", join("test", "publisher")].filter((m) => existsSync(join(ROOT, m)));

const refuse = (why) => {
  console.log(`cannot verify: ${why}`);
  process.exit(2);
};
if (installed && markers.length) refuse(`an installed package carries source markers (${markers.join(", ")})`);
if (!installed && markers.length !== 2) refuse("a source checkout is missing plan/ or test/publisher/");
const declared = Object.keys(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts ?? {}).filter((n) => n.startsWith("test:"));
if (!declared.includes("test:embedded")) refuse("test:embedded is not declared");
if (!installed && !declared.includes("test:publisher")) refuse("test:publisher is not declared");

const cli = process.env.npm_execpath;
if (!cli || !/\.[cm]?js$/.test(cli)) refuse("run through npm test: npm_execpath names no package manager script to run the suites with");

async function suite(name) {
  const r = await execute(process.execPath, [cli, "run", "--silent", name], { cwd: ROOT, env: process.env });
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  return r.status;
}

if (installed) process.exit(await suite("test:embedded"));
const failed = [];
for (const name of ["test:embedded", "test:publisher"]) if ((await suite(name)) !== 0) failed.push(name);
console.log(failed.length ? `failed: ${failed.join(", ")} did not pass` : "verified");
process.exit(failed.length ? 1 : 0);
