// kaal-guard outer acceptance, Requirements verification: each test (T…) names the Functional (F…)
// or Nonfunctional (N…) Requirement it verifies; each describe repeats that Requirement's own trace to
// Intent (I…), for reading only. N1 is
// these tests on Linux, macOS and Windows; N6 is verified by T30. Planned in PLAN; DO and CHECK do not change them.
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { CONFIG, consumer, declaration, exec, NAME, RECORD, sha256, SKILL, tree, verdicts } from "./harness.mjs";

const exit = (status, message = `exit ${status}`) => `node checks/exit.mjs ${status} ${message}`;

/** A consumer that declares these checks, committed. */
function given(checks) {
  const c = consumer();
  c.checks(checks);
  c.commit("checks");
  return c;
}

describe("guard/F1 [guard/I1] check list", () => {
  it("guard/T6 [guard/F1]: runs the hook checks for the hook and only the named check for CI", () => {
    const c = given({ a: { command: exit(0), runs: ["hook"] }, b: { command: exit(0), runs: ["ci"] }, both: { command: exit(0), runs: ["hook", "ci"] } });
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--hook"]).output)).sort(), ["a", "both"]);
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)).sort(), ["b", "both"]);
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--check", "b"]).output)), ["b"]);
  });
});

describe("guard/F2 [guard/I2] verdicts", () => {
  it("guard/T7 [guard/F2]: names every exit status by its own verdict and never collapses one into another", () => {
    const c = given({
      s0: { command: exit(0), runs: ["hook"] },
      s1: { command: exit(1), runs: ["hook"] },
      s2: { command: exit(2), runs: ["hook"] },
      s3: { command: exit(3), runs: ["hook"] },
      s4held: { command: exit(4, "held by the Owner, see #1"), runs: ["hook"], outcomes: { 4: "held" } },
      s4: { command: exit(4), runs: ["hook"] },
      s7: { command: exit(7), runs: ["hook"] },
    });
    const r = c.guard(["run", "--hook"]);
    const v = verdicts(r.output);
    assert.deepEqual(
      Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.verdict])),
      { s0: "pass", s1: "fail", s2: "cannot judge", s3: "not applicable", s4held: "held", s4: "cannot judge", s7: "cannot judge" },
    );
    // The hold's explanation is the check's own: it stays visible in the run's output, wherever Guard puts it.
    assert.match(r.output, /held by the Owner, see #1/);
  });
});

describe("guard/F3 [guard/I2, guard/I3] one runner", () => {
  it("guard/T8 [guard/F3]: serves the hook and CI from the same runner and the same list", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.match(c.read(".githooks/pre-push"), /kaal-guard run --hook/);
    assert.match(c.read(".github/workflows/guard.yml"), /kaal-guard run --ci/);
  });
});

describe("guard/F4 [guard/I2, guard/I3] hook", () => {
  it("guard/T9 [guard/F4, guard/A4]: blocks a push on fail or cannot judge, says that CI decides, and is skipped by --no-verify", () => {
    for (const status of [1, 2]) {
      const c = consumer();
      assert.equal(c.guard(["init", "--hook"]).status, 0);
      c.checks({ gate: { command: exit(status), runs: ["hook"] } });
      c.commit("gate");
      const blocked = c.git("push", "origin", "main");
      assert.notEqual(blocked.status, 0, `status ${status} did not block the push`);
      assert.match(blocked.output, /CI decides/);
      assert.equal(c.git("push", "--no-verify", "origin", "main").status, 0);
    }
  });

  it("guard/T10 [guard/F4, guard/A4]: lets a push through when every hook check passes or is not applicable", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["hook"] }, na: { command: exit(3), runs: ["hook"] } });
    c.commit("gate");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).na.verdict, "not applicable");
  });
});

describe("guard/F5 [guard/I2, guard/I3] CI gate", () => {
  const ci = (status, outcomes) => {
    const c = given({ x: { command: exit(status, "evidence"), runs: ["ci"], ...(outcomes ? { outcomes } : {}) } });
    const summary = join(c.root, "summary.md");
    writeFileSync(summary, "");
    const r = c.guard(["run", "--check", "x", "--github"], { GITHUB_STEP_SUMMARY: summary });
    return { ...r, summary: readFileSync(summary, "utf8") };
  };

  it("guard/T11 [guard/F5, guard/A5]: fails the job on fail and on cannot judge", () => {
    for (const status of [1, 2]) {
      const r = ci(status);
      assert.notEqual(r.status, 0);
      assert.match(r.stdout, /::error/);
    }
  });

  it("guard/T12 [guard/F5, guard/A5]: reports not applicable as not applicable, never as a pass", () => {
    const r = ci(3);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /::notice[^\n]*not applicable/);
    assert.match(r.summary, /not applicable/);
    assert.doesNotMatch(r.summary, /\bpass/i);
  });

  it("guard/T13 [guard/F5, guard/A5]: reports held as a warning, never as a pass, with the check's own explanation visible", () => {
    const r = ci(4, { 4: "held" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /::warning[^\n]*held/);
    assert.match(r.output, /evidence/);
    assert.doesNotMatch(r.summary, /\bpass/i);
  });
});

describe("guard/F6 [guard/I3] narrow adapters", () => {
  it("guard/T14 [guard/F6, guard/A4]: the hook follows the declarations without being changed, and names no check", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    const hook = c.read(".githooks/pre-push");
    c.checks({ flips: { command: exit(0), runs: ["hook"] } });
    c.commit("pass");
    assert.equal(c.git("push", "origin", "main").status, 0);
    c.checks({ flips: { command: exit(1), runs: ["hook"] } });
    c.commit("fail");
    assert.notEqual(c.git("push", "origin", "main").status, 0);
    assert.equal(c.read(".githooks/pre-push"), hook);
    assert.doesNotMatch(hook, /flips/);
  });
});

describe("guard/F7 [guard/I1, guard/I2] trusted checker", () => {
  it("guard/T15 [guard/F7]: runs the trusted checker as it stands on the base, never the candidate's version", () => {
    const c = consumer();
    c.write("checks/judge.mjs", "process.exit(1);\n");
    c.checks({ judge: { command: "node checks/judge.mjs", runs: ["ci"], facts: ["base"], trusted: "checks/judge.mjs" } });
    const base = c.commit("judge fails");
    c.write("checks/judge.mjs", "process.exit(0);\n");
    const head = c.commit("candidate certifies itself");
    const r = c.guard(["run", "--check", "judge", "--head", head, "--base", base, "--base-ref", "main"]);
    assert.equal(verdicts(r.output).judge?.verdict, "fail");
  });

  it("guard/T81 [guard/F7]: a trusted checker Git records as executable keeps that mode in its base copy, so a check that runs it directly passes on the base's verdict", () => {
    const windows = process.platform === "win32";
    const c = consumer();
    c.write("checks/judge.sh", "#!/bin/sh\nexit 0\n");
    c.checks({ judge: { command: windows ? "sh checks/judge.sh" : "./checks/judge.sh", runs: ["ci"], facts: ["base"], trusted: "checks/judge.sh" } });
    if (!windows) chmodSync(join(c.dir, "checks/judge.sh"), 0o755);
    c.git("add", "checks/judge.sh");
    c.git("update-index", "--chmod=+x", "checks/judge.sh");
    const base = c.commit("an executable checker");
    assert.match(c.git("ls-files", "-s", "checks/judge.sh").stdout, /^100755 /, "the fixture does not record the checker as executable");
    const r = c.guard(["run", "--check", "judge", "--head", base, "--base", base, "--base-ref", "main"]);
    assert.equal(verdicts(r.output).judge?.verdict, "pass", r.output);
  });
});

