// core/C28 planned outer tests: kaal-core 0.0.1 Release and Consumer Readiness. Immutable to DO and
// CHECK; core/C29 turns them GREEN. Each title names the contracts it checks (plan/release/*.md).
// They read the package as it is packed and installed, never the repository's plans.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KAAL = resolve(CORE, "..", "..");
const pkg = () => JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const DOCS = ["intent", "requirements", "architecture", "limitations", "operations", "testing"];
const LOOPS = ["intent", "requirements", "architecture"];
const doc = (name) => {
  const path = join(CORE, "docs", `${name}.md`);
  assert.ok(existsSync(path), `docs/${name}.md ships (core/F69)`);
  return readFileSync(path, "utf8");
};

/** Runs a command, returning its status and output; never throws. */
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

/** The files `npm pack` would ship for a workspace directory. */
const packed = (dir) => {
  const r = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], dir);
  assert.equal(r.status, 0, r.out);
  return JSON.parse(r.stdout.slice(r.stdout.indexOf("["))).flatMap((p) => p.files.map((f) => f.path)).sort();
};

/** Every file under a directory, as sorted relative POSIX paths. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
};

/** The workspace directory of each package by name. */
const workspaces = () => {
  const out = new Map();
  for (const base of ["packages", "packages/skills", "packages/extensions"]) {
    const root = join(KAAL, base);
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root)) {
      const manifest = join(root, d, "package.json");
      if (existsSync(manifest)) out.set(JSON.parse(readFileSync(manifest, "utf8")).name, join(root, d));
    }
  }
  return out;
};

/** kaal-core's runtime dependencies that are workspace packages, transitively. */
const runtime = () => {
  const ws = workspaces();
  const seen = new Map();
  const walk = (name) => {
    for (const dep of Object.keys(JSON.parse(readFileSync(join(ws.get(name), "package.json"), "utf8")).dependencies ?? {}))
      if (ws.has(dep) && !seen.has(dep)) {
        seen.set(dep, ws.get(dep));
        walk(dep);
      }
  };
  walk(pkg().name);
  return seen;
};

