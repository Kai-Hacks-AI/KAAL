// Inner Code tests of the lifecycle, the installation contract it realizes and the workflow it installs.
// They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { CONFIG, readDeclarations } from "../lib/config.mjs";
import { declarations, verify } from "../lib/github.mjs";
import { CONTRACT, init, remove, sha256, sources, upgrade, VERSION } from "../lib/lifecycle.mjs";
import { checkout, readRecord, readState, RECORD } from "../lib/state.mjs";

const HOOK = ".githooks/pre-push";
const WORKFLOW = ".github/workflows/guard.yml";
/** The Skill, the asset every init installs (guard/C51). */
const SKILL = ".agents/skills/kaal-guard/SKILL.md";
/** Guard's .gitattributes, which keep its files byte for byte on every host (guard/C65). */
const HOOK_ATTRIBUTES = ".githooks/.gitattributes";
const WORKFLOW_ATTRIBUTES = ".github/workflows/.gitattributes";
const SKILL_ATTRIBUTES = ".agents/skills/kaal-guard/.gitattributes";

/** A fresh Git working tree declaring these checks, when given. */
function tree(checks) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-guard-lifecycle-"));
  spawnSync("git", ["init", "-q", dir]);
  if (checks) {
    mkdirSync(join(dir, CONFIG), { recursive: true });
    for (const [name, c] of Object.entries(checks)) writeFileSync(join(dir, CONFIG, `${name}.md`), `---\ntype: Guard/Check\ncommand: ${JSON.stringify(c.command)}\nruns: [${c.runs.join(", ")}]\n${c.facts ? `facts: [${c.facts.join(", ")}]\n` : ""}---\n`);
  }
  return dir;
}

const write = (dir, path, text) => (mkdirSync(dirname(join(dir, path)), { recursive: true }), writeFileSync(join(dir, path), text));

/** What the command reads and validates before a lifecycle step: the step's context. */
function context(dir) {
  const at = checkout(dir);
  const read = readDeclarations(dir, join(dir, CONFIG));
  return { dir: join(dir, CONFIG), list: read.list ?? { checks: {} }, record: readRecord(dir), at, state: readState(at), declared: declarations(dir) };
}
const step = (fn, dir, options = {}) => fn(dir, { ...context(dir), ...options }).lines.join("\n");
const list = (dir) => readDeclarations(dir, join(dir, CONFIG)).list;
const assets = (dir) => readRecord(dir).assets;

const hooksPath = (dir) => spawnSync("git", ["config", "--local", "--get", "core.hooksPath"], { cwd: dir, encoding: "utf8" }).stdout.trim();
const ci = { command: "x", runs: ["ci"] };

describe("installation contract", () => {
  it("catalogues every content this version installs, and only the files its assets name", () => {
    for (const [path, text] of Object.entries(sources())) assert.ok(CONTRACT.catalogue[path].includes(sha256(Buffer.from(text))), `${path} is not catalogued`);
    assert.deepEqual(Object.keys(CONTRACT.catalogue).sort(), Object.keys(sources()).sort());
  });

  it("is an instance of Core's Installation Contract format, with the Skill as an asset every init installs", () => {
    assert.deepEqual(Object.keys(CONTRACT), ["format", "capability", "version", "assets", "catalogue", "record", "runtime", "provides"]);
    assert.equal(CONTRACT.format.name, "Installation Contract");
    assert.equal(CONTRACT.version, VERSION, "the contract's version is not the package's");
    assert.equal(CONTRACT.record, ".kaal/state/guard/installation.json");
    assert.deepEqual(CONTRACT.provides, [{ skill: "kaal-guard" }]);
    const skill = CONTRACT.assets.find((a) => a.name === "skill");
    assert.deepEqual(skill, { name: "skill", source: "skills/kaal-guard", target: ".agents/skills/kaal-guard", kind: "directory" });
    assert.deepEqual(CONTRACT.assets.filter((a) => a.surface).map((a) => [a.name, a.surface]), [["hook", "hook"], ["hook-attributes", "hook"], ["workflow", "ci"], ["workflow-attributes", "ci"]]);
  });

  it("has one workflow, which runs verify and every ci check in one job, each in the declared form", () => {
    const dir = tree({});
    write(dir, WORKFLOW, sources()[WORKFLOW]);
    assert.deepEqual(declarations(dir).map((d) => [d.name, d.job]), [["verify", "guard"], ["ci", "checks"]]);
    assert.doesNotMatch(sources()[WORKFLOW], /matrix|list/, "Guard's workflow computes which checks it runs");
  });
});