describe("guard/F7 [guard/I1, guard/I2] a trusted declaration is judged from the base (guard/C76)", () => {
  /** A checker that records that it ran, in the working tree, then exits with `status`. */
  const checker = (mark, status) => `import { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(mark)}, "ran\\n");\nprocess.exit(${status});\n`;
  const judge = { command: "node checks/judge.mjs", runs: ["ci"], facts: ["base"], trusted: "checks/judge.mjs" };
  const other = { command: exit(0), runs: ["ci"] };

  /** A base whose trusted check `judge` exits `status` (a fail by default), beside a passing `other`; the candidate is what `change` makes of it. */
  function candidate(change, status = 1) {
    const c = consumer();
    c.write("checks/judge.mjs", checker("judge-ran", status));
    c.checks({ judge, other });
    const base = c.commit("judge fails on the base");
    change(c);
    const head = c.commit("candidate");
    const r = c.guard(["run", "--ci", "--head", head, "--base", base, "--base-ref", "main"]);
    return { c, r, judged: verdicts(r.output).judge };
  }

  it("guard/T94 [guard/F7, guard/N4]: a candidate that drops trusted from a trusted check's declaration is cannot judge, names the check, says to land the declaration change on its own, and its checker never runs", () => {
    const { c, r, judged } = candidate((c) => {
      c.write("checks/judge.mjs", checker("judge-ran", 0));
      c.checks({ judge: { ...judge, trusted: undefined }, other });
    });
    assert.equal(judged?.verdict, "cannot judge", r.output);
    assert.equal(r.status, 2, r.output);
    assert.match(judged.evidence, /on its own/i, "the verdict does not say to land the declaration change on its own");
    assert.ok(!c.exists("judge-ran"), "a checker ran for a trusted check whose declaration the candidate changed");
  });

  it("guard/T95 [guard/F7, guard/N4]: a candidate that changes a trusted check's command, or adds an outcomes entry, is cannot judge, naming the check, and neither command runs", () => {
    const rewritten = candidate((c) => {
      c.write("checks/certify.mjs", checker("certify-ran", 0));
      c.checks({ judge: { ...judge, command: "node checks/certify.mjs" }, other });
    });
    assert.equal(rewritten.judged?.verdict, "cannot judge", rewritten.r.output);
    assert.notEqual(rewritten.r.status, 0, rewritten.r.output);
    assert.ok(!rewritten.c.exists("certify-ran"), "the candidate's command ran");
    assert.ok(!rewritten.c.exists("judge-ran"), "the base's command ran for a declaration the candidate changed");

    // The base's checker exits 4, cannot judge on the base; the candidate's outcomes would make it held.
    const softened = candidate((c) => c.checks({ judge: { ...judge, outcomes: { 4: "held" } }, other }), 4);
    assert.equal(softened.judged?.verdict, "cannot judge", softened.r.output);
    assert.notEqual(softened.r.status, 0, softened.r.output);
    assert.ok(!softened.c.exists("judge-ran"), "the checker ran for a declaration the candidate changed");
  });

  it("guard/T96 [guard/F7, guard/N4]: a candidate that deletes a trusted check's declaration is cannot judge, naming the check, and the run does not pass", () => {
    const { r, judged } = candidate((c) => c.checks({ other }));
    assert.equal(judged?.verdict, "cannot judge", r.output);
    assert.notEqual(r.status, 0, r.output);
  });

  it("guard/T99 [guard/F7, guard/F10, guard/N4]: a base that resolves to no commit here is cannot judge for every check, naming the base, and nothing runs", () => {
    const c = consumer();
    c.checks({ plain: { command: "node checks/plain.mjs", runs: ["ci"] } });
    c.write("checks/plain.mjs", checker("plain-ran", 0));
    const head = c.commit("a check that declares no trusted");
    for (const base of ["no-such-base", "0123456789abcdef0123456789abcdef01234567"]) {
      const r = c.guard(["run", "--ci", "--head", head, "--base", base, "--base-ref", "main"]);
      const judged = verdicts(r.output).plain;
      assert.equal(judged?.verdict, "cannot judge", `base ${base}:\n${r.output}`);
      assert.equal(r.status, 2, r.output);
      assert.ok(judged.evidence.includes(base), `the verdict does not name the base ${base}: ${judged.evidence}`);
      assert.ok(!c.exists("plain-ran"), `a check ran against the unresolved base ${base}`);
    }
  });

  it("guard/T97 [guard/F7]: a check the base does not declare, and a changed check the base declares without trusted, run as the candidate declares them; an unchanged trusted check runs its base checker", () => {
    const c = consumer();
    c.write("checks/judge.mjs", checker("judge-ran", 0));
    c.checks({ judge, other });
    const base = c.commit("base");
    c.checks({ judge, other: { ...other, command: exit(0, "changed by the candidate") }, added: { command: exit(0, "new"), runs: ["ci"] } });
    c.write("checks/judge.mjs", checker("judge-ran", 1));
    const head = c.commit("candidate");
    const r = c.guard(["run", "--ci", "--head", head, "--base", base, "--base-ref", "main"]);
    const v = verdicts(r.output);
    assert.equal(v.added?.verdict, "pass", r.output);
    assert.equal(v.other?.verdict, "pass", r.output);
    assert.equal(v.judge?.verdict, "pass", `the trusted check did not run its base checker:\n${r.output}`);
    assert.equal(r.status, 0, r.output);
  });
});

describe("guard/F8 [guard/I5] safe lifecycle", () => {
  it("guard/T16 [guard/F8, guard/F29, guard/A6]: registers every file init writes in the installation record, with its SHA-256 and the version that wrote it", () => {
    const c = consumer();
    const before = c.files();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    const assets = c.installation();
    assert.ok(assets && Object.keys(assets).length > 0, "the installation record registers no asset");
    for (const [path, { sha256: hash, version }] of Object.entries(assets)) {
      assert.equal(sha256(readFileSync(join(c.dir, path))), hash, path);
      assert.equal(version, c.version(), path);
    }
    const written = c.files().filter((p) => !before.includes(p) && p !== RECORD);
    assert.deepEqual(written, Object.keys(assets).sort(), "init wrote a file it did not register");
  });

  it("guard/T17 [guard/F8, guard/A6]: never overwrites a pre-existing hook, workflow or core.hooksPath, and prints the line to add", () => {
    const c = consumer();
    c.write(".githooks/pre-push", "#!/bin/sh\necho mine\n");
    c.write(".github/workflows/guard.yml", "name: mine\n");
    c.git("config", "core.hooksPath", "hooks-of-mine");
    c.commit("mine");
    const r = c.guard(["init", "--hook", "--ci"]);
    assert.equal(c.read(".githooks/pre-push"), "#!/bin/sh\necho mine\n");
    assert.equal(c.read(".github/workflows/guard.yml"), "name: mine\n");
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), "hooks-of-mine");
    assert.match(r.output, /\.githooks\/pre-push/);
    assert.match(r.output, /kaal-guard run --hook/);
  });

  it("guard/T18 [guard/F8, guard/A6]: upgrade and remove touch only unmodified managed files, and remove unsets only the core.hooksPath it set", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), ".githooks");
    c.write(".github/workflows/guard.yml", "name: edited by the consumer\n");
    c.commit("edit");
    const up = c.guard(["upgrade"]);
    assert.equal(c.read(".github/workflows/guard.yml"), "name: edited by the consumer\n");
    assert.match(up.output, /\.github\/workflows\/guard\.yml/);
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0);
    assert.ok(!c.exists(".githooks/pre-push"), "remove kept an unmodified managed file");
    assert.equal(c.read(".github/workflows/guard.yml"), "name: edited by the consumer\n");
    assert.match(rm.output, /\.github\/workflows\/guard\.yml/);
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), "");
  });
});

describe("guard/F9 [guard/I2] execution contract", () => {
  it("guard/T19 [guard/F9]: gives a check only its facts, from the repository root, with no stdin, wherever it is started", () => {
    const c = given({ facts: { command: "node checks/facts.mjs facts.json", runs: ["hook", "ci"] } });
    c.write("changed.txt", "a.txt\0dir/b.txt\0");
    // The base is a commit here: one that resolves to none is cannot judge (guard/F7, guard/C84).
    const b = c.git("rev-parse", "HEAD").stdout.trim();
    const args = ["run", "--check", "facts", "--head", "h", "--base", b, "--base-ref", "main", "--changed", join(c.dir, "changed.txt")];
    const seen = [];
    for (const [cwd, extra] of [[c.dir, {}], [join(c.dir, "checks"), { GITHUB_ACTIONS: "true", CI: "true" }]]) {
      assert.equal(c.guard(args, extra, cwd).status, 0);
      seen.push(JSON.parse(c.read("facts.json")));
    }
    for (const s of seen) {
      assert.equal(realpathSync(s.cwd), realpathSync(c.dir)); // the same directory, however the OS spells it (macOS: /var is /private/var)
      assert.equal(s.stdin, "");
      assert.deepEqual(Object.keys(s.guard).sort(), ["GUARD_BASE", "GUARD_BASE_REF", "GUARD_CHANGED", "GUARD_HEAD"]);
      assert.deepEqual([s.guard.GUARD_HEAD, s.guard.GUARD_BASE, s.guard.GUARD_BASE_REF], ["h", b, "main"]);
      assert.deepEqual(s.changed, ["a.txt", "dir/b.txt"]);
    }
  });

  it("guard/T20 [guard/F9]: the hook prints the base commit it used", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("ok");
    const base = c.git("rev-parse", "origin/main").stdout.trim();
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.match(push.output, new RegExp(base));
  });
});

describe("guard/F10 [guard/I2] no silent gate", () => {
  it("guard/T21 [guard/F10]: a command that cannot start is cannot judge, and it blocks", () => {
    const c = given({ ghost: { command: "a-command-that-does-not-exist-anywhere", runs: ["hook"] } });
    const r = c.guard(["run", "--hook"]);
    assert.equal(verdicts(r.output).ghost?.verdict, "cannot judge");
    assert.notEqual(r.status, 0);
  });

  it("guard/T22 [guard/F10]: a declared fact that is not supplied is cannot judge", () => {
    const c = given({ needs: { command: exit(0), runs: ["ci"], facts: ["base"] } });
    assert.equal(verdicts(c.guard(["run", "--check", "needs"]).output).needs?.verdict, "cannot judge");
  });

  it("guard/T23 [guard/F10]: a check that is not declared is cannot judge", () => {
    const c = given({ known: { command: exit(0), runs: ["ci"] } });
    const r = c.guard(["run", "--check", "unknown"]);
    assert.equal(verdicts(r.output).unknown?.verdict, "cannot judge");
    assert.notEqual(r.status, 0);
  });

  it("guard/T24 [guard/F10]: verify fails on a ci check that no workflow job names (static configuration coverage only)", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ orphan: { command: exit(0), runs: ["ci"] } });
    c.write(".github/workflows/guard.yml", "name: CI\non: pull_request\njobs: {}\n");
    c.commit("orphan");
    const r = c.guard(["verify"]);
    assert.notEqual(r.status, 0);
    assert.match(r.output, /orphan/);
  });
});

describe("guard/N2 to guard/N4", () => {
  it("guard/T25 [guard/N2]: the same run twice prints the same verdicts", () => {
    const c = given({ a: { command: exit(1, "same"), runs: ["hook"] }, b: { command: exit(3, "same"), runs: ["hook"] } });
    assert.equal(c.guard(["run", "--hook"]).output, c.guard(["run", "--hook"]).output);
  });

  it("guard/T26 [guard/N3]: no state beyond the repository, core.hooksPath and Guard's checkout state in Git's metadata", () => {
    const c = consumer();
    const config = () => c.git("config", "--local", "--list").stdout.split(/\r?\n/).filter(Boolean).sort();
    const before = config();
    const home = readdirSync(c.home).sort();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ a: { command: exit(0), runs: ["hook"] } });
    c.guard(["run", "--hook"]);
    assert.deepEqual(config().filter((l) => !before.includes(l)), ["core.hookspath=.githooks"]);
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(config(), before);
    assert.deepEqual(readdirSync(c.home).sort(), home);
  });

  it("guard/T27 [guard/N4]: every fail or cannot-judge verdict says what to do next", () => {
    const c = given({ f: { command: exit(1), runs: ["hook"] }, cj: { command: exit(2), runs: ["hook"] } });
    const lines = c.guard(["run", "--hook"]).output.split(/\r?\n/);
    for (const name of ["f", "cj"]) {
      const at = lines.findIndex((l) => new RegExp(`^(fail|cannot judge): ${name}:`).test(l.trim()));
      assert.ok(at >= 0, `no verdict for ${name}`);
      assert.match(lines[at + 1] ?? "", /^\s+do: \S/);
    }
  });
});

