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
import { CONFIG, readDeclarations } from "../lib/config.mjs";
import { lines, run, status } from "../lib/runner.mjs";

/** One declaration's file for a check, in the frontmatter subset. */
function declare(check) {
  const l = ["type: Guard/Check", `command: ${JSON.stringify(check.command)}`, `runs: [${check.runs.join(", ")}]`];
  if (check.facts) l.push(`facts: [${check.facts.join(", ")}]`);
  if (check.trusted !== undefined) l.push(`trusted: ${JSON.stringify(check.trusted)}`);
  if (check.outcomes) l.push(`outcomes: {${Object.entries(check.outcomes).map(([k, v]) => `${k}: ${v}`).join(", ")}}`);
  return `---\n${l.join("\n")}\n---\n`;
}

/** A Git working tree declaring these checks in its configuration directory. */
function repo(checks) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-guard-inner-"));
  spawnSync("git", ["init", "-q", dir]);
  mkdirSync(join(dir, CONFIG), { recursive: true });
  for (const [name, check] of Object.entries(checks)) writeFileSync(join(dir, CONFIG, `${name}.md`), declare(check));
  return dir;
}

/** The declared list of a repository from repo(). */
const declared = (dir) => readDeclarations(dir, join(dir, CONFIG)).list;

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

describe("run", () => {
  it("gives each verdict its own name and the run the worst status", () => {
    const dir = repo({
      p: { command: node("process.exit(0)"), runs: ["local"] },
      n: { command: node("process.exit(3)"), runs: ["local"] },
      h: { command: node("console.log('on hold');process.exit(4)"), runs: ["local"], outcomes: { 4: "held" } },
    });
    const { results } = run(dir, declared(dir), { local: true }, {});
    assert.deepEqual(results.map((r) => [r.name, r.verdict]), [["h", "held"], ["n", "not applicable"], ["p", "pass"]], "not in name order");
    assert.equal(results[0].evidence, "exit status 4");
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
    const dir = repo({ q: { command: node("process.exit(1)"), runs: ["ci"] } });
    const { results } = run(dir, declared(dir), { ci: true }, {});
    assert.deepEqual(lines(results), ["fail: q: exit status 1", "  do: fix what q reports, then run kaal-guard run --check q"]);
  });

  it("is cannot judge when a trusted checker has no base", () => {
    const dir = repo({ t: { command: "node t.mjs", runs: ["ci"], trusted: "t.mjs" } });
    const { results } = run(dir, declared(dir), { check: "t" }, {});
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
  /** A Git repository with these checks declared and these files committed as the base; returns { dir, base }. */
  function based(checks, files) {
    const dir = repo(checks);
    const git = (...args) => assert.equal(spawnSync("git", args, { cwd: dir }).status, 0, args.join(" "));
    git("config", "user.email", "t@example.invalid");
    git("config", "user.name", "t");
    for (const [path, text] of Object.entries(files)) write(dir, path, text);
    git("add", "-A");
    git("commit", "-q", "-m", "base");
    return { dir, base: spawnSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).stdout.trim(), git };
  }
  const write = (dir, path, text) => (mkdirSync(join(dir, path, ".."), { recursive: true }), writeFileSync(join(dir, path), text));
  const judge = (trusted, command = "node checks/judge.mjs") => ({ j: { command, runs: ["ci"], trusted } });
  const verdict = (dir, base) => run(dir, declared(dir), { check: "j" }, { base }).results[0];

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
    return Object.fromEntries(verify(dir, declared(dir)).results.map((r) => [r.name, r]));
  };
  const verdicts = (checks, workflows) => Object.fromEntries(Object.entries(verified(checks, workflows)).map(([n, r]) => [n, r.verdict]));
  const ci = { command: "x", runs: ["ci"] };
  const job = (...lines) => `on: push\njobs:\n  a:\n${lines.map((l) => `    ${l}`).join("\n")}\n`;

  it("passes a ci check a step declares in Guard's form, and fails one nothing declares", () => {
    const wf = job("steps:", "  - run: npx kaal-guard run --check plain --github", "  - name: n", "    run: npx --no kaal-guard run --check named", "  - run: kaal-guard run --check bare");
    assert.deepEqual(verdicts({ plain: ci, named: ci, bare: ci, orphan: ci, mine: { command: "x", runs: ["local"] } }, { "ci.yml": wf }), { plain: "pass", named: "pass", bare: "pass", orphan: "fail" });
  });

  it("reads --check ${{ matrix.check }} from the job's - { check: <name> } lines", () => {
    const wf = job("strategy:", "  matrix:", "    include:", "      - { check: one, script: \"x\" }", "      - {check: two}", "      - check: three", "steps:", "  - run: npx --no kaal-guard run --check ${{ matrix.check }} --github");
    assert.deepEqual(verdicts({ one: ci, two: ci, three: ci }, { "ci.yaml": wf }), { one: "pass", two: "pass", three: "fail" });
  });

  it("infers nothing from scripts or other YAML: only the declared form declares", () => {
    const wf = job(
      "name: kaal-guard run --check named",
      "env:",
      "  X: kaal-guard run --check env",
      "strategy:",
      "  matrix:",
      "    include:",
      "      - { name: other }",
      "steps:",
      "  - run: echo kaal-guard run --check echoed",
      "  - run: npx kaal-guard run --check \"quoted\"",
      "  - run: npx kaal-guard run --check ${{ inputs.check }}",
      "  - run: npx kaal-guard run --check ${{ matrix.name }}",
      "  - run: |",
      "      npx kaal-guard run --check scripted",
      "  - run: x && npx kaal-guard run --check chained",
      "  # - run: npx kaal-guard run --check commented",
    );
    const top = "# - run: npx kaal-guard run --check top\non: push\n" + wf.replace("on: push\n", "");
    const checks = Object.fromEntries(["named", "env", "echoed", "quoted", "other", "scripted", "chained", "commented", "top"].map((n) => [n, ci]));
    assert.ok(Object.values(verdicts(checks, { "ci.yml": top })).every((v) => v === "fail"));
    assert.deepEqual(verdicts({ any: ci }, {}), { any: "fail" });
  });

  it("claims declared integration only, never that GitHub ran or requires the job", () => {
    const r = verified({ c: ci }, { "ci.yml": job("if: false", "steps:", "  - if: false", "    run: npx kaal-guard run --check c") }).c;
    assert.equal(r.verdict, "pass");
    assert.equal(r.evidence, "declared by job a in .github/workflows/ci.yml; declared integration only, not that GitHub ran or requires that job");
  });
});

