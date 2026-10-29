// npm test (foundation/F9, foundation/A6). In the source workspace it runs every declared test:<name>
// suite; in an installed package it runs only test:consumer. Which applies is detected explicitly,
// and a layout it cannot tell apart is refused as cannot verify before any suite runs.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const parent = dirname(root);
// Installed: the package's real path sits directly in node_modules. A workspace link resolves to source.
const installed = basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
// Source markers: neither ships.
const markers = ["plan", join("test", "plan")].filter((m) => existsSync(join(root, m)));

const refuse = (why) => {
  console.log(`cannot verify: ${why}`);
  process.exit(2);
};
if (installed && markers.length) refuse(`an installed package carries source markers (${markers.join(", ")})`);
if (!installed && markers.length !== 2) refuse("a source checkout is missing plan/ or test/plan/");
const declared = Object.keys(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts ?? {}).filter((n) => n.startsWith("test:"));
if (!declared.length) refuse("no test:<name> suite is declared");
if (!declared.includes("test:consumer")) refuse("test:consumer is not declared");
if (!installed && !declared.includes("test:publisher")) refuse("test:publisher is not declared");

const suite = (name) => spawnSync("npm", ["run", name], { cwd: root, stdio: "inherit", shell: process.platform === "win32" }).status ?? 1;
if (installed) process.exit(suite("test:consumer"));
let failed = false;
for (const name of declared) if (suite(name) !== 0) failed = true;
process.exit(failed ? 1 : 0);