/** Guard's checkout state as Git resolves it from `cwd`: in the common directory, or in the worktree's own metadata. */
const state = (c, cwd, scope) => {
  const r = scope === "worktree" ? c.git("-C", cwd, "rev-parse", "--path-format=absolute", "--git-path", "kaal/guard/state.json") : c.git("-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir");
  assert.equal(r.status, 0, r.output);
  return scope === "worktree" ? r.stdout.trim() : join(r.stdout.trim(), "kaal", "guard", "state.json");
};

/** Where core.hooksPath is set, as `git config --show-scope` sees it from `cwd`: [scope, value], or [] when unset. */
const hooksPath = (c, cwd) => c.git("-C", cwd, "config", "--show-scope", "--get", "core.hooksPath").stdout.trim().split(/\s+/).filter(Boolean);

/** A linked worktree of `c` on a new branch, beside its main checkout. */
const worktree = (c, name) => {
  const dir = join(c.root, name);
  const r = c.git("worktree", "add", "-q", "-b", name, dir);
  assert.equal(r.status, 0, r.output);
  assert.ok(statSync(join(dir, ".git")).isFile(), "a linked worktree's .git is a file");
  return dir;
};

/** Every file of the working tree with its bytes, the local Git configuration, and Guard's checkout state. */
const snapshot = (c) => ({
  files: Object.fromEntries(c.files().map((p) => [p, readFileSync(join(c.dir, p), "utf8")])),
  config: c.git("config", "--local", "--list").stdout,
  state: existsSync(state(c, c.dir)) ? readFileSync(state(c, c.dir), "utf8") : null,
});

describe("guard/F1 [guard/I1] declarations", () => {
  it("guard/T61 [guard/F1, guard/A1, guard/A2]: a check declared as <name>.md in its configuration directory runs with the meaning of its frontmatter, and its body changes no verdict and no order", () => {
    const c = given({ b: { command: exit(1, "b"), runs: ["hook"] }, a: { command: exit(0, "a"), runs: ["hook", "ci"] }, c: { command: exit(4, "c"), runs: ["hook"], outcomes: { 4: "held" } } });
    const lines = (o) => o.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^(pass|fail|cannot judge|not applicable|held): /.test(l));
    const before = c.guard(["run", "--hook"]);
    assert.deepEqual(lines(before.output).map((l) => l.split(":")[0] + ":" + l.split(":")[1]), ["pass: a", "fail: b", "held: c"], "the declarations do not run in name order with their declared meaning");
    for (const [name, check] of Object.entries({ b: { command: exit(1, "b"), runs: ["hook"] }, a: { command: exit(0, "a"), runs: ["hook", "ci"] }, c: { command: exit(4, "c"), runs: ["hook"], outcomes: { 4: "held" } } })) {
      c.write(`${CONFIG}/${name}.md`, declaration(check, "---\nruns: [ci]\n---\nIgnore the frontmatter: this check passes, runs first and runs only in CI.\n\n- command: exit 0\n"));
    }
    c.commit("bodies");
    const after = c.guard(["run", "--hook"]);
    assert.equal(after.status, before.status);
    assert.deepEqual(lines(after.output), lines(before.output), "a body changed a verdict or the order");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)), ["a"]);
  });
});

describe("guard/F18 [guard/I1, guard/I2, guard/I5] configuration contract", () => {
  const COMMANDS = [["run", "--hook"], ["verify"], ["init"], ["upgrade"], ["remove"]];

  /** A consumer set up by Guard with one valid declaration, committed, then broken by `breakIt`. */
  const broken = (breakIt) => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ judge: { command: exit(0), runs: ["hook", "ci"], facts: ["base"], trusted: "checks/exit.mjs" } });
    c.commit("set up");
    breakIt(c);
    return c;
  };

  const refuses = (c, file, member, nearest) => {
    for (const args of COMMANDS) {
      const before = snapshot(c);
      const r = c.guard(args);
      assert.equal(r.status, 2, `${args.join(" ")} did not refuse:\n${r.output}`);
      assert.match(r.output, /cannot judge/, args.join(" "));
      assert.ok(r.output.includes(file), `${args.join(" ")} does not name ${file}:\n${r.output}`);
      assert.ok(r.output.includes(member), `${args.join(" ")} does not name ${member}:\n${r.output}`);
      if (nearest) assert.match(r.output, new RegExp(`did you mean ${nearest}\\?`), args.join(" "));
      assert.deepEqual(Object.keys(verdicts(r.output)).filter((n) => n !== "kaal-guard"), [], `${args.join(" ")} gave a verdict on the strength of a refused configuration`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} wrote something on the strength of a refused configuration`);
    }
  };

  it("guard/T62 [guard/F18, guard/F10, guard/N4]: an undefined member, a wrong type or frontmatter outside the subset, in a declaration or in Guard's state, is cannot judge, named, and nothing is written", () => {
    const file = `${CONFIG}/judge.md`;
    refuses(broken((c) => c.write(file, c.read(file).replace("trusted:", "trustd:"))), file, "trustd", "trusted");
    refuses(broken((c) => c.write(file, c.read(file).replace(/^command: .*$/m, "command: [node, checks/exit.mjs, 0]"))), file, "command");
    refuses(broken((c) => c.write(file, c.read(file).replace(/^runs: .*$/m, "runs:\n  - hook\n  - ci"))), file, "runs");
    refuses(broken((c) => c.write(RECORD, JSON.stringify({ ...JSON.parse(c.read(RECORD)), owner: "someone" }, null, 2) + "\n")), RECORD, "owner");
    refuses(broken((c) => {
      const at = state(c, c.dir);
      writeFileSync(at, JSON.stringify({ ...JSON.parse(readFileSync(at, "utf8")), extra: 1 }));
    }), "state.json", "extra");
  });

  it('guard/T79 [guard/F1, guard/F2, guard/F18]: outcomes: {"4": held} makes exit status 4 held; an unquoted status key, {4: held}, is cannot judge, naming the declaration, outcomes and {"4": held}', () => {
    const c = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook", "ci"], outcomes: { 4: "held" } } });
    assert.match(c.read(`${CONFIG}/h.md`), /^outcomes: \{"4": held\}$/m, "the declaration does not quote the status key");
    for (const args of [["run", "--hook"], ["run", "--check", "h"]]) {
      const r = c.guard(args);
      assert.equal(verdicts(r.output).h?.verdict, "held", `${args.join(" ")}:\n${r.output}`);
    }

    const file = `${CONFIG}/judge.md`;
    const unquoted = broken((b) => b.write(file, b.read(file).replace(/^runs: .*$/m, (line) => `${line}\noutcomes: {4: held}`)));
    refuses(unquoted, file, "outcomes");
    for (const args of [["run", "--hook"], ["verify"]]) {
      const r = unquoted.guard(args);
      assert.ok(r.output.includes('{"4": held}'), `${args.join(" ")} does not name the quoted form:\n${r.output}`);
    }
  });
});

describe("guard/F28 [guard/I2, guard/I3, guard/I5] configuration discovery", () => {
  it("guard/T63 [guard/F28]: the hook and workflow pass --config; without it the top level's declarations are found from any directory; only .md files directly in it count; with none it is cannot judge naming init", () => {
    const fresh = consumer();
    const none = fresh.guard(["run", "--hook"]);
    assert.equal(none.status, 2, none.output);
    assert.match(none.output, /kaal-guard init/);

    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    for (const asset of [".githooks/pre-push", ".github/workflows/guard.yml"]) {
      assert.match(c.read(asset), /kaal-guard run [^\n]*--config \.kaal\/config\/guard\b/, `${asset} does not pass --config`);
    }
    c.checks({ top: { command: exit(1, "top"), runs: ["hook", "ci"] } });
    c.write(`${CONFIG}/notes.txt`, "not a declaration\n");
    c.write(`${CONFIG}/nested/deep.md`, declaration({ command: exit(0), runs: ["hook", "ci"] }));
    c.write("alt/top.md", declaration({ command: exit(0, "alt"), runs: ["hook", "ci"] }));
    c.commit("declarations");
    const fromRoot = verdicts(c.guard(["run", "--check", "top"]).output).top;
    const fromBelow = verdicts(c.guard(["run", "--check", "top"], {}, join(c.dir, "checks")).output).top;
    assert.equal(fromRoot?.verdict, "fail");
    assert.deepEqual(fromBelow, fromRoot, "a subdirectory resolved other declarations");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--hook"]).output)), ["top"], "a file that is not a .md directly in the directory was taken as a declaration");
    assert.equal(verdicts(c.guard(["run", "--check", "deep"]).output).deep?.verdict, "cannot judge");
    assert.equal(verdicts(c.guard(["run", "--check", "top", "--config", "alt"]).output).top?.verdict, "pass", "--config was not followed");
  });
});

describe("guard/F29 [guard/I5] lifecycle state", () => {
  it("guard/T69 [guard/F29, guard/F8]: shared configuration: init in a linked worktree sets core.hooksPath in the shared scope with its state in the common directory, and remove in the main checkout unsets it", () => {
    const c = given({ ok: { command: exit(0), runs: ["hook"] } });
    const wt = worktree(c, "shared");
    const init = c.guard(["init", "--hook"], {}, wt);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(hooksPath(c, wt), ["local", ".githooks"]);
    assert.deepEqual(hooksPath(c, c.dir), ["local", ".githooks"], "the main checkout does not see the shared setting");
    assert.ok(existsSync(state(c, wt)), "no checkout state in the common directory");
    assert.equal(state(c, wt), state(c, c.dir));
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(hooksPath(c, wt), []);
    assert.ok(!existsSync(state(c, c.dir)), "remove kept the checkout state it used");
  });

  it("guard/T70 [guard/F29, guard/F8, guard/F12]: in a fresh clone, upgrade and remove judge each asset by the tracked installation record alone, and leave a core.hooksPath Guard did not set there", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("set up");
    assert.equal(c.git("push", "--no-verify", "origin", "main").status, 0);
    const clone = join(c.root, "clone");
    assert.equal(c.git("clone", "-q", "-b", "main", c.remote, clone).status, 0);
    c.git("-C", clone, "config", "core.hooksPath", ".githooks");
    writeFileSync(join(clone, ".github", "workflows", "guard.yml"), "name: edited in the clone\n");
    const up = c.guard(["upgrade"], {}, clone);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, /\.github\/workflows\/guard\.yml/);
    assert.equal(readFileSync(join(clone, ".github", "workflows", "guard.yml"), "utf8"), "name: edited in the clone\n");
    const rm = c.guard(["remove"], {}, clone);
    assert.equal(rm.status, 0, rm.output);
    assert.ok(!existsSync(join(clone, ".githooks", "pre-push")), "remove kept an unmodified registered asset");
    assert.equal(readFileSync(join(clone, ".github", "workflows", "guard.yml"), "utf8"), "name: edited in the clone\n", "remove deleted a modified asset");
    assert.deepEqual(hooksPath(c, clone), ["local", ".githooks"], "remove unset a core.hooksPath Guard did not set in this clone");
  });

  it("guard/T71 [guard/F29, guard/F8]: worktree configuration: init in a linked worktree sets core.hooksPath for that worktree only, with its state in the worktree's metadata", () => {
    const c = given({ ok: { command: exit(0), runs: ["hook"] } });
    assert.equal(c.git("config", "extensions.worktreeConfig", "true").status, 0);
    const wt = worktree(c, "own");
    const init = c.guard(["init", "--hook"], {}, wt);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(hooksPath(c, wt), ["worktree", ".githooks"]);
    assert.deepEqual(hooksPath(c, c.dir), [], "the main checkout sees the worktree's setting");
    assert.ok(existsSync(state(c, wt, "worktree")), "no checkout state in the worktree's metadata");
    assert.ok(!existsSync(state(c, c.dir)), "the state was written to the common directory");
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(hooksPath(c, wt), ["worktree", ".githooks"], "remove in the main checkout touched the worktree's setting");
    const rm = c.guard(["remove"], {}, wt);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(hooksPath(c, wt), []);
    assert.ok(!existsSync(state(c, wt, "worktree")), "remove kept the checkout state it used");
  });

  it("guard/T72 [guard/F29, guard/F8, guard/F19]: every asset init and upgrade install is byte-identical to catalogued content and valid in its format", () => {
    const c = consumer();
    for (const [command, ...options] of [["init", "--hook", "--ci"], ["upgrade"]]) {
      assert.equal(c.guard([command, ...options]).status, 0, command);
      const catalogue = c.catalogue();
      for (const path of Object.keys(c.installation())) {
        const bytes = readFileSync(join(c.dir, path));
        assert.ok((catalogue[path] ?? []).includes(sha256(bytes)), `${command}: ${path} is not catalogued content`);
        const text = bytes.toString("utf8");
        if (path === ".githooks/pre-push") {
          assert.match(text, /^#!/, `${command}: the hook does not start with its shebang`);
          if (process.platform !== "win32") assert.ok(statSync(join(c.dir, path)).mode & 0o111, `${command}: the hook is not executable`);
        } else if (/\.ya?ml$/.test(path)) {
          assert.match(text, /^name: /, `${command}: ${path} does not start as a plain workflow`);
          assert.match(text, /^jobs:/m, `${command}: ${path} has no jobs`);
          assert.doesNotMatch(text, /\t/, `${command}: ${path} holds a tab, which YAML refuses`);
        } else if (path.endsWith("SKILL.md")) {
          assert.match(text, /^---\r?\nname: kaal-guard\r?\n(?:[^\n]*\n)*?description: \S/, `${command}: ${path} does not begin with the standard's frontmatter`);
        }
      }
    }
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("ok");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", "the installed hook does not run");
  });

  it("guard/T73 [guard/F29, guard/F8]: a file with published bytes that the record does not register is not Guard's, and a changed or missing registered asset is reported, not re-registered", () => {
    const source = consumer();
    assert.equal(source.guard(["init", "--hook"]).status, 0);
    const published = source.read(".githooks/pre-push");

    const c = consumer();
    c.write(".githooks/pre-push", published);
    if (process.platform !== "win32") chmodSync(join(c.dir, ".githooks", "pre-push"), 0o755);
    c.commit("a hook of the consumer's own, with Guard's bytes");
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.equal(c.installation()[".githooks/pre-push"], undefined, "init registered a file it did not write");
    for (const command of ["upgrade", "remove"]) {
      const r = c.guard([command]);
      assert.equal(r.status, 0, r.output);
      assert.match(r.output, /\.githooks\/pre-push/, `${command} does not report the unregistered file`);
      assert.equal(c.read(".githooks/pre-push"), published, `${command} touched a file that is not Guard's`);
    }

    const d = consumer();
    assert.equal(d.guard(["init", "--hook", "--ci"]).status, 0);
    const registered = d.installation()[".githooks/pre-push"];
    d.write(".githooks/pre-push", `${published}# the consumer's line\n`);
    const up = d.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, /\.githooks\/pre-push/, "upgrade does not report the changed asset");
    assert.deepEqual(d.installation()[".githooks/pre-push"], registered, "upgrade re-registered a changed asset");
    rmSync(join(d.dir, ".github", "workflows", "guard.yml"));
    const rm = d.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.match(rm.output, /\.githooks\/pre-push/, "remove does not report the changed asset");
    assert.match(rm.output, /\.github\/workflows\/guard\.yml/, "remove does not report the missing registered asset");
  });
});

