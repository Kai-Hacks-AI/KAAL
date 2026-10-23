// Inner Code tests of the runner, commands, trusted checkers and GitHub reporting. They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { annotations, summarize, verify } from "../lib/github.mjs";
import { plan, words } from "../lib/command.mjs";
import { findRoot, lines, readList, run, status } from "../lib/runner.mjs";

/** A directory holding guard.json with these checks. */
function repo(checks) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-guard-inner-"));
  writeFileSync(join(dir, "guard.json"), JSON.stringify({ checks }));
  return dir;
}

const node = (code) => `node -e "${code}"`;

describe("words", () => {
  it("splits on whitespace and lets quotes group a word", () => {
    assert.deepEqual(words(`node a.mjs "b c" 'd e' #1`), ["node", "a.mjs", "b c", "d e", "#1"]);
    assert.deepEqual(words(`x "a\\"b"`), ["x", 'a"b']);
    assert.deepEqual(words(`x ""`), ["x", ""]);
  });

  it("refuses a quote that is not closed", () => {
    assert.equal(words(`x "a`), undefined);
  });
});

describe("guard.json", () => {
  it("is found from a subdirectory", () => {
    const dir = repo({});
    assert.equal(findRoot(join(dir, "a", "b")), dir);
  });

  it("names what is wrong with a check", () => {
    for (const [check, said] of [
      [{ runs: ["ci"] }, /no command/],
      [{ command: "x", runs: ["nightly"] }, /runs/],
      [{ command: "x", runs: ["ci"], facts: ["time"] }, /facts/],
      [{ command: "x", runs: ["ci"], outcomes: { 1: "held" } }, /outcomes/],
      [{ command: "x", runs: ["ci"], outcomes: { 4: "ignored" } }, /outcomes/],
    ]) assert.match(readList(repo({ c: check })).problem, said);
    assert.match(readList(repo({ "a b": { command: "x", runs: ["ci"] } })).problem, /no spaces or colons/);
  });
});

