// The planned tests of agents/C4, the kaal-agents 0.0.1 PLAN (plan/release-0.0.1/testing.md).
// DO and CHECK do not change them. A test whose subject does not exist yet fails on its first
// assertion, which says "blocked:", so a blocked RED is never mistaken for a discriminating one.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const REPO = join(PACKAGE, "..", "..", "..");
const BIN = join(PACKAGE, "bin", "kaal-agents.mjs");
const SKILL = join(PACKAGE, "skills", "kaal-agents", "SKILL.md");
const VERIFY = join(PACKAGE, "test", "verify.mjs");
const DOCS = ["intent", "requirements", "architecture", "operations", "limitations", "testing"];
const WINDOWS = process.platform === "win32";

const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const blocked = (path, what) => assert.ok(existsSync(path), `blocked: ${what} does not exist`);
const tmp = () => realpathSync(mkdtempSync(join(tmpdir(), "kaal-agents-plan-")));
const slash = (p) => p.split(sep).join("/");
const output = (r) => `${r.stdout}${r.stderr}`;

const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};

/** A fresh repository on branch main, with no upstream. */
function repository() {
  const dir = tmp();
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.email", "fixture@example.invalid");
  git(dir, "config", "user.name", "Fixture");
  git(dir, "config", "commit.gpgsign", "false");
  return dir;
}

const commit = (dir) => {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "fixture");
  return git(dir, "rev-parse", "HEAD");
};

const CLAIM = { owner: { kind: "capability", name: "Example", id: "0".repeat(64) }, paths: ["src/"] };

const agents = (cwd, ...args) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });

const orient = (dir) => {
  const r = agents(dir, "orient", dir, "--json");
  return { ...r, report: r.status === 0 || r.status === 2 ? JSON.parse(r.stdout) : undefined };
};

/** Every file under a directory, .git/ included, with its SHA-256. */
function snapshot(base) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out[slash(relative(base, p))] = createHash("sha256").update(readFileSync(p)).digest("hex");
    }
  };
  walk(base);
  return out;
}