describe("guard/F17 [guard/I1, guard/I5] CI responsibility", () => {
  it("guard/T74 [guard/F17, guard/F10, guard/F30, guard/N4]: without --hook or --ci, init activates neither integration, reports each ci check no job declares with the step to add and init --ci, and verify fails on it with the same step", () => {
    const c = given({ build: { command: exit(0), runs: ["ci"] }, lint: { command: exit(0), runs: ["hook"] } });
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(c.files().filter((p) => p.startsWith(".github/")), [], "init wrote a workflow without --ci");
    assert.equal(c.exists(".githooks/pre-push"), false, "init installed the hook without --hook");
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), "", "init set core.hooksPath without --hook");
    assert.match(init.output, /kaal-guard run --check build\b/, "init does not name the step that would run the uncovered ci check");
    assert.match(init.output, /init --ci/, "init does not name the opt-in");
    assert.doesNotMatch(init.output, /--check lint\b/, "init reports a hook check as missing CI coverage");
    c.commit("init");
    const r = c.guard(["verify"]);
    assert.equal(verdicts(r.output).build?.verdict, "fail", r.output);
    assert.match(r.output, /kaal-guard run --check build\b/, "verify does not name the step to add");
  });

  it("guard/T75 [guard/F17, guard/F8]: init --ci installs Guard's workflow only where no workflow of the consumer's declares a check or verify, and never changes one", () => {
    const fresh = given({ build: { command: exit(0), runs: ["ci"] } });
    assert.equal(fresh.guard(["init", "--ci"]).status, 0);
    const workflow = fresh.read(".github/workflows/guard.yml");
    assert.match(workflow, /kaal-guard verify/);
    assert.match(workflow, /kaal-guard run --ci/);
    assert.ok(fresh.installation()[".github/workflows/guard.yml"], "init --ci did not register the workflow it installed");
    fresh.commit("init");
    assert.equal(verdicts(fresh.guard(["verify"]).output).build?.verdict, "pass", "verify does not read Guard's workflow as running every ci check");

    const own = "name: Own\non: pull_request\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npx --no kaal-guard run --check build --github\n";
    for (const steps of [own, own.replace("run --check build --github", "verify --github")]) {
      const c = given({ build: { command: exit(0), runs: ["ci"] }, test: { command: exit(0), runs: ["ci"] } });
      c.write(".github/workflows/own.yml", steps);
      c.commit("own workflow");
      const r = c.guard(["init", "--ci"]);
      assert.equal(r.status, 0, r.output);
      assert.ok(!c.exists(".github/workflows/guard.yml"), "init --ci installed Guard's workflow beside one that already runs Guard");
      assert.equal(c.read(".github/workflows/own.yml"), steps, "init --ci changed the consumer's workflow");
      assert.match(r.output, /own\.yml/, "init --ci does not report the workflow it found");
    }
  });
});

