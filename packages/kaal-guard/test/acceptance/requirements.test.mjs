// kaal-guard outer acceptance, Requirements verification: each test (T…) names the Functional (F…)
// or Nonfunctional (N…) Requirement it verifies; each describe names the Intent (I…) it serves. N1 is
// these tests on Linux, macOS and Windows; N6 is verified by T30. Planned in PLAN; DO and CHECK do not change them.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { consumer, sha256, verdicts } from "./harness.mjs";

const exit = (status, message = `exit ${status}`) => `node checks/exit.mjs ${status} ${message}`;

/** A consumer whose guard.json holds these checks, committed. */
function given(checks) {
  const c = consumer();
  c.checks(checks);
  c.commit("checks");
  return c;
}

describe("F1 [I1] check list", () => {
  it("T6 [F1]: runs the local checks for the hook and only the named check for CI", () => {
    const c = given({ a: { command: exit(0), runs: ["local"] }, b: { command: exit(0), runs: ["ci"] }, both: { command: exit(0), runs: ["local", "ci"] } });
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--local"]).output)).sort(), ["a", "both"]);
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)).sort(), ["b", "both"]);
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--check", "b"]).output)), ["b"]);
  });
});

describe("F2 [I2] verdicts", () => {
  it("T7 [F2]: names every exit status by its own verdict and never collapses one into another", () => {
    const c = given({
      s0: { command: exit(0), runs: ["local"] },
      s1: { command: exit(1), runs: ["local"] },
      s2: { command: exit(2), runs: ["local"] },
      s3: { command: exit(3), runs: ["local"] },
      s4held: { command: exit(4, "held by the Owner, see #1"), runs: ["local"], outcomes: { 4: "held" } },
      s4: { command: exit(4), runs: ["local"] },
      s7: { command: exit(7), runs: ["local"] },
    });
    const v = verdicts(c.guard(["run", "--local"]).output);
    assert.deepEqual(
      Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.verdict])),
      { s0: "pass", s1: "fail", s2: "cannot judge", s3: "not applicable", s4held: "held", s4: "cannot judge", s7: "cannot judge" },
    );
    assert.match(v.s4held.evidence, /held by the Owner, see #1/);
  });
});

describe("F3 [I2, I3] one runner", () => {
  it("T8 [F3]: serves the hook and CI from the same runner and the same list", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    assert.match(c.read(".githooks/pre-push"), /kaal-guard run --local/);
    assert.match(c.read(".github/workflows/guard.yml"), /kaal-guard run --check/);
  });
});

describe("F4 [I2, I3] local hook", () => {
  it("T9 [F4]: blocks a push on fail or cannot judge, says that CI decides, and is skipped by --no-verify", () => {
    for (const status of [1, 2]) {
      const c = consumer();
      assert.equal(c.guard(["init"]).status, 0);
      c.checks({ gate: { command: exit(status), runs: ["local"] } });
      c.commit("gate");
      const blocked = c.git("push", "origin", "main");
      assert.notEqual(blocked.status, 0, `status ${status} did not block the push`);
      assert.match(blocked.output, /CI decides/);
      assert.equal(c.git("push", "--no-verify", "origin", "main").status, 0);
    }
  });

  it("T10 [F4]: lets a push through when every local check passes or is not applicable", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["local"] }, na: { command: exit(3), runs: ["local"] } });
    c.commit("gate");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).na.verdict, "not applicable");
  });
});

describe("F5 [I2, I3] CI gate", () => {
  const ci = (status, outcomes) => {
    const c = given({ x: { command: exit(status, "evidence"), runs: ["ci"], ...(outcomes ? { outcomes } : {}) } });
    const summary = join(c.root, "summary.md");
    writeFileSync(summary, "");
    const r = c.guard(["run", "--check", "x", "--github"], { GITHUB_STEP_SUMMARY: summary });
    return { ...r, summary: readFileSync(summary, "utf8") };
  };

  it("T11 [F5]: fails the job on fail and on cannot judge", () => {
    for (const status of [1, 2]) {
      const r = ci(status);
      assert.notEqual(r.status, 0);
      assert.match(r.stdout, /::error/);
    }
  });

  it("T12 [F5]: reports not applicable as not applicable, never as a pass", () => {
    const r = ci(3);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /::notice[^\n]*not applicable/);
    assert.match(r.summary, /not applicable/);
    assert.doesNotMatch(r.summary, /\bpass/i);
  });

  it("T13 [F5]: reports held as a warning carrying its evidence, never as a pass", () => {
    const r = ci(4, { 4: "held" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /::warning[^\n]*held[^\n]*evidence/);
    assert.doesNotMatch(r.summary, /\bpass/i);
  });
});

