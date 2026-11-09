import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "@kaihacksai/kaal-hosting";
import { accept, discover, findings, integrity, packed as packedOf, sha256 } from "@kaihacksai/kaal-testing/acceptance";

const LIB = pathToFileURL(fileURLToPath(new URL("../lib/acceptance.mjs", import.meta.url))).href;

const M = { pkg: { tarball: "/run/pkg.tgz", sha256: "a".repeat(64), integrity: "sha512-good" } };
const held = (integrity) => ({ "node_modules/pkg": { version: "1.0.0", resolved: "file:/run/pkg.tgz", integrity } });
const record = (scenario, host, hash = M.pkg.sha256) => ({ scenario, host, consumed: { pkg: hash } });
const UNKNOWNS = ["installation hosts", "unrecorded installations"];
const failures = (found) => found.filter((f) => f.kind === "verified failure").map(({ subject, evidence }) => ({ subject, evidence }));

describe("acceptance evidence into findings", () => {
  it("a clean run has no failures, and states what it does not verify as unknowns, never as a pass", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs", "/b.test.mjs"], records: [record("/a.test.mjs", "/h1"), record("/b.test.mjs", "/h2")], holds: { "/h1": held("sha512-good"), "/h2": held("sha512-good") } });
    assert.deepEqual(failures(found), []);
    assert.deepEqual(
      found.map((f) => [f.kind, f.subject]),
      UNKNOWNS.map((s) => ["unknown", s]),
    );
    assert.match(found[0].evidence, /2 hosts lie physically outside the repository is not verified/);
  });

  it("foreign bytes: an installation that consumed other bytes than the packed tarball", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs"], records: [record("/a.test.mjs", "/h1", "b".repeat(64))], holds: { "/h1": held("sha512-good") } });
    assert.deepEqual(failures(found), [{ subject: "/a.test.mjs", evidence: "installed pkg with bytes other than the packed tarball" }]);
  });

  it("a package this run did not pack", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs"], records: [{ scenario: "/a.test.mjs", host: "/h1", consumed: { other: "c".repeat(64) } }], holds: { "/h1": {} } });
    assert.deepEqual(failures(found), [{ subject: "/a.test.mjs", evidence: "installed other, which this run did not pack" }]);
  });

  it("a host that holds a packed package from elsewhere, however it got there", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs"], records: [record("/a.test.mjs", "/h1")], holds: { "/h1": held("sha512-foreign") } });
    assert.deepEqual(failures(found), [{ subject: "/a.test.mjs", evidence: "/h1 holds pkg from file:/run/pkg.tgz, not the packed tarball" }]);
  });

  it("a host whose npm record cannot be read is a failure, not a pass", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs"], records: [record("/a.test.mjs", "/h1")], holds: { "/h1": { unreadable: "missing" } } });
    assert.deepEqual(failures(found), [{ subject: "/a.test.mjs", evidence: "npm's record of what /h1 holds could not be read: missing" }]);
  });

  it("a reused host: two installations into one host", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs", "/b.test.mjs"], records: [record("/a.test.mjs", "/h1"), record("/b.test.mjs", "/h1")], holds: { "/h1": held("sha512-good") } });
    assert.deepEqual(failures(found), [{ subject: "/h1", evidence: "more than one installation shared this host" }]);
  });

  it("a scenario that installed nothing", () => {
    const found = findings({ manifest: M, scenarios: ["/a.test.mjs", "/b.test.mjs"], records: [record("/a.test.mjs", "/h1")], holds: { "/h1": held("sha512-good") } });
    assert.deepEqual(failures(found), [{ subject: "/b.test.mjs", evidence: "installed no packed package" }]);
  });
});

/** A one-file package, packed once, and the manifest a caller would hand over for it. */
async function packed(dir) {
  const pkg = join(dir, "pkg");
  mkdirSync(pkg);
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "kaal-acceptance-fixture", version: "1.0.0", type: "module", main: "index.js" }));
  writeFileSync(join(pkg, "index.js"), "export const answer = 42;\n");
  const r = await execute("npm", ["pack", "--json", "--pack-destination", dir], { cwd: pkg });
  assert.equal(r.status, 0, r.stderr);
  const tarball = join(dir, JSON.parse(r.stdout)[0].filename);
  chmodSync(tarball, 0o444);
  const bytes = readFileSync(tarball);
  return { "kaal-acceptance-fixture": { tarball, sha256: await sha256(bytes), integrity: await integrity(bytes) } };
}

