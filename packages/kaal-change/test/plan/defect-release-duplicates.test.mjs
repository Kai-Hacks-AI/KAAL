// Defect (Kai, 9 Nov 2026): Change re-implements Engineering's Release gate. change/T57 calls the
// readiness judge in engineering/release/release.mjs to test Engineering's own behavior, and the
// packed-artifact probe (change/T56) imports the verification judge from the same file and repeats
// pack, override, install and judge. Tests live in one place and run against targets; Engineering owns
// the Release engine (engineering/F28 to F35). change/F49 also mixes a Change claim (exact declared
// providers) with that installed-verification claim, and change/F49 and change/A23 still describe Graph
// as a required production dependency, which change #1256 corrected in code.
// This is a known-RED Defect Case. It is not part of any gating test script. It is run by hand until
// the fixing Change turns it GREEN and moves it into the package's gating tests.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKIP = new Set(["node_modules", ".git"]);
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const read = (path) => readFileSync(path, "utf8");

describe("Defect: Change duplicates Engineering's Release gate", () => {
  it("no Change test or source imports Engineering's Release engine", () => {
    const self = fileURLToPath(import.meta.url);
    const importers = walk(PACKAGE)
      .filter((p) => /\.(mjs|js|ts)$/.test(p) && p !== self)
      .filter((p) => /from\s+["'][^"']*engineering\/release\//.test(read(p)) || /import\(\s*["'][^"']*engineering\/release\//.test(read(p)))
      .map((p) => relative(PACKAGE, p));
    assert.deepEqual(importers, [], `these files import engineering/release: ${importers.join(", ")}`);
  });

  it("no Change test re-implements the packed-artifact install probe", () => {
    const pkg = JSON.parse(read(join(PACKAGE, "package.json")));
    const probes = walk(join(PACKAGE, "test")).map((p) => relative(PACKAGE, p)).filter((p) => /package-only/.test(p));
    assert.deepEqual(probes, [], `these files are the install probe: ${probes.join(", ")}`);
    assert.equal(pkg.scripts?.["test:package-only"], undefined);
  });

  it("change/F49 and change/A23 say Graph is an optional peer, not a required production dependency", () => {
    const pkg = JSON.parse(read(join(PACKAGE, "package.json")));
    assert.equal(pkg.peerDependenciesMeta?.["kaal-graph"]?.optional, true, "the package declares Graph as an optional peer");
    const requirements = read(join(PACKAGE, "docs/requirements.md"));
    const architecture = read(join(PACKAGE, "docs/architecture.md"));
    assert.doesNotMatch(requirements, /Declare Foundation, Graph and Hosting at their\s+exact required production/, "F49 still requires Graph as a production dependency");
    assert.doesNotMatch(architecture, /rather than optional peers/, "A23 still rejects optional peers");
  });
});