describe("run", () => {
  it("gives each verdict its own name and the run the worst status", () => {
    const dir = repo({
      p: { command: node("process.exit(0)"), runs: ["local"] },
      n: { command: node("process.exit(3)"), runs: ["local"] },
      h: { command: node("console.log('on hold');process.exit(4)"), runs: ["local"], outcomes: { 4: "held" } },
    });
    const { results } = run(dir, { local: true }, {});
    assert.deepEqual(results.map((r) => r.verdict), ["pass", "not applicable", "held"]);
    assert.equal(results[2].evidence, "exit status 4");
    assert.equal(status(results), 0);
    assert.equal(status([{ verdict: "cannot judge" }, { verdict: "fail" }]), 1);
    assert.equal(status([{ verdict: "cannot judge" }, { verdict: "pass" }]), 2);
  });

  it("passes a check's output through on standard error and takes the verdict from its exit status alone", () => {
    const bin = fileURLToPath(new URL("../bin/kaal-guard.mjs", import.meta.url));
    const dir = repo({
      s: { command: node("console.log('all is well');console.error('really');process.exit(1)"), runs: ["ci"] },
    });
    const r = spawnSync(process.execPath, [bin, "run", "--ci"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /all is well/);
    assert.match(r.stderr, /really/);
    assert.equal(r.stdout, "fail: s: exit status 1\n  do: fix what s reports, then run kaal-guard run --check s\n");
  });

  it("gives the exit status as evidence", () => {
    const { results } = run(repo({ q: { command: node("process.exit(1)"), runs: ["ci"] } }), { ci: true }, {});
    assert.deepEqual(lines(results), ["fail: q: exit status 1", "  do: fix what q reports, then run kaal-guard run --check q"]);
  });

  it("is cannot judge when a trusted checker has no base", () => {
    const { results } = run(repo({ t: { command: "node t.mjs", runs: ["ci"], trusted: "t.mjs" } }), { check: "t" }, {});
    assert.equal(results[0].verdict, "cannot judge");
    assert.match(results[0].do, /--base/);
  });
});

describe("command", () => {
  const win = (files, env = {}) => ({ root: "C:\\repo", platform: "win32", env: { Path: "C:\\bin;C:\\node", PATHEXT: ".EXE;.CMD", ...env }, exists: (p) => files.includes(p) });

  it("starts the program directly, with its arguments as words, outside Windows", () => {
    assert.deepEqual(plan(["node", "a b", "#1"], { root: "/r", platform: "linux" }), { file: "node", args: ["a b", "#1"], options: {} });
  });

  it("starts a Windows .exe directly, as found on PATH", () => {
    const p = plan(["node", "x.mjs", "a&b"], win(["C:\\node\\node.exe"]));
    assert.deepEqual(p, { file: "C:\\node\\node.exe", args: ["x.mjs", "a&b"], options: {} });
  });

  it("runs a Windows .cmd under cmd with every word quoted", () => {
    const p = plan(["npm", "run", "test:unit"], win(["C:\\node\\npm.cmd"], { ComSpec: "C:\\cmd.exe" }));
    assert.deepEqual(p, { file: "C:\\cmd.exe", args: ["/d", "/s", "/c", '""C:\\node\\npm.cmd" "run" "test:unit""'], options: { windowsVerbatimArguments: true } });
  });

  it("refuses a .cmd argument that cmd would read as syntax", () => {
    for (const arg of ["a&b", "x|y", "%PATH%", "<in", "say \"hi\"", "^", "!x!"]) {
      assert.match(plan(["npm", arg], win(["C:\\node\\npm.cmd"])).problem, /cmd would read as syntax/, arg);
    }
  });

  it("leaves a program it cannot find to fail to start", () => {
    assert.deepEqual(plan(["ghost"], win([])), { file: "ghost", args: [], options: {} });
  });
});

describe("trusted checker", () => {
  /** A Git repository with guard.json and these files committed as the base; returns { dir, base }. */
  function based(checks, files) {
    const dir = repo(checks);
    const git = (...args) => assert.equal(spawnSync("git", args, { cwd: dir }).status, 0, args.join(" "));
    git("init", "-q");
    git("config", "user.email", "t@example.invalid");
    git("config", "user.name", "t");
    for (const [path, text] of Object.entries(files)) write(dir, path, text);
    git("add", "-A");
    git("commit", "-q", "-m", "base");
    return { dir, base: spawnSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).stdout.trim(), git };
  }
  const write = (dir, path, text) => (mkdirSync(join(dir, path, ".."), { recursive: true }), writeFileSync(join(dir, path), text));
  const judge = (trusted, command = "node checks/judge.mjs") => ({ j: { command, runs: ["ci"], trusted } });
  const verdict = (dir, base) => run(dir, { check: "j" }, { base }).results[0];

  it("takes a trusted directory from the base: the base's helper runs, not the candidate's", () => {
    const { dir, base, git } = based(judge("checks"), {
      "checks/judge.mjs": 'import { status } from "./helper.mjs"; process.exit(status);\n',
      "checks/helper.mjs": "export const status = 1;\n",
    });
    write(dir, "checks/helper.mjs", "export const status = 0;\n");
    git("commit", "-qam", "candidate certifies itself");
    assert.equal(verdict(dir, base).verdict, "fail");
  });

  it("names the base revision that supplied the checker in its evidence", () => {
    const { dir, base } = based(judge("checks/judge.mjs"), { "checks/judge.mjs": 'console.log("judged"); process.exit(0);\n' });
    const r = verdict(dir, base);
    assert.equal(r.verdict, "pass");
    assert.equal(r.evidence, `exit status 0 (checks/judge.mjs from base ${base})`);
  });

  it("is cannot judge when the base or the checker on it cannot be obtained", () => {
    const { dir, base } = based(judge("checks/judge.mjs"), { "checks/other.mjs": "process.exit(0);\n" });
    assert.match(verdict(dir, base).evidence, /does not hold checks\/judge\.mjs/);
    assert.match(verdict(dir, "0000000000000000000000000000000000000000").evidence, /is not a commit here/);
  });

  it("is cannot judge when no word of the command names the trusted path", () => {
    const { dir, base } = based(judge("checks/judge.mjs", "node xchecks/judge.mjs"), { "checks/judge.mjs": "process.exit(0);\n" });
    assert.match(verdict(dir, base).evidence, /does not name its trusted checker/);
  });

  it("refuses a trusted path outside the repository", () => {
    assert.match(readList(repo({ j: { command: "node x.mjs", runs: ["ci"], trusted: "../x.mjs" } })).problem, /inside the repository/);
  });
});

