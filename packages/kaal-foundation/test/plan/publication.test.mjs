// foundation/C3 planned outer tests: publication readiness. Immutable to DO and CHECK; foundation/C4
// turns them GREEN. Each title names the contracts it checks (plan/publication/*.md). They read the
// package as it is packed and installed.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const SHIPPED = ["LICENSE", "README.md", "lib/sha256.d.ts", "lib/sha256.mjs", "package.json"];
const ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

/** Runs a command, returning its status and output; never throws. */
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

/** Every file under a directory, as sorted relative POSIX paths. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
};

describe("Foundation publication readiness (foundation/C3)", () => {
  it("foundation/T9 [foundation/F4, foundation/F5, foundation/N2]: the package is publishable, keeps its name and version, has no dependencies, and packs exactly its five files", () => {
    const m = manifest();
    assert.notEqual(m.private, true, "the package is private, so it cannot be published");
    assert.equal(m.name, "@kaihacksai/kaal-foundation");
    assert.equal(m.version, "0.0.1");
    for (const kind of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"])
      assert.equal(Object.keys(m[kind] ?? {}).length, 0, `the package declares no ${kind}`);
    const r = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], PACKAGE);
    assert.equal(r.status, 0, r.out);
    const packed = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path).sort();
    assert.deepEqual(packed, SHIPPED);
  });

  it("foundation/T10 [foundation/F5, foundation/A5, foundation/I4]: packed and installed into a clean directory, the sha256 subpath imports and hashes abc, and the installed files are exactly the packed ones", { timeout: 300_000 }, () => {
    const work = mkdtempSync(join(tmpdir(), "kaal-foundation-release-"));
    try {
      const pack = run("npm", ["pack", "--json", "--pack-destination", work], PACKAGE);
      assert.equal(pack.status, 0, pack.out);
      const tarball = join(work, JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].filename);
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
      const install = run("npm", ["install", tarball], app);
      assert.equal(install.status, 0, install.out);
      assert.deepEqual(listed(join(app, "node_modules", "@kaihacksai", "kaal-foundation")), SHIPPED);
      const use = run(process.execPath, ["--input-type=module", "-e", 'import { sha256 } from "@kaihacksai/kaal-foundation/sha256"; console.log(sha256(new TextEncoder().encode("abc")));'], app);
      assert.equal(use.status, 0, use.out);
      assert.equal(use.stdout.trim(), ABC);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("foundation/T11 [foundation/F6]: the README gives the install command, does not call the package private or unpublished, and keeps the provisional ownership statement", () => {
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.ok(readme.includes("npm install @kaihacksai/kaal-foundation"), "the README gives the install command");
    assert.doesNotMatch(readme, /\bnot published\b|\bis private\b|\bunpublished\b/i, "the README does not call the package private or unpublished");
    assert.match(readme, /provisional/i, "the README keeps the provisional ownership statement (foundation/N4)");
  });
});
