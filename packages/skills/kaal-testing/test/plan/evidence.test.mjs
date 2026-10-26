// testing/C7 planned outer tests: contract evidence from observed runs.
// Immutable to DO and CHECK; testing/C8 turns them GREEN. Each title names the
// contracts it checks (plan/evidence/*.md). They use kaal-testing's public
// interface only.
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "kaal-hosting";
import { accept, integrity, sha256 } from "kaal-testing/acceptance";
import { classify } from "kaal-testing/contracts";

const PACKAGE = new URL("../../", import.meta.url);
const LIB = pathToFileURL(fileURLToPath(new URL("lib/acceptance.mjs", PACKAGE))).href;
const FIXTURE = "kaal-evidence-fixture";
const SCENARIO = "ws/test/acceptance/fixture.test.mjs";
const BARE = "ws/test/acceptance/bare.test.mjs";
const BROKEN = "ws/test/acceptance/broken.test.mjs";

/** A one-file package, packed once, and the manifest a caller would hand over for it. */
async function packed(dir) {
  const pkg = join(dir, "pkg");
  mkdirSync(pkg);
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: FIXTURE, version: "1.0.0", type: "module", main: "index.js" }));
  writeFileSync(join(pkg, "index.js"), "export const answer = 42;\n");
  const r = await execute("npm", ["pack", "--json", "--pack-destination", dir], { cwd: pkg });
  assert.equal(r.status, 0, r.stderr);
  const tarball = join(dir, JSON.parse(r.stdout)[0].filename);
  chmodSync(tarball, 0o444);
  const bytes = readFileSync(tarball);
  return { [FIXTURE]: { tarball, sha256: await sha256(bytes), integrity: await integrity(bytes) } };
}

/** The scenario that installs the fixture: one passing and one failing test in one suite. */
const INSTALLING = `import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { install } from ${JSON.stringify(LIB)};
describe("fixture", () => {
  it("works installed", async () => {
    const host = await install([${JSON.stringify(FIXTURE)}], { offline: true });
    const { answer } = await import(pathToFileURL(join(host, "node_modules", ${JSON.stringify(FIXTURE)}, "index.js")).href);
    assert.equal(answer, 42);
  });
  it("is wrong", () => {
    assert.equal(41, 42);
  });
});
`;

/** A scenario that passes without installing anything, so it exercises no package. */
const NOTHING = `import { it } from "node:test";
it("passes without the package", () => {});
`;

/** A scenario that installs the fixture, then makes its host's npm record unreadable: a provenance failure of the run. */
const UNREADABLE = `import { rmSync } from "node:fs";
import { join } from "node:path";
import { it } from "node:test";
import { install } from ${JSON.stringify(LIB)};
it("leaves a host whose record cannot be read", async () => {
  const host = await install([${JSON.stringify(FIXTURE)}], { offline: true });
  rmSync(join(host, "node_modules", ".package-lock.json"));
});
`;

/** One accept() run over the given scenarios, with cwd as the repository root so paths match a mapping's. */
async function observed(scenarios) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-testing-evidence-"));
  const manifest = await packed(dir);
  mkdirSync(join(dir, "ws", "test", "acceptance"), { recursive: true });
  const files = {};
  for (const [path, text] of Object.entries(scenarios)) {
    writeFileSync(join(dir, path), text);
    files[path] = Buffer.from(text);
  }
  const run = await accept({ manifest, scenarios: Object.keys(scenarios).map((p) => join(dir, p)), run: join(dir, "run"), cwd: dir });
  return { run, files, dir };
}

/** The run's per-test outcomes, or the reason the tests are blocked before any behavioural assertion. */
function outcomes(run) {
  if (!Array.isArray(run.tests)) assert.fail("blocked before behavioural assertion: accept() reports no per-test outcomes (result.tests)");
  return run.tests;
}

const README = "fixture/README.md";
const QUOTE = "The delivered package answers 42.";

/** A mapping offering, for one statement, the given tests of a scenario at its pinned bytes. */
async function mapping(files, offered) {
  return {
    owner: { kind: "capability", name: "Fixture", id: "f".repeat(64) },
    statements: [
      {
        source: README,
        quote: QUOTE,
        sha256: await sha256(Buffer.from(QUOTE)),
        loop: "acceptance",
        evidence: await Promise.all(offered.map(async ([file, test]) => ({ file, sha256: await sha256(files[file]), test }))),
        inference: "The scenario imports the installed package and checks its answer.",
        limits: "One value.",
        review: null,
      },
    ],
  };
}

const tree = (files) => ({ ...files, [README]: Buffer.from(`# Fixture\n\n${QUOTE}\n`) });

describe("Observed per-test outcomes (testing/C7)", () => {
  it("testing/T9 [testing/F7, testing/A5]: accept lists each test it ran, with its file, the file's bytes as run, its suite path and its outcome", async () => {
    const { run, files } = await observed({ [SCENARIO]: INSTALLING });
    const tests = outcomes(run);
    const pick = (name) => tests.filter((t) => t.test.at(-1) === name);
    assert.deepEqual(pick("works installed"), [{ file: SCENARIO, sha256: await sha256(files[SCENARIO]), test: ["fixture", "works installed"], outcome: "pass" }]);
    assert.deepEqual(pick("is wrong"), [{ file: SCENARIO, sha256: await sha256(files[SCENARIO]), test: ["fixture", "is wrong"], outcome: "fail" }]);
    assert.ok(run.manifest && run.manifest[FIXTURE], "the result carries the manifest it ran with");
    assert.equal(run.passed, false, "a failing test is still a verified failure of the run");
  });
});

