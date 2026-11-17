// Consumer cases of `kaal-agents orient` (NEW): what it discovers, what it leaves unresolved, and
// that discovery never reads as authorization.
import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { agents, CLAIM, commit, git, orient, output, repository, snapshot, tmp } from "./fixture.mjs";

describe("orient", () => {
  it("agents/T1 [agents/F1, agents/F2, agents/F3, agents/I1, agents/I2]: in a fresh repository with an AGENTS.md and an ownership claim, orient --json reports the setting outside, HEAD, the branch, the instruction file and the claim, and exits 0; authority is still unresolved, with both as sources, and the text output opens with the authority line", () => {
    const dir = repository();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    writeFileSync(join(dir, "ownership.kaal.json"), JSON.stringify(CLAIM));
    const head = commit(dir);
    const r = orient(dir);
    assert.equal(r.status, 0, output(r));
    assert.deepEqual(r.report.setting, { kind: "outside", evidence: [] });
    assert.deepEqual(r.report.repository, { head, branch: "main", upstream: null, ahead: null, behind: null });
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

  it("agents/T3 [agents/F1, agents/N1, agents/N3]: with a .kaal/ Engine and no Core installed, the setting is embedded, the catalog is unresolved naming kaal-core, and the exit is 2; with KAAL's own source as well, the setting is engineered", () => {
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
    assert.deepEqual(r.report.setting, { kind: "engineered", evidence: ["packages/kaal-core/package.json"] });
  });

  it("agents/T5 [agents/N2, agents/N4]: two runs give byte-identical output, and every file under the directory, .git/ included, is unchanged", () => {
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
    const values = (v) => (v && typeof v === "object" ? Object.values(v).flatMap(values) : [v]);
    const dir = repository();
    writeFileSync(join(dir, "README.md"), "# Readme\n");
    commit(dir);
    let r = orient(dir);
    assert.equal(r.status, 0, output(r));
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

  it("agents/T7 [agents/F3, agents/N3]: outside any repository, the repository and what is in flight are unresolved and the exit is 2; a missing directory exits 1, naming it, with no stack trace", () => {
    const dir = tmp();
    writeFileSync(join(dir, "AGENTS.md"), "# Instructions\n");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.repository, null);
    assert.equal(r.report.inFlight, null);
    assert.ok(r.report.unresolved.some((u) => u.what === "repository"));
    const m = agents(tmp(), "orient", join(tmp(), "missing"));
    assert.equal(m.status, 1);
    assert.match(output(m), /missing/);
    assert.doesNotMatch(output(m), /\n\s+at /);
  });

  it("agents/T16 [agents/F1, agents/A3, agents/N3]: something installed as Core that does not export Core's catalog leaves the catalog unresolved, naming catalog, and the exit is 2", () => {
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

describe("orient when Git fails", () => {
  it("agents/T19 [agents/F1, agents/A2, agents/N3, agents/N4]: a status Git cannot read is unresolved, not a clean tree: what is in flight is null, HEAD is still reported, the exit is 2, and nothing is written", () => {
    const dir = repository();
    git(dir, "commit", "-q", "--allow-empty", "-m", "fixture");
    const head = git(dir, "rev-parse", "HEAD");
    writeFileSync(join(dir, ".git", "index"), "not an index");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.inFlight, null);
    assert.equal(r.report.repository.head, head);
    assert.ok(r.report.unresolved.some((u) => u.what === "inFlight" && /the status cannot be read/.test(u.reason)));
    assert.match(agents(dir, "orient", dir).stdout, /^in flight: unresolved$/m);
    assert.equal(readFileSync(join(dir, ".git", "index"), "utf8"), "not an index");
  });

  it("agents/T20 [agents/F1, agents/A2, agents/N3]: a branch with no commit yet reports HEAD as absent, with nothing unresolved; a HEAD Git cannot read is unresolved", () => {
    const dir = repository();
    const unborn = orient(dir);
    assert.equal(unborn.status, 0, output(unborn));
    assert.equal(unborn.report.repository.head, null);
    assert.equal(unborn.report.repository.branch, "main");
    assert.deepEqual(unborn.report.unresolved, []);
    git(dir, "commit", "-q", "--allow-empty", "-m", "fixture");
    writeFileSync(join(dir, ".git", "refs", "heads", "main"), "not a commit\n");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.repository.head, null);
    assert.ok(r.report.unresolved.some((u) => u.what === "repository" && /HEAD cannot be read/.test(u.reason)));
  });

  it("agents/T21 [agents/F1, agents/A2, agents/N3]: no upstream is absent, with nothing unresolved; an upstream whose ahead and behind cannot be counted is unresolved, naming it", () => {
    const dir = repository();
    git(dir, "commit", "-q", "--allow-empty", "-m", "fixture");
    assert.deepEqual(orient(dir).report.unresolved, []);
    git(dir, "config", "branch.main.remote", ".");
    git(dir, "config", "branch.main.merge", "refs/heads/gone");
    const r = orient(dir);
    assert.equal(r.status, 2, output(r));
    assert.equal(r.report.repository.upstream, "gone");
    assert.equal(r.report.repository.ahead, null);
    assert.equal(r.report.repository.behind, null);
    assert.ok(r.report.unresolved.some((u) => u.what === "repository" && /ahead and behind gone cannot be counted/.test(u.reason)));
  });
});