describe("declared integration", () => {
  it("credits a job that runs every ci check, after any job that names one", () => {
    const dir = tree({ a: ci, b: ci, l: { command: "x", runs: ["hook"] } });
    write(dir, WORKFLOW, sources()[WORKFLOW]);
    write(dir, ".github/workflows/own.yml", "jobs:\n  own:\n    steps:\n      - run: npx --no kaal-guard run --check a\n");
    const results = verify(dir, list(dir)).results;
    assert.deepEqual(results.map((r) => [r.name, r.verdict]), [["a", "pass"], ["b", "pass"]]);
    assert.match(results[0].evidence, /job own in \.github\/workflows\/own\.yml/);
    assert.match(results[1].evidence, /job checks in \.github\/workflows\/guard\.yml, which runs every ci check \(kaal-guard run --ci\)/);
  });

  it("reads no list a job computes: a matrix from another job's output declares nothing, and verify names the step to add", () => {
    const dir = tree({ a: ci });
    write(dir, ".github/workflows/own.yml", "jobs:\n  list:\n    steps:\n      - run: npx --no kaal-guard list --undeclared --github\n  check:\n    strategy:\n      matrix:\n        check: ${{ fromJSON(needs.list.outputs.checks) }}\n    steps:\n      - run: npx --no kaal-guard run --check ${{ matrix.check }} --github\n");
    const [result] = verify(dir, list(dir)).results;
    assert.equal(result.verdict, "fail");
    assert.match(result.do, /- run: npx --no kaal-guard run --check a --github/);
    assert.match(result.do, /kaal-guard init --ci/);
  });
});

