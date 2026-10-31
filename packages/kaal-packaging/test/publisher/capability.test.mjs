// Packaging's publisher cases (docs/testing.md, packaging/C8): the cases that need the source
// workspace, and so do not ship. packaging/T27 packs Packaging itself with Hosting and Foundation,
// installs the three into a fresh consumer, and decides Packaging with its own conformance suite.
// Every process they start goes through Hosting's `execute` (packaging/N11).
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { after, describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { conform, conformSource } from "kaal-packaging/conformance";
import { manifest, ROOT } from "./manifest.mjs";

const REPOSITORY = join(ROOT, "..", "..");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-publisher-"));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));
let made = 0;
const fresh = (name) => {
  const dir = join(SCRATCH, `${name}-${++made}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

async function npm(args, cwd) {
  const r = await execute("npm", args, { cwd });
  assert.equal(r.status, 0, `npm ${args.join(" ")} exited ${r.status}: ${r.stderr}`);
  return r.stdout;
}

/** Testing's model functions as a caller hands them in (testing/F24–F25), held to their interface as far as Packaging's model reaches. */
const TESTING = {
  check(model) {
    if (model === null || typeof model !== "object" || !Array.isArray(model.cases)) return ["a model holds a list of cases"];
    const seen = new Set();
    const problems = [];
    for (const c of model.cases) {
      if (seen.has(c.id)) problems.push(`${c.id}: duplicate identity`);
      seen.add(c.id);
      if (!(Array.isArray(c.tests) && c.tests.every((t) => typeof t === "string" && t !== ""))) problems.push(`${c.id}: tests must be nonempty strings`);
    }
    return problems;
  },
  tested(model) {
    const out = {};
    for (const c of model.cases) for (const t of c.tests) (out[t] ??= []).push(c.id);
    return out;
  },
};

/** Packaging, Hosting and Foundation, each packed from its workspace, installed into one fresh consumer. Made once. */
let installed;
function installPackaging() {
  installed ??= (async () => {
    const hosting = join(REPOSITORY, "packages", "extensions", "kaal-hosting");
    assert.ok(existsSync(join(hosting, "dist", "index.js")), "kaal-hosting is built (npm run build -w kaal-hosting)");
    const out = fresh("packed");
    const tarballs = [];
    for (const dir of [hosting, join(REPOSITORY, "packages", "kaal-foundation"), ROOT]) {
      tarballs.push(join(out, JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], dir))[0].filename));
    }
    const consumer = fresh("consumer");
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }) + "\n");
    await npm(["install", ...tarballs, "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline"], consumer);
    const dir = join(consumer, "node_modules", "kaal-packaging");
    const report = await conform(dir, { consumer, work: fresh("probe"), testing: TESTING });
    return { dir, consumer, report };
  })();
  return installed;
}

/** Every file under `dir`, by path relative to it with forward slashes. */
const walk = (dir, base = dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules") return [];
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path).split("\\").join("/")];
  });

describe("packaging/C8 Packaging as a capability, from its source workspace", () => {
  it("packaging/T27 [packaging/F15, packaging/I7]: kaal-packaging, packed and installed with Hosting and Foundation, passes its own conform on every Requirement it can decide", async () => {
    assert.equal(readFileSync(join(ROOT, "test", "verify.json"), "utf8"), await manifest(), "test/verify.json is stale: run node test/publisher/manifest.mjs");
    const { report } = await installPackaging();
    const by = Object.fromEntries(report.findings.map((f) => [f.requirement, f]));
    for (const f of report.findings) {
      if (f.requirement === "packaging/F7") continue;
      assert.equal(f.result, "verified", `${f.requirement}: ${f.cause}`);
    }
    // Out of its hands until Hosting and Foundation install from a registry (packaging/F19): installed
    // from local tarballs, F7 fails and names exactly them, and nothing else.
    const f7 = by["packaging/F7"];
    assert.equal(f7.result, "failed", f7.cause);
    const named = f7.cause.split("; ");
    assert.equal(named.length, 2, f7.cause);
    assert.ok(named.some((c) => /^kaal-hosting resolved from "file:/.test(c)), f7.cause);
    assert.ok(named.some((c) => /^@kaihacksai\/kaal-foundation resolved from "file:/.test(c)), f7.cause);
    assert.deepEqual(report.reported, { result: "verified", exit: 0, causes: [] });
  });

  it("packaging/T28 [packaging/F15, packaging/F14]: the source npm test follows the declared plan, and the installed npm test runs test:embedded only", async () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    assert.equal(pkg.scripts.test, "npm run test:all");
    for (const suite of ["test:all", "test:embedded", "test:publisher"]) assert.ok(pkg.scripts[suite], `${suite} is declared`);
    // conformSource runs the source npm test. Run for real here it would run this suite again, so a
    // stand-in npm answers for it, and the plan itself is decided from the package's own declaration.
    const standIn = join(fresh("stand-in"), "npm.mjs");
    writeFileSync(standIn, 'console.log("verified");\n');
    const source = await conformSource(ROOT, { npm: standIn });
    assert.equal(source.result, "verified", source.cause);
    assert.match(source.cause, /runs test:all of the declared test:all, test:embedded, test:publisher/);
    // Installed: no publisher suite ships, and the npm test's result is the Embedded verification's, which ran exactly the declared cases.
    const { dir, report } = await installPackaging();
    assert.equal(existsSync(join(dir, "test", "publisher")), false);
    assert.equal(existsSync(join(dir, "plan")), false);
    const f11 = report.findings.find((f) => f.requirement === "packaging/F11");
    assert.equal(f11.result, "verified", f11.cause);
    for (const requirement of ["packaging/F9", "packaging/F10"]) {
      const f = report.findings.find((x) => x.requirement === requirement);
      assert.equal(f.result, "verified", `${requirement}: ${f.cause}`);
    }
  });

  it("packaging/T31 [packaging/F18]: the repository's agent instructions name Packaging, its skill and both commands", () => {
    const agents = readFileSync(join(REPOSITORY, "AGENTS.md"), "utf8");
    assert.match(agents, /^## Packaging$/m);
    for (const needle of ["packages/kaal-packaging/skills/kaal-packaging/SKILL.md", "kaal-packaging measure", "kaal-packaging conform"]) assert.ok(agents.includes(needle), `AGENTS.md names ${needle}`);
  });

  it("packaging/T33 [packaging/N11]: no file of the package names the running platform, a launcher for one, or a shell chosen by platform", () => {
    // The patterns are assembled, so that this file does not name what it looks for.
    const forbidden = [new RegExp(["process", "platform"].join("\\.")), new RegExp(["win", "32"].join("")), new RegExp(["\\.c", "md\\b"].join("")), new RegExp(["shell", ":\\s*process"].join(""))];
    const code = walk(ROOT).filter((p) => /\.(mjs|cjs|js|ts|json)$/.test(p));
    assert.ok(code.includes("lib/conformance.mjs") && code.includes("test/embed/measurement.test.mjs"), "the scan reaches the library and the tests");
    const found = [];
    for (const path of code) {
      const text = readFileSync(join(ROOT, path), "utf8");
      for (const pattern of forbidden) if (pattern.test(text)) found.push(`${path} names ${pattern.source}`);
    }
    assert.deepEqual(found, []);
  });
});