describe("Contract evidence with an observed run (testing/C7)", () => {
  it("testing/T10 [testing/F8]: a statement whose offered tests passed in the run is observed, with its inference still a judgment; a failed one is a verified failure", async () => {
    const { run, files } = await observed({ [SCENARIO]: INSTALLING });
    outcomes(run);
    const [passing] = await classify(await mapping(files, [[SCENARIO, ["fixture", "works installed"]]]), tree(files), run);
    assert.equal(passing.class, "observed");
    assert.equal(passing.evidence[0].class, "observed");
    assert.equal(passing.inference, "proposed, not reviewed", "the inference stays a judgment");
    const [failing] = await classify(await mapping(files, [[SCENARIO, ["fixture", "works installed"]], [SCENARIO, ["fixture", "is wrong"]]]), tree(files), run);
    assert.equal(failing.class, "verified failure");
    assert.deepEqual(failing.evidence.map((e) => e.class), ["observed", "verified failure"]);
  });

  it("testing/T11 [testing/F8, testing/I5]: a copied run, a test the run did not execute, and bytes other than those run stay unknown", async () => {
    const { run, files } = await observed({ [SCENARIO]: INSTALLING });
    outcomes(run);
    const offered = await mapping(files, [[SCENARIO, ["fixture", "works installed"]]]);
    for (const copy of [structuredClone(run), JSON.parse(JSON.stringify(run))]) {
      const [s] = await classify(offered, tree(files), copy);
      assert.equal(s.class, "unknown", "a copy of a run is a claim, not an observation");
    }
    const [none] = await classify(offered, tree(files));
    assert.equal(none.class, "unknown", "without a run nothing is observed");
    const [missing] = await classify(await mapping(files, [[SCENARIO, ["fixture", "never ran"]]]), tree(files), run);
    assert.equal(missing.class, "unknown");
    const changed = { ...files, [SCENARIO]: Buffer.from(INSTALLING.replace("works installed", "works installed ")) };
    const [stale] = await classify(await mapping(changed, [[SCENARIO, ["fixture", "works installed"]]]), tree(changed), run);
    assert.equal(stale.class, "unknown", "the pinned bytes are not the bytes that ran");
    for (const s of [none, missing, stale]) assert.ok(typeof s.reason === "string" && s.reason.length > 0, "an unknown names its reason");
  });

  it("testing/T12 [testing/F9]: a scenario that installed nothing gives no evidence, and neither does a passing installed test in a run whose provenance failed elsewhere", async () => {
    const bare = await observed({ [BARE]: NOTHING });
    assert.deepEqual(outcomes(bare.run).map((t) => t.outcome), ["pass"]);
    const [s] = await classify(await mapping(bare.files, [[BARE, ["passes without the package"]]]), tree(bare.files), bare.run);
    assert.equal(s.class, "unknown", "a scenario that installed nothing exercised no package");
    const failed = await observed({ [SCENARIO]: INSTALLING, [BROKEN]: UNREADABLE });
    assert.ok(outcomes(failed.run).some((t) => t.file === SCENARIO && t.test.at(-1) === "works installed" && t.outcome === "pass"), "the offered test installed the package and passed");
    assert.ok(
      failed.run.findings.some((f) => f.kind === "verified failure" && /record of what .* holds could not be read/.test(f.evidence)),
      "the run's provenance failed in another scenario's host",
    );
    const [t] = await classify(await mapping(failed.files, [[SCENARIO, ["fixture", "works installed"]]]), tree(failed.files), failed.run);
    assert.equal(t.class, "unknown", "evidence from a run whose provenance failed is not independent");
  });
});

describe("Testing judges what it does not own (testing/C7)", () => {
  it("testing/T13 [testing/N3, testing/A6]: kaal-testing's runtime depends on c8 and Hosting only, and nothing it delivers imports a package it judges", () => {
    const pkg = JSON.parse(readFileSync(new URL("package.json", PACKAGE), "utf8"));
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), ["c8", "kaal-hosting"]);
    assert.deepEqual(Object.keys(pkg.peerDependencies ?? {}), []);
    assert.deepEqual(Object.keys(pkg.optionalDependencies ?? {}), []);
    const lib = new URL("lib/", PACKAGE);
    const imports = [];
    for (const file of readdirSync(lib).filter((f) => f.endsWith(".mjs"))) {
      const text = readFileSync(new URL(file, lib), "utf8");
      for (const [, name] of text.matchAll(/(?:from\s+|import\s*\(\s*)["']((?:@kaihacksai\/)?kaal-[a-z-]+)/g)) {
        if (name !== "kaal-hosting") imports.push(`lib/${file}: ${name}`);
      }
    }
    assert.deepEqual(imports, [], "Testing's delivered code imports no package it judges");
  });
});