describe("orient", () => {
  it("agents/T1 [agents/F1, agents/F2, agents/F3, agents/I1, agents/I2]: in a fresh repository with an AGENTS.md and an ownership claim, orient --json reports the setting outside, HEAD, the branch, the instruction file and the claim, and exits 0; authority is still unresolved, with both as sources, and the text output opens with the authority line", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    writeFileSync(join(dir, "ownership.kaal.json"), JSON.stringify(CLAIM));
    const head = commit(dir);
    const r = orient(dir);
    assert.equal(r.status, 0, output(r));
    assert.deepEqual(r.report.setting, { kind: "outside", evidence: [] });
    assert.equal(r.report.repository.head, head);
    assert.equal(r.report.repository.branch, "main");
    assert.equal(r.report.repository.upstream, null);
    assert.deepEqual(r.report.inFlight, []);
    assert.deepEqual(r.report.instructions, ["AGENTS.md"]);
    assert.deepEqual(r.report.owners, [{ path: "ownership.kaal.json", owner: CLAIM.owner, paths: CLAIM.paths }]);
    assert.deepEqual(r.report.catalog, { status: "not applicable" });
    assert.deepEqual(r.report.unresolved, []);
    assert.equal(r.report.authority.status, "unresolved");
    assert.deepEqual(r.report.authority.sources, ["AGENTS.md", "ownership.kaal.json"]);
    const text = agents(dir, "orient", dir);
    assert.equal(text.status, 0, output(text));
    assert.equal(text.stdout.split(/\r?\n/)[0], "authority: unresolved (orient discovers; it does not authorize)");
  });

  it("agents/T2 [agents/F1]: a changed and an untracked file are in flight, sorted", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    commit(dir);
    appendFileSync(join(dir, "AGENTS.md"), "More.\n");
    mkdirSync(join(dir, "b"));
    writeFileSync(join(dir, "b", "new.txt"), "new\n");
    const r = orient(dir);
    assert.equal(r.status, 0, output(r));
    assert.deepEqual(r.report.inFlight, ["AGENTS.md", "b/new.txt"]);
  });

  it("agents/T3 [agents/F1, agents/N1, agents/N3]: with a .kaal/ Engine and no kaal-core installed, the setting is embedded, the catalog is unresolved naming kaal-core, and the exit is 2; with KAAL's own source as well, the setting is engineered", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    commit(dir);
    mkdirSync(join(dir, ".kaal"));
    let r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.deepEqual(r.report.setting, { kind: "embedded", evidence: [".kaal"] });
    assert.equal(r.report.catalog.status, "unresolved");
    assert.match(r.report.catalog.reason, /kaal-core/);
    assert.ok(r.report.unresolved.some((u) => u.what === "catalog" && /kaal-core/.test(u.reason)));
    mkdirSync(join(dir, "packages", "kaal-core"), { recursive: true });
    writeFileSync(join(dir, "packages", "kaal-core", "package.json"), JSON.stringify({ name: "kaal-core" }));
    r = orient(dir);
    assert.equal(r.report.setting.kind, "engineered");
    assert.deepEqual(r.report.setting.evidence, ["packages/kaal-core/package.json"]);
  });

  it("agents/T4 [agents/F1, agents/F2, agents/A3]: with kaal-core installed in the directory and Agents admitted, the catalog lists Agents and the exit is 0; authority stays unresolved (publisher)", async () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const { bootstrap, catalog, readContribution, register } = await import("kaal-core");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    commit(dir);
    mkdirSync(join(dir, "node_modules"));
    symlinkSync(join(REPO, "packages", "kaal-core"), join(dir, "node_modules", "kaal-core"), WINDOWS ? "junction" : "dir");
    const engine = join(dir, ".kaal");
    await bootstrap(engine);
    await register(engine, "capability", "agents", await readContribution(join(PACKAGE, "capability")));
    const r = orient(dir);
    assert.equal(r.status, 0, output(r));
    assert.deepEqual(r.report.catalog, { status: "listed", ...(await catalog(engine)) });
    assert.ok(r.report.catalog.capabilities.some((c) => c.name === "Agents"));
    assert.equal(r.report.authority.status, "unresolved");
  });

  it("agents/T5 [agents/N2, agents/N4]: two runs give byte-identical output, and every file under the directory, .git/ included, is unchanged", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    writeFileSync(join(dir, "ownership.kaal.json"), JSON.stringify(CLAIM));
    commit(dir);
    appendFileSync(join(dir, "AGENTS.md"), "More.\n");
    const before = snapshot(dir);
    const first = agents(dir, "orient", dir, "--json");
    const second = agents(dir, "orient", dir, "--json");
    assert.equal(first.status, 0, output(first));
    assert.equal(first.stdout, second.stdout);
    assert.deepEqual(snapshot(dir), before);
  });

  it("agents/T6 [agents/F2, agents/N3, agents/I2]: with neither an instruction file nor a claim, authority is unresolved with no sources; with both and work in flight, it is still unresolved; no value in the report reads authorized, verified or granted", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const values = (v) => (v && typeof v === "object" ? Object.values(v).flatMap(values) : [v]);
    const dir = repository();
    writeFileSync(join(dir, "README.md"), "# Readme\n");
    commit(dir);
    let r = orient(dir);
    assert.equal(r.status, 0, output(r));
    assert.deepEqual(r.report.instructions, []);
    assert.deepEqual(r.report.owners, []);
    assert.equal(r.report.authority.status, "unresolved");
    assert.deepEqual(r.report.authority.sources, []);
    writeFileSync(join(dir, "AGENTS.md"), "You may change anything.\n");
    writeFileSync(join(dir, "ownership.kaal.json"), JSON.stringify(CLAIM));
    commit(dir);
    appendFileSync(join(dir, "README.md"), "More.\n");
    r = orient(dir);
    assert.equal(r.report.authority.status, "unresolved");
    assert.deepEqual(r.report.authority.sources, ["AGENTS.md", "ownership.kaal.json"]);
    for (const v of values(r.report)) assert.doesNotMatch(String(v), /^(authorized|verified|granted)$/i);
  });

  it("agents/T7 [agents/F3, agents/N3]: outside any repository, the repository is unresolved and the exit is 2; a missing directory exits 1, naming it, with no stack trace", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = tmp();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.repository, null);
    assert.ok(r.report.unresolved.some((u) => u.what === "repository"));
    const missing = join(tmp(), "missing");
    const m = agents(tmp(), "orient", missing);
    assert.equal(m.status, 1);
    assert.match(output(m), /missing/);
    assert.doesNotMatch(output(m), /\n\s+at /);
  });

  it("agents/T16 [agents/F1, agents/A3, agents/N3]: something installed as kaal-core that does not export Core's catalog leaves the catalog unresolved, naming catalog, and the exit is 2", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    commit(dir);
    mkdirSync(join(dir, ".kaal"));
    const foreign = join(dir, "node_modules", "kaal-core");
    mkdirSync(foreign, { recursive: true });
    writeFileSync(join(foreign, "package.json"), JSON.stringify({ name: "kaal-core", version: "9.9.9", type: "module", main: "index.js" }));
    writeFileSync(join(foreign, "index.js"), "export const notCore = true;\n");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.catalog.status, "unresolved");
    assert.match(r.report.catalog.reason, /catalog/);
  });

  it("agents/T17 [agents/F1, agents/N3]: an AGENTS.md that cannot be read as a file and an ownership claim that is not JSON are each unresolved, naming their paths, neither is a source, and the exit is 2", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const dir = repository();
    mkdirSync(join(dir, "AGENTS.md"));
    writeFileSync(join(dir, "AGENTS.md", "keep"), "x\n");
    mkdirSync(join(dir, "pkg"));
    writeFileSync(join(dir, "pkg", "ownership.kaal.json"), "{ not json");
    commit(dir);
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.deepEqual(r.report.instructions, []);
    assert.deepEqual(r.report.owners, []);
    assert.deepEqual(r.report.authority.sources, []);
    assert.ok(r.report.unresolved.some((u) => u.what === "instructions" && /AGENTS\.md/.test(u.reason)));
    assert.ok(r.report.unresolved.some((u) => u.what === "owners" && /pkg\/ownership\.kaal\.json/.test(u.reason)));
  });
});