describe("F6 [I3] narrow adapters", () => {
  it("T14 [F6]: the hook follows guard.json without being changed, and names no check", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    const hook = c.read(".githooks/pre-push");
    c.checks({ flips: { command: exit(0), runs: ["local"] } });
    c.commit("pass");
    assert.equal(c.git("push", "origin", "main").status, 0);
    c.checks({ flips: { command: exit(1), runs: ["local"] } });
    c.commit("fail");
    assert.notEqual(c.git("push", "origin", "main").status, 0);
    assert.equal(c.read(".githooks/pre-push"), hook);
    assert.doesNotMatch(hook, /flips/);
  });
});

describe("F7 [I1, I2] trusted checker", () => {
  it("T15 [F7]: runs the trusted checker as it stands on the base, never the candidate's version", () => {
    const c = consumer();
    c.write("checks/judge.mjs", "process.exit(1);\n");
    c.checks({ judge: { command: "node checks/judge.mjs", runs: ["ci"], facts: ["base"], trusted: "checks/judge.mjs" } });
    const base = c.commit("judge fails");
    c.write("checks/judge.mjs", "process.exit(0);\n");
    const head = c.commit("candidate certifies itself");
    const r = c.guard(["run", "--check", "judge", "--head", head, "--base", base, "--base-ref", "main"]);
    assert.equal(verdicts(r.output).judge?.verdict, "fail");
  });
});

describe("F8 [I5, I6] safe lifecycle", () => {
  it("T16 [F8]: records every file init writes, with its SHA-256", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    const { managed } = JSON.parse(c.read("guard.json"));
    assert.ok(managed && Object.keys(managed).length > 0, "guard.json records no managed files");
    for (const [path, hash] of Object.entries(managed)) assert.equal(sha256(readFileSync(join(c.dir, path))), hash, path);
  });

  it("T17 [F8]: never overwrites a pre-existing hook, workflow or core.hooksPath, and prints the line to add", () => {
    const c = consumer();
    c.write(".githooks/pre-push", "#!/bin/sh\necho mine\n");
    c.write(".github/workflows/guard.yml", "name: mine\n");
    c.git("config", "core.hooksPath", "hooks-of-mine");
    c.commit("mine");
    const r = c.guard(["init"]);
    assert.equal(c.read(".githooks/pre-push"), "#!/bin/sh\necho mine\n");
    assert.equal(c.read(".github/workflows/guard.yml"), "name: mine\n");
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), "hooks-of-mine");
    assert.match(r.output, /\.githooks\/pre-push/);
    assert.match(r.output, /kaal-guard run --local/);
  });

  it("T18 [F8]: upgrade and remove touch only unmodified managed files, and remove unsets only the core.hooksPath it set", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
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

describe("F9 [I2] execution contract", () => {
  it("T19 [F9]: gives a check only its facts, from the repository root, with no stdin, wherever it is started", () => {
    const c = given({ facts: { command: "node checks/facts.mjs facts.json", runs: ["local", "ci"] } });
    c.write("changed.txt", "a.txt\0dir/b.txt\0");
    const args = ["run", "--check", "facts", "--head", "h", "--base", "b", "--base-ref", "main", "--changed", join(c.dir, "changed.txt")];
    const seen = [];
    for (const [cwd, extra] of [[c.dir, {}], [join(c.dir, "checks"), { GITHUB_ACTIONS: "true", CI: "true" }]]) {
      assert.equal(c.guard(args, extra, cwd).status, 0);
      seen.push(JSON.parse(c.read("facts.json")));
    }
    for (const s of seen) {
      assert.equal(s.cwd, c.dir);
      assert.equal(s.stdin, "");
      assert.deepEqual(Object.keys(s.guard).sort(), ["GUARD_BASE", "GUARD_BASE_REF", "GUARD_CHANGED", "GUARD_HEAD"]);
      assert.deepEqual([s.guard.GUARD_HEAD, s.guard.GUARD_BASE, s.guard.GUARD_BASE_REF], ["h", "b", "main"]);
      assert.deepEqual(s.changed, ["a.txt", "dir/b.txt"]);
    }
  });

  it("T20 [F9]: the hook prints the base commit it used", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["local"] } });
    c.commit("ok");
    const base = c.git("rev-parse", "origin/main").stdout.trim();
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.match(push.output, new RegExp(base));
  });
});

