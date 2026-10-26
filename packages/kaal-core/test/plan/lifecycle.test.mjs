// core/C18 planned outer tests: Core's lifecycle. Immutable to DO and CHECK;
// core/C19 turns them GREEN. Each title names the contracts it checks
// (plan/lifecycle/*.md). They drive the built `kaal` command in fresh
// temporary repositories.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import { checkContract } from "kaal-core/installation";
import { payload } from "kaal-core";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const CLI = join(PACKAGE, "dist", "cli.js");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const RECORD = ".kaal/state/core/installation.json";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const made = [];
after(() => made.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** A fresh, empty repository directory. */
function repository() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-lifecycle-"));
  made.push(dir);
  return dir;
}

/** Run the built `kaal` command in `cwd`. */
function kaal(cwd, ...args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

/** Every file under `dir`, by `/`-separated relative path, with its SHA-256. */
function snapshot(dir) {
  if (!existsSync(dir)) return {};
  return Object.fromEntries(
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => join(e.parentPath, e.name))
      .map((p) => [relative(dir, p).split(sep).join("/"), sha256(readFileSync(p))])
      .sort(([a], [b]) => (a < b ? -1 : 1)),
  );
}

const record = (repo) => JSON.parse(readFileSync(join(repo, RECORD), "utf8"));
const put = (path, bytes) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
};

/** A repository whose Engine `kaal init` bootstrapped and recorded, or the test fails there. */
function initialized() {
  const repo = repository();
  const r = kaal(repo, "init");
  assert.equal(r.status, 0, `kaal init succeeds\n${r.out}`);
  assert.ok(existsSync(join(repo, RECORD)), `kaal init writes Core's record at ${RECORD}`);
  return repo;
}

/** Make `path` in the Engine look as an earlier Core version left it: other bytes, recorded as written by 0.0.0. */
function earlier(repo, path, bytes) {
  put(join(repo, path), bytes);
  const r = record(repo);
  r.assets[path] = { sha256: sha256(bytes), version: "0.0.0" };
  writeFileSync(join(repo, RECORD), JSON.stringify(r, null, 2));
}

describe("Core's own Installation Contract (core/C18)", () => {
  it("core/T43 [core/F42, core/A20]: kaal-core delivers a conforming Installation Contract of its own, for exactly its payload", () => {
    const at = join(PACKAGE, "installation.kaal.json");
    if (!existsSync(at)) assert.fail("blocked before behavioural assertion: kaal-core has no installation.kaal.json");
    const contract = JSON.parse(readFileSync(at, "utf8"));
    assert.deepEqual(checkContract(contract), [], "the contract conforms to Core's own format");
    assert.equal(contract.capability, "core");
    assert.equal(contract.version, pkg.version, "the contract's version is kaal-core's");
    assert.equal(contract.record, RECORD);
    assert.deepEqual(contract.runtime, { node: 24 });
    assert.deepEqual(contract.provides, []);
    const carried = payload();
    const expected = Object.keys(carried)
      .sort()
      .map((p) => ({ source: `payload/${p}`, target: `.kaal/${p}`, kind: "file" }));
    const assets = contract.assets.map((a) => ({ source: a.source, target: a.target, kind: a.kind })).sort((a, b) => (a.target < b.target ? -1 : 1));
    assert.deepEqual(assets, expected, "one file asset per payload file, from payload/ to .kaal/");
    assert.ok(contract.assets.every((a) => !("surface" in a)), "no asset waits for a consumer to opt in");
    for (const p of Object.keys(carried)) assert.ok(contract.catalogue[`.kaal/${p}`]?.includes(sha256(carried[p])), `the catalogue lists the current bytes of .kaal/${p}`);
    assert.ok(pkg.files.includes("installation.kaal.json"), "the contract is delivered");
  });
});