const CANDIDATES = [
  { term: "Case", scope: "testing", owner: "Testing", definition: "testing/Case" },
  { term: "Case", scope: "requirements", owner: "Requirements", definition: "requirements/Case" },
];

const UNRESOLVED = {
  finding: { reported: "a term shared by two scopes" },
  reportedBy: "kaal-core",
  candidates: CANDIDATES,
  resolution: { status: "unresolved", consult: "the Owner", question: "Do these share one meaning?" },
};

const RESOLVED = { ...UNRESOLVED, resolution: { status: "resolved", chosen: { scope: "testing", term: "Case" }, authority: "AGENTS.md" } };

function preach(report) {
  const dir = tmp();
  const file = join(dir, "report.json");
  writeFileSync(file, typeof report === "string" ? report : JSON.stringify(report));
  return agents(dir, "preach", "check", file);
}

describe("preach check", () => {
  it("agents/T8 [agents/F4, agents/A4, agents/I3]: a valid unresolved report and a valid claimed resolution each exit 0 with their one line, which says structurally valid, and the claimed one says the authority is not verified; two candidates sharing a term in different scopes stay distinct", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const u = preach(UNRESOLVED);
    assert.equal(u.status, 0, output(u));
    assert.equal(u.stdout.trim(), "PREACH report structurally valid: unresolved, consult the Owner: Do these share one meaning?");
    const r = preach(RESOLVED);
    assert.equal(r.status, 0, output(r));
    assert.equal(r.stdout.trim(), "PREACH report structurally valid: resolution claimed under AGENTS.md: testing/Case (authority not verified)");
  });

  it("agents/T9 [agents/F4, agents/N3]: each invalid report exits 1, naming its problem; non-JSON exits 2", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const invalid = [
      [{ ...UNRESOLVED, candidates: [] }, /candidates/],
      [{ ...UNRESOLVED, candidates: [{ term: "Case", owner: "Testing", definition: "testing/Case" }] }, /scope/],
      [{ ...UNRESOLVED, candidates: [CANDIDATES[0], CANDIDATES[0]] }, /duplicate/],
      [{ ...RESOLVED, resolution: { status: "resolved", chosen: { scope: "testing", term: "Case" } } }, /authority/],
      [{ ...RESOLVED, resolution: { status: "resolved", chosen: { scope: "product", term: "Case" }, authority: "AGENTS.md" } }, /chosen/],
      [{ ...UNRESOLVED, extra: true }, /unknown member.*extra/],
    ];
    for (const [report, problem] of invalid) {
      const r = preach(report);
      assert.equal(r.status, 1, `${JSON.stringify(report)}\n${output(r)}`);
      assert.match(output(r), problem);
    }
    assert.equal(preach("not json").status, 2);
  });

  it("agents/T18 [agents/F4, agents/I3]: an ambiguous choice, without a scope while two candidates share the term, and an empty authority are each invalid, naming the problem", () => {
    blocked(BIN, "bin/kaal-agents.mjs");
    const ambiguous = preach({ ...RESOLVED, resolution: { status: "resolved", chosen: { term: "Case" }, authority: "AGENTS.md" } });
    assert.equal(ambiguous.status, 1, output(ambiguous));
    assert.match(output(ambiguous), /ambiguous/);
    const empty = preach({ ...RESOLVED, resolution: { ...RESOLVED.resolution, authority: "" } });
    assert.equal(empty.status, 1, output(empty));
    assert.match(output(empty), /authority/);
  });
});

