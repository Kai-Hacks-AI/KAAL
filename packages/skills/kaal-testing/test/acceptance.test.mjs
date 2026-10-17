import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "kaal-hosting";
import { accept, discover, findings, integrity, sha256 } from "kaal-testing/acceptance";

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
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.records.length, 2);
    assert.equal(new Set(result.records.map((r) => r.host)).size, 2);
    assert.ok(result.records.every((r) => r.host.startsWith(join(run, "hosts"))));
    assert.deepEqual(failures(result.findings), []);
    assert.deepEqual(
      result.findings.map((f) => f.kind),
      ["unknown", "unknown"],
    );
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
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /no longer holds the bytes packed for kaal-acceptance-fixture/);
    assert.deepEqual(failures(result.findings), [
      { subject: "one.test.mjs", evidence: `the scenarios failed (node --test exited ${result.status})` },
      { subject: scenarios[0], evidence: "installed no packed package" },
    ]);
  });

  it("refuses a run directory that is already in use", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-acceptance-"));
    writeFileSync(join(dir, "left-over"), "");
    await assert.rejects(accept({ manifest: {}, scenarios: [], run: dir, cwd: dir }), /not empty/);
  });
});