describe("GitHub reporting", () => {
  it("annotates every verdict but a pass, escaping what GitHub would read as syntax", () => {
    const out = annotations([
      { name: "a", verdict: "pass", evidence: "ok" },
      { name: "b", verdict: "fail", evidence: "50% done\nnext", do: "fix" },
      { name: "c", verdict: "held", evidence: "see #1" },
    ]);
    assert.deepEqual(out, ["::error title=fail%3A b::50%25 done%0Anext (do: fix)", "::warning title=held%3A c::see #1"]);
  });

  it("writes each verdict to the step summary by its own name", () => {
    const file = join(mkdtempSync(join(tmpdir(), "kaal-guard-summary-")), "summary.md");
    writeFileSync(file, "");
    summarize([{ name: "x", verdict: "not applicable", evidence: "a | b" }, { name: "y", verdict: "pass", evidence: "C:\\dir\\| z" }], file);
    const text = readFileSync(file, "utf8");
    assert.match(text, /\| x \| not applicable \| a \\\| b \|/);
    assert.ok(text.includes("| y | pass | C:\\\\dir\\\\\\| z |"), text);
  });
});

describe("verify", () => {
  /** A repository with these checks and these workflow files; returns verify's results by check. */
  const verified = (checks, workflows) => {
    const dir = repo(checks);
    for (const [file, text] of Object.entries(workflows)) {
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      writeFileSync(join(dir, ".github", "workflows", file), text);
    }
    return Object.fromEntries(verify(dir, readList(dir).list).results.map((r) => [r.name, r]));
  };
  const verdicts = (checks, workflows) => Object.fromEntries(Object.entries(verified(checks, workflows)).map(([n, r]) => [n, r.verdict]));
  const ci = { command: "x", runs: ["ci"] };
  const job = (...lines) => `on: push\njobs:\n  a:\n${lines.map((l) => `    ${l}`).join("\n")}\n`;

  it("passes a ci check a step's run: command references, inline or in a block, and fails one nothing references", () => {
    const wf = job("steps:", "  - run: npx kaal-guard run --check inline --github", "  - run: |", "      B=$(git rev-parse HEAD)", "      npx --no kaal-guard run --check block --base \"$B\"");
    assert.deepEqual(verdicts({ inline: ci, block: ci, orphan: ci, mine: { command: "x", runs: ["local"] } }, { "ci.yml": wf }), { inline: "pass", block: "pass", orphan: "fail" });
  });

  it("reads --check ${{ matrix.check }} from the job's matrix check: entries", () => {
    const wf = job("strategy:", "  matrix:", "    include:", "      - { check: one, script: \"x\" }", "      - check: two", "steps:", "  - run: npx --no kaal-guard run --check ${{ matrix.check }} --github");
    assert.deepEqual(verdicts({ one: ci, two: ci, three: ci }, { "ci.yaml": wf }), { one: "pass", two: "pass", three: "fail" });
  });

  it("references nothing outside the convention, rather than guess", () => {
    const wf = job(
      "name: kaal-guard run --check named",
      "env:",
      "  X: kaal-guard run --check env",
      "strategy:",
      "  matrix:",
      "    name: [other]",
      "steps:",
      "  - run: echo kaal-guard run --check echoed",
      "  - run: npx kaal-guard run --check \"quoted\"",
      "  - run: npx kaal-guard run --check ${{ inputs.check }}",
      "  - run: npx kaal-guard run --check ${{ matrix.name }}",
      "  - run: |",
      "      # npx kaal-guard run --check commented",
      "      true",
    );
    const top = "# kaal-guard run --check top\non: push\n" + wf.replace("on: push\n", "");
    const checks = Object.fromEntries(["named", "env", "echoed", "quoted", "other", "commented", "top"].map((n) => [n, ci]));
    assert.ok(Object.values(verdicts(checks, { "ci.yml": top })).every((v) => v === "fail"));
    assert.deepEqual(verdicts({ any: ci }, {}), { any: "fail" });
  });

  it("claims a static reference only, never that the job runs or is required", () => {
    const r = verified({ c: ci }, { "ci.yml": job("if: false", "steps:", "  - if: false", "    run: npx kaal-guard run --check c") }).c;
    assert.equal(r.verdict, "pass");
    assert.equal(r.evidence, "statically referenced by job a in .github/workflows/ci.yml; whether GitHub runs or requires that job is outside verify");
  });
});