/** A workspace whose acceptance scenarios each install the fixture and import it. */
function workspace(dir, names) {
  const location = join(dir, "ws");
  mkdirSync(join(location, "test", "acceptance"), { recursive: true });
  for (const name of names) {
    writeFileSync(
      join(location, "test", "acceptance", `${name}.test.mjs`),
      `import assert from "node:assert/strict";
import { join } from "node:path";
import { it } from "node:test";
import { pathToFileURL } from "node:url";
import { install } from ${JSON.stringify(LIB)};
it("${name}: the delivered package works installed", async () => {
  const host = await install(["kaal-acceptance-fixture"], { offline: true });
  const { answer } = await import(pathToFileURL(join(host, "node_modules", "kaal-acceptance-fixture", "index.js")).href);
  assert.equal(answer, 42);
});
`,
    );
  }
  writeFileSync(join(location, "test", "acceptance", "helper.mjs"), "export {};\n");
  return location;
}

describe("running acceptance", () => {
  it("discovers a workspace's scenarios by convention, runs them in parallel into distinct fresh hosts, and finds no failure", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    const manifest = await packed(dir);
    const location = workspace(dir, ["one", "two"]);
    const scenarios = await discover([
      { name: "ws", location },
      { name: "none", location: join(dir, "pkg") },
    ]);
    assert.deepEqual(
      scenarios.map((s) => s.path),
      [join(location, "test", "acceptance", "one.test.mjs"), join(location, "test", "acceptance", "two.test.mjs")],
    );
    const run = join(dir, "run");
    const result = await accept({ manifest, scenarios: scenarios.map((s) => s.path), run, cwd: dir });
    assert.equal(result.runner.status, 0, result.runner.stdout + result.runner.stderr);
    assert.equal(result.passed, true);
    assert.equal(result.records.length, 2);
    assert.equal(new Set(result.records.map((r) => r.host)).size, 2);
    assert.ok(result.records.every((r) => r.host.startsWith(join(run, "hosts"))));
    assert.deepEqual(failures(result.findings), []);
    assert.deepEqual(
      result.findings.map((f) => f.kind),
      ["unknown", "unknown"],
    );
  });

  it("names, of the packages a scenario would consume, those this run packed, so a packed dependency is never taken from the registry", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    writeFileSync(join(dir, "manifest.json"), JSON.stringify({ one: {}, two: {} }));
    const before = process.env.KAAL_ACCEPTANCE_RUN;
    process.env.KAAL_ACCEPTANCE_RUN = dir;
    try {
      assert.deepEqual(await packedOf(["one", "three", "two"]), ["one", "two"]);
      assert.deepEqual(await packedOf(["three"]), []);
    } finally {
      if (before === undefined) delete process.env.KAAL_ACCEPTANCE_RUN;
      else process.env.KAAL_ACCEPTANCE_RUN = before;
    }
  });

  it("refuses to install a tarball whose bytes changed after packing, and the failed run is a verified failure", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    const manifest = await packed(dir);
    const [entry] = Object.values(manifest);
    chmodSync(entry.tarball, 0o644);
    writeFileSync(entry.tarball, "not the packed bytes");
    const location = workspace(dir, ["one"]);
    const scenarios = (await discover([{ name: "ws", location }])).map((s) => s.path);
    const result = await accept({ manifest, scenarios, run: join(dir, "run"), cwd: dir });
    assert.notEqual(result.runner.status, 0);
    assert.equal(result.passed, false);
    assert.match(result.runner.stdout + result.runner.stderr, /no longer holds the bytes packed for kaal-acceptance-fixture/);
    assert.deepEqual(failures(result.findings), [
      { subject: "one.test.mjs", evidence: `the scenarios failed (node --test exited ${result.runner.status})` },
      { subject: scenarios[0], evidence: "installed no packed package" },
    ]);
  });

  it("does not pass a run whose runner exits 0 when its evidence holds a verified failure", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    const manifest = await packed(dir);
    const location = workspace(dir, ["one"]);
    const idle = join(location, "test", "acceptance", "idle.test.mjs");
    writeFileSync(idle, 'import { it } from "node:test";\nit("passes without installing anything", () => {});\n');
    const scenarios = (await discover([{ name: "ws", location }])).map((s) => s.path);
    const result = await accept({ manifest, scenarios, run: join(dir, "run"), cwd: dir });
    assert.equal(result.runner.status, 0, result.runner.stdout + result.runner.stderr);
    assert.equal(result.passed, false);
    assert.deepEqual(failures(result.findings), [{ subject: idle, evidence: "installed no packed package" }]);
  });

  it("refuses an empty scenario list before writing or running anything, so the runner never discovers tests of its own", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    writeFileSync(join(dir, "stray.test.mjs"), 'import { it } from "node:test";\nit("must never run", () => { throw new Error("ran"); });\n');
    const run = join(dir, "run");
    await assert.rejects(accept({ manifest: {}, scenarios: [], run, cwd: dir }), /no acceptance scenarios to run/);
    assert.equal(existsSync(run), false);
  });

  it("refuses a run directory that is already in use", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    writeFileSync(join(dir, "left-over"), "");
    await assert.rejects(accept({ manifest: {}, scenarios: [join(dir, "left-over")], run: dir, cwd: dir }), /not empty/);
  });
});

