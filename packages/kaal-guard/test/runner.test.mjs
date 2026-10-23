// Inner Code tests of the runner and GitHub reporting. They evolve with the code, test first.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { annotations, summarize } from "../lib/github.mjs";
import { findRoot, lines, readList, run, status, words } from "../lib/runner.mjs";

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

  it("is cannot judge when the command does not name its trusted checker", () => {
    const { results } = run(repo({ t: { command: "node other.mjs", runs: ["ci"], trusted: "t.mjs" } }), { check: "t" }, { base: "HEAD" });
    assert.equal(results[0].verdict, "cannot judge");
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
    summarize([{ name: "x", verdict: "not applicable", evidence: "a | b" }], file);
    assert.match(readFileSync(file, "utf8"), /\| x \| not applicable \| a \\\| b \|/);
  });
});