describe("F10 [I2, I4] no silent gate", () => {
  it("T21 [F10]: a command that cannot start is cannot judge, and it blocks", () => {
    const c = given({ ghost: { command: "a-command-that-does-not-exist-anywhere", runs: ["local"] } });
    const r = c.guard(["run", "--local"]);
    assert.equal(verdicts(r.output).ghost?.verdict, "cannot judge");
    assert.notEqual(r.status, 0);
  });

  it("T22 [F10]: a declared fact that is not supplied is cannot judge", () => {
    const c = given({ needs: { command: exit(0), runs: ["ci"], facts: ["base"] } });
    assert.equal(verdicts(c.guard(["run", "--check", "needs"]).output).needs?.verdict, "cannot judge");
  });

  it("T23 [F10]: a check that is not in guard.json is cannot judge", () => {
    const c = given({ known: { command: exit(0), runs: ["ci"] } });
    const r = c.guard(["run", "--check", "unknown"]);
    assert.equal(verdicts(r.output).unknown?.verdict, "cannot judge");
    assert.notEqual(r.status, 0);
  });

  it("T24 [F10]: verify fails on a ci check that no workflow job names (static configuration coverage only)", () => {
    const c = consumer();
    assert.equal(c.guard(["init"]).status, 0);
    c.checks({ orphan: { command: exit(0), runs: ["ci"] } });
    c.write(".github/workflows/guard.yml", "name: CI\non: pull_request\njobs: {}\n");
    c.commit("orphan");
    const r = c.guard(["verify"]);
    assert.notEqual(r.status, 0);
    assert.match(r.output, /orphan/);
  });
});

describe("N2 to N4", () => {
  it("T25 [N2]: the same run twice prints the same verdicts", () => {
    const c = given({ a: { command: exit(1, "same"), runs: ["local"] }, b: { command: exit(3, "same"), runs: ["local"] } });
    assert.equal(c.guard(["run", "--local"]).output, c.guard(["run", "--local"]).output);
  });

  it("T26 [N3]: no state beyond the repository and core.hooksPath", () => {
    const c = consumer();
    const config = () => c.git("config", "--local", "--list").stdout.split(/\r?\n/).filter(Boolean).sort();
    const before = config();
    const home = readdirSync(c.home).sort();
    assert.equal(c.guard(["init"]).status, 0);
    c.checks({ a: { command: exit(0), runs: ["local"] } });
    c.guard(["run", "--local"]);
    assert.deepEqual(config().filter((l) => !before.includes(l)), ["core.hookspath=.githooks"]);
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(config(), before);
    assert.deepEqual(readdirSync(c.home).sort(), home);
  });

  it("T27 [N4]: every fail or cannot-judge verdict says what to do next", () => {
    const c = given({ f: { command: exit(1), runs: ["local"] }, cj: { command: exit(2), runs: ["local"] } });
    const lines = c.guard(["run", "--local"]).output.split(/\r?\n/);
    for (const name of ["f", "cj"]) {
      const at = lines.findIndex((l) => new RegExp(`^(fail|cannot judge): ${name}:`).test(l.trim()));
      assert.ok(at >= 0, `no verdict for ${name}`);
      assert.match(lines[at + 1] ?? "", /^\s+do: \S/);
    }
  });
});
