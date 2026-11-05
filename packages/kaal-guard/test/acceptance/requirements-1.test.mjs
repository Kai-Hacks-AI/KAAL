// Part 1 of 4 of the Requirements verification. guard/C142 moved these cases here from requirements.test.mjs, unchanged, so that node --test runs the four parts in parallel.
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
import { CONFIG, consumer, declaration, exec, NAME, PACKAGE, RECORD, sha256, SKILL, tree, verdicts } from "./harness.mjs";
import { exit, given, state, extra, named } from "./requirements-support.mjs";


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
      s4held: { command: exit(4, "held by the Owner, see #1"), runs: ["hook"], held: [4] },
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
    const c = given({ x: { command: exit(status, "evidence"), runs: ["ci"], ...(outcomes ? { held: Object.keys(outcomes).map(Number) } : {}) } });
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

  it("guard/T81 [guard/F7, guard/D5]: a trusted checker Git records as executable keeps that mode in its base copy, so a check that runs it directly passes on the base's verdict", () => {
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

  it("guard/T94 [guard/F7, guard/N4, guard/D16]: a candidate that drops trusted from a trusted check's declaration is cannot judge, names the check, says to land the declaration change on its own, and its checker never runs", () => {
    const { c, r, judged } = candidate((c) => {
      c.write("checks/judge.mjs", checker("judge-ran", 0));
      c.checks({ judge: { ...judge, trusted: undefined }, other });
    });
    assert.equal(judged?.verdict, "cannot judge", r.output);
    assert.equal(r.status, 2, r.output);
    assert.match(judged.evidence, /on its own/i, "the verdict does not say to land the declaration change on its own");
    assert.ok(!c.exists("judge-ran"), "a checker ran for a trusted check whose declaration the candidate changed");
  });

  it("guard/T95 [guard/F7, guard/N4, guard/D16]: a candidate that changes a trusted check's command, or adds a held entry, is cannot judge, naming the check, and neither command runs", () => {
    const rewritten = candidate((c) => {
      c.write("checks/certify.mjs", checker("certify-ran", 0));
      c.checks({ judge: { ...judge, command: "node checks/certify.mjs" }, other });
    });
    assert.equal(rewritten.judged?.verdict, "cannot judge", rewritten.r.output);
    assert.notEqual(rewritten.r.status, 0, rewritten.r.output);
    assert.ok(!rewritten.c.exists("certify-ran"), "the candidate's command ran");
    assert.ok(!rewritten.c.exists("judge-ran"), "the base's command ran for a declaration the candidate changed");

    // The base's checker exits 4, cannot judge on the base; the candidate's held entry would make it held.
    const softened = candidate((c) => c.checks({ judge: { ...judge, held: [4] }, other }), 4);
    assert.equal(softened.judged?.verdict, "cannot judge", softened.r.output);
    assert.notEqual(softened.r.status, 0, softened.r.output);
    assert.ok(!softened.c.exists("judge-ran"), "the checker ran for a declaration the candidate changed");
  });

  it("guard/T96 [guard/F7, guard/N4, guard/D16]: a candidate that deletes a trusted check's declaration is cannot judge, naming the check, and the run does not pass", () => {
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
