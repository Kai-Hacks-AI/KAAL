// engineering/T62–T70 (engineering/C12, engineering/release/README.md): the Release engine, on fixture
// packages in a scratch directory and a fixture registry behind the engine's npm seam. No network,
// and nothing is ever published: `npm publish` is answered by the fixture.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { acceptance, bind, firstSteps, locate, provenance, publishable, readiness, REPOSITORY, SOURCE, verification } from "./release.mjs";
import { acceptStep, npm as realNpm, packStep, publishStep } from "./run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const NAME = "@kaihacksai/kaal-demo";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const sri = (b) => `sha512-${createHash("sha512").update(b).digest("base64")}`;

const good = (over = {}) => ({
  name: NAME,
  version: "0.0.1",
  license: "MIT",
  type: "module",
  files: ["test"],
  engines: { node: ">=24" },
  publishConfig: { access: "public" },
  repository: { type: "git", url: REPOSITORY, directory: "packages/kaal-demo" },
  scripts: { test: "node test/verify.mjs" },
  ...over,
});

const CASES = ["demo/T1", "demo/T2"];
/** The demo's installed verification: prints a summary record for `cases`, as given by DEMO_RESULT, and exits with its `exit`. */
const VERIFY = `const r = JSON.parse(process.env.DEMO_RESULT ?? JSON.stringify({ result: "verified", exit: 0, cases: ${JSON.stringify(CASES.map((name) => ({ name, outcome: "pass" })))}, causes: [] }));\nconsole.log("kaal-demo verification: this copy");\nconsole.log("kaal-demo-verification " + JSON.stringify(r));\nprocess.exit(r.exit);\n`;

