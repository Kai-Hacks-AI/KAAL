// Inner Code tests of the lifecycle and the workflow it renders. They evolve with the code, test first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { verify } from "../lib/github.mjs";
import { init, remove, upgrade, workflow } from "../lib/lifecycle.mjs";

/** A fresh Git working tree with guard.json holding these checks, when given. */
function tree(checks) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-guard-lifecycle-"));
  spawnSync("git", ["init", "-q", dir]);
  if (checks) writeFileSync(join(dir, "guard.json"), JSON.stringify({ checks }));
  return dir;
}

const hooksPath = (dir) => spawnSync("git", ["config", "--local", "--get", "core.hooksPath"], { cwd: dir, encoding: "utf8" }).stdout.trim();
const guard = (dir) => JSON.parse(readFileSync(join(dir, "guard.json"), "utf8"));

describe("workflow", () => {
  it("declares each ci check in Guard's declared form, so verify finds it", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] }, b: { command: "x", runs: ["ci"] } });
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "guard.yml"), workflow(["a", "b"]));
    const { results } = verify(dir, guard(dir));
    assert.deepEqual(results.map((r) => [r.name, r.verdict]), [["a", "pass"], ["b", "pass"]]);
  });

  it("with no ci checks, leaves the check job as a comment that declares nothing", () => {
    const text = workflow([]);
    assert.match(text, /^# +check:$/m);
    assert.doesNotMatch(text, /^ {2}check:$/m);
    assert.match(text, /^ {2}guard:$/m);
  });
});

describe("lifecycle", () => {
  it("init writes, records and sets; remove takes back exactly that and keeps guard.json's checks", () => {
    const dir = tree({ a: { command: "x", runs: ["ci"] } });
    assert.ok(init(dir).lines);
    assert.equal(hooksPath(dir), ".githooks");
    const after = guard(dir);
    assert.deepEqual(Object.keys(after.managed).sort(), [".githooks/pre-push", ".github/workflows/guard.yml"]);
    assert.deepEqual(after.config, { "core.hooksPath": ".githooks" });
    assert.ok(remove(dir).lines);
    assert.ok(!existsSync(join(dir, ".githooks")) && !existsSync(join(dir, ".github")));
    assert.equal(hooksPath(dir), "");
    assert.deepEqual(guard(dir), { checks: { a: { command: "x", runs: ["ci"] } } });
  });

  it("says apart what it installed, what it left untouched and what is still to do, and claims no execution", () => {
    const dir = tree();
    mkdirSync(join(dir, ".githooks"));
    writeFileSync(join(dir, ".githooks", "pre-push"), "#!/bin/sh\n");
    const out = init(dir).lines.join("\n");
    assert.match(out, /installed by Guard:\n {2}\.github\/workflows\/guard\.yml\n/);
    assert.match(out, /left untouched:\n {2}\.githooks\/pre-push: it was there before Guard\n/);
    assert.match(out, /still to do in this repository:\n {2}To run Guard's local checks from \.githooks\/pre-push/);
    assert.match(out, /does not show that Git runs the hook, that CI runs these jobs, or that a merge requires them/);
    assert.match(out, /declared integration only/);
    assert.deepEqual(Object.keys(guard(dir).managed), [".github/workflows/guard.yml"]);
  });

  it("does not set core.hooksPath over hooks Git already runs, nor for a hook it did not install", () => {
    const dir = tree();
    writeFileSync(join(dir, ".git", "hooks", "pre-commit"), "#!/bin/sh\n");
    assert.match(init(dir).lines.join("\n"), /core\.hooksPath: unset, so Git runs pre-commit from \.git\/hooks; setting it would turn them off/);
    assert.equal(hooksPath(dir), "");
    assert.equal(guard(dir).config, undefined);

    const other = tree();
    mkdirSync(join(other, ".githooks"));
    writeFileSync(join(other, ".githooks", "pre-push"), "#!/bin/sh\n");
    assert.match(init(other).lines.join("\n"), /git config core\.hooksPath \.githooks/);
    assert.equal(hooksPath(other), "");
  });

  it("leaves a core.hooksPath that equals its own but that it did not set", () => {
    const dir = tree();
    spawnSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: dir });
    init(dir);
    assert.equal(guard(dir).config, undefined);
    remove(dir);
    assert.equal(hooksPath(dir), ".githooks");
  });

  it("upgrade rewrites an unmodified workflow from guard.json's ci checks", () => {
    const dir = tree({});
    init(dir);
    writeFileSync(join(dir, "guard.json"), JSON.stringify({ ...guard(dir), checks: { a: { command: "x", runs: ["ci"] } } }));
    assert.match(upgrade(dir).lines.join("\n"), /upgraded \.github\/workflows\/guard\.yml/);
    assert.equal(readFileSync(join(dir, ".github", "workflows", "guard.yml"), "utf8"), workflow(["a"]));
    assert.match(upgrade(dir).lines.join("\n"), /guard\.yml is current/);
  });

  it("names guard.json when it cannot be read", () => {
    const dir = tree();
    writeFileSync(join(dir, "guard.json"), "{");
    for (const step of [init, upgrade, remove]) assert.match(step(dir).problem, /guard\.json/);
  });
});