describe("guard/F30 [guard/I1, guard/I3, guard/I5] initialization, activation and execution", () => {
  const surfaces = (c) => ({ hook: c.exists(".githooks/pre-push"), ci: c.exists(".github/workflows/guard.yml"), hooksPath: c.git("config", "--get", "core.hooksPath").stdout.trim() });

  it("guard/T76 [guard/F30, guard/N4]: init prepares the configuration and the installation record, activates neither hook nor CI, names both activations, and run again writes nothing", () => {
    const c = given({ both: { command: exit(0), runs: ["hook", "ci"] } });
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(c.exists(CONFIG), "init did not prepare the configuration directory");
    assert.ok(c.exists(RECORD), "init did not prepare the installation record");
    // From guard/C16 on, init also installs the canonical Skill (guard/F23, guard/F30), which runs nothing: it registers no other asset.
    assert.deepEqual(Object.keys(c.installation()).filter((p) => !p.startsWith(`${SKILL}/`)), [], "init registered an asset without an activation");
    assert.deepEqual(surfaces(c), { hook: false, ci: false, hooksPath: "" }, "init activated a surface");
    assert.match(init.output, /init --hook/, "init does not name the hook's activation");
    assert.match(init.output, /init --ci/, "init does not name CI's activation");
    const before = snapshot(c);
    assert.equal(c.guard(["init"]).status, 0);
    assert.deepEqual(snapshot(c), before, "init run again changed something");
  });

  it("guard/T77 [guard/F30, guard/F4, guard/F17]: hook and CI are activated apart and registered apart; neither implies the other, and activating again changes nothing", () => {
    const c = given({ h: { command: exit(0, "h"), runs: ["hook"] }, k: { command: exit(0, "k"), runs: ["ci"] }, both: { command: exit(0, "both"), runs: ["hook", "ci"] } });
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    assert.deepEqual(surfaces(c), { hook: true, ci: false, hooksPath: ".githooks" }, "init --hook activated more or less than the hook");
    c.commit("hook");
    const ciOnly = given({ k: { command: exit(0), runs: ["ci"] } });
    assert.equal(ciOnly.guard(["init", "--ci"]).status, 0);
    assert.deepEqual(surfaces(ciOnly), { hook: false, ci: true, hooksPath: "" }, "init --ci activated more or less than CI");
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    assert.deepEqual(surfaces(c), { hook: true, ci: true, hooksPath: ".githooks" });
    c.commit("ci");
    const before = snapshot(c);
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.deepEqual(snapshot(c), before, "activating again changed something");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--hook"]).output)).sort(), ["both", "h"], "run --hook ran a check not registered for the hook");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)).sort(), ["both", "k"], "run --ci ran a check not registered for CI");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--check", "h"]).output)), ["h"], "run --check did not run exactly the named check");
  });

  it("guard/T78 [guard/F30, guard/F18, guard/N4]: each activation is undone on its own, keeping every declaration and Test Case; local is refused, naming hook", () => {
    const c = given({ h: { command: exit(0), runs: ["hook"] }, k: { command: exit(0), runs: ["ci"] } });
    const kept = () => Object.fromEntries([`${CONFIG}/h.md`, `${CONFIG}/k.md`, "test/own.test.mjs", "checks/exit.mjs"].map((p) => [p, c.read(p)]));
    const declared = kept();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.commit("activated");
    const ci = c.guard(["remove", "--ci"]);
    assert.equal(ci.status, 0, ci.output);
    assert.deepEqual(surfaces(c), { hook: true, ci: false, hooksPath: ".githooks" }, "remove --ci touched the hook");
    const hook = c.guard(["remove", "--hook"]);
    assert.equal(hook.status, 0, hook.output);
    assert.deepEqual(surfaces(c), { hook: false, ci: false, hooksPath: "" }, "remove --hook left the hook active");
    assert.deepEqual(kept(), declared, "an undo changed a declaration or a Test Case");
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(kept(), declared, "remove changed a declaration or a Test Case");

    const d = given({ old: { command: exit(0), runs: ["local"] } });
    const r = d.guard(["run", "--hook"]);
    assert.equal(r.status, 2, r.output);
    assert.match(r.output, /local/);
    assert.match(r.output, /hook/);
    const flag = d.guard(["run", "--local"]);
    assert.equal(flag.status, 2, flag.output);
    assert.match(flag.output, /--hook/, "run --local does not name run --hook");
  });
});

// guard/T45–guard/T59 are planned in guard/C12 and written in guard/C13, before any code. They run like every
// other Test Case: until their Changes land they are RED, and that RED is their evidence.

/** A check script that writes known bytes to its own stdout and stderr, then exits with its argument. */
const LOUD = `process.stdout.write("the check's stdout\\n"); process.stderr.write("the check's stderr\\n"); process.exit(Number(process.argv[2]));\n`;

/** The lines of a run's stdout that are neither a verdict line nor its `do:` line. */
const extra = (stdout) => stdout.split(/\r?\n/).filter((l) => l.trim() && !/^\s+do: /.test(l) && Object.keys(verdicts(l)).length === 0);