describe("installation host names", () => {
  it("stay unique when an operating system reuses a process id for a later scenario process", async () => {
    // A second module instance in this process models the next process that gets the same pid.
    const first = await import(`${LIB}?first`);
    const second = await import(`${LIB}?second`);
    assert.equal(typeof first.hostId, "function");
    assert.notEqual(first.hostId(), second.hostId());
    assert.notEqual(first.hostId(), first.hostId());
  });
});

// testing/C57: a nested, strictly older copy of a packed package is pin-behind, not a verified failure.

const NAME = "@kaihacksai/kaal-foundation";
const pinManifest = (extra = {}) => ({ [NAME]: { tarball: "/run/foundation.tgz", sha256: "a".repeat(64), integrity: "sha512-packed", version: "0.0.2", ...extra } });
const pinRun = (holds, m = pinManifest()) =>
  findings({ manifest: m, scenarios: ["/s.test.mjs"], records: [{ scenario: "/s.test.mjs", host: "/h", consumed: { [NAME]: "a".repeat(64) } }], holds: { "/h": holds } });
const pinTop = { [`node_modules/${NAME}`]: { version: "0.0.2", integrity: "sha512-packed" } };
const pinNested = (version, integrity = "sha512-registry", consumer = "kaal-core") => ({ ...pinTop, [`node_modules/${consumer}/node_modules/${NAME}`]: { version, integrity, resolved: "https://registry.npmjs.org/x.tgz" } });
const pinFails = (found) => found.filter((f) => f.kind === "verified failure");

describe("pin-behind in the acceptance evidence", () => {
  it("testing/T141 [testing/F118]: a nested older copy gives pin-behind naming consumer, package, held and packed version", () => {
    const found = pinRun(pinNested("0.0.1"));
    const pin = found.filter((f) => f.kind === "pin-behind");
    assert.equal(pin.length, 1);
    assert.deepEqual({ consumer: pin[0].consumer, package: pin[0].package, held: pin[0].held, packed: pin[0].packed, host: pin[0].host, subject: pin[0].subject }, { consumer: "kaal-core", package: NAME, held: "0.0.1", packed: "0.0.2", host: "/h", subject: "/s.test.mjs" });
    assert.deepEqual(pinFails(found), []);
  });
  it("testing/T142 [testing/F118, testing/F120]: nested older copies under several consumers are all pin-behind and none is a verified failure", () => {
    const found = pinRun({ ...pinNested("0.0.1", "sha512-r", "kaal-core"), ...pinNested("0.0.1", "sha512-r", "kaal-change") });
    assert.deepEqual(found.filter((f) => f.kind === "pin-behind").map((f) => f.consumer).sort(), ["kaal-change", "kaal-core"]);
    assert.deepEqual(pinFails(found), []);
  });
  it("testing/T143 [testing/F119]: a top-level held copy with other bytes is a verified failure", () => {
    assert.equal(pinFails(pinRun({ [`node_modules/${NAME}`]: { version: "0.0.1", integrity: "sha512-registry" } })).length, 1);
  });
  it("testing/T144 [testing/F119]: a nested copy of the same version with other bytes is a verified failure", () => {
    assert.equal(pinFails(pinRun(pinNested("0.0.2"))).length, 1);
  });
  it("testing/T145 [testing/F119]: a nested copy of a newer version is a verified failure", () => {
    assert.equal(pinFails(pinRun(pinNested("0.0.3"))).length, 1);
  });
  it("testing/T146 [testing/F119]: a nested older copy is a verified failure when a version is missing or not plain x.y.z", () => {
    assert.equal(pinFails(pinRun(pinNested("0.0.1"), pinManifest({ version: undefined }))).length, 1);
    assert.equal(pinFails(pinRun({ ...pinTop, [`node_modules/kaal-core/node_modules/${NAME}`]: { integrity: "sha512-registry" } })).length, 1);
    assert.equal(pinFails(pinRun(pinNested("0.0.1-rc.1"))).length, 1);
  });
  it("testing/T147 [testing/F121]: a held copy equal to the packed integrity gives neither a failure nor a pin-behind", () => {
    const found = pinRun(pinNested("0.0.1", "sha512-packed"));
    assert.deepEqual(pinFails(found), []);
    assert.deepEqual(found.filter((f) => f.kind === "pin-behind"), []);
  });
});