/** A scratch repository with one workspace, the demo package. */
function repo(dir, manifest) {
  mkdirSync(join(dir, "packages", "kaal-demo", "test"), { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, workspaces: ["packages/kaal-demo"] }));
  writeFileSync(join(dir, "packages", "kaal-demo", "package.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, "packages", "kaal-demo", "test", "verify.mjs"), VERIFY);
  writeFileSync(join(dir, "packages", "kaal-demo", "test", "verify.json"), JSON.stringify({ files: {}, cases: CASES }));
  const r = spawn(["install", "--offline"], dir);
  assert.equal(r.status, 0, r.stderr);
  return dir;
}

let spawnSyncFn;
const spawn = (args, cwd) => spawnSyncFn("npm", args, { cwd, encoding: "utf8", env: { ...process.env, npm_config_offline: "true", npm_config_audit: "false", npm_config_fund: "false" } });

/**
 * The fixture registry: `known` maps a name to its versions (absent = E404), `tarballs` maps a spec
 * to the bytes the registry serves, `dist` to its dist object. Every other npm command runs for
 * real, offline. Records every call; `publish` is recorded and never run.
 */
function registry({ known = {}, tarballs = {}, dist = {} } = {}) {
  const calls = [];
  const fn = async (args, cwd, env) => {
    calls.push(args);
    // As a real spawn does, a command in a directory that does not exist cannot start.
    if (!existsSync(cwd)) throw Object.assign(new Error(`spawn npm ENOENT (cwd ${cwd})`), { code: "ENOENT" });
    const [cmd, what] = args;
    if (cmd === "view") {
      const [name, version] = what.startsWith("@") ? ["@" + what.slice(1).split("@")[0], what.slice(1).split("@")[1]] : what.split("@");
      if (version) return dist[what] ? { status: 0, stdout: JSON.stringify(dist[what]), stderr: "" } : { status: 1, stdout: "", stderr: "npm error code E404" };
      return name in known ? { status: 0, stdout: JSON.stringify(known[name]), stderr: "" } : { status: 1, stdout: "", stderr: "npm error code E404\nnpm error 404 Not Found" };
    }
    if (cmd === "publish") return { status: 0, stdout: "", stderr: "" };
    if (cmd === "pack" && tarballs[what]) {
      const dest = args[args.indexOf("--pack-destination") + 1];
      const filename = "kaihacksai-kaal-demo-0.0.1.tgz";
      writeFileSync(join(dest, filename), tarballs[what]);
      return { status: 0, stdout: JSON.stringify([{ filename }]), stderr: "" };
    }
    if (cmd === "install" && tarballs[what]) {
      const file = join(cwd, "..", "from-registry.tgz");
      writeFileSync(file, tarballs[what]);
      return realNpm(["install", file], cwd, { ...env, npm_config_offline: "true" });
    }
    return realNpm(args, cwd, { ...env, npm_config_offline: "true" });
  };
  fn.calls = calls;
  return fn;
}

let work;
before(async () => {
  ({ spawnSync: spawnSyncFn } = await import("node:child_process"));
  work = mkdtempSync(join(tmpdir(), "kaal-release-"));
});
after(() => rmSync(work, { recursive: true, force: true }));
const scratch = (name) => {
  const d = join(work, name);
  mkdirSync(d);
  return d;
};

describe("engineering/T62 [engineering/F29]: readiness names each missing manifest field, and nothing is packed", () => {
  const registryOf = { [NAME]: null };
  for (const [what, manifest, finding] of [
    ["unscoped name", good({ name: "kaal-demo" }), /not scoped @kaihacksai\//],
    ["publishConfig", good({ publishConfig: undefined }), /publishConfig\.access/],
    ["repository.directory", good({ repository: { url: REPOSITORY } }), /repository\.directory/],
    ["repository.url", good({ repository: { url: "https://example.com/x.git", directory: "packages/kaal-demo" } }), /repository\.url/],
    ["license", good({ license: undefined }), /license is missing/],
    ["engines.node", good({ engines: {} }), /engines\.node is missing/],
    ["files", good({ files: undefined }), /files is missing/],
    ["private", good({ private: true }), /is private/],
  ]) {
    it(what, () => {
      const r = readiness({ manifest: manifest, directory: "packages/kaal-demo", registry: { ...registryOf, [manifest.name]: null } });
      assert.ok(r.findings.some((f) => finding.test(f)), `${what}: ${JSON.stringify(r.findings)}`);
    });
  }
  it("a complete manifest is ready", () => assert.deepEqual(readiness({ manifest: good(), directory: "packages/kaal-demo", registry: registryOf }).findings, []));
  it("a package that is not ready is never packed", { timeout: 120_000 }, async () => {
    const root = repo(scratch("t62"), good({ publishConfig: undefined }));
    const out = join(root, "out");
    const r = await packStep({ name: NAME, root, out, commit: "c0", run: "1", npm: registry() });
    assert.equal(r.result, "failed");
    assert.equal(existsSync(join(out, "artifact")), false);
    assert.match(readFileSync(join(out, "report", "summary.md"), "utf8"), /publishConfig\.access/);
  });
});

describe("engineering/T63 [engineering/F29]: the registry decides the version and the dependencies", () => {
  it("a version already on the registry is refused", () => {
    const r = readiness({ manifest: good(), directory: "packages/kaal-demo", registry: { [NAME]: ["0.0.1"] } });
    assert.ok(r.findings.some((f) => /already on the registry/.test(f)));
  });
  it("a runtime dependency the registry lacks is refused and named; once it exists the release proceeds", () => {
    const manifest = good({ dependencies: { "@kaihacksai/kaal-foundation": "0.0.1" } });
    const lacking = readiness({ manifest, directory: "packages/kaal-demo", registry: { [NAME]: null, "@kaihacksai/kaal-foundation": null } });
    assert.deepEqual(lacking.findings, ["dependency @kaihacksai/kaal-foundation@0.0.1 is not on the registry; release it first"]);
    const present = readiness({ manifest, directory: "packages/kaal-demo", registry: { [NAME]: null, "@kaihacksai/kaal-foundation": ["0.0.1"] } });
    assert.deepEqual(present.findings, []);
  });
  it("a dependency range is not an exact version", () => {
    const r = readiness({ manifest: good({ dependencies: { x: "^1.0.0" } }), directory: "packages/kaal-demo", registry: { [NAME]: null, x: ["1.0.0"] } });
    assert.ok(r.findings.some((f) => /not an exact version/.test(f)));
  });
});

describe("engineering/T64 [engineering/F28]: the package is found by its npm name among the workspaces", () => {
  const ws = [{ name: NAME, location: "/r/packages/kaal-demo" }];
  it("an unknown package is refused", () => assert.match(locate(ws, "@kaihacksai/kaal-none").findings[0], /not a workspace/));
  it("a name given as a path is refused", () => {
    for (const n of ["packages/kaal-demo", "../kaal-demo", "@kaihacksai/../x", "@kaihacksai/a/b"]) assert.match(locate(ws, n).findings[0], /not a package name/, n);
  });
  it("no list of releasable packages exists beside the manifests", () => {
    assert.deepEqual(readdirSync(HERE).filter((f) => f.endsWith(".json")), []);
  });
});

describe("engineering/T65 [engineering/F31, F33]: one pack; Publish publishes the downloaded artifact and never packs", () => {
  let rec, tarball;
  before(async () => {
    const root = repo(scratch("t65"), good());
    const out = join(root, "out");
    const r = await packStep({ name: NAME, root, out, commit: "c1", run: "65", npm: registry({ known: { [NAME]: ["0.0.0"] } }) });
    assert.equal(r.result, "verified", readFileSync(join(out, "report", "summary.md"), "utf8"));
    tarball = join(out, "artifact", r.record.tarball);
    rec = bind(r.record, { id: "9", digest: r.record.sha256 }).record;
  });
  it("the SHA-256 and integrity in the record are the tarball's", () => {
    const b = readFileSync(tarball);
    assert.equal(rec.sha256, sha(b));
    assert.equal(rec.integrity, sri(b));
    assert.equal(rec.path, "trusted");
  });
  it("an uploaded artifact whose digest differs is cannot judge", () => assert.equal(bind(rec, { id: "9", digest: "0".repeat(64) }).result, "unknown"));
  it("Publish publishes the downloaded tarball's bytes and never runs npm pack", async () => {
    const downloaded = join(work, "t65-download.tgz");
    copyFileSync(tarball, downloaded);
    const npm = registry();
    assert.equal((await publishStep({ record: rec, tarball: downloaded, commit: "c1", run: "65", npm })).result, "verified");
    assert.deepEqual(npm.calls, [["publish", downloaded, "--access", "public"]]);
  });
  it("a downloaded artifact with other bytes, another run or another commit is cannot judge, and publish is never reached", async () => {
    const tampered = join(work, "t65-tampered.tgz");
    writeFileSync(tampered, Buffer.concat([readFileSync(tarball), Buffer.from([0])]));
    for (const [file, commit, run] of [[tampered, "c1", "65"], [tarball, "c2", "65"], [tarball, "c1", "66"]]) {
      const npm = registry();
      assert.equal((await publishStep({ record: rec, tarball: file, commit, run, npm })).result, "unknown");
      assert.deepEqual(npm.calls, []);
    }
  });
});

describe("engineering/T66 [engineering/F32]: the installed verification's whole record decides, never an exit status or a result field alone", () => {
  const pass = (name) => ({ name, outcome: "pass" });
  const rec = (over = {}) => ({ result: "verified", exit: 0, cases: CASES.map(pass), causes: [], ...over });
  const out = (r) => `kaal-demo verification: this copy\nkaal-demo-verification ${JSON.stringify(r)}\n`;
  const judge = (r, o = {}) => verification(o.text ?? out(r), NAME, { status: "status" in o ? o.status : r.exit, declared: "declared" in o ? o.declared : CASES });
  it("a complete, consistent verified record against the declared cases is verified", () => assert.equal(judge(rec()).result, "verified"));
  it("failed is failed, and cannot verify is unknown", () => {
    assert.equal(judge(rec({ result: "failed", exit: 1, cases: [pass("demo/T1"), { name: "demo/T2", outcome: "fail" }], causes: ["demo/T2 failed"] })).result, "failed");
    assert.equal(judge(rec({ result: "cannot verify", exit: 2, causes: ["x"] })).result, "unknown");
  });
  it("mismatched exit: the record's exit disagrees with its result, or the process exit disagrees with the record", () => {
    assert.equal(judge(rec({ exit: 1 }), { status: 1 }).result, "unknown");
    assert.equal(judge(rec(), { status: 1 }).result, "unknown");
    assert.equal(judge(rec({ result: "failed", exit: 1 }), { status: 0 }).result, "unknown");
    assert.equal(judge(rec(), { status: undefined }).result, "unknown");
  });
  it("verified with a missing, duplicate, undeclared, skipped, todo or failed case never verifies", () => {
    const cases = {
      missing: [pass("demo/T1")],
      duplicate: [...CASES.map(pass), pass("demo/T1")],
      undeclared: [...CASES.map(pass), pass("demo/T9")],
      skipped: [pass("demo/T1"), { name: "demo/T2", outcome: "skip" }],
      todo: [pass("demo/T1"), { name: "demo/T2", outcome: "todo" }],
      none: [],
    };
    for (const [what, c] of Object.entries(cases)) assert.equal(judge(rec({ cases: c })).result, "unknown", what);
    assert.equal(judge(rec({ cases: [pass("demo/T1"), { name: "demo/T2", outcome: "fail" }] })).result, "failed");
  });
  it("verified with causes, or with no declaration to check it against, never verifies", () => {
    assert.equal(judge(rec({ causes: ["something"] })).result, "unknown");
    for (const declared of [undefined, [], [""], "demo/T1"]) assert.equal(judge(rec(), { declared }).result, "unknown", JSON.stringify(declared));
  });
  it("malformed summaries are unknown", () => {
    const malformed = [
      "all good\n",
      `${out(rec())}${out(rec())}`,
      `${out(rec())}more\n`,
      `kaal-other-verification ${JSON.stringify(rec())}\n`,
      "kaal-demo-verification verified\n",
      "kaal-demo-verification null\n",
      "kaal-demo-verification [1]\n",
      out({ ...rec(), result: "passed" }),
      out({ ...rec(), cases: undefined }),
      out({ ...rec(), cases: [{ outcome: "pass" }] }),
      out({ ...rec(), cases: [{ name: "demo/T1" }] }),
      out({ ...rec(), causes: undefined }),
      out({ ...rec(), causes: [1] }),
      out({ ...rec(), exit: "0" }),
    ];
    for (const text of malformed) assert.equal(judge(rec(), { text }).result, "unknown", text);
  });
  it("end to end: the record is read from the installed candidate, and checks that cannot run yet are not run, never verified", { timeout: 180_000 }, async () => {
    const root = repo(scratch("t66"), good());
    const r = await packStep({ name: NAME, root, out: join(root, "out"), commit: "c", run: "1", npm: registry({ known: { [NAME]: [] } }) });
    assert.equal(r.record.checks.installed.result, "verified");
    assert.equal(r.record.checks.packaging.result, "not run");
    assert.equal(r.record.checks.conformance.result, "not run");
  });
  it("end to end: a false GREEN from the installed candidate (verified, a case skipped) disqualifies the tarball", { timeout: 180_000 }, async () => {
    const root = repo(scratch("t66b"), good());
    process.env.DEMO_RESULT = JSON.stringify(rec({ cases: [pass("demo/T1"), { name: "demo/T2", outcome: "skip" }] }));
    try {
      const r = await packStep({ name: NAME, root, out: join(root, "out"), commit: "c", run: "1", npm: registry({ known: { [NAME]: [] } }) });
      assert.equal(r.result, "unknown");
      assert.equal(r.record.checks.installed.result, "unknown");
      const bound = bind(r.record, { id: "1", digest: r.record.sha256 }).record;
      assert.equal(publishable(bound, { sha256: bound.sha256, run: "1", commit: "c" }).result, "failed");
    } finally {
      delete process.env.DEMO_RESULT;
    }
  });
});

describe("engineering/T67 [engineering/F34]: a name the registry does not know is a first publication for the Owner", () => {
  let r, out;
  before(async () => {
    const root = repo(scratch("t67"), good());
    out = join(root, "out");
    r = await packStep({ name: NAME, root, out, commit: "c7", run: "67", npm: registry() });
  });
  it("the path is first, and the Owner's steps carry the run, the file, the SHA-256 and the package, and never pack", () => {
    assert.equal(r.record.path, "first");
    const steps = firstSteps(r.record);
    const summary = readFileSync(join(out, "report", "summary.md"), "utf8");
    assert.ok(summary.includes(steps));
    for (const v of ["67", r.record.tarball, r.record.sha256, NAME, "--access public", "trust github", "disallow tokens"]) assert.ok(steps.includes(v), v);
    assert.doesNotMatch(steps, /npm(@[\d.]+)? pack/);
    assert.match(steps, /publish \.\/kaihacksai-kaal-demo-0\.0\.1\.tgz/);
  });
  it("Publish refuses a first publication before any npm command", async () => {
    const rec = bind(r.record, { id: "1", digest: r.record.sha256 }).record;
    const npm = registry();
    const p = await publishStep({ record: rec, tarball: join(out, "artifact", rec.tarball), commit: "c7", run: "67", npm });
    assert.equal(p.result, "failed");
    assert.match(p.cause, /first publication is the Owner's/);
    assert.deepEqual(npm.calls, []);
  });
});

describe("engineering/T68 [engineering/F35]: registry acceptance compares the registry's bytes with the tested artifact", () => {
  const rec = { package: NAME, version: "0.0.1", run: "68", commit: "c8", sha256: "a".repeat(64), integrity: "sha512-A", path: "first", artifact: { id: "1", digest: "a".repeat(64) } };
  const ok = { sha256: "a".repeat(64), integrity: "sha512-A", distIntegrity: "sha512-A" };
  const installed = { result: "verified" };
  it("equal bytes and a verified fresh install are verified, and only then accepted", () => {
    const a = acceptance(rec, { run: "68", registry: ok, installed, statements: null });
    assert.equal(a.result, "verified");
    assert.equal(a.record.accepted, true);
  });
  it("another SHA-256, another sha512, another dist.integrity, or a failed install fails and is not accepted", () => {
    for (const [registry, inst] of [[{ ...ok, sha256: "b".repeat(64) }, installed], [{ ...ok, integrity: "sha512-B" }, installed], [{ ...ok, distIntegrity: "sha512-B" }, installed], [ok, { result: "failed", cause: "x" }]]) {
      const a = acceptance(rec, { run: "68", registry, installed: inst, statements: null });
      assert.equal(a.result, "failed");
      assert.equal(a.record.accepted, false);
    }
  });
  it("the hash comes from the Pack run's record: another run is cannot judge", () => assert.equal(acceptance(rec, { run: "69", registry: ok, installed, statements: null }).result, "unknown"));
  it("end to end: the registry's tarball is downloaded, compared, installed fresh and verified", { timeout: 180_000 }, async () => {
    const root = repo(scratch("t68"), good());
    const out = join(root, "out");
    const packed = await packStep({ name: NAME, root, out, commit: "c8", run: "68", npm: registry() });
    const bytes = readFileSync(join(out, "artifact", packed.record.tarball));
    const r0 = bind(packed.record, { id: "1", digest: packed.record.sha256 }).record;
    const spec = `${NAME}@0.0.1`;
    const good1 = await acceptStep({ record: r0, run: "68", out: join(root, "accept1"), npm: registry({ tarballs: { [spec]: bytes }, dist: { [spec]: { integrity: sri(bytes) } } }) });
    assert.equal(good1.result, "verified", good1.findings.join("\n"));
    const other = Buffer.concat([bytes, Buffer.from([0])]);
    const bad = await acceptStep({ record: r0, run: "68", out: join(root, "accept2"), npm: registry({ tarballs: { [spec]: other }, dist: { [spec]: { integrity: sri(other) } } }) });
    assert.equal(bad.result, "failed");
  });
});

describe("engineering/T69 [engineering/F35]: provenance is recorded as observed, never stronger", () => {
  const statement = (over = {}) => ({
    predicateType: "https://slsa.dev/provenance/v1",
    predicate: { buildDefinition: { externalParameters: { workflow: { repository: SOURCE.repository, path: SOURCE.workflow, ...over } }, resolvedDependencies: [{ digest: { gitCommit: over.commit ?? "c9" } }] } },
  });
  const trusted = { path: "trusted", commit: "c9" };
  it("trusted: an attestation naming this repository, release.yml and the commit verifies", () => assert.equal(provenance(trusted, [statement()]).result, "verified"));
  it("trusted: a missing attestation, or one naming another repository, workflow or commit, fails", () => {
    for (const s of [null, [], [statement({ repository: "https://github.com/x/y" })], [statement({ path: ".github/workflows/guard-release.yml" })], [statement({ commit: "other" })]])
      assert.equal(provenance(trusted, s).result, "failed");
  });
  it("first: no attestation is recorded as none, manual bootstrap, and is not a failure; nothing is claimed", () => {
    const p = provenance({ path: "first", commit: "c9" }, null);
    assert.equal(p.result, "verified");
    assert.match(p.note, /provenance: none \(first publication by the Owner, manual bootstrap\)/);
    assert.doesNotMatch(p.note, /OIDC/);
  });
});

describe("engineering/T70 [engineering/N15]: no path publishes but F33's, and no token is read", () => {
  const sources = ["release.mjs", "run.mjs"].map((f) => readFileSync(join(HERE, f), "utf8")).join("\n");
  it("npm publish appears once, in publishStep", () => {
    const uses = [...sources.matchAll(/\["publish"/g)];
    assert.equal(uses.length, 1);
    const run = readFileSync(join(HERE, "run.mjs"), "utf8");
    const at = run.indexOf('["publish"');
    assert.ok(run.lastIndexOf("export async function publishStep", at) > run.lastIndexOf("export async function", at - 1) - 1);
    assert.equal(run.lastIndexOf("export async function publishStep", at), run.lastIndexOf("export async function", at));
  });
  it("no token variable is read", () => assert.doesNotMatch(sources, /NPM_TOKEN|NODE_AUTH_TOKEN|_authToken/));
  it("Publish refuses a record whose tested tarball did not verify", () => {
    const rec = { path: "trusted", run: "1", commit: "c", sha256: "a", artifact: { digest: "a" }, checks: { installed: { result: "failed" } } };
    assert.equal(publishable(rec, { sha256: "a", run: "1", commit: "c" }).result, "failed");
  });
});