describe("list --undeclared", () => {
  const bin = fileURLToPath(new URL("../bin/kaal-guard.mjs", import.meta.url));

  it("prints the ci checks no job declares by name, and with --github writes them as the step's output", () => {
    const dir = repo({ a: { command: "x", runs: ["ci"] }, b: { command: "x", runs: ["ci"] }, l: { command: "x", runs: ["local"] } });
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "jobs:\n  own:\n    steps:\n      - run: npx --no kaal-guard run --check a\n");
    const out = join(dir, "..", `${dir.split(/[\\/]/).pop()}-output`);
    writeFileSync(out, "");
    const r = spawnSync(process.execPath, [bin, "list", "--undeclared", "--github"], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_OUTPUT: out } });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(r.stdout, '["b"]\n');
    assert.equal(readFileSync(out, "utf8"), 'checks=["b"]\n');
  });

  it("is cannot judge without --undeclared, and with --github outside a step", () => {
    const dir = repo({});
    assert.equal(spawnSync(process.execPath, [bin, "list"], { cwd: dir }).status, 2);
    const r = spawnSync(process.execPath, [bin, "list", "--undeclared", "--github"], { cwd: dir, encoding: "utf8", env: { ...process.env, GITHUB_OUTPUT: "" } });
    assert.equal(r.status, 2);
    assert.match(r.stdout, /cannot judge: kaal-guard: --github needs GITHUB_OUTPUT/);
  });
});