/** The Skill path a reminder line names, repository-relative with forward slashes where it lies in the repository, and whether it exists. */
function named(c, line) {
  const m = /((?:[A-Za-z]:)?[^\s`'"(]*skills[\\/]kaal-guard(?:[\\/][^\s`'"),;]*)?)/.exec(line);
  assert.ok(m, `the reminder names no Skill path: ${line}`);
  const path = m[1].replace(/[.:]$/, "");
  const absolute = isAbsolute(path) ? path : join(c.dir, path);
  const inside = isAbsolute(path) ? null : path.split("\\").join("/").replace(/\/$/, "");
  return { path, inside, exists: existsSync(absolute) };
}

describe("guard/F19 [guard/I7] Guard's Skill", () => {
  it("guard/T45 [guard/F19, guard/A13, guard/N11]: the packed package carries skills/kaal-guard/SKILL.md, named kaal-guard, with BASS sections and no script, and names no consumer", () => {
    const c = consumer();
    const { source, files } = c.skill();
    const text = readFileSync(join(source, "SKILL.md"), "utf8");
    const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
    assert.ok(front, "SKILL.md does not begin with the standard's frontmatter");
    assert.match(front[1], /^name: kaal-guard$/m, "the Skill is not named kaal-guard");
    assert.match(front[1], /^description: \S/m, "the Skill has no description");
    for (const section of ["Bare", "Agent", "Skill", "Script"]) assert.match(text, new RegExp(`^#{1,6} [^\\n]*\\b${section}\\b`, "m"), `the Skill has no ${section} section (BASS)`);
    // Script: none (guard/F19), and nothing in the Skill runs.
    assert.deepEqual(files.filter((f) => f.startsWith("scripts/") || /\.(mjs|cjs|js|sh|ps1|py)$/.test(f)), [], "the Skill carries a script");
    for (const f of files) {
      const body = readFileSync(join(source, f), "utf8");
      assert.doesNotMatch(body, /\bKAAL\b|Kai-Hacks-AI/, `${f} names a particular consumer`);
    }
    const manifest = JSON.parse(readFileSync(join(c.dir, "node_modules", ...NAME.split("/"), "package.json"), "utf8"));
    assert.deepEqual(Object.keys(manifest.dependencies ?? {}), [], "the Skill brought a runtime dependency (guard/N11)");
  });
});

describe("guard/F21 and guard/F22 [guard/I7, guard/I1, guard/I2] reminder, unchanged verdicts", () => {
  /** A consumer with one check that runs LOUD with the given exit status, for the hook and CI. */
  const loud = (status, outcomes) => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ x: { command: `node checks/loud.mjs ${status}`, runs: ["hook", "ci"], ...(outcomes ? { outcomes } : {}) } });
    c.commit("loud");
    return c;
  };

  it("guard/T47 [guard/F21, guard/F22]: a failing and a cannot-judge local run keep their exit statuses, verdict lines and the check's own stdout and stderr byte for byte, and add exactly one reminder line naming an existing Skill path", () => {
    // No Skill is deployed here, so the reminder names the package's copy (guard/F21).
    for (const [status, verdict] of [[1, "fail"], [2, "cannot judge"]]) {
      const c = loud(status);
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, status, `${verdict}: the exit status changed`);
      assert.equal(verdicts(r.stdout).x?.verdict, verdict, `${verdict}: the verdict changed`);
      const lines = r.stdout.split(/\r?\n/).filter((l) => l.trim());
      assert.match(lines[lines.findIndex((l) => verdicts(l).x) + 1] ?? "", /^\s+do: \S/, `${verdict}: the do: line moved or vanished`);
      assert.equal(r.stderr, "the check's stdout\nthe check's stderr\n", `${verdict}: the check's own output did not reach the terminal byte for byte`);
      const reminder = extra(r.stdout);
      assert.equal(reminder.length, 1, `${verdict}: not exactly one reminder line: ${JSON.stringify(reminder)}`);
      assert.equal(lines.at(-1), reminder[0], `${verdict}: the reminder does not follow the verdict lines`);
      const skill = named(c, reminder[0]);
      assert.ok(skill.exists, `${verdict}: the reminder names ${skill.path}, which does not exist`);
    }
    const both = consumer();
    both.write("checks/loud.mjs", LOUD);
    both.checks({ f: { command: "node checks/loud.mjs 1", runs: ["hook"] }, cj: { command: "node checks/loud.mjs 2", runs: ["hook"] } });
    both.commit("both");
    assert.equal(extra(both.guard(["run", "--hook"]).stdout).length, 1, "a run with a fail and a cannot judge does not add exactly one reminder line");
  });

  // It holds before the reminder exists, and it keeps holding once the reminder and the Skill are there.
  it("guard/T48 [guard/F21]: a run of only pass, not applicable or held adds no reminder", () => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ p: { command: "node checks/loud.mjs 0", runs: ["hook"] }, na: { command: "node checks/loud.mjs 3", runs: ["hook"] }, h: { command: "node checks/loud.mjs 4", runs: ["hook"], outcomes: { 4: "held" } } });
    c.commit("quiet");
    for (const step of ["before init", "after init"]) {
      if (step === "after init") assert.equal(c.guard(["init"]).status, 0, "init");
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, 0, r.output);
      assert.deepEqual(Object.fromEntries(Object.entries(verdicts(r.stdout)).map(([k, v]) => [k, v.verdict])), { p: "pass", na: "not applicable", h: "held" }, step);
      assert.deepEqual(extra(r.stdout), [], `${step}: a run with no fail and no cannot judge added a line`);
      assert.doesNotMatch(r.output, /skills[\\/]kaal-guard/, `${step}: a run with no fail and no cannot judge names the Skill`);
    }
  });

  // Planned in guard/C46: guard/T47 sees no deployed Skill, so only this test sees the reminder name the deployed one.
  it("guard/T82 [guard/F21, guard/F23, guard/A15]: after a standalone init deploys the Skill, a failing and a cannot-judge local run's reminder names the deployed .agents/skills/kaal-guard/SKILL.md, not the package's copy, and with --github so do the annotations and the step summary", () => {
    for (const [status, verdict] of [[1, "fail"], [2, "cannot judge"]]) {
      const c = loud(status);
      c.skill();
      assert.equal(c.guard(["init"]).status, 0, `${verdict}: init`);
      assert.ok(existsSync(join(c.dir, SKILL, "SKILL.md")), `blocked before behavioural assertion: init deployed no Skill at ${SKILL}/`);
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, status, `${verdict}: the exit status changed`);
      const reminder = extra(r.stdout);
      assert.equal(reminder.length, 1, `${verdict}: not exactly one reminder line: ${JSON.stringify(reminder)}`);
      const skill = named(c, reminder[0]);
      assert.equal(skill.inside, `${SKILL}/SKILL.md`, `${verdict}: the reminder names ${skill.path}, not the deployed ${SKILL}/SKILL.md`);
      assert.ok(skill.exists, `${verdict}: the reminder names ${skill.path}, which does not exist`);

      const summary = join(c.root, "summary.md");
      writeFileSync(summary, "");
      const g = c.guard(["run", "--check", "x", "--github"], { GITHUB_STEP_SUMMARY: summary });
      assert.equal(g.status, status, `${verdict}: the exit status changed with --github`);
      const deployed = new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`);
      const errors = g.stdout.split(/\r?\n/).filter((l) => l.startsWith("::error"));
      assert.ok(errors.length > 0, `${verdict}: no error annotation`);
      for (const l of errors) assert.match(l, deployed, `${verdict}: an annotation does not name the deployed Skill: ${l}`);
      assert.match(readFileSync(summary, "utf8"), deployed, `${verdict}: the step summary does not name the deployed Skill`);
    }
  });
});

describe("guard/F23 [guard/I5, guard/I7] standalone installation", () => {
  /** What lies under .agents/ and the like: every file whose path starts with one of these. */
  const under = (c, ...prefixes) => c.files().filter((p) => prefixes.some((x) => p.startsWith(x)));

  it("guard/T50 [guard/F23, guard/F24, guard/N10, guard/A14]: standalone init in a fresh repository installs the Skill only at .agents/skills/kaal-guard/, byte-identical to its catalogued content and equal to the package's source", () => {
    const c = consumer();
    const { source, files } = c.skill();
    const before = c.files();
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    const written = c.files().filter((p) => !before.includes(p) && p !== RECORD);
    assert.deepEqual(written, files.map((f) => `${SKILL}/${f}`), "init installed the Skill elsewhere, in part, or beside other files");
    assert.match(c.read(`${SKILL}/SKILL.md`), /^---\r?\nname: kaal-guard\r?\n/, "the installed Skill is not a SKILL.md named kaal-guard (guard/F24)");
    const catalogue = c.catalogue();
    const assets = c.installation();
    for (const f of files) {
      const path = `${SKILL}/${f}`;
      const bytes = readFileSync(join(c.dir, path));
      assert.ok(bytes.equals(readFileSync(join(source, f))), `${path} differs from the package's source`);
      assert.ok((catalogue[path] ?? []).includes(sha256(bytes)), `${path} is not catalogued content`);
      assert.deepEqual(assets[path], { sha256: sha256(bytes), version: c.version() }, `${path} is not registered with its SHA-256 and version`);
    }
  });

  it("guard/T51 [guard/F23, guard/F8, guard/A14]: init keeps a pre-existing .agents/skills/kaal-guard/SKILL.md, reports it, and installs no other Skill file", () => {
    const c = consumer();
    c.skill();
    const mine = "---\nname: kaal-guard\ndescription: the consumer's own.\n---\n\nMine.\n";
    c.write(`${SKILL}/SKILL.md`, mine);
    c.commit("a Skill of the consumer's own");
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.equal(c.read(`${SKILL}/SKILL.md`), mine, "init overwrote the consumer's SKILL.md");
    assert.match(init.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "init does not report the kept SKILL.md");
    assert.deepEqual(under(c, ".agents/"), [`${SKILL}/SKILL.md`], "init installed part of the Skill beside the consumer's");
    assert.deepEqual(Object.keys(c.installation()).filter((p) => p.startsWith(".agents/")), [], "init registered a Skill file it did not write");
  });

  it("guard/T52 [guard/F23, guard/F12, guard/A14]: upgrade moves unmodified Skill files forward and keeps a modified one; remove deletes only unmodified Skill files and the directories it emptied, and leaves other skills in .agents/skills/ untouched", () => {
    const c = consumer();
    const { source, files } = c.skill();
    c.write(".agents/skills/other/SKILL.md", "---\nname: other\ndescription: another skill.\n---\n");
    c.commit("another skill");
    assert.equal(c.guard(["init"]).status, 0, "init");
    c.commit("guard");
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    for (const f of files) assert.ok(readFileSync(join(c.dir, SKILL, f)).equals(readFileSync(join(source, f))), `upgrade left ${SKILL}/${f} behind the installed version's source`);
    const edited = `${c.read(`${SKILL}/SKILL.md`)}\nThe consumer's line.\n`;
    c.write(`${SKILL}/SKILL.md`, edited);
    assert.equal(c.guard(["upgrade"]).status, 0, "upgrade");
    assert.equal(c.read(`${SKILL}/SKILL.md`), edited, "upgrade overwrote a modified Skill file");
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(under(c, ".agents/"), [`${SKILL}/SKILL.md`, ".agents/skills/other/SKILL.md"], "remove did not delete exactly the unmodified Skill files");
    assert.equal(c.read(".agents/skills/other/SKILL.md"), "---\nname: other\ndescription: another skill.\n---\n", "remove touched another skill");

    const d = consumer();
    d.write(".agents/skills/other/SKILL.md", "---\nname: other\ndescription: another skill.\n---\n");
    assert.equal(d.guard(["init"]).status, 0, "init");
    assert.equal(d.guard(["remove"]).status, 0, "remove");
    assert.ok(!d.exists(SKILL), `remove left ${SKILL}/, which it emptied`);
    assert.ok(d.exists(".agents/skills/other/SKILL.md"), "remove deleted a directory it did not empty");
  });

  it("guard/T57 [guard/F23, guard/F8]: a modified deployment is kept and reported while the others move forward, and remove leaves it", () => {
    const c = consumer();
    const { source, files } = c.skill();
    assert.equal(c.guard(["init"]).status, 0, "init");
    c.commit("guard");
    const registered = c.installation()[`${SKILL}/SKILL.md`];
    const edited = `${c.read(`${SKILL}/SKILL.md`)}\nThe consumer's line.\n`;
    c.write(`${SKILL}/SKILL.md`, edited);
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "upgrade does not report the modified deployment");
    assert.deepEqual(c.installation()[`${SKILL}/SKILL.md`], registered, "upgrade re-registered the modified deployment");
    for (const f of files.filter((f) => f !== "SKILL.md")) assert.ok(readFileSync(join(c.dir, SKILL, f)).equals(readFileSync(join(source, f))), `upgrade did not move ${SKILL}/${f} forward`);
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.equal(c.read(`${SKILL}/SKILL.md`), edited, "remove deleted the modified deployment");
    assert.match(rm.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "remove does not report the modified deployment it kept");
  });

  it("guard/T53 [guard/F23, guard/N10, guard/N12, guard/A14]: the standalone lifecycle writes no supplier-specific location, even where such directories exist, and its report names the canonical path", () => {
    const c = consumer();
    c.skill();
    const suppliers = [".claude/skills/", ".github/skills/", ".cursor/", ".codex/", ".gemini/"];
    c.write(".claude/skills/mine/SKILL.md", "---\nname: mine\ndescription: the consumer's.\n---\n");
    c.write(".github/skills/mine/SKILL.md", "---\nname: mine\ndescription: the consumer's.\n---\n");
    c.commit("supplier locations of the consumer's own");
    const theirs = Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)]));
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.match(init.output, new RegExp(SKILL.replaceAll(".", "\\.")), "init does not name the canonical path");
    for (const command of ["upgrade", "remove"]) {
      assert.equal(c.guard([command]).status, 0, command);
      assert.deepEqual(Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)])), theirs, `${command} wrote a supplier-specific location`);
    }
    mkdirSync(join(c.dir, ".claude", "skills"), { recursive: true });
    assert.equal(c.guard(["init"]).status, 0, "init");
    assert.deepEqual(Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)])), theirs, "init wrote a supplier-specific location");
  });
});

describe("guard/F26 [guard/I1, guard/I7] agent instruction files", () => {
  it("guard/T54 [guard/F26]: init, upgrade and remove create, edit and remove no AGENTS.md, CLAUDE.md or other instruction file; init reports the canonical path and how an agent reaches it, and proposes no supplier-specific pointer", () => {
    const instructions = ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md", "GEMINI.md"];
    const fresh = consumer();
    fresh.skill();
    const init = fresh.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(instructions.filter((p) => fresh.exists(p)), [], "init created an instruction file");
    assert.match(init.output, new RegExp(SKILL.replaceAll(".", "\\.")), "init does not report the canonical path");
    assert.match(init.output, /reminder/i, "init does not say that an agent reaches the Skill through the reminder");
    assert.doesNotMatch(init.output, /CLAUDE\.md|\.claude[\\/]|copilot-instructions/, "init proposes a supplier-specific pointer");

    const c = consumer();
    for (const p of instructions) c.write(p, `# ${p}, the consumer's own\n`);
    c.commit("instruction files of the consumer's own");
    for (const command of ["init", "upgrade", "remove"]) {
      assert.equal(c.guard([command]).status, 0, command);
      for (const p of instructions) assert.equal(c.exists(p) ? c.read(p) : null, `# ${p}, the consumer's own\n`, `${command} changed ${p}`);
    }
  });
});

