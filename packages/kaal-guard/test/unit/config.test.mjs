// Inner Code tests of the configuration: the frontmatter subset, the Guard/Check schema, discovery and the
// refusals that name the file, the member and the rule. They evolve with the code, test first.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { CONFIG, check, configDir, frontmatter, legacy, nearest, readDeclarations, Refusal } from "../../lib/config.mjs";

/** The refusal `fn` throws, or a failed assertion. */
function refusal(fn) {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof Refusal, e.stack);
    assert.ok(e.todo, "a refusal says what to do next");
    return e.message;
  }
  assert.fail("nothing was refused");
}

const front = (...lines) => `---\n${lines.join("\n")}\n---\nbody\n`;

describe("frontmatter", () => {
  it("reads key: value lines: plain and double-quoted strings, integers, flow lists and flow maps", () => {
    assert.deepEqual(frontmatter(front("a: node x.mjs test:unit", 'b: "q \\" #1"', "c: 4", "d: [local, ci]", 'e: {"4": held}', "f: []", "", "g: Guard/Check"), "f.md"), {
      a: "node x.mjs test:unit",
      b: 'q " #1',
      c: 4,
      d: ["local", "ci"],
      e: { 4: "held" },
      f: [],
      g: "Guard/Check",
    });
  });

  it("never reads the body, even when it looks like frontmatter", () => {
    assert.deepEqual(frontmatter("---\na: x\n---\n---\nb: y\n---\n", "f.md"), { a: "x" });
  });

  it("refuses everything outside the subset, naming the file and the member", () => {
    for (const [text, said] of [
      ["no frontmatter\n", /f\.md: has no frontmatter/],
      ["---\na: x\n", /f\.md: its frontmatter is not closed/],
      [front("runs:", "  - local"), /f\.md: runs: has no value on its line; block-style/],
      [front("a: x", "  b: y"), /f\.md: a: an indented line is block-style/],
      [front("# a comment"), /f\.md: #: .* is not a key: value line/],
      [front("a: x", "a: y"), /f\.md: a: declared twice/],
      [front("a: 'single'"), /f\.md: a: .*single-quoted/],
      [front("a: true"), /f\.md: a: true is not a string or an integer to YAML/],
      [front("a: 1.5"), /f\.md: a: 1\.5 is not a string/],
      [front("a: &anchor x"), /f\.md: a: .*begins with &/],
      [front("a: x: y"), /f\.md: a: .*": "/],
      [front("a: [x, [y]]"), /f\.md: a: a flow collection inside another/],
      [front("a: [x, ]"), /f\.md: a: an item is empty/],
      [front('a: {"4": held, "4": held}'), /f\.md: a: 4 is a key twice/],
      [front("a: {4: held}"), /f\.md: a: 4 is an unquoted key[^\n]*write \{"4": held\}/],
      [front('a: "open'), /f\.md: a: .*not one double-quoted string/],
    ]) assert.match(refusal(() => frontmatter(text, "f.md")), said);
  });
});

describe("Guard/Check", () => {
  const valid = { type: "Guard/Check", command: "node x.mjs", runs: ["hook"] };

  it("is the members of a check, without its type", () => {
    const full = { ...valid, facts: ["base", "changed"], trusted: "checks", outcomes: { 4: "held" } };
    const { type, ...rest } = full;
    assert.deepEqual(check(full, "c.md"), rest);
  });

  it("refuses an undefined member and names the one it was probably meant to be", () => {
    assert.equal(refusal(() => check({ ...valid, trustd: "x" }, "c.md")), "c.md: trustd: not defined for Guard/Check; did you mean trusted?");
    assert.equal(refusal(() => check({ ...valid, owner: "x" }, "c.md")), "c.md: owner: not defined for Guard/Check");
    assert.equal(nearest("Runs", ["runs"]), "runs");
  });

  it("refuses a missing or wrong value, naming the member", () => {
    for (const [members, said] of [
      [{ command: "x", runs: ["ci"] }, /c\.md: type: missing/],
      [{ ...valid, type: "Guard/check" }, /c\.md: type: is "Guard\/check", not Guard\/Check/],
      [{ ...valid, command: ["node", "x"] }, /c\.md: command: is a list, not a string/],
      [{ ...valid, command: 7 }, /c\.md: command: is an integer, not a string/],
      [{ ...valid, command: '"open' }, /c\.md: command: names no program, or a quote/],
      [{ ...valid, runs: "hook" }, /c\.md: runs: must be a list/],
      [{ ...valid, runs: ["local"] }, /c\.md: runs: local is not a surface of Guard\/Check; did you mean hook\?/],
      [{ ...valid, runs: [] }, /c\.md: runs: must be a list/],
      [{ ...valid, runs: ["nightly"] }, /c\.md: runs: must be a list/],
      [{ ...valid, runs: ["ci", "ci"] }, /c\.md: runs: must be a list/],
      [{ ...valid, facts: ["time"] }, /c\.md: facts: must be a list/],
      [{ ...valid, trusted: "../x.mjs" }, /c\.md: trusted: must be a string naming a file or directory inside the repository/],
      [{ ...valid, trusted: 4 }, /c\.md: trusted: must be a string/],
      [{ ...valid, outcomes: { 1: "held" } }, /c\.md: outcomes:/],
      [{ ...valid, outcomes: { 4: "ignored" } }, /c\.md: outcomes:/],
      [{ ...valid, outcomes: { 256: "held" } }, /c\.md: outcomes:/],
      [{ ...valid, outcomes: ["held"] }, /c\.md: outcomes:/],
    ]) assert.match(refusal(() => check(members, "c.md")), said);
  });
});

describe("discovery", () => {
  const tree = () => mkdtempSync(join(tmpdir(), "kaal-guard-config-"));
  const write = (dir, path, text) => (mkdirSync(join(dir, path, ".."), { recursive: true }), writeFileSync(join(dir, path), text));
  const decl = "---\ntype: Guard/Check\ncommand: x\nruns: [ci]\n---\n";

  it("reads .kaal/config/guard at the top level unless --config names a directory from the working directory", () => {
    const root = resolve("r");
    assert.equal(configDir(root, join(root, "a"), undefined), join(root, CONFIG));
    assert.equal(configDir(root, join(root, "a"), "alt"), join(root, "a", "alt"));
  });

  it("takes only the .md files directly in the directory, in name order", () => {
    const dir = tree();
    for (const p of ["b.md", "a.md", "C.md", "notes.txt", "nested/d.md"]) write(dir, `${CONFIG}/${p}`, decl);
    assert.deepEqual(Object.keys(readDeclarations(dir, join(dir, CONFIG)).list.checks), ["C", "a", "b"]);
  });

  it("says when there is no directory, and refuses a name with a space and a declaration out of contract, by its path", () => {
    const dir = tree();
    assert.deepEqual(readDeclarations(dir, join(dir, CONFIG)), { absent: true });
    write(dir, `${CONFIG}/a b.md`, decl);
    assert.match(refusal(() => readDeclarations(dir, join(dir, CONFIG))), /^\.kaal\/config\/guard\/a b\.md: the check's name "a b" holds a space/);
    const other = tree();
    write(other, `${CONFIG}/x.md`, decl.replace("ci]", "ci]\ntrustd: x"));
    assert.match(refusal(() => readDeclarations(other, join(other, CONFIG))), /^\.kaal\/config\/guard\/x\.md: trustd: not defined/);
  });

  it("refuses 0.0.1's guard.json, naming the fresh setup", () => {
    const dir = tree();
    assert.equal(legacy(dir), undefined);
    writeFileSync(join(dir, "guard.json"), "{}");
    const r = legacy(dir);
    assert.match(r.message, /guard\.json is the configuration of kaal-guard 0\.0\.1/);
    assert.match(r.todo, /kaal-guard init/);
  });
});
