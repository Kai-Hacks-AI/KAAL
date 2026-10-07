// list-kaal-capabilities [--into <dir>]
// What the packages can deliver as Skills or Extensions, each with the exact ID
// of its Node, and whether the KAAL in the checkout already has it installed.
// It lists; it selects nothing and writes nothing. An ID printed here is what
// `install-kaal --select` takes.
import { join } from "node:path";
import { contributions, core, KAAL_DIR, packages, SOURCE } from "./delivery.js";
import { parse } from "./args.js";
import { existsSync } from "node:fs";

const { target } = parse(process.argv.slice(2), "usage: list-kaal-capabilities [--into <dir>]");
const dir = join(target, KAAL_DIR);
const installed = new Set(existsSync(dir) ? [...core.installedSkills(dir), ...core.installedExtensions(dir)].map((n) => n.id) : []);
for (const pkg of await packages(join(SOURCE, "packages")))
  for (const c of contributions(pkg)) console.log(`${c.kind}\t${pkg.capability}\t${c.name}\t${c.id}\t${installed.has(c.id) ? "installed" : "not installed"}`);