describe("guard/N1 [guard/I5] runtime prerequisite", () => {
  it("guard/T59 [guard/N1, guard/F27]: the package declares Node >=24; on an older Node every command exits as cannot judge, naming Node 24 as the next step, and the README states the prerequisite", () => {
    const c = given({ x: { command: exit(0), runs: ["hook", "ci"] } });
    const installed = join(c.dir, "node_modules", ...NAME.split("/"));
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).engines?.node, ">=24", "the package does not declare Node >=24");
    assert.match(readFileSync(join(installed, "README.md"), "utf8"), /Node(?:\.js)? 24\b/, "the README does not state Node 24");
    assert.match(readFileSync(join(installed, "contract.json"), "utf8"), /\b24\b/, "the contract does not state the runtime prerequisite");
    // An older Node, as the running command sees it: the preload replaces only the reported version.
    const preload = join(c.root, "node20.mjs");
    writeFileSync(preload, `Object.defineProperty(process, "versions", { value: { ...process.versions, node: "20.11.0" } });\nObject.defineProperty(process, "version", { value: "v20.11.0" });\n`);
    const old = { NODE_OPTIONS: `--import="${pathToFileURL(preload).href}"` };
    for (const args of [["run", "--hook"], ["run", "--check", "x"], ["verify"], ["init"], ["upgrade"], ["remove"]]) {
      const before = snapshot(c);
      const r = c.guard(args, old);
      assert.equal(r.status, 2, `${args.join(" ")} on Node 20: ${r.output}`);
      assert.match(r.output, /cannot judge/, `${args.join(" ")} on Node 20 is not cannot judge`);
      assert.match(r.output, /Node(?:\.js)? 24/, `${args.join(" ")} on Node 20 does not name Node 24 as the next step`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} on Node 20 changed something`);
    }
  });
});

// guard/T84–guard/T92 are planned in guard/C61, from the 0.0.2 release review, and written in guard/C63, before
// any correction. Each is registered in red.json until its Change (guard/C64–guard/C68): its RED is the
// evidence that establishes its suspected Defect, and a GREEN would refute it.

const WINDOWS = process.platform === "win32";

/** A symbolic link at `path` in `c` to `target`, or false where the host refuses to make one (Windows without the privilege). */
const link = (c, target, path) => {
  try {
    symlinkSync(target, join(c.dir, path), "file");
    return true;
  } catch (e) {
    if (WINDOWS && e.code === "EPERM") return false;
    throw e;
  }
};

/** Asserts that a command was cannot judge (exit 2), naming `entry`, with no stack trace and no verdict for `check`. */
const cannotJudge = (r, entry, what, check) => {
  assert.equal(r.status, 2, `${what}:\n${r.output}`);
  assert.match(r.output, /cannot judge/, what);
  assert.ok(r.output.includes(entry), `${what} does not name ${entry}:\n${r.output}`);
  assert.doesNotMatch(r.output, /^\s+at .+[(:]\d+/m, `${what} printed a stack trace:\n${r.output}`);
  if (check) assert.equal(verdicts(r.output)[check], undefined, `${what} gave ${check} a verdict:\n${r.output}`);
};

describe("guard/F28 [guard/I2, guard/I3, guard/I5] declarations that are not regular files", () => {
  it("guard/T84 [guard/F28, guard/F10]: a declaration that is a symbolic link, and a directory named <name>.md, in the configuration directory each make run --hook, run --ci and run --check cannot judge, naming the entry; neither is skipped", () => {
    const entries = {
      "linked.md": (c) => {
        c.write("elsewhere/linked.md", declaration({ command: exit(1, "the linked check fails"), runs: ["hook", "ci"] }));
        return link(c, join("..", "..", "..", "elsewhere", "linked.md"), `${CONFIG}/linked.md`);
      },
      "folder.md": (c) => (mkdirSync(join(c.dir, CONFIG, "folder.md")), writeFileSync(join(c.dir, CONFIG, "folder.md", "inside.txt"), "not a declaration\n"), true),
    };
    for (const [entry, make] of Object.entries(entries)) {
      const c = given({ ok: { command: exit(0), runs: ["hook", "ci"] } });
      if (!make(c)) continue;
      c.commit(entry);
      for (const args of [["run", "--hook"], ["run", "--ci"], ["run", "--check", "ok"]]) cannotJudge(c.guard(args), entry, `${entry}: ${args.join(" ")}`);
    }
  });
});

describe("guard/F27 and guard/F29 [guard/I5] Guard's bytes and mode in every clone", () => {
  it("guard/T85 [guard/F27, guard/F29, guard/F12]: in a clone with core.autocrlf=true, the hook, the workflow and the Skill Guard installed and committed keep the bytes Guard wrote: the hook runs under sh, and upgrade and remove treat each file as Guard's unmodified file", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.commit("Guard installed");
    assert.equal(c.git("push", "-q", "--no-verify", "origin", "main").status, 0);
    const clone = join(c.root, "crlf");
    const cloned = c.git("-c", "core.autocrlf=true", "clone", "-q", "-b", "main", "--config", "core.autocrlf=true", c.remote, clone);
    assert.equal(cloned.status, 0, cloned.output);
    assert.equal(c.git("-C", clone, "config", "--get", "core.autocrlf").stdout.trim(), "true");

    const assets = c.installation();
    for (const [path, { sha256: hash }] of Object.entries(assets)) {
      const bytes = readFileSync(join(clone, path));
      assert.ok(!bytes.includes("\r\n"), `the clone rewrote ${path} with CRLF line endings`);
      assert.equal(sha256(bytes), hash, `${path} in the clone is not the bytes Guard wrote`);
    }
    const sh = exec(clone, "sh", ["-n", ".githooks/pre-push"]);
    if (sh.status !== null) assert.equal(sh.status, 0, `the cloned hook does not parse under sh:\n${sh.output}`);

    const up = c.guard(["upgrade"], {}, clone);
    assert.equal(up.status, 0, up.output);
    for (const path of Object.keys(assets)) assert.ok(!up.output.includes(`kept ${path}`), `upgrade in the clone calls ${path} modified:\n${up.output}`);
    const rm = c.guard(["remove"], {}, clone);
    assert.equal(rm.status, 0, rm.output);
    for (const path of Object.keys(assets)) assert.ok(!existsSync(join(clone, path)), `remove in the clone kept ${path}:\n${rm.output}`);
  });

  it("guard/T86 [guard/F4, guard/F27]: where core.fileMode is false, init --hook reports git add --chmod=+x .githooks/pre-push, and after the consumer runs it a fresh clone with core.fileMode=true runs the hook on push", () => {
    const COMMAND = "git add --chmod=+x .githooks/pre-push";
    const c = consumer();
    assert.equal(c.git("config", "core.fileMode", "false").status, 0);
    const init = c.guard(["init", "--hook"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(init.output.includes(COMMAND), `init --hook does not report ${COMMAND}:\n${init.output}`);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    assert.equal(c.git("add", "-A").status, 0);
    assert.equal(c.git(...COMMAND.split(" ").slice(1)).status, 0, `${COMMAND} failed`);
    c.commit("Guard installed, hook recorded executable");
    assert.equal(c.git("push", "-q", "--no-verify", "origin", "main").status, 0);

    // A fresh clone that honours the mode Git recorded: with the consumer's own dependencies installed and the
    // hook enabled as the consumer would, a push there runs Guard's hook. Without the recorded mode Git skips it.
    const clone = join(c.root, "modes");
    const cloned = c.git("clone", "-q", "-b", "main", "--config", "core.fileMode=true", c.remote, clone);
    assert.equal(cloned.status, 0, cloned.output);
    assert.match(c.git("-C", clone, "ls-files", "-s", ".githooks/pre-push").stdout, /^100755 /, "the hook is not recorded executable");
    const installed = exec(clone, "npm", ["ci", "--no-audit", "--no-fund", "--offline"], c.env);
    assert.equal(installed.status, 0, `npm ci in the clone: ${installed.output}`);
    for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"], ["core.hooksPath", ".githooks"]]) {
      assert.equal(c.git("-C", clone, "config", k, v).status, 0, `git config ${k} in the clone`);
    }
    assert.equal(c.git("-C", clone, "commit", "-q", "--allow-empty", "-m", "from the clone").status, 0);
    const push = c.git("-C", clone, "push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", `a push from the fresh clone did not run Guard's hook:\n${push.output}`);
  });
});