describe("Core's lifecycle (core/C18)", () => {
  it("core/T44 [core/F43, core/F46, core/A22]: init records Core's version in the one Core record it shares with Agent Realization, version reads it, reports an unrecorded Engine, and --engine gets no lifecycle", () => {
    const repo = repository();
    const r = kaal(repo, "init");
    assert.equal(r.status, 0, r.out);
    assert.ok(existsSync(join(repo, RECORD)), `kaal init writes Core's record at ${RECORD}`);
    const assets = record(repo).assets;
    for (const [p, bytes] of Object.entries(payload())) {
      assert.deepEqual(assets[`.kaal/${p}`], { sha256: sha256(bytes), version: pkg.version }, `.kaal/${p} is recorded with its bytes and Core's version`);
    }
    assert.deepEqual(readdirSync(join(repo, ".kaal/state/core")), ["installation.json"], "one Core record, shared with Agent Realization, and no other");
    const v = kaal(repo, "version");
    assert.equal(v.status, 0, v.out);
    assert.match(v.out, new RegExp(`kaal-core ${pkg.version.replaceAll(".", "\\.")}`), "names the kaal-core that runs");
    assert.match(v.out, new RegExp(`engine ${pkg.version.replaceAll(".", "\\.")}`), "names the version the Engine's record holds");

    const elsewhere = repository();
    assert.equal(kaal(elsewhere, "init", "--engine", "myKAAL").status, 0, "init --engine still bootstraps");
    assert.ok(!existsSync(join(elsewhere, RECORD)) && !existsSync(join(elsewhere, "myKAAL", "state")), "an Engine outside ./.kaal gets no record");
    assert.match(kaal(elsewhere, "version", "--engine", "myKAAL").out, /unrecorded/, "its version is reported as unrecorded");
    const before = snapshot(elsewhere);
    for (const step of ["upgrade", "remove"]) {
      const s = kaal(elsewhere, step, "--engine", "myKAAL");
      assert.notEqual(s.status, 0, `${step} --engine is refused`);
      assert.notEqual(s.status, 2, `${step} is a command kaal knows`);
    }
    assert.deepEqual(snapshot(elsewhere), before, "and nothing is written");
  });

  it("core/T45 [core/F44, core/A21]: upgrade replaces unmodified files from an earlier version, adopts an Engine without a record, and is idempotent", () => {
    const repo = initialized();
    const carried = payload();
    earlier(repo, ".kaal/AGENTS.md", Buffer.from("# An earlier Engine's entry point\n"));
    rmSync(join(repo, ".kaal/core/LOVE.md"));
    const up = kaal(repo, "upgrade");
    assert.equal(up.status, 0, up.out);
    assert.equal(sha256(readFileSync(join(repo, ".kaal/AGENTS.md"))), sha256(carried["AGENTS.md"]), "the unmodified earlier file is replaced");
    assert.equal(sha256(readFileSync(join(repo, ".kaal/core/LOVE.md"))), sha256(carried["core/LOVE.md"]), "an absent target is installed");
    assert.ok(Object.values(record(repo).assets).every((e) => e.version === pkg.version), "every file is recorded with Core's version");
    const settled = snapshot(repo);
    assert.equal(kaal(repo, "upgrade").status, 0);
    assert.deepEqual(snapshot(repo), settled, "upgrading an Engine already at the contract writes nothing");

    rmSync(join(repo, RECORD));
    const adopt = kaal(repo, "upgrade");
    assert.equal(adopt.status, 0, adopt.out);
    for (const p of Object.keys(carried)) assert.equal(record(repo).assets[`.kaal/${p}`]?.version, pkg.version, `.kaal/${p}, listed by the catalogue, is adopted`);
    assert.match(kaal(repo, "version").out, new RegExp(`engine ${pkg.version.replaceAll(".", "\\.")}`));
  });

  it("core/T46 [core/F44, core/N12]: upgrade keeps a modified file and reports it, and the upgraded Engine verifies; it refuses, changing nothing, when the result would not verify", () => {
    const repo = initialized();
    const changed = Buffer.from("# Our own entry point\n");
    put(join(repo, ".kaal/AGENTS.md"), changed);
    const up = kaal(repo, "upgrade");
    assert.equal(up.status, 0, up.out);
    assert.deepEqual(readFileSync(join(repo, ".kaal/AGENTS.md")), changed, "a modified file is kept");
    assert.match(up.out, /\.kaal\/AGENTS\.md/, "and reported");
    const verified = kaal(repo, "verify");
    assert.equal(verified.status, 0, `the upgraded Engine verifies\n${verified.out}`);

    const broken = initialized();
    earlier(broken, ".kaal/KAAL-KERNEL.md", Buffer.from("an earlier Kernel\n"));
    put(join(broken, ".kaal/KAAL-KERNEL.md"), Buffer.from("a Kernel somebody changed\n"));
    const before = snapshot(broken);
    const refused = kaal(broken, "upgrade");
    assert.notEqual(refused.status, 0, "an upgrade whose Engine would not verify is refused");
    assert.notEqual(refused.status, 2, "upgrade is a command kaal knows");
    assert.match(refused.out, /Kernel/, "with the reason");
    assert.deepEqual(snapshot(broken), before, "and nothing changes");
  });

  it("core/T47 [core/F45, core/N12]: remove removes only Core's unmodified files and its record, and keeps and reports everything else", () => {
    const empty = initialized();
    const gone = kaal(empty, "remove");
    assert.equal(gone.status, 0, gone.out);
    assert.ok(!existsSync(join(empty, ".kaal")), "with nothing kept, the Engine directory is gone");

    const repo = initialized();
    const changed = Buffer.from("# Our own entry point\n");
    put(join(repo, ".kaal/AGENTS.md"), changed);
    const other = Buffer.from(JSON.stringify({ assets: {} }));
    put(join(repo, ".kaal/state/guard/installation.json"), other);
    const contribution = Buffer.from("not Core's\n");
    put(join(repo, ".kaal/skills/greeting/notes.txt"), contribution);
    const r = kaal(repo, "remove");
    assert.equal(r.status, 0, r.out);
    assert.deepEqual(
      snapshot(join(repo, ".kaal")),
      { "AGENTS.md": sha256(changed), "skills/greeting/notes.txt": sha256(contribution), "state/guard/installation.json": sha256(other) },
      "only what is not Core's, or was modified, remains: Core's record and its emptied directories are gone",
    );
    assert.match(r.out, /\.kaal\/AGENTS\.md/, "the modified file is reported");
  });
});
