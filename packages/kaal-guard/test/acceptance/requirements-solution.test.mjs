// guard/C171 planned outer tests: solution protection. Immutable to DO and CHECK.
// Each title names the identifiers it checks (plan/solution-protection/*.md). They run the
// kaal-guard command in throwaway Git repositories and use no other KAAL code.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it, after } from "node:test";
import { fileURLToPath } from "node:url";

const BIN = resolve(dirname(fileURLToPath(import.meta.url)), "../../bin/kaal-guard.mjs");
const CONFIG = ".kaal/config/guard";
const made = [];
after(() => made.forEach((d) => rmSync(d, { recursive: true, force: true })));

const git = (cwd, ...args) => {
  const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const put = (root, files) => {
  for (const [p, v] of Object.entries(files)) {
    if (v === null) { rmSync(join(root, p), { force: true }); continue; }
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), typeof v === "string" ? v : `${JSON.stringify(v, null, 2)}\n`);
  }
};
/** A repository whose first commit (the base) holds `files`; commit(files) adds a candidate on top. */
const repo = (files) => {
  const root = mkdtempSync(join(tmpdir(), "guard-c171-"));
  made.push(root);
  git(root, "init", "-q", "-b", "main");
  put(root, files);
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "base");
  const base = git(root, "rev-parse", "HEAD");
  return {
    root, base,
    commit(more) { put(root, more); git(root, "add", "-A"); git(root, "commit", "-q", "-m", "candidate"); return git(root, "rev-parse", "HEAD"); },
  };
};
const guard = (cwd, ...args) => {
  const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};
/** Blocked before any behavioural assertion when the command does not exist yet. */
const needs = (cmd, r) => {
  if (/usage:|unknown command|unrecognized|not a command/i.test(r.out) && r.status !== 0 && !/guard\.json|aggregate|solution/i.test(r.out.split("\n").slice(0, 3).join(" ").replace(/usage:[^\n]*/i, ""))) {
    assert.fail(`blocked before behavioural assertion: kaal-guard has no ${cmd}`);
  }
};
const head = (r) => git(r.root, "rev-parse", "HEAD");
const plan = (r, ...extra) => {
  const given = (flag) => extra.includes(flag);
  const x = guard(r.root, "plan", "--aggregate", "solution", "--config", CONFIG, ...(given("--run") ? [] : ["--run", "run-1"]), ...(given("--head") ? [] : ["--head", head(r)]), ...extra);
  needs("plan", x);
  return x;
};
const json = (s) => JSON.parse(s.out.slice(s.out.indexOf("{")));

const SCRIPT = "node --test";
const PLAN = { aggregate: "solution", run: "run-1", head: "a".repeat(40), expected: ["packages/a/test", "packages/c/test"], scripts: { "packages/a/test": SCRIPT, "packages/c/test": SCRIPT }, registrations: { "packages/a/test": "packages/a/guard.json", "packages/c/test": "packages/c/guard.json" } };
const report = (dir, id, over) => { mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, `${id.replaceAll("/", "__")}.json`), JSON.stringify({ check: id, aggregates: ["solution"], run: PLAN.run, head: PLAN.head, script: SCRIPT, ...over })); };
const AGG = { solution: { always: [], exempt: { "package.json": "the root's tests run in the lanes" } } };
const REG = (name = "test", extra = {}) => ({ checks: [{ name, command: "npm test", aggregates: ["solution"], ...extra }] });
const PKG = { name: "x", scripts: { test: "node --test" } };
const base = (extra = {}) => ({ [`${CONFIG}/aggregates.json`]: AGG, "package.json": { name: "root", scripts: { test: "true" } }, "packages/a/package.json": PKG, "packages/a/guard.json": REG(), ...extra });

