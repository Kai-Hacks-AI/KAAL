// The planned tests of agents/C14, Agents matches main's layout and package identities (plan/main-alignment-0.0.1/plan.md).
// DO and CHECK do not change them. They failed on the old layout and pass on the flat one.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PKG = fileURLToPath(new URL("../../", import.meta.url));
const pkgDir = PKG.replace(/[\\/]$/, "");
const ROOT = (() => {
  let d = pkgDir;
  while (!existsSync(join(d, "package-lock.json")) && dirname(d) !== d) d = dirname(d);
  return d;
})();
const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// Built from parts, so that Hosting's scan for the old name does not read this file as a user of it.
const OLD = ["kaal", "hosting"].join("-");
const where = relative(ROOT, pkgDir).split("\\").join("/");

describe("agents/C14 main alignment", () => {
  it("agents/T420 [agents/F15]: the package names Hosting by main's scoped identity", () => {
    const unscoped = OLD;
    const scoped = `@kaihacksai/${OLD}`;
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    assert.ok(names.includes(scoped), "depends on the scoped Hosting");
    assert.ok(!names.includes(unscoped), "no unscoped Hosting");
    const scripts = Object.values(pkg.scripts).join(" ");
    assert.ok(!new RegExp(`-w ${unscoped}(\\s|$)`).test(scripts), "no script builds the unscoped name");
  });

  it("agents/T421 [agents/F15]: the package sits directly under packages/", () => {
    assert.equal(basename(dirname(pkgDir)), "packages", `${where} is not packages/kaal-agents`);
    assert.equal(where, "packages/kaal-agents");
  });

  it("agents/T422 [agents/F15]: the root workspace list holds no legacy folder and holds the package", () => {
    const ws = rootPkg.workspaces;
    assert.ok(!ws.some((w) => /^packages\/(skills|extensions)\//.test(w)), "no packages/skills or packages/extensions entry");
    assert.ok(ws.includes("packages/kaal-agents"), "lists packages/kaal-agents");
  });

  it("agents/T423 [agents/F15]: the root lockfile resolves the package", () => {
    const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));
    assert.ok(lock.packages["packages/kaal-agents"], "lock has packages/kaal-agents");
    assert.ok(!lock.packages[`node_modules/${OLD}`], "lock does not link the unscoped Hosting");
  });
});