describe("lifecycle", () => {
  it("init writes, registers, sets and records; remove takes back exactly that and keeps the declarations", () => {
    const dir = tree({ a: ci });
    const out = step(init, dir, { hook: true, ci: true });
    assert.match(out, /installed by Guard:\n {2}\.kaal\/state\/guard\/installation\.json, Guard's installation record\n {2}\.agents\/skills\/kaal-guard\/\.gitattributes\n {2}\.agents\/skills\/kaal-guard\/SKILL\.md\n {2}\.githooks\/pre-push\n {2}\.githooks\/\.gitattributes\n {2}\.github\/workflows\/guard\.yml\n {2}\.github\/workflows\/\.gitattributes\n {2}core\.hooksPath = \.githooks in the local configuration\n/);
    assert.equal(hooksPath(dir), ".githooks");
    assert.deepEqual(Object.keys(assets(dir)).sort(), [SKILL_ATTRIBUTES, SKILL, HOOK_ATTRIBUTES, HOOK, WORKFLOW_ATTRIBUTES, WORKFLOW].sort());
    assert.deepEqual(Object.values(assets(dir)).map((e) => e.version), Array(6).fill(VERSION));
    assert.deepEqual(readState(checkout(dir)), { "core.hooksPath": ".githooks", scope: "local" });
    assert.match(step(remove, dir), /removed \.githooks\/pre-push\nremoved \.githooks\/\.gitattributes\nremoved \.github\/workflows\/guard\.yml\nremoved \.github\/workflows\/\.gitattributes\nremoved \.agents\/skills\/kaal-guard\/\.gitattributes\nremoved \.agents\/skills\/kaal-guard\/SKILL\.md\nunset core\.hooksPath in the local configuration/);
    assert.ok(!existsSync(join(dir, ".agents")) && !existsSync(join(dir, ".githooks")) && !existsSync(join(dir, ".github")) && !existsSync(join(dir, RECORD)) && !existsSync(join(dir, ".kaal", "state")));
    assert.equal(readState(checkout(dir)), undefined);
    assert.ok(!existsSync(join(dir, ".git", "kaal")), "remove left Guard's directories in Git's metadata");
    assert.equal(hooksPath(dir), "");
    assert.ok(existsSync(join(dir, CONFIG, "a.md")));
  });

  it("init creates the configuration directory and says how to declare the first check", () => {
    const dir = tree();
    assert.match(step(init, dir), /installed by Guard:\n {2}\.kaal\/config\/guard\/, where each check is declared as <name>\.md\n[\s\S]*Declare each check as \.kaal\/config\/guard\/<name>\.md/);
    assert.ok(existsSync(join(dir, CONFIG)));
    step(remove, dir);
    assert.ok(!existsSync(join(dir, ".kaal")), "remove kept the empty configuration directory init created");
  });

  it("says apart what it installed, what it left untouched and what is still to do, and claims no execution", () => {
    const dir = tree({});
    write(dir, HOOK, "#!/bin/sh\n");
    const out = step(init, dir, { hook: true, ci: true });
    assert.match(out, /installed by Guard:\n {2}\.kaal\/state\/guard\/installation\.json, Guard's installation record\n {2}\.agents\/skills\/kaal-guard\/\.gitattributes\n {2}\.agents\/skills\/kaal-guard\/SKILL\.md\n {2}\.github\/workflows\/guard\.yml\n {2}\.github\/workflows\/\.gitattributes\n/);
    assert.match(out, /\.githooks\/\.gitattributes: not installed; it would keep \.githooks\/pre-push, which is not Guard's/);
    assert.match(out, /left untouched:\n {2}\.githooks\/pre-push: it was there before Guard, so it is not Guard's\n/);
    assert.match(out, /still to do in this repository:\n {2}To run Guard's hook checks from \.githooks\/pre-push/);
    assert.match(out, /does not show that Git runs the hook, that CI runs these jobs, or that a merge requires them/);
    assert.match(out, /declared integration only/);
    assert.deepEqual(Object.keys(assets(dir)), [SKILL_ATTRIBUTES, SKILL, WORKFLOW_ATTRIBUTES, WORKFLOW]);
  });

  it("does not set core.hooksPath over hooks Git already runs, nor for a hook it did not install", () => {
    const dir = tree({});
    writeFileSync(join(dir, ".git", "hooks", "pre-commit"), "#!/bin/sh\n");
    assert.match(step(init, dir, { hook: true }), /core\.hooksPath: unset, so Git runs pre-commit from \.git\/hooks; setting it would turn them off/);
    assert.equal(hooksPath(dir), "");
    assert.equal(readState(checkout(dir)), undefined);

    const other = tree({});
    write(other, HOOK, "#!/bin/sh\n");
    assert.match(step(init, other, { hook: true }), /git config core\.hooksPath \.githooks/);
    assert.equal(hooksPath(other), "");
  });

  it("leaves a core.hooksPath that equals its own but that it did not set", () => {
    const dir = tree({});
    spawnSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: dir });
    assert.match(step(init, dir, { hook: true }), /core\.hooksPath = \.githooks in the local configuration: Guard did not set it, and leaves it/);
    assert.equal(readState(checkout(dir)), undefined);
    assert.match(step(remove, dir), /left core\.hooksPath: Guard did not set it in this checkout/);
    assert.equal(hooksPath(dir), ".githooks");
  });

  it("upgrade names the versions it moves between, keeps a modified asset with its registered version, and confirms an unchanged one", () => {
    const dir = tree({ a: ci });
    step(init, dir, { hook: true, ci: true });
    const record = assets(dir);
    write(dir, RECORD, JSON.stringify({ activated: ["hook", "ci"], assets: { ...record, [WORKFLOW]: { sha256: record[WORKFLOW].sha256, version: "0.0.0-older" } } }));
    write(dir, HOOK, "#!/bin/sh\n# mine\n");
    const out = step(upgrade, dir);
    assert.match(out, /kept \.githooks\/pre-push: modified since Guard [^ ]+ wrote it, so it keeps that registered version/);
    assert.ok(out.includes(`current ${WORKFLOW}: unchanged from 0.0.0-older to ${VERSION}`), out);
    assert.deepEqual(assets(dir)[HOOK], record[HOOK]);
    assert.equal(assets(dir)[WORKFLOW].version, VERSION);
  });

  it("upgrade moves an unmodified asset to this version's content and registers it", () => {
    const dir = tree({ a: ci });
    step(init, dir, { hook: true, ci: true });
    const older = "name: Guard\njobs: {}\n";
    write(dir, WORKFLOW, older);
    write(dir, RECORD, JSON.stringify({ activated: ["hook", "ci"], assets: { ...assets(dir), [WORKFLOW]: { sha256: sha256(Buffer.from(older)), version: "0.0.0-older" } } }));
    assert.ok(step(upgrade, dir).includes(`upgraded ${WORKFLOW}: from 0.0.0-older to ${VERSION}`));
    assert.equal(readFileSync(join(dir, WORKFLOW), "utf8"), sources()[WORKFLOW]);
  });

  it("init without ci installs no workflow, and reports each ci check no job runs with the step to add", () => {
    const dir = tree({ a: ci, b: ci, l: { command: "x", runs: ["hook"] } });
    write(dir, ".github/workflows/ci.yml", "jobs:\n  own:\n    steps:\n      - run: kaal-guard run --check a\n");
    const out = step(init, dir);
    assert.ok(!existsSync(join(dir, WORKFLOW)));
    assert.deepEqual(Object.keys(assets(dir)), [SKILL_ATTRIBUTES, SKILL]);
    assert.match(out, /No workflow job runs these ci checks, and Guard does not run them in CI on its own[^\n]*\n {4}- run: npx --no kaal-guard run --check b --config \.kaal\/config\/guard --github\n/);
    assert.doesNotMatch(out, /or run kaal-guard init --ci/, "init offers Guard's workflow beside one that already runs Guard");
    assert.doesNotMatch(out, /--check (a|l) /);
    assert.match(out, /No workflow job runs kaal-guard verify[^\n]*\n {4}- run: npx --no kaal-guard verify --config \.kaal\/config\/guard --github/);
  });

  it("init reports no missing coverage where the repository's own workflows run every ci check and verify", () => {
    const dir = tree({ a: ci });
    write(dir, ".github/workflows/ci.yml", "jobs:\n  own:\n    steps:\n      - run: kaal-guard run --check a\n      - run: kaal-guard verify\n");
    assert.doesNotMatch(step(init, dir), /No workflow job runs/);
  });

  it("init with ci installs no workflow where the repository's own workflows run Guard, and reports them as not managed", () => {
    const dir = tree({ a: ci, b: ci });
    write(dir, ".github/workflows/ci.yml", "jobs:\n  own:\n    steps:\n      - run: npx --no kaal-guard run --check a --github\n      - run: kaal-guard run --check b\n  consistency:\n    steps:\n      - run: npx kaal-guard verify --github\n");
    const out = step(init, dir, { hook: true, ci: true });
    assert.ok(!existsSync(join(dir, WORKFLOW)));
    assert.equal(assets(dir)[WORKFLOW], undefined);
    assert.match(out, /\.github\/workflows\/guard\.yml: not installed; your workflows already run Guard \(a in job own of \.github\/workflows\/ci\.yml; [^)]*\), and Guard's workflow would run those checks a second time/);
    assert.match(out, /executed by Guard, not managed:\n {2}a in job own of \.github\/workflows\/ci\.yml\n {2}b in job own of \.github\/workflows\/ci\.yml\n {2}verify in job consistency of \.github\/workflows\/ci\.yml/);
  });

  it("init with ci installs nothing beside a workflow that runs only verify, and names the step for each check left", () => {
    const dir = tree({ a: ci, b: ci });
    const own = "jobs:\n  own:\n    steps:\n      - run: npx --no kaal-guard verify --config .kaal/config/guard --github\n";
    write(dir, ".github/workflows/ci.yml", own);
    const out = step(init, dir, { hook: true, ci: true });
    assert.ok(!existsSync(join(dir, WORKFLOW)));
    assert.equal(readFileSync(join(dir, ".github/workflows/ci.yml"), "utf8"), own);
    assert.match(out, /--check a --config \.kaal\/config\/guard --github\n {4}- run: npx --no kaal-guard run --check b /);
    assert.doesNotMatch(out, /or run kaal-guard init --ci/);
  });

  it("does not count Guard's own registered workflow as the repository's declaration", () => {
    const dir = tree({ a: ci });
    step(init, dir, { hook: true, ci: true });
    assert.ok(step(upgrade, dir).includes(`current ${WORKFLOW}: ${VERSION}`));
    assert.equal(readFileSync(join(dir, WORKFLOW), "utf8"), sources()[WORKFLOW]);
  });

  it("init activates nothing, names both activations, and keeps the record it prepares", () => {
    const dir = tree({ a: ci, h: { command: "x", runs: ["hook"] } });
    const out = step(init, dir);
    assert.ok(!existsSync(join(dir, HOOK)) && !existsSync(join(dir, WORKFLOW)));
    assert.equal(hooksPath(dir), "");
    // The Skill is part of every init; installing it activates no surface (guard/F30).
    assert.deepEqual(readRecord(dir).activated, []);
    assert.deepEqual(Object.keys(readRecord(dir).assets), [SKILL_ATTRIBUTES, SKILL]);
    assert.match(out, /The hook is not activated\. Run kaal-guard init --hook/);
    assert.match(out, /or run kaal-guard init --ci/);
    // Guard's workflow has two jobs, Guard and Guard checks (guard/C88, guard/C93).
    assert.match(out, /or run kaal-guard init --ci to install Guard's workflow, whose two jobs, Guard and Guard checks, run kaal-guard verify and every ci check\./);
    assert.doesNotMatch(out, /in one job/);
  });

  it("plain init reinstalls no surface, and lists a registered surface file the repository no longer has under still to do", () => {
    const dir = tree({ a: ci, h: { command: "x", runs: ["hook"] } });
    step(init, dir, { hook: true, ci: true });
    rmSync(join(dir, HOOK));
    rmSync(join(dir, WORKFLOW));
    const out = step(init, dir);
    assert.ok(!existsSync(join(dir, HOOK)) && !existsSync(join(dir, WORKFLOW)), "plain init reinstalled a surface file");
    assert.equal(hooksPath(dir), ".githooks");
    const todo = out.slice(out.indexOf("still to do in this repository:"));
    assert.match(todo, /\.githooks\/pre-push: Guard registered it, and the repository no longer has it\. Run kaal-guard init --hook to reinstall it, or kaal-guard remove --hook to deactivate the hook\./);
    assert.match(todo, /\.github\/workflows\/guard\.yml: Guard registered it, and the repository no longer has it\. Run kaal-guard init --ci to reinstall it, or kaal-guard remove --ci to deactivate CI\./);
    assert.match(step(init, dir, { hook: true }), /\.githooks\/pre-push: reinstalled/);
  });

  it("activates the hook and CI apart, records each, and undoes each apart without touching a declaration", () => {
    const dir = tree({ a: ci, h: { command: "x", runs: ["hook"] } });
    const declared = readFileSync(join(dir, CONFIG, "h.md"), "utf8");
    step(init, dir, { hook: true });
    assert.deepEqual(readRecord(dir).activated, ["hook"]);
    assert.ok(!existsSync(join(dir, WORKFLOW)));
    step(init, dir, { ci: true });
    assert.deepEqual(readRecord(dir).activated, ["hook", "ci"]);
    assert.match(step(remove, dir, { ci: true }), /removed \.github\/workflows\/guard\.yml\nremoved \.github\/workflows\/\.gitattributes\ndeactivated ci/);
    assert.deepEqual(readRecord(dir).activated, ["hook"]);
    assert.equal(hooksPath(dir), ".githooks");
    assert.match(step(remove, dir, { hook: true }), /removed \.githooks\/pre-push\nremoved \.githooks\/\.gitattributes\nunset core\.hooksPath in the local configuration\ndeactivated hook/);
    // Removing a surface keeps the Skill, which only a full remove takes back.
    assert.deepEqual(readRecord(dir).activated, []);
    assert.deepEqual(Object.keys(readRecord(dir).assets), [SKILL_ATTRIBUTES, SKILL]);
    assert.equal(readFileSync(join(dir, CONFIG, "h.md"), "utf8"), declared);
  });

  it("upgrade installs a missing asset only for an activated surface, and leaves alone a file at a managed path the record does not register", () => {
    const dir = tree({ a: ci });
    step(init, dir, { hook: true });
    rmSync(join(dir, HOOK));
    write(dir, RECORD, JSON.stringify({ activated: ["hook"], assets: {} }));
    write(dir, WORKFLOW, sources()[WORKFLOW]);
    const out = step(upgrade, dir);
    assert.ok(out.includes(`installed ${HOOK}: ${VERSION}; the activated hook surface did not have it`), out);
    assert.match(out, /left alone \.github\/workflows\/guard\.yml: not Guard's; the installation record does not register it/);
    assert.deepEqual(Object.keys(assets(dir)), [HOOK]);

    const bare = tree({ a: ci });
    step(init, bare);
    step(upgrade, bare);
    assert.ok(!existsSync(join(bare, HOOK)) && !existsSync(join(bare, WORKFLOW)), "upgrade activated a surface");
  });
});

describe("pre-push template", () => {
  const BIN = resolve(dirname(fileURLToPath(import.meta.url)), "../bin/kaal-guard.mjs");
  const TEMPLATE = resolve(dirname(fileURLToPath(import.meta.url)), "../templates/pre-push");

  it("supplies no changed paths when Git cannot compute them, so a check that needs them cannot judge and blocks", { skip: process.platform === "win32" }, () => {
    const dir = tree({ scope: { command: "node -e 0", runs: ["hook"], facts: ["changed"] } });
    const g = (...args) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: dir, encoding: "utf8" });
    mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
    writeFileSync(join(dir, "node_modules", ".bin", "kaal-guard"), `#!/bin/sh\nexec "${process.execPath}" "${BIN}" "$@"\n`);
    chmodSync(join(dir, "node_modules", ".bin", "kaal-guard"), 0o755);
    g("commit", "-q", "--allow-empty", "-m", "head");
    const head = g("rev-parse", "HEAD").stdout.trim();
    g("checkout", "-q", "--orphan", "unrelated");
    g("commit", "-q", "--allow-empty", "-m", "unrelated base");
    g("update-ref", "refs/remotes/origin/main", "HEAD"); // a base with no merge base: Git cannot give the changed paths
    const r = spawnSync("sh", [TEMPLATE, "origin"], { cwd: dir, encoding: "utf8", input: `refs/heads/x ${head} refs/heads/x ${"0".repeat(40)}\n` });
    assert.notEqual(r.status, 0, r.stderr);
    assert.match(r.stderr, /changed paths .* cannot be computed/);
    assert.match(r.stderr, /cannot judge: scope: the fact changed was not supplied/);
    assert.match(r.stderr, /CI decides/);
  });
});
