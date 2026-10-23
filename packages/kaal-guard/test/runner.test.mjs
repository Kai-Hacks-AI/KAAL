// Inner Code tests of the runner, commands, trusted checkers and GitHub reporting. They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { annotations, summarize } from "../lib/github.mjs";
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
    assert.equal(results[2].evidence, "on hold");
    assert.equal(status(results), 0);
    assert.equal(status([{ verdict: "cannot judge" }, { verdict: "fail" }]), 1);
    assert.equal(status([{ verdict: "cannot judge" }, { verdict: "pass" }]), 2);
  });

  it("says that a check printed nothing", () => {
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

  it("trusts a directory: the base's helper is used, not the candidate's", () => {
    const { dir, base, git } = based(judge("checks"), {
      "checks/judge.mjs": 'import { status } from "./helper.mjs"; process.exit(status);\n',
      "checks/helper.mjs": "export const status = 1;\n",
    });
    write(dir, "checks/helper.mjs", "export const status = 0;\n");
    git("commit", "-qam", "candidate certifies itself");
    assert.equal(verdict(dir, base).verdict, "fail");
  });

  it("is cannot judge when the trusted file imports a file it does not trust", () => {
    const { dir, base } = based(judge("checks/judge.mjs"), {
      "checks/judge.mjs": 'import { status } from "./helper.mjs"; process.exit(status);\n',
      "checks/helper.mjs": "export const status = 0;\n",
    });
    const r = verdict(dir, base);
    assert.equal(r.verdict, "cannot judge");
    assert.match(r.evidence, /imports \.\/helper\.mjs, which is not among the trusted files/);
  });

  it("is cannot judge for a package import, a computed import or a non-module file", () => {
    for (const [file, text, said] of [
      ["checks/judge.mjs", 'import x from "some-package";\n', /some-package/],
      ["checks/judge.mjs", "const m = await import(process.env.X);\n", /names at run time/],
      ["checks/judge.mjs", "const m = require(name);\n", /names at run time/],
      ["checks/judge.sh", "exit 0\n", /not a JavaScript or TypeScript module/],
    ]) {
      const { dir, base } = based(judge(file, `node ${file}`), { [file]: text });
      const r = verdict(dir, base);
      assert.equal(r.verdict, "cannot judge", file);
      assert.match(r.evidence, said);
    }
  });

  it("allows node: built-ins and literal imports inside the trusted files", () => {
    const { dir, base } = based(judge("checks"), {
      "checks/judge.mjs": 'import { readFileSync } from "node:fs";\nconst { ok } = await import("./sub/ok.mjs");\nprocess.exit(ok);\n',
      "checks/sub/ok.mjs": "export const ok = 0;\n",
    });
    assert.equal(verdict(dir, base).verdict, "pass");
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