describe("guard/F5 [guard/I2, guard/I3] Guard's workflow", () => {
  it("guard/T87 [guard/F5, guard/N1]: the workflow init --ci installs pins actions/checkout and actions/setup-node by commit SHA, uses Node 24, and has no ${{ expression in any run: line", () => {
    const c = given({ build: { command: exit(0), runs: ["ci"] } });
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    const lines = c.read(".github/workflows/guard.yml").split(/\r?\n/);
    const uses = lines.filter((l) => /^\s*-?\s*uses:/.test(l));
    for (const action of ["actions/checkout", "actions/setup-node"]) assert.ok(uses.some((l) => l.includes(`${action}@`)), `the workflow does not use ${action}`);
    for (const l of uses) assert.match(l, /uses: [\w.-]+\/[\w.-]+@[0-9a-f]{40}(\s|$)/, `not pinned by commit SHA: ${l.trim()}`);
    const versions = lines.filter((l) => /^\s*node-version:/.test(l));
    assert.ok(versions.length > 0, "the workflow names no node-version");
    for (const l of versions) assert.match(l, /node-version: ["']?24["']?\s*$/, `not Node 24: ${l.trim()}`);
    // A run: line, and every line of its block scalar, is shell: no GitHub expression may reach it.
    lines.forEach((l, i) => {
      const m = /^(\s*)(?:- )?run:/.exec(l);
      if (!m) return;
      const indent = m[1].length + (l.trimStart().startsWith("- ") ? 2 : 0);
      const block = [l];
      for (let j = i + 1; j < lines.length && (lines[j].trim() === "" || lines[j].search(/\S/) > indent); j++) block.push(lines[j]);
      for (const b of block) assert.ok(!b.includes("${{"), `a GitHub expression in a run: line: ${b.trim()}`);
    });
  });
});

describe("guard/F8 and guard/F13 [guard/I5] a missing registered asset", () => {
  it("guard/T88 [guard/F8, guard/F13]: after the registered hook is deleted, init --hook reinstalls it and reports it reinstalled, and a push runs it; after the registered Skill is deleted, upgrade reinstalls it", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.commit("Guard installed");
    rmSync(join(c.dir, ".githooks", "pre-push"));
    c.commit("hook lost");
    const init = c.guard(["init", "--hook"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(c.exists(".githooks/pre-push"), `init --hook did not reinstall the registered hook:\n${init.output}`);
    assert.match(init.output, /reinstalled[^\n]*\.githooks\/pre-push|\.githooks\/pre-push[^\n]*reinstalled/, `init --hook does not report the hook reinstalled:\n${init.output}`);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("hook back");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", `the reinstalled hook did not run:\n${push.output}`);

    const skill = `${SKILL}/SKILL.md`;
    assert.ok(c.installation()[skill], "init did not register the Skill");
    rmSync(join(c.dir, skill));
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.ok(c.exists(skill), `upgrade did not reinstall the registered Skill:\n${up.output}`);
    assert.match(up.output, /reinstalled/, `upgrade does not report the Skill reinstalled:\n${up.output}`);
  });
});

describe("guard/F10 and guard/F17 [guard/I2, guard/I5] unreadable workflows", () => {
  it("guard/T89 [guard/F10, guard/F17, guard/N4]: with a directory, and with a dangling link, named .github/workflows/x.yml, verify and init --ci are cannot judge (exit 2), naming the entry, and print no stack trace", () => {
    const entry = ".github/workflows/x.yml";
    const entries = {
      directory: (c) => (mkdirSync(join(c.dir, entry), { recursive: true }), writeFileSync(join(c.dir, entry, "inside.txt"), "not a workflow\n"), true),
      "dangling link": (c) => (mkdirSync(join(c.dir, ".github", "workflows"), { recursive: true }), link(c, "missing.yml", entry)),
    };
    for (const [kind, make] of Object.entries(entries)) {
      const c = given({ build: { command: exit(0), runs: ["ci"] } });
      assert.equal(c.guard(["init"]).status, 0);
      if (!make(c)) continue;
      cannotJudge(c.guard(["verify"]), "x.yml", `${kind}: verify`, "build");
      cannotJudge(c.guard(["init", "--ci"]), "x.yml", `${kind}: init --ci`);
      assert.ok(!c.exists(".github/workflows/guard.yml"), `${kind}: init --ci installed a workflow beside one it cannot read`);
    }
  });
});

describe("guard/F8 [guard/I5] remove and the configuration directory", () => {
  it("guard/T90 [guard/F8]: remove --config <dir>, for an empty directory inside and outside the repository, leaves that directory in place; plain remove after a bare init deletes the empty default .kaal/config/guard/", () => {
    const c = consumer();
    const inside = join(c.dir, "empty-config");
    const outside = join(c.root, "outside-config");
    for (const dir of [inside, outside]) {
      mkdirSync(dir);
      assert.equal(c.guard(["init"]).status, 0);
      const r = c.guard(["remove", "--config", dir]);
      assert.ok(existsSync(dir), `remove --config deleted ${dir}:\n${r.output}`);
    }

    const d = consumer();
    assert.equal(d.guard(["init"]).status, 0);
    assert.ok(d.exists(CONFIG), "a bare init did not create the default configuration directory");
    const rm = d.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.ok(!d.exists(CONFIG), "remove kept the empty default configuration directory");
  });
});

describe("guard/F2 [guard/I2] named outcomes", () => {
  it('guard/T91 [guard/F2, guard/F18]: an outcomes key "04", "+4" or "256" is refused as cannot judge, naming the canonical form, and "4" names exit 4 as held', () => {
    for (const [key, canonical] of [["04", '"4"'], ["+4", '"4"'], ["256", '"255"']]) {
      const c = given({ h: { command: exit(0), runs: ["hook", "ci"], outcomes: { [key]: "held" } } });
      for (const args of [["run", "--check", "h"], ["run", "--hook"], ["verify"]]) {
        const r = c.guard(args);
        cannotJudge(r, `${CONFIG}/h.md`, `"${key}": ${args.join(" ")}`, "h");
        assert.ok(r.output.includes(canonical), `"${key}": ${args.join(" ")} does not name ${canonical}:\n${r.output}`);
      }
    }
    const held = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook"], outcomes: { 4: "held" } } });
    assert.equal(verdicts(held.guard(["run", "--check", "h"]).output).h?.verdict, "held");
  });
});

describe("guard/N1 [guard/I5] Git prerequisite", () => {
  it("guard/T92 [guard/N1]: with a git that reports version 2.25, every command is cannot judge (exit 2), names Git 2.26, and changes nothing", () => {
    const c = given({ x: { command: exit(0), runs: ["hook", "ci"] } });
    // An older Git, as the running command sees it: like guard/T59's Node, the preload replaces only what
    // `git --version` reports through Node's child_process, on every host, and every other Git call is the real one.
    const preload = join(c.root, "git225.mjs");
    writeFileSync(preload, [
      'import { createRequire, syncBuiltinESMExports } from "node:module";',
      'const cp = createRequire(import.meta.url)("node:child_process");',
      'const asked = (file, args) => /(^|[\\\\/])git(\\.exe)?$/i.test(String(file)) && Array.isArray(args) && ["--version", "version"].includes(args[0]);',
      'const text = (options) => Boolean(options?.encoding) && options.encoding !== "buffer";',
      'const REPORT = "git version 2.25.0\\n";',
      'const { spawnSync, execFileSync } = cp;',
      'cp.spawnSync = (file, args, options) => (asked(file, args) ? { pid: 0, status: 0, signal: null, stdout: text(options) ? REPORT : Buffer.from(REPORT), stderr: text(options) ? "" : Buffer.alloc(0) } : spawnSync(file, args, options));',
      'cp.execFileSync = (file, args, options) => (asked(file, args) ? (text(options) ? REPORT : Buffer.from(REPORT)) : execFileSync(file, args, options));',
      "syncBuiltinESMExports();",
      "",
    ].join("\n"));
    const old = { NODE_OPTIONS: `--import="${pathToFileURL(preload).href}"` };
    const seen = exec(c.dir, process.execPath, ["--input-type=module", "-e", 'import { spawnSync } from "node:child_process"; process.stdout.write(spawnSync("git", ["--version"], { encoding: "utf8" }).stdout);'], old);
    assert.equal(seen.stdout.trim(), "git version 2.25.0", `the preload does not stand in for git --version: ${seen.output}`);
    for (const args of [["run", "--hook"], ["run", "--check", "x"], ["verify"], ["init"], ["init", "--hook"], ["upgrade"], ["remove"]]) {
      const before = snapshot(c);
      const r = c.guard(args, old);
      assert.equal(r.status, 2, `${args.join(" ")} on Git 2.25: ${r.output}`);
      assert.match(r.output, /cannot judge/, `${args.join(" ")} on Git 2.25 is not cannot judge`);
      assert.match(r.output, /Git 2\.26/, `${args.join(" ")} on Git 2.25 does not name Git 2.26 as the next step`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} on Git 2.25 changed something`);
    }
  });
});

describe("guard/N15 [guard/I1, guard/I5] no credential left behind", () => {
  it("guard/T119 [guard/N15, guard/F29]: every checkout in the installed workflow sets persist-credentials: false, and the installed workflow is catalogued beside every content published from 0.0.2 on", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    const workflow = c.read(".github/workflows/guard.yml");
    const steps = workflow.split(/\n(?=\s*- )/).filter((step) => /uses:\s*actions\/checkout@/.test(step));
    assert.ok(steps.length > 0, "the installed workflow has no checkout step");
    for (const step of steps) assert.match(step, /^\s*persist-credentials:\s*false\s*$/m, `a checkout step keeps the run's credential:\n${step}`);
    const catalogued = c.catalogue()[".github/workflows/guard.yml"] ?? [];
    assert.ok(catalogued.includes(sha256(Buffer.from(workflow))), "the installed workflow is not catalogued content");
    // The workflow's published contents from 0.0.2 on (0.0.1 has no catalogue; guard/I5): 0.0.2, then 0.0.3 and 0.0.4.
    for (const earlier of ["832be35f6d149493adfcb171fc159d707f762915f2e2cd57a159b2aeb8e14acf", "3635321ec5949c64b7a03206f5958a65d1351662b43baeb4efccb75131c59070"])
      assert.ok(catalogued.includes(earlier), `the catalogue no longer holds the earlier workflow content ${earlier}`);
  });
});

describe("guard/F41 [guard/I5] the version and the usage", () => {
  it("guard/T122 [guard/F41]: kaal-guard --version prints the installed version and kaal-guard --help prints the usage, each with exit 0, in a directory that is not a repository, which stays unchanged", () => {
    const c = consumer();
    const outside = mkdtempSync(join(tmpdir(), "kaal-guard-outside-"));
    try {
      writeFileSync(join(outside, "keep.txt"), "kept\n");
      const version = c.guard(["--version"], {}, outside);
      assert.equal(version.status, 0, `--version exited ${version.status}: ${version.output}`);
      assert.equal(version.stdout.trim(), c.version(), "--version does not print the installed version alone");
      const help = c.guard(["--help"], {}, outside);
      assert.equal(help.status, 0, `--help exited ${help.status}: ${help.output}`);
      assert.match(help.stdout, /^usage: kaal-guard run /m, "--help does not print the usage");
      for (const command of ["verify", "init", "remove", "upgrade"]) assert.match(help.stdout, new RegExp(`kaal-guard .*\\b${command}\\b`), `the usage does not name ${command}`);
      assert.deepEqual(readdirSync(outside), ["keep.txt"], "--version or --help wrote into the directory");
      assert.equal(readFileSync(join(outside, "keep.txt"), "utf8"), "kept\n");
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});