describe("kaal-core 0.0.1 release and consumer readiness (core/C28)", () => {
  it("core/T74 [core/F69, core/N19, core/A33]: the package ships Intent, Requirements, Architecture, limitations, operations and testing documents, the README links each, none sends a consumer to a file that does not ship, and the limitations name what 0.0.1 leaves out", () => {
    const files = packed(CORE);
    const readme = readFileSync(join(CORE, "README.md"), "utf8");
    for (const name of DOCS) {
      doc(name);
      assert.ok(files.includes(`docs/${name}.md`), `docs/${name}.md is in the packed file list`);
      assert.ok(readme.includes(`docs/${name}.md`), `the README links docs/${name}.md`);
    }
    for (const name of [...DOCS.map((n) => `docs/${n}.md`), "README.md"]) {
      const text = readFileSync(join(CORE, name), "utf8");
      for (const [, target] of text.matchAll(/\]\((?!https?:|#)([^)#\s]+)/g)) {
        const path = join(dirname(join(CORE, name)), target).slice(CORE.length + 1).replaceAll("\\", "/");
        assert.ok(files.some((f) => f === path || f.startsWith(`${path}/`)), `${name} links ${target}, which ships`);
      }
      assert.doesNotMatch(text, /\bplan\/[a-z]/, `${name} sends no consumer to a repository plan`);
    }
    const limits = doc("limitations").toLowerCase();
    for (const left of ["align", "relationship", "complement"]) assert.ok(limits.includes(left), `docs/limitations.md names what 0.0.1 leaves out: ${left}`);
  });

  it("core/T75 [core/F70, core/F71, core/A33, core/A34]: `npm test` is the consumer entry and builds nothing, the publisher's tests have their own script, the delivered loops ship, and docs/testing.md names every delivered test file and the publisher's tests as not delivered", () => {
    const { scripts = {}, files = [] } = pkg();
    assert.equal(scripts.test, "node test/verify.mjs", "npm test runs the delivered verification");
    assert.ok(scripts["test:publisher"], "the publisher's tests keep a script of their own");
    for (const f of ["docs", "test/acceptance", "test/unit", "test/verify.mjs"]) assert.ok(files.includes(f), `files includes ${f}`);
    const shipped = packed(CORE).filter((f) => f.startsWith("test/"));
    for (const loop of LOOPS) assert.ok(shipped.includes(`test/acceptance/${loop}.test.mjs`), `the ${loop} loop ships`);
    assert.ok(shipped.some((f) => f.startsWith("test/unit/") && f.endsWith(".test.mjs")), "the Code loop ships");
    assert.ok(!shipped.some((f) => f.startsWith("test/plan/")), "the planned outer tests are the publisher's and do not ship");
    const testing = doc("testing");
    for (const f of shipped.filter((f) => f.endsWith(".test.mjs"))) assert.ok(testing.includes(f), `docs/testing.md names ${f}`);
    assert.ok(testing.includes("test/plan/"), "docs/testing.md names the publisher's planned tests");
    assert.match(testing, /not (delivered|shipped)|do(es)? not ship/i, "and says they are not delivered");
  });

  it("core/T76 [core/F72, core/F70, core/A35, core/I23]: packed and installed into a clean directory, kaal-core's installed files are exactly those its operations document lists and `npm test` ends in verified; a corrupted file is never verified, a failing delivered test in any one loop gives failed, and any one loop that runs no test, or no delivered tests at all, gives cannot verify", { timeout: 600_000 }, () => {
    assert.equal(pkg().scripts?.test, "node test/verify.mjs", "blocked before release acceptance: npm test is not the consumer entry");
    const work = mkdtempSync(join(tmpdir(), "kaal-core-release-"));
    try {
      const tarballs = [];
      for (const dir of [CORE, ...runtime().values()]) {
        const r = run("npm", ["pack", "--json", "--pack-destination", work], dir);
        assert.equal(r.status, 0, r.out);
        tarballs.push(join(work, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename));
      }
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }));
      const install = run("npm", ["install", ...tarballs], app);
      assert.equal(install.status, 0, install.out);
      const installed = join(app, "node_modules", ...pkg().name.split("/"));
      const shipped = listed(installed);
      const operations = readFileSync(join(installed, "docs", "operations.md"), "utf8");
      const section = /^## Shipped files\s*\n+```text\n([\s\S]*?)\n```/m.exec(operations);
      assert.ok(section, "the installed docs/operations.md has a Shipped files section with a text block");
      assert.deepEqual(shipped, section[1].split("\n").map((l) => l.trim()).filter(Boolean).sort(), "the installed files are exactly the documented ones");
      const verify = () => run("npm", ["test"], installed);
      const ok = verify();
      assert.equal(ok.status, 0, ok.out);
      const last = (r) => r.stdout.trim().split(/\r?\n/).pop() ?? "";
      assert.match(last(ok), /\bverified\b/, ok.out);
      const index = join(installed, "dist", "index.js");
      const original = readFileSync(index);
      writeFileSync(index, "throw new Error('corrupted');\n");
      const bad = verify();
      assert.notEqual(bad.status, 0, "a corrupted installation does not pass");
      assert.match(bad.out, /\bfailed\b|\bcannot verify\b/);
      assert.doesNotMatch(last(bad), /^\W*verified\b/, bad.out);
      writeFileSync(index, original);
      const loops = [...LOOPS.map((l) => [l, [join(installed, "test", "acceptance", `${l}.test.mjs`)]]), ["code", readdirSync(join(installed, "test", "unit")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(installed, "test", "unit", f))]];
      for (const [loop, paths] of loops) {
        const kept = paths.map((path) => [path, readFileSync(path)]);
        for (const [path] of kept) writeFileSync(path, 'import "node:test";\n');
        const empty = verify();
        writeFileSync(kept[0][0], 'import { it } from "node:test";\nit("fails on purpose", () => { throw new Error("deliberate"); });\n');
        const failing = verify();
        for (const [path, bytes] of kept) writeFileSync(path, bytes);
        assert.equal(empty.status, 2, `the ${loop} loop ran no test while the others passed: ${empty.out}`);
        assert.match(last(empty), /cannot verify/, `an empty ${loop} loop is never verified: ${empty.out}`);
        assert.equal(failing.status, 1, `a failing ${loop} test with kaal-core intact gives failed: ${failing.out}`);
        assert.match(last(failing), /\bfailed\b/, `a failing ${loop} test is never verified: ${failing.out}`);
      }
      rmSync(join(installed, "test", "acceptance"), { recursive: true, force: true });
      rmSync(join(installed, "test", "unit"), { recursive: true, force: true });
      const none = verify();
      assert.equal(none.status, 2, none.out);
      assert.match(none.out, /cannot verify/, "zero delivered tests is never verified");
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("core/T77 [core/F68]: 0.0.1 contains registration: kaal-core/registration ships and exports assemble", async () => {
    let m;
    try {
      m = await import(`${pkg().name}/registration`);
    } catch (e) {
      assert.fail(`blocked before behavioural assertion: ${pkg().name} exports no ./registration (${e.code ?? e.message})`);
    }
    assert.equal(typeof m.assemble, "function");
    assert.ok(packed(CORE).some((f) => f === "dist/registration.js"), "dist/registration.js is in the packed file list");
  });

  it("core/T78 [core/F73]: every workspace package kaal-core depends on at runtime can be published", () => {
    const deps = runtime();
    assert.ok(deps.size > 0, "kaal-core's runtime dependencies are found");
    for (const [name, dir] of deps) assert.notEqual(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).private, true, `${name} is private, so a consumer cannot install it`);
  });

  it("core/T79 [core/F74]: kaal-core and every workspace package it depends on at runtime publish under the @kaihacksai/kaal-* namespace", () => {
    assert.equal(pkg().name, "@kaihacksai/kaal-core");
    const deps = runtime();
    assert.ok(deps.size > 0, "kaal-core's runtime dependencies are found");
    for (const name of deps.keys()) assert.match(name, /^@kaihacksai\/kaal-/, `${name} is not named under @kaihacksai/kaal-`);
  });
});