describe("Solution protection (guard/C171)", () => {
  it("guard/T1670 [guard/I10, guard/F41, guard/F45, guard/A21, guard/A23]: plan finds a guard.json beside a package, lists its solution check by id, and builds a matrix with one entry for it", () => {
    const r = repo(base());
    const x = plan(r);
    assert.equal(x.status, 0, x.out);
    const p = json(x);
    assert.deepEqual(p.expected, ["packages/a/test"]);
    assert.deepEqual(p.matrix.include.map((e) => e.check), ["packages/a/test"]);
  });

  it("guard/T1671 [guard/F43, guard/F44, guard/A22]: a package.json with a test script and no registration or exempt entry fails plan, naming the folder and the line to add; an exempt entry with a reason passes", () => {
    const r = repo(base({ "packages/b/package.json": PKG }));
    const x = plan(r);
    assert.notEqual(x.status, 0);
    assert.match(x.out, /packages\/b/);
    assert.match(x.out, /guard\.json|exempt/, "it names the line to add");
    put(r.root, { [`${CONFIG}/aggregates.json`]: { solution: { always: [], exempt: { ...AGG.solution.exempt, "packages/b": "published as a Skill only, no suite of its own" } } } });
    git(r.root, "add", "-A"); git(r.root, "commit", "-q", "-m", "exempt");
    const y = plan(r);
    assert.equal(y.status, 0, y.out);
    const swapped = repo(base({ "packages/a/guard.json": REG("test", { command: "node -e 0" }) }));
    const w = plan(swapped);
    assert.notEqual(w.status, 0, "a check that is not the package's own npm test does not cover it");
    assert.match(w.out, /packages\/a\/test/, "the check that does not run the suite is named");
  });

  it("guard/T1672 [guard/F42, guard/I11, guard/A21]: a candidate that adds a registration is planned including it; one that removes a baseline registration, or changes its command or aggregates, is cannot judge naming the file and the check; the same removal alone in a diff of registration files only is planned", () => {
    const r = repo(base());
    const added = r.commit({ "packages/c/package.json": PKG, "packages/c/guard.json": REG() });
    const a = plan(r, "--base", r.base, "--head", added);
    assert.equal(a.status, 0, a.out);
    assert.deepEqual(json(a).expected.sort(), ["packages/a/test", "packages/c/test"], "the pull request's own addition runs in it");
    for (const [label, change] of [
      ["command", { "packages/a/guard.json": REG("test", { command: "true" }), "packages/a/lib.mjs": "export {}\n" }],
      ["aggregates", { "packages/a/guard.json": REG("test", { aggregates: [] }), "packages/a/lib.mjs": "export {}\n" }],
      ["removal with other changes", { "packages/a/guard.json": null, "packages/a/lib.mjs": "export {}\n" }],
    ]) {
      const r2 = repo(base());
      const head = r2.commit(change);
      const x = plan(r2, "--base", r2.base, "--head", head);
      assert.equal(x.status, 2, `${label}: ${x.out}`);
      assert.match(x.out, /packages\/a\/guard\.json/);
      assert.match(x.out, /packages\/a\/test/);
    }
    for (const [label, change] of [
      ["guard.json deleted, package stays", { "packages/a/guard.json": null }],
      ["test script removed, package stays", { "packages/a/guard.json": null, "packages/a/package.json": { name: "x", scripts: {} } }],
    ]) {
      const r4 = repo(base());
      const h = r4.commit(change);
      const x = plan(r4, "--base", r4.base, "--head", h);
      assert.notEqual(x.status, 0, `${label} is a removal of protection and is never planned: ${x.out}`);
    }
    const r3 = repo(base({ "packages/b/package.json": PKG, "packages/b/guard.json": REG() }));
    const alone = r3.commit({ "packages/a/guard.json": null, "packages/a/package.json": null });
    const z = plan(r3, "--base", r3.base, "--head", alone);
    assert.equal(z.status, 0, `a registration landing alone is allowed: ${z.out}`);
  });

  it("guard/T1673 [guard/F43, guard/N17, guard/A21]: a missing or unparseable aggregates.json on the base is cannot judge, never an empty list; aggregates delivery and a .md declaration with aggregates are refused", () => {
    const missing = repo(base({ [`${CONFIG}/aggregates.json`]: null }));
    const a = plan(missing);
    assert.equal(a.status, 2, a.out);
    assert.match(a.out, /aggregates\.json/);
    const broken = repo(base({ [`${CONFIG}/aggregates.json`]: "{ not json" }));
    assert.equal(plan(broken).status, 2);
    const delivery = repo(base({ "packages/a/guard.json": REG("test", { aggregates: ["delivery"] }) }));
    const d = plan(delivery);
    assert.equal(d.status, 2, d.out);
    assert.match(d.out, /delivery/);
    const legacy = repo(base({ [`${CONFIG}/Legacy.md`]: "---\ntype: Guard/Check\ncommand: true\nruns: [ci]\naggregates: [solution]\n---\nlegacy\n" }));
    const l = plan(legacy);
    assert.equal(l.status, 2, l.out);
    assert.match(l.out, /Legacy/);
  });

  it("guard/T1674 [guard/F46, guard/N15, guard/A23]: fold fails with no reports, with a missing report naming the check, with a report that is not success and with an unexpected extra report, and passes only when the reported set equals the expected set and each is success", () => {
    const r = repo(base());
    const planFile = join(r.root, "plan.json");
    writeFileSync(planFile, JSON.stringify(PLAN));
    const dir = join(r.root, "reports");
    const fold = () => { const x = guard(r.root, "fold", "--aggregate", "solution", "--plan", planFile, "--reports", dir); needs("fold", x); return x; };
    assert.notEqual(fold().status, 0, "no reports at all fails");
    report(dir, "packages/a/test", { result: "pass" });
    const missing = fold();
    assert.notEqual(missing.status, 0);
    assert.match(missing.out, /packages\/c\/test/, "the missing check is named");
    report(dir, "packages/c/test", { result: "fail" });
    assert.notEqual(fold().status, 0, "a report that is not success fails");
    report(dir, "packages/c/test", { result: "pass" });
    report(dir, "packages/z/test", { result: "pass" });
    const extra = fold();
    assert.notEqual(extra.status, 0, "an unexpected extra report fails even when every expected check passed");
    assert.match(extra.out, /packages\/z\/test/);
    rmSync(join(dir, "packages__z__test.json"));
    assert.equal(fold().status, 0, "the reported set equals the expected set and each passed");
  });

  it("guard/T1678 [guard/F46, guard/F48, guard/A23]: a report whose run id differs from the plan's, one whose head is another revision, one whose executed script differs from the plan's, and one left in the reports directory from an earlier run each fail fold, naming the check and the differing member; reports of the plan's run and revision pass", () => {
    const r = repo(base());
    const planFile = join(r.root, "plan.json");
    writeFileSync(planFile, JSON.stringify(PLAN));
    for (const [member, bad] of [["run", { run: "run-0" }], ["head", { head: "b".repeat(40) }], ["script", { script: "true" }]]) {
      const dir = join(r.root, `reports-${member}`);
      report(dir, "packages/a/test", { result: "pass" });
      report(dir, "packages/c/test", { result: "pass", ...bad });
      const x = guard(r.root, "fold", "--aggregate", "solution", "--plan", planFile, "--reports", dir);
      needs("fold", x);
      assert.notEqual(x.status, 0, `${member} differs`);
      assert.match(x.out, /packages\/c\/test/);
      assert.match(x.out, new RegExp(member), `the differing member ${member} is named`);
    }
    const ok = join(r.root, "reports-ok");
    report(ok, "packages/a/test", { result: "pass" });
    report(ok, "packages/c/test", { result: "pass" });
    assert.equal(guard(r.root, "fold", "--aggregate", "solution", "--plan", planFile, "--reports", ok).status, 0);
  });

  it("guard/T1675 [guard/F48, guard/N15, guard/A24]: run --check <id> --report writes a report with the id, aggregates, result, finding, fix hint and registration file; a command that cannot start is recorded as cannot judge and exits non-zero", () => {
    const ok = repo(base({ "packages/a/package.json": { name: "x", scripts: { test: "node -e 0" } } }));
    const out = join(ok.root, "out.json");
    const x = guard(ok.root, "run", "--ci", "--check", "packages/a/test", "--config", CONFIG, "--run", "run-1", "--head", head(ok), "--report", out);
    needs("run --report", x);
    assert.equal(x.status, 0, x.out);
    const rep = JSON.parse(readFileSync(out, "utf8"));
    for (const k of ["check", "aggregates", "run", "head", "script", "result", "finding", "fix", "registration"]) assert.ok(k in rep, `report has ${k}`);
    assert.equal(rep.check, "packages/a/test");
    assert.equal(rep.registration, "packages/a/guard.json");
    assert.equal(rep.run, "run-1");
    assert.equal(rep.head, head(ok));
    assert.equal(rep.script, "node -e 0", "the script it executed");
    const bad = repo(base({ "packages/a/guard.json": REG("test", { command: "no-such-program-guard-c171" }) }));
    const out2 = join(bad.root, "out.json");
    const y = guard(bad.root, "run", "--ci", "--check", "packages/a/test", "--config", CONFIG, "--run", "run-1", "--head", head(bad), "--report", out2);
    assert.notEqual(y.status, 0);
    assert.equal(existsSync(out2), true, "the non-run is recorded");
    assert.match(JSON.parse(readFileSync(out2, "utf8")).result, /cannot.?judge/i);
  });

  it("guard/T1676 [guard/F48, guard/I12, guard/A24]: a failing fold writes guard-report.json naming the check, the aggregate, the registration file and the next step, and prints the report's path", () => {
    const r = repo(base());
    const planFile = join(r.root, "plan.json");
    writeFileSync(planFile, JSON.stringify({ ...PLAN, expected: ["packages/a/test"], scripts: { "packages/a/test": SCRIPT }, registrations: { "packages/a/test": "packages/a/guard.json" } }));
    const dir = join(r.root, "reports");
    mkdirSync(dir);
    const x = guard(r.root, "fold", "--aggregate", "solution", "--plan", planFile, "--reports", dir);
    needs("fold", x);
    assert.notEqual(x.status, 0);
    assert.match(x.out, /guard-report\.json/, "the output names the report");
    const file = join(r.root, "guard-report.json");
    assert.ok(existsSync(file), "the report is written next to the run");
    const text = readFileSync(file, "utf8");
    for (const part of ["packages/a/test", "solution", "packages/a/guard.json"]) assert.ok(text.includes(part), `the report names ${part}`);
    assert.match(text, /"(fix|next)/, "and says what to do next");
  });

  it("guard/T1679 [guard/F44, guard/F48, guard/A24]: run records the run id, the judged head and the script it executed, taken from its own arguments and the package's package.json, and records cannot judge when the command it was given is not the package's test script", () => {
    const r = repo(base({ "packages/a/guard.json": REG("test", { command: "node -e 0" }) }));
    const out = join(r.root, "out.json");
    const x = guard(r.root, "run", "--ci", "--check", "packages/a/test", "--config", CONFIG, "--run", "run-1", "--head", head(r), "--report", out);
    needs("run --report", x);
    assert.notEqual(x.status, 0, "a command that is not the package's own test script does not count as running its suite");
    const rep = JSON.parse(readFileSync(out, "utf8"));
    assert.match(rep.result, /cannot.?judge/i);
    assert.equal(rep.run, "run-1");
    assert.equal(rep.head, head(r));
    assert.match(rep.fix, /npm test/, "it says to run the package's own test script");
  });

  it("guard/T1677 [guard/F47, guard/N16, guard/A25]: the solution template names a fold job Solution protection and per-check jobs by id, runs on pull_request and merge_group, and no per-check job name equals a fold name; plan, run and fold import nothing of Controls, Testing or Core", () => {
    const tpl = join(dirname(BIN), "../templates/solution.yml");
    if (!existsSync(tpl)) assert.fail("blocked before behavioural assertion: the package has no templates/solution.yml");
    const yml = readFileSync(tpl, "utf8");
    assert.match(yml, /pull_request/);
    assert.match(yml, /merge_group/);
    assert.match(yml, /name:\s*Solution protection/);
    assert.match(yml, /matrix\.check/, "per-check jobs are named by the check id");
    for (const f of ["registration", "completeness", "aggregate", "report"]) {
      const src = join(dirname(BIN), `../lib/${f}.mjs`);
      assert.ok(existsSync(src), `lib/${f}.mjs exists`);
      assert.doesNotMatch(readFileSync(src, "utf8"), /kaal-(controls|testing|core)/, `${f}.mjs imports nothing of Controls, Testing or Core`);
    }
  });
});