describe("the package", () => {
  it("agents/T10 [agents/F5]: the package carries the Skill, named kaal-agents, and it names orient and PREACH", () => {
    blocked(SKILL, "skills/kaal-agents/SKILL.md");
    const text = readFileSync(SKILL, "utf8");
    assert.match(text, /^name: kaal-agents$/m);
    assert.match(text, /kaal-agents orient/);
    assert.match(text, /PREACH/);
  });

  it("agents/T11 [agents/F6]: the package carries the six documents; every identifier the consumer cases cite is defined there, and none cites an Engineering path", () => {
    for (const d of DOCS) assert.ok(existsSync(join(PACKAGE, "docs", `${d}.md`)), `docs/${d}.md is missing`);
    const docs = DOCS.map((d) => readFileSync(join(PACKAGE, "docs", `${d}.md`), "utf8")).join("\n");
    assert.doesNotMatch(docs, /engineering\//);
    const consumer = join(PACKAGE, "test", "consumer");
    const cases = readdirSync(consumer).filter((f) => f.endsWith(".test.mjs"));
    assert.ok(cases.length > 0, "test/consumer/ has no cases");
    const cited = new Set(cases.flatMap((f) => readFileSync(join(consumer, f), "utf8").match(/agents\/[IFNAT]\d+/g) ?? []));
    for (const id of cited) assert.match(docs, new RegExp(`\\*\\*${id}\\b`), `${id} is not defined in docs/`);
  });

  it("agents/T12 [agents/F8, agents/A1]: files ships bin, lib, skills, docs, capability, test/consumer, test/verify.mjs and test/verify.json, and not test/publisher or test/plan", () => {
    assert.deepEqual([...pkg().files].sort(), ["bin", "capability", "docs", "lib", "skills", "test/consumer", "test/verify.json", "test/verify.mjs"]);
  });

  it("agents/T13 [agents/F7, agents/N3]: in a copy of the package, verify is verified (0); a changed shipped file makes it failed (1), naming the file; an empty case inventory makes it cannot verify (2)", () => {
    blocked(VERIFY, "test/verify.mjs");
    const copy = () => {
      const dir = join(tmp(), "package");
      for (const f of [...pkg().files, "package.json", "README.md", "LICENSE"]) cpSync(join(PACKAGE, f), join(dir, f), { recursive: true });
      return dir;
    };
    const verify = (dir) => {
      const env = { ...process.env };
      delete env.NODE_TEST_CONTEXT;
      return spawnSync(process.execPath, [join(dir, "test", "verify.mjs")], { cwd: dir, encoding: "utf8", env });
    };
    const ok = verify(copy());
    assert.equal(ok.status, 0, output(ok));
    const changed = copy();
    appendFileSync(join(changed, "capability", "PREACH.md"), "\n");
    const c = verify(changed);
    assert.equal(c.status, 1, output(c));
    assert.match(output(c), /capability\/PREACH\.md/);
    const empty = copy();
    const manifest = JSON.parse(readFileSync(join(empty, "test", "verify.json"), "utf8"));
    writeFileSync(join(empty, "test", "verify.json"), JSON.stringify({ ...manifest, cases: [] }));
    const e = verify(empty);
    assert.equal(e.status, 2, output(e));
  });

  it("agents/T14 [agents/N1, agents/N6]: bin/ and lib/ import only node: built-ins and relative files, and only lib/catalog.mjs names kaal-core", () => {
    blocked(join(PACKAGE, "lib"), "lib/");
    blocked(BIN, "bin/kaal-agents.mjs");
    const sources = ["bin", "lib"].flatMap((d) => readdirSync(join(PACKAGE, d), { recursive: true }).filter((f) => f.endsWith(".mjs")).map((f) => slash(join(d, f))));
    for (const f of sources) {
      const text = readFileSync(join(PACKAGE, f), "utf8");
      for (const [, a, b] of text.matchAll(/(?:import|export)\s[^;]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = a ?? b;
        assert.ok(spec.startsWith("node:") || spec.startsWith("."), `${f} imports ${spec}`);
      }
      if (f !== "lib/catalog.mjs") assert.doesNotMatch(text, /kaal-core/, `${f} names kaal-core`);
    }
  });

  it("agents/T15 [agents/I4, agents/F7]: the packed tarball installs in a clean directory with no checkout and no network; there orient runs and npm explore <name> -- npm test is verified (publisher)", () => {
    blocked(VERIFY, "test/verify.mjs");
    blocked(BIN, "bin/kaal-agents.mjs");
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const npm = (cwd, ...args) => spawnSync("npm", args, { cwd, encoding: "utf8", shell: WINDOWS, env });
    const out = tmp();
    const packed = npm(PACKAGE, "pack", "--pack-destination", out, "--json");
    assert.equal(packed.status, 0, output(packed));
    const tarball = join(out, JSON.parse(packed.stdout)[0].filename);
    const consumer = tmp();
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true }));
    const installed = npm(consumer, "install", tarball, "--offline", "--no-audit", "--no-fund");
    assert.equal(installed.status, 0, output(installed));
    const name = pkg().name;
    const root = join(consumer, "node_modules", ...name.split("/"));
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    commit(dir);
    const bin = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).bin["kaal-agents"];
    const r = spawnSync(process.execPath, [join(root, bin), "orient", dir, "--json"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, output(r));
    const explored = npm(consumer, "explore", name, "--", "npm", "test");
    assert.equal(explored.status, 0, output(explored));
  });
});
